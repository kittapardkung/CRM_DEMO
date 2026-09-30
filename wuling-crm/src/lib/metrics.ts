import { STAGES, TEMPS } from "./constants.ts";
import { dueState, fmtShort, isoOf, parseDate, startOfToday } from "./dates.ts";
import type { Lead } from "./types.ts";

export const str = (v: unknown) => String(v ?? "").trim();
export const statusOf = (r: Lead) => r.lead_status || "NEW";
export const tempKey = (r: Lead) => r.lead_temperature || "NONE";
export const initialOf = (n: unknown) => str(n || "?").charAt(0).toUpperCase();
export const isOpen = (r: Lead) => statusOf(r) !== "WON" && statusOf(r) !== "LOST";
export const stageOf = (r: Lead) => STAGES.find((s) => s.id === statusOf(r)) ?? STAGES[0];
export const tempOf = (r: Lead) => (r.lead_temperature ? TEMPS[r.lead_temperature] : undefined);
export const modelOf = (r: Lead) => [r.interested_brand, r.interested_model].filter(Boolean).join(" ");
export const noteOf = (r: Lead) => str(r.follow_up_note || r.sales_reply || r.customer_message);
export const isOverdue = (r: Lead) => dueState(r.next_follow_up)?.kind === "overdue";
export const placeOf = (r: Lead) => [r.customer_district, r.customer_province].map(str).filter(Boolean).join(" ");
export const createdLabel = (r: Lead) => [r.created_date, str(r.created_time).slice(0, 5)].filter(Boolean).join(" ") || "—";

export interface SalesPerson { key: string; code: string; name: string }

export function salesList(rows: Lead[]): SalesPerson[] {
  const out: SalesPerson[] = [];
  for (const r of rows) {
    const v = str(r.assigned_sales);
    if (!v || out.some((s) => s.key === v)) continue;
    const m = v.match(/^(SA\d+)\s*-\s*(.+)$/);
    out.push({ key: v, code: m ? m[1] : v, name: m ? m[2] : v });
  }
  return out.sort((a, b) => a.code.localeCompare(b.code));
}

export const inScope = (r: Lead, view: string) => view === "all" || view === "dash" || str(r.assigned_sales).startsWith(view);

/** Days since the lead was last touched (last follow-up → accepted → created); null if unknown/implausible. */
export function daysSince(r: Lead): number | null {
  const d = parseDate(r.last_follow_up) || parseDate(r.accepted_date) || parseDate(r.created_date);
  if (!d) return null;
  const k = Math.round((startOfToday().getTime() - d.getTime()) / 86400000);
  return k < 0 || k > 730 ? null : k;
}

export function ageLabel(k: number | null) {
  return k == null ? "ไม่ทราบ" : k === 0 ? "อัปเดตวันนี้" : "เงียบไป " + k + " วัน";
}

export function withinSpan(r: Lead, days: number) {
  const p = parseDate(r.created_date);
  if (!p) return false;
  const cut = startOfToday();
  cut.setDate(cut.getDate() - (days - 1));
  return p.getTime() >= cut.getTime();
}

/** Search across every tab/filter: text fields + digits anywhere in the phone (so last digits work). */
export function matchesSearch(r: Lead, q: string) {
  const t = q.trim().toLowerCase();
  const fields = [r.lead_id, r.customer_name, r.phone_number, r.follow_up_note, r.sales_reply, r.customer_message,
    r.interested_model, r.interested_brand, r.assigned_sales, r.customer_province, r.customer_district,
    r.promotion_name, r.closing_condition, r.occupation];
  if (fields.filter(Boolean).some((v) => String(v).toLowerCase().includes(t))) return true;
  const digits = t.replace(/[^0-9]/g, "");
  if (digits.length >= 3) {
    if (str(r.phone_number).replace(/[^0-9]/g, "").includes(digits)) return true;
    if (str(r.lead_id).replace(/[^0-9]/g, "").includes(digits)) return true;
  }
  return false;
}

export function dailyStats(rows: Lead[], span: number) {
  const byDate: Record<string, number> = {};
  for (const r of rows) {
    const p = parseDate(r.created_date);
    if (!p) continue;
    const k = isoOf(p);
    byDate[k] = (byDate[k] || 0) + 1;
  }
  const today = startOfToday();
  const todayIso = isoOf(today);
  const days = [];
  for (let i = span - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const k = isoOf(d);
    days.push({ date: d, n: byDate[k] || 0, isToday: k === todayIso });
  }
  const total = days.reduce((a, b) => a + b.n, 0);
  const active = days.filter((d) => d.n > 0);
  const avg = Math.round((total / days.length) * 10) / 10;
  const max = Math.max(1, ...days.map((d) => d.n));
  const best = [...active].sort((a, b) => b.n - a.n)[0];
  return {
    total, avg, max, days,
    today: byDate[todayIso] || 0,
    activeDays: active.length,
    best: best ? `${best.n} (${fmtShort(best.date)})` : "—",
    range: fmtShort(days[0].date) + " – " + fmtShort(days[days.length - 1].date),
    bars: days.map((d) => ({
      label: fmtShort(d.date), value: d.n,
      height: d.n > 0 ? Math.max(Math.round((d.n / max) * 100), 4) + "%" : "3px",
      color: d.isToday ? "var(--amber)" : d.n === 0 ? "var(--lineSoft)" : d.n >= avg ? "var(--blue)" : "var(--raised)",
      labelColor: d.isToday ? "var(--amber)" : "var(--faint)",
      valueColor: d.n === 0 ? "var(--faint)" : "var(--text)",
    })),
  };
}

export function testDriveStats(rows: Lead[], span: number) {
  const pool = rows.filter((r) => withinSpan(r, span));
  const driven = pool.filter((r) => r.test_drive_done);
  const total = driven.length;
  const counts = STAGES.map((s) => driven.filter((r) => statusOf(r) === s.id).length);
  const maxC = Math.max(1, ...counts);
  return {
    total, all: pool.length,
    pctAll: pool.length ? Math.round((total / pool.length) * 100) + "%" : "0%",
    byStatus: STAGES.map((s, i) => ({
      label: s.label, color: s.color, count: counts[i],
      pct: Math.max(Math.round((counts[i] / maxC) * 100), counts[i] ? 4 : 0) + "%",
      share: total ? Math.round((counts[i] / total) * 100) + "%" : "0%",
    })),
  };
}

export interface PieDef { id: string; label: string; color: string }

export function makePie(list: Lead[], title: string, defs: readonly PieDef[], keyOf: (r: Lead) => string) {
  const total = list.length;
  let acc = 0;
  const slices = defs.map((d) => {
    const n = list.filter((r) => keyOf(r) === d.id).length;
    const pct = total ? (n / total) * 100 : 0;
    const from = acc;
    acc += pct;
    return { label: d.label, color: d.color, count: n, pct: Math.round(pct * 10) / 10 + "%", from, to: acc };
  }).filter((s) => s.count > 0);
  const stops = slices.map((s) => `${s.color} ${s.from.toFixed(2)}% ${s.to.toFixed(2)}%`);
  return { title, total, slices, gradient: stops.length ? `conic-gradient(${stops.join(", ")})` : "conic-gradient(#E1E6ED 0% 100%)" };
}

export const STATUS_PIE_DEFS: PieDef[] = STAGES.map((s) => ({ id: s.id, label: s.label, color: s.color }));

export const funnel = (rows: Lead[]) => {
  const stages = STAGES.filter((s) => s.id !== "LOST");
  const nonLost = rows.filter((r) => statusOf(r) !== "LOST");
  const idx = (r: Lead) => stages.findIndex((f) => f.id === statusOf(r));
  const counts = stages.map((_, i) => nonLost.filter((r) => idx(r) >= i).length);
  const maxC = Math.max(1, ...counts);
  return stages.map((s, i) => ({
    label: s.label, color: s.color, count: counts[i],
    pct: Math.max(Math.round((counts[i] / maxC) * 100), 7) + "%",
    conv: (i === 0 ? 100 : counts[i - 1] ? Math.round((counts[i] / counts[i - 1]) * 100) : 0) + "% ต่อเนื่อง",
  }));
};
