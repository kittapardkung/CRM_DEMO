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

export function money(amount: number): string {
  if (!isDemoPricing()) return '฿XXX,XXX';
  return '฿' + Math.round(amount).toLocaleString('en-US');
}

export const priceNote = isDemoPricing() ? '(ราคาสาธิต — รอยืนยันราคาจริง)' : '(ราคารอยืนยัน)';

export { PLACEHOLDER };
