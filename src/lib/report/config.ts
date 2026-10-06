import { Temperature } from './types';

/**
 * Lead_Status values. The sheet currently shows NEW / TEST_DRIVE / LOST;
 * the rest are the usual dealership funnel steps — edit this list to match
 * whatever the Telegram bot / sheet actually writes.
 */
export const STATUSES = ['NEW', 'CONTACTED', 'TEST_DRIVE', 'QUOTATION', 'BOOKING', 'WON', 'LOST'] as const;

/** Statuses that need no weekly check — the lead is finished either way. */
export const CLOSED_STATUSES = ['WON', 'LOST'];

export const TEMPERATURES: Temperature[] = ['HOT', 'WARM', 'COLD'];

export const STATUS_LABEL: Record<string, string> = {
  NEW: 'ใหม่',
  CONTACTED: 'ติดต่อแล้ว',
  TEST_DRIVE: 'ทดลองขับ',
  QUOTATION: 'เสนอราคา',
  BOOKING: 'จอง',
  WON: 'ปิดการขาย',
  LOST: 'ไม่ได้ซื้อ',
};

export const TEMPERATURE_LABEL: Record<string, string> = {
  HOT: 'ร้อน',
  WARM: 'อุ่น',
  COLD: 'เย็น',
};

/** A lead with no follow-up for this many days counts as "stale". */
export const STALE_DAYS = 7;

export const SHEET_TABS = {
  leads: 'SHEET_1_TEL',
  reports: 'WEEKLY_REPORT',
  notes: 'WEEKLY_NOTES',
} as const;
