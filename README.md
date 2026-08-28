# WULING CHONBURI

Digital showroom + PORTA configurator + lead-gen website for the WULING
CHONBURI dealership, built with Next.js (App Router) + TypeScript.

This is the production implementation of the `Wuling Chonburi v2.dc.html`
Claude Design prototype — same navy (`#101f3d`) + lime (`#c6f24d`) palette,
Prompt typeface, and page content, rebuilt as real routed pages with a
typed data layer instead of the prototype's single-file client state.

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` to override the site URL or turn off
demo pricing.

## Structure

```
src/
  app/                  Routes (App Router) — one folder per URL in the sitemap
    models/[slug]/      Model detail (darion, binguo, ekxion, porta)
    articles/[slug]/    Article detail
    api/leads/          Lead intake stub (no CRM connected yet)
    sitemap.ts robots.ts
  components/           Presentational + a handful of small client islands
                         (PortaConfigurator, CompareTool, InstallmentCalculator,
                         TestDriveForm, VehicleVisuals — everything else is a
                         plain server component)
  lib/
    data/                Product data structure — vehicles, accessories,
                         articles, promotions, services, dealer contact.
                         Nothing here is hard-coded into a component; add a
                         model/article/accessory by adding an entry here.
    format.ts            money() / demo-pricing toggle
    analytics.ts          track() — conversion event tracking (§42)
    nav.ts, seo.ts
```

## Placeholder rule

No real specs, prices, or vehicle photography exist yet. Every unconfirmed
number renders as `ข้อมูลรอยืนยัน`; every image is a labeled `ImageSlot`
naming the exact shot and filename it needs (e.g. `porta-front-34-white.webp`)
so it's a straight swap once real assets arrive — never a broken image.

Prices are the one exception: `NEXT_PUBLIC_DEMO_PRICES=true` (the default)
shows working demo numbers so the installment calculator and PORTA
configurator actually compute end-to-end. Set it to `false` to switch every
price to the `฿XXX,XXX` placeholder without touching a component; update the
real figures in `lib/data/vehicles.ts` / `lib/data/accessories.ts` when
they're confirmed.

## What's implemented

All 11 routes from the brief: home, models index, model detail (with the
PORTA configurator — use-case packages, per-accessory image-mapping with a
labeled fallback when a combination has no preview, running price summary,
before/after slider), compare, installment calculator, test drive
(lead form → success screen with the lead payload shown, per §21/§25),
promotions, articles hub + detail (TOC, FAQ, related model/article,
category filter), service, contact. Plus the "recommended variant"
highlighted pricing card called out from the reference screenshot.

SEO: per-page metadata (title/description/canonical), Open Graph +
Twitter defaults, `AutoDealer`/`Vehicle`/`Article`/`FAQPage`/`ItemList`
JSON-LD, `sitemap.xml`, `robots.txt`.

Not built yet (flagged as optional, skipped for this pass): the stats
band (50+/83k/103-style numbers) from the reference screenshot.

## Lead data

`POST /api/leads` validates and assigns a `LEAD-…` id per the `Lead` shape
in `lib/data/types.ts`, then logs — there's no CRM connected yet, so the
form always lands on the success screen regardless. Point the same handler
at a real CRM endpoint when one exists; no form component needs to change.
