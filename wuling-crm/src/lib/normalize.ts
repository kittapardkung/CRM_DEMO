import { toIsoDate } from "./dates.ts";
import { STAGE_IDS } from "./constants.ts";

/** Column types of public.leads that need more than "trimmed text, empty = null". */
export const DATE_COLS = new Set(["created_date", "accepted_date", "appointment_date", "last_follow_up", "next_follow_up"]);
export const BOOL_COLS = new Set(["has_trade_in", "test_drive_done"]);
export const INT_COLS = new Set(["call_attempts"]);

export const TEXT_COLS = [
  "created_time", "customer_name", "phone_number", "facebook_user_id", "customer_district", "customer_province",
  "occupation", "source", "customer_message", "interested_brand", "interested_model", "variant", "preferred_variant",
  "preferred_color", "purchase_type", "budget", "vehicle_price", "down_payment", "loan_term", "interest_rate",
  "monthly_payment", "financing_required", "financing_status", "finance_amount", "financing_bank", "finance_note",
  "trade_in", "trade_in_brand", "trade_in_model", "trade_in_year", "trade_in_expected_price",
  "trade_in_appraised_price", "trade_in_status", "trade_in_value", "promotion_name", "discount_amount", "free_items",
  "closing_condition", "lead_score", "accepted_time", "accepted_by", "response_minutes", "telegram_status",
  "assigned_sales", "sales_reply", "follow_up_note",
];

export const LEAD_COLS = new Set<string>([
  "lead_id", "lead_status", "lead_temperature",
  ...DATE_COLS, ...BOOL_COLS, ...INT_COLS, ...TEXT_COLS,
]);

export class BadValueError extends Error {}

const truthy = (s: string) => ["y", "true", "yes", "1"].includes(s.toLowerCase());

/** Coerces a UI / spreadsheet string into the value stored in Postgres for `col`. */
export function coerceValue(col: string, raw: unknown): string | number | boolean | null {
  const s = String(raw ?? "").trim();
  if (DATE_COLS.has(col)) {
    if (!s) return null;
    const iso = toIsoDate(s);
    if (!iso) throw new BadValueError(`${col}: วันที่ไม่ถูกต้อง "${s}"`);
    return iso;
  }
  if (col === "has_trade_in") {
    if (!s) return null;
    if (s.startsWith("ไม่") || ["n", "no", "false", "0"].includes(s.toLowerCase())) return false;
    return s.startsWith("มี") || truthy(s) ? true : null;
  }
  if (col === "test_drive_done") return truthy(s);
  if (INT_COLS.has(col)) {
    const n = parseInt(s, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }
  if (col === "lead_status") {
    const u = s.toUpperCase();
    if (!STAGE_IDS.includes(u as never)) throw new BadValueError(`lead_status: สถานะไม่ถูกต้อง "${s}"`);
    return u;
  }
  if (col === "lead_temperature") {
    const u = s.toUpperCase();
    return u === "HOT" || u === "WARM" || u === "COLD" ? u : null;
  }
  return s === "" ? null : s;
}

/** Turns one spreadsheet row (any header casing) into a leads insert row. Returns unknown headers too. */
export function normalizeSheetLead(raw: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  const ignored: string[] = [];
  for (const [header, value] of Object.entries(raw)) {
    const col = header.trim().toLowerCase();
    if (!LEAD_COLS.has(col)) { ignored.push(header); continue; }
    try { row[col] = coerceValue(col, value); }
    catch { row[col] = col === "lead_status" ? "NEW" : null; } // never drop a lead over one bad cell
  }
  if (row.lead_status == null) row.lead_status = "NEW";
  return { row, ignored };
}

/** Sheet ACTIVITY_LOG row -> activity_log insert row. */
export function normalizeSheetActivity(raw: Record<string, unknown>) {
  const g = (k: string) => String(raw[k] ?? "").trim();
  const date = toIsoDate(g("Activity_Date"));
  const time = /^\d{1,2}:\d{2}(:\d{2})?$/.test(g("Activity_Time")) ? g("Activity_Time") : "00:00:00";
  const status = g("Lead_Status").toUpperCase();
  const temp = g("Lead_Temperature").toUpperCase();
  return {
    activity_id: g("Activity_ID"),
    lead_id: g("Lead_ID"),
    // sheet times are Asia/Bangkok
    activity_at: date ? `${date}T${time.length === 5 ? time + ":00" : time}+07:00` : new Date().toISOString(),
    activity_type: g("Activity_Type") || "UPDATE",
    activity_channel: g("Activity_Channel") || "CRM App",
    activity_status: g("Activity_Status") || null,
    activity_notes: g("Activity_Notes") || null,
    last_modified_by: g("Last_Modified_By") || null,
    lead_status: STAGE_IDS.includes(status as never) ? status : null,
    lead_temperature: ["HOT", "WARM", "COLD"].includes(temp) ? temp : null,
  };
}
