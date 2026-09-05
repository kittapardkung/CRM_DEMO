'use client';

/**
 * Conversion tracking (master prompt §42). A thin wrapper around
 * window.dataLayer so this can point at GA4 / Meta Pixel later without
 * touching call sites. Event names match the spec exactly.
 */
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
  }
}

export function track(event: TrackedEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
