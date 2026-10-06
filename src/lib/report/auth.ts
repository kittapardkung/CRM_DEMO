import { createHash, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const AUTH_COOKIE = 'sr_auth';
const digest = (s: string) => createHash('sha256').update(`sales-report:${s}`).digest('hex');

/** Shared team passcode from SALES_REPORT_PASSCODE. Unset → open in dev, closed in production. */
export function passcodeConfigured() {
  return Boolean(process.env.SALES_REPORT_PASSCODE);
}

export function checkPasscode(input: string): boolean {
  const expected = process.env.SALES_REPORT_PASSCODE;
  if (!expected) return process.env.NODE_ENV !== 'production';
  const a = Buffer.from(digest(input));
  const b = Buffer.from(digest(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAuthed(): Promise<boolean> {
  // Read cookies first so every caller is opted into dynamic rendering at build time.
  const cookie = (await cookies()).get(AUTH_COOKIE)?.value;
  const expected = process.env.SALES_REPORT_PASSCODE;
  if (!expected) return process.env.NODE_ENV !== 'production';
  return cookie === digest(expected);
}

export function authCookieValue(): string {
  return digest(process.env.SALES_REPORT_PASSCODE ?? '');
}
