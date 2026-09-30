/** Date helpers ported from the design reference. All dates are calendar dates in local time. */

const pad = (n: number) => ("0" + n).slice(-2);

/** Parses 'YYYY-MM-DD', 'YYYY/M/D' or 'D/M/YYYY' (also พ.ศ. years) into 'YYYY-MM-DD'; null if not a date. */
export function toIsoDate(v: unknown): string | null {
  const s = String(v ?? "").trim();
  if (!s || /^\d{1,2}:\d{2}/.test(s)) return null; // "10:30" is a time, not a date
  let y: number, mo: number, da: number, m: RegExpMatchArray | null;
  if ((m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/))) { y = +m[1]; mo = +m[2]; da = +m[3]; }
  else if ((m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/))) { da = +m[1]; mo = +m[2]; y = +m[3]; }
  else return null;
  if (y > 2400) y -= 543; // Buddhist era -> Gregorian
  if (y < 2000 || y > 2100 || mo < 1 || mo > 12 || da < 1 || da > 31) return null;
  const d = new Date(Date.UTC(y, mo - 1, da));
  if (d.getUTCMonth() !== mo - 1) return null; // e.g. 31 Feb
  return `${y}-${pad(mo)}-${pad(da)}`;
}

/** Local-midnight Date for an ISO date string, or null. */
export function parseDate(v: unknown): Date | null {
  const iso = toIsoDate(v);
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isoOf(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isoAdd(days: number): string {
  return isoOf(new Date(Date.now() + days * 86400000));
}

export const fmtShort = (d: Date) => d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });

export interface DueState {
  kind: "overdue" | "today" | "soon" | "later";
  diff: number;
  text: string;
  color: string;
  bg: string;
}

export function dueState(v: unknown): DueState | null {
  const d = parseDate(v);
  if (!d) return null;
  const diff = Math.round((d.getTime() - startOfToday().getTime()) / 86400000);
  if (diff < 0) return { kind: "overdue", diff, text: "เลยกำหนด " + Math.abs(diff) + " วัน", color: "#BE3A2B", bg: "rgba(190,58,43,.11)" };
  if (diff === 0) return { kind: "today", diff, text: "ติดตามวันนี้", color: "#B36A00", bg: "rgba(179,106,0,.10)" };
  if (diff === 1) return { kind: "soon", diff, text: "ติดตามพรุ่งนี้", color: "#B36A00", bg: "rgba(179,106,0,.10)" };
  return { kind: "later", diff, text: fmtShort(d), color: "#90A9B0", bg: "rgba(22,32,43,.045)" };
}
