// One-off migration: Google Sheet tabs (exported as CSV) -> Supabase.
//
//   File → Download → CSV, once per tab, saved as
//   Products.csv Purchases.csv Stock.csv Transactions.csv Balance.csv
//   in one folder, then:
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/import-csv.mjs ./path/to/csv-folder
//
// Existing ids are kept, so stock <-> purchase <-> sale links survive.
// Safe to re-run: rows are upserted by id.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const dir = process.argv[2];
if (!dir) { console.error("usage: node scripts/import-csv.mjs <csv-folder>"); process.exit(1); }
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) { console.error("set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function parseCsv(text) {
  const rows = []; let row = [], cur = "", q = false;
  text = text.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur); cur = ""; rows.push(row); row = [];
    } else cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((x) => x !== ""));
}
const snake = (s) => s.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
const NUMERIC = new Set(["buy_price","sell_price","price_per_unit","quantity","total_amount","down_payment",
  "financing_fee","commission_fee","cash_amount","value"]);
const BOOL = new Set(["active"]);

function load(name) {
  const f = join(dir, name + ".csv");
  if (!existsSync(f)) { console.warn(`skip ${name}: ${f} not found`); return []; }
  const [head, ...body] = parseCsv(readFileSync(f, "utf8"));
  const cols = head.map((h) => snake(h.trim()));
  return body.map((r) => {
    const o = {};
    cols.forEach((c, i) => {
      let v = (r[i] ?? "").trim();
      if (v === "") { if (!NUMERIC.has(c)) o[c] = null; return; } // let column defaults apply to numbers
      if (NUMERIC.has(c)) v = Number(v.replace(/,/g, "")) || 0;
      else if (BOOL.has(c)) v = /^(true|1|yes)$/i.test(v);
      o[c] = v;
    });
    return o;
  }).filter((o) => name === "Balance" || o.id);
}

// text NOT NULL columns can't take NULL — blank them to ""
const TEXT_NOT_NULL = ["car","customer","notes","code","name"];
function fix(rows) {
  return rows.map((o) => { for (const k of TEXT_NOT_NULL) if (k in o && o[k] === null) o[k] = ""; return o; });
}

async function up(table, rows, onConflict = "id") {
  if (!rows.length) { console.log(`${table}: 0 rows`); return; }
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await sb.from(table).upsert(rows.slice(i, i + 500), { onConflict });
    if (error) { console.error(`${table}: ${error.message}`); process.exit(1); }
  }
  console.log(`${table}: ${rows.length} rows`);
}

await up("products", fix(load("Products")));
await up("purchases", fix(load("Purchases")));
await up("transactions", fix(load("Transactions")));
await up("stock", fix(load("Stock")));
const bal = load("Balance").at(-1);
if (bal) await up("balance", [{ id: 1, value: bal.value ?? 0, as_of_date: bal.as_of_date }]);
console.log("done");
