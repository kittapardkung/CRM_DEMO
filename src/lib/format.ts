import { PLACEHOLDER } from './data/types';

/**
 * All real prices are still unconfirmed (Placeholder Rule, master prompt
 * §38). Demo mode shows working, clearly-labeled placeholder numbers so
 * the calculator and configurator can actually compute; turning it off
 * (NEXT_PUBLIC_DEMO_PRICES=false) switches every price to ฿XXX,XXX
 * without touching a single component.
 */
export function isDemoPricing(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_PRICES !== 'false';
}

export function money(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return PLACEHOLDER;
  if (!isDemoPricing()) return '฿XXX,XXX';
  return '฿' + Math.round(amount).toLocaleString('en-US');
}

export const priceNote = isDemoPricing() ? '(ราคาสาธิต — รอยืนยันราคาจริง)' : '(ราคารอยืนยัน)';

const THAI_MONTHS: Record<string, string> = {
  'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04',
  'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08',
  'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12',
};

/**
 * Converts a display date like "1 ก.ย. 2569" (Buddhist Era) to ISO 8601
 * ("2026-09-01") for structured data — schema.org's datePublished needs a
 * real date, not the Thai-formatted string shown on the page. Falls back
 * to the original string if it doesn't match the expected shape, so a
 * future non-Thai date format degrades safely instead of throwing.
 */
export function toISODate(thaiDate: string): string {
  const match = thaiDate.trim().match(/^(\d{1,2})\s+([ก-ฮ.]+)\s+(\d{4})$/);
  if (!match) return thaiDate;
  const [, day, month, buddhistYear] = match;
  const isoMonth = THAI_MONTHS[month];
  if (!isoMonth) return thaiDate;
  const gregorianYear = Number(buddhistYear) - 543;
  return `${gregorianYear}-${isoMonth}-${day.padStart(2, '0')}`;
}

export { PLACEHOLDER };
