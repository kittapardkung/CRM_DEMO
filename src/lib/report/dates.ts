const DAY_MS = 86_400_000;

/** Parse YYYY-MM-DD or M/D/YYYY (the MES tab's format) into a UTC date; null if unparseable. */
export function parseSheetDate(value: string): Date | null {
  const v = value.trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(v);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(v);
  if (m) return new Date(Date.UTC(+m[3], +m[1] - 1, +m[2]));
  return null;
}

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Today's date in Thailand (UTC+7), as a UTC-midnight Date. */
export function todayTh(now = new Date()): Date {
  const th = new Date(now.getTime() + 7 * 3_600_000);
  return new Date(Date.UTC(th.getUTCFullYear(), th.getUTCMonth(), th.getUTCDate()));
}

/** Monday of the week containing `d`, YYYY-MM-DD. */
export function weekStart(d: Date): string {
  const dow = (d.getUTCDay() + 6) % 7; // Mon=0
  return toIsoDate(new Date(d.getTime() - dow * DAY_MS));
}

export function addWeeks(week: string, n: number): string {
  const d = parseSheetDate(week)!;
  return toIsoDate(new Date(d.getTime() + n * 7 * DAY_MS));
}

export function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / DAY_MS);
}

export function formatThaiDate(iso: string): string {
  const d = parseSheetDate(iso);
  if (!d) return '-';
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
