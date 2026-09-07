'use client';

/**
 * Conversion tracking (master prompt §42). A thin wrapper around
 * window.dataLayer so this can point at GA4 / Meta Pixel later without
 * touching call sites. Event names match the spec exactly.
 *
 * GA_MEASUREMENT_ID lives in @/lib/seo (a plain module, no 'use client')
 * because layout.tsx is a Server Component — a server component can't
 * import a plain value out of a 'use client' module directly.
 */
export { GA_MEASUREMENT_ID } from './seo';

export type TrackedEvent =
  | 'page_view'
  | 'navigate'
  | 'view_vehicle'
  | 'select_vehicle'
  | 'select_variant'
  | 'select_color'
  | 'view_accessory'
  | 'add_accessory'
  | 'remove_accessory'
  | 'select_porta_package'
  | 'calculate_installment'
  | 'click_phone'
  | 'click_contact'
  | 'click_test_drive'
  | 'submit_test_drive'
  | 'submit_quote'
  | 'submit_lead'
  | 'view_article'
  | 'article_to_vehicle'
  | 'article_internal_link'
  | 'article_cta_mid'
  | 'article_cta_end'
  | 'article_external_link'
  | 'lease_cta_click'
  | 'company_test_drive_click'
  | 'lease_form_submit'
  | 'submit_lease'
  | 'calculate_fleet';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Pushes to dataLayer (GTM-shape, kept for compatibility if a container is
 * added later) and reports straight to GA4 via gtag() — the site loads the
 * gtag.js tag directly (no GTM container), so gtag() is what actually gets
 * these 24 events into GA4.
 */
export function track(event: TrackedEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  window.gtag?.('event', event, params);
}
