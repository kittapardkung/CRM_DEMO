import { db, dashboardUrl } from "./supabase";

/* The browser UI speaks camelCase (it was written against Google Sheets
 * column names); Postgres uses snake_case. These helpers convert both
 * ways and normalise "" <-> NULL for date / uuid columns. */

type Row = Record<string, unknown>;

const NULLABLE = new Set([
  "date", "purchaseDate", "deliveryPlanDate", "deliveredDate",
  "financingExpectedDate", "financingReceivedDate",
  "productId", "purchaseId", "txId", "stockId",
]);

const TABLES = {
  products: ["id", "code", "name", "buyPrice", "sellPrice", "active", "createdAt"],
  purchases: ["id", "date", "car", "productId", "pricePerUnit", "quantity", "totalAmount", "notes", "createdAt"],
  stock: ["id", "purchaseId", "productId", "code", "name", "car", "buyPrice", "purchaseDate", "status",
    "customer", "txId", "deliveryPlanDate", "deliveredDate", "notes", "createdAt"],
  transactions: ["id", "date", "customer", "car", "productId", "type", "pricePerUnit", "quantity",
    "totalAmount", "downPayment", "financingFee", "commissionFee", "financingExpectedDate",
    "financingStatus", "financingReceivedDate", "cashAmount", "notes", "stockId", "deliveryPlanDate", "createdAt"],
} as const;
type TableName = keyof typeof TABLES;

const snake = (s: string) => s.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
const camel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

function toDb(table: TableName, obj: Row): Row {
  const allowed = new Set<string>(TABLES[table]);
  const out: Row = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (!allowed.has(k) || k === "id" || k === "createdAt") continue;
    out[snake(k)] = NULLABLE.has(k) && (v === "" || v === undefined) ? null : v;
  }
  return out;
}
function fromDb(table: TableName, row: Row): Row {
  const out: Row = {};
  for (const col of TABLES[table]) {
    const v = row[snake(col)];
    out[col] = v === null || v === undefined ? "" : v;
  }
  return out;
}

function unwrap<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

/** PostgREST caps a response at 1000 rows by default — page through. */
async function readAll(table: TableName): Promise<Row[]> {
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const res = await db().from(table).select("*").order("created_at").order("id").range(from, from + 999);
    const page = unwrap(res) as Row[];
    rows.push(...page);
    if (page.length < 1000) break;
  }
  return rows.map((r) => fromDb(table, r));
}

async function insert(table: TableName, obj: Row): Promise<Row> {
  const row = unwrap(await db().from(table).insert(toDb(table, obj)).select().single()) as Row;
  return fromDb(table, row);
}
async function update(table: TableName, id: string, patch: Row): Promise<Row> {
  const res = await db().from(table).update(toDb(table, patch)).eq("id", id).select().maybeSingle();
  const row = unwrap(res) as Row | null;
  if (!row) throw new Error(`ไม่พบรายการ id=${id} ใน ${table}`);
  return fromDb(table, row);
}
async function remove(table: TableName, id: string): Promise<true> {
  unwrap(await db().from(table).delete().eq("id", id));
  return true;
}

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
const s = (v: unknown) => String(v ?? "").trim();
const n = (v: unknown) => Number(v) || 0;

/* ───────────── public API (same names the UI used with google.script.run) ───────────── */
type Handler = (...args: any[]) => Promise<unknown>; // eslint-disable-line @typescript-eslint/no-explicit-any

export const handlers: Record<string, Handler> = {
  async getDbUrl() {
    return dashboardUrl();
  },

  /** One bad table never blanks the whole app: failures land in `errors`. */
  async getAllData() {
    const out: Record<string, unknown> = {
      products: [], purchases: [], stock: [], transactions: [],
      balance: { value: 0, asOfDate: "" }, errors: [] as string[],
    };
    const errors = out.errors as string[];
    await Promise.all((Object.keys(TABLES) as TableName[]).map(async (t) => {
      try { out[t] = await readAll(t); } catch (e) { errors.push(`${t}: ${(e as Error).message}`); }
    }));
    try {
      const b = unwrap(await db().from("balance").select("*").eq("id", 1).maybeSingle()) as Row | null;
      if (b) out.balance = { value: n(b.value), asOfDate: b.as_of_date || "" };
    } catch (e) { errors.push(`balance: ${(e as Error).message}`); }
    return out;
  },

  async saveBalance(value: unknown) {
    const row = { id: 1, value: n(value), as_of_date: today() };
    unwrap(await db().from("balance").upsert(row));
    return { value: row.value, asOfDate: row.as_of_date };
  },

  async addProduct(data: Row) {
    const code = s(data?.code), name = s(data?.name);
    if (!code || !name) throw new Error("กรุณากรอกรหัสและชื่อรุ่นรถ");
    return insert("products", { code, name, buyPrice: n(data.buyPrice), sellPrice: n(data.sellPrice), active: true });
  },
  updateProduct: (id: string, patch: Row) => update("products", id, patch),
  deleteProduct: (id: string) => remove("products", id),

  addTransaction: (data: Row) => insert("transactions", data),
  updateTransaction: (id: string, patch: Row) => update("transactions", id, patch),
  async deleteTransaction(id: string) {
    // release any car that was reserved for this sale back to stock
    unwrap(await db().from("stock")
      .update({ status: "in_stock", tx_id: null, customer: "" })
      .eq("tx_id", id).eq("status", "reserved"));
    return remove("transactions", id);
  },

  /** Creates the purchase-order row, then `quantity` car rows in stock. */
  async addPurchase(data: Row) {
    const qty = Math.max(1, Math.floor(n(data.quantity)) || 1);
    const price = n(data.pricePerUnit);
    const purchase = await insert("purchases", {
      date: data.date, car: data.car, productId: data.productId || "",
      pricePerUnit: price, quantity: qty, totalAmount: price * qty, notes: data.notes || "",
    });
    let code = "", name = "";
    if (data.productId) {
      const p = unwrap(await db().from("products").select("code,name").eq("id", data.productId).maybeSingle()) as Row | null;
      if (p) { code = s(p.code); name = s(p.name); }
    }
    const units = Array.from({ length: qty }, () => toDb("stock", {
      purchaseId: purchase.id, productId: data.productId || "", code, name, car: data.car,
      buyPrice: price, purchaseDate: data.date, status: "in_stock",
    }));
    const res = await db().from("stock").insert(units);
    if (res.error) { // don't leave an order without its cars
      await db().from("purchases").delete().eq("id", purchase.id);
      throw new Error(res.error.message);
    }
    return purchase;
  },
  updatePurchase: (id: string, patch: Row) => update("purchases", id, patch),
  deletePurchase: (id: string) => remove("purchases", id), // stock rows cascade

  updateStock: (id: string, patch: Row) => update("stock", id, patch),
  deleteStock: (id: string) => remove("stock", id),

  markReceived: (id: string) => update("transactions", id, { financingStatus: "received", financingReceivedDate: today() }),
};
