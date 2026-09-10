/**
 * Product data structure.
 *
 * Every vehicle, variant, accessory and article lives here as typed data —
 * never hard-coded inside a component. Adding a new model, article or
 * accessory means adding an entry to the files in this folder, not
 * touching any component or page.
 */

export type Money = number;

export interface VehicleColor {
  name: string;
  code: string;
  slug: string;
}

export interface VehicleVariant {
  id: string;
  name: string;
  /** null = price still unconfirmed by the dealer (e.g. EKXION) — render the Placeholder Rule text, not ฿0. */
  price: Money | null;
  promotionalPrice?: Money;
  promotionLabel?: string;
  /** Marks the variant surfaced as the dealer's recommended pick. */
  recommended?: boolean;
  features: string[];
}

export interface SpecRow {
  label: string;
  /** Real value once confirmed by the dealer; left as the placeholder rule until then. */
  value: string;
}

export interface SpecGroup {
  id: string;
  title: string;
  rows: SpecRow[];
}

export interface VehicleHighlight {
  value: string;
  unit: string;
  label: string;
}

export interface VehicleImageSlot {
  slug: string;
  label: string;
}

export interface Vehicle {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  positioning: string;
  vehicleType: string;
  seats: string;
  /** null = price still unconfirmed by the dealer (e.g. EKXION). */
  startingPrice: Money | null;
  colors: VehicleColor[];
  exteriorViews: VehicleImageSlot[];
  interiorViews: VehicleImageSlot[];
  highlights: VehicleHighlight[];
  specifications: SpecGroup[];
  /** Real confirmed spec values keyed by the row label used in `specifications` (Placeholder Rule §38 for anything absent). */
  specValues?: Record<string, string>;
  variants: VehicleVariant[];
  /** True only for PORTA EV — the commercial, configurable product. */
  isConfigurable?: boolean;
  /** Real hero/card photo once shipped; falls back to an ImageSlot placeholder when absent. */
  image?: string;
  /** Real exterior-view photos keyed by `${viewSlug}` or `${viewSlug}-${colorSlug}` (color-specific wins). */
  exteriorImages?: Record<string, string>;
  /** Real interior-view photos keyed by `${viewSlug}`. */
  interiorImages?: Record<string, string>;
}

export interface Accessory {
  id: string;
  name: string;
  description: string;
  price: Money;
  /** Whether this accessory changes the configurator preview image. */
  isVisualLayer: boolean;
}

export interface AccessoryUseCase {
  id: string;
  label: string;
  accessoryIds: string[];
}

export interface CargoShot {
  label: string;
  filename: string;
  hasDimensionOverlay?: boolean;
}

/** One persona card in the PORTA "เลือกอุปกรณ์ตามสายงาน" section. */
export interface TradePersona {
  title: string;
  description: string;
  accessoryIds: string[];
  icon: 'truck' | 'wrench' | 'store';
}

export interface Promotion {
  id: string;
  title: string;
  modelLabel: string;
  detail: string;
  validity: string;
  /** Vehicle slug this promotion links to, or a route ('models' | 'contact'). */
  linkTo: string;
}

export interface ArticleTable {
  head: string[];
  rows: string[][];
}

export interface ArticleCta {
  heading: string;
  body: string;
  label: string;
  /** Logical destination resolved via `ctaHref()` in `@/lib/nav`. */
  goRoute: string;
}

export interface ArticleLink {
  lead: string;
  toSlug: string;
}

/** Embedded video for an article section — see Video Hub (`@/lib/data/videos`). */
export interface ArticleSectionVideo {
  /** Empty/absent while status is 'planned' (no file shot yet). */
  youtubeId?: string;
  /**
   * Numeric TikTok video id (from tiktok.com/@handle/video/<id>), used only
   * when no `youtubeId` exists yet. Per MILESTONE §5 YouTube is meant to be
   * the site's single embeddable source — this exists because some clips
   * ship to TikTok first, not as the preferred path.
   */
  tiktokId?: string;
  title: string;
  durationSec?: number;
  /** Short summary/spoken-line text so Google can index the content even before the video plays. */
  transcript?: string;
  /** 'planned' = no file yet — the page must skip rendering, not show a broken/empty placeholder. */
  status: 'planned' | 'produced';
}

export interface ArticleSection {
  id: string;
  heading: string;
  /** Short, highlighted lede answering the heading directly (AEO pattern) — rendered before `body`. */
  answer?: string;
  /** Supports inline **bold**, __underline__ and *italic* markers — render with `renderInline()` from `@/lib/inline`. */
  body?: string;
  bullets?: string[];
  table?: ArticleTable;
  image?: string;
  imageCaption?: string;
  cta?: ArticleCta;
  link?: ArticleLink;
  note?: string;
  video?: ArticleSectionVideo;
}

export interface ArticleFaq {
  question: string;
  answer: string;
}

export interface Article {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readingTime: string;
  relatedVehicleSlug: string;
  sections: ArticleSection[];
  faq: ArticleFaq[];
  image?: string;
  social?: { label: string; url: string };
  endCta?: ArticleCta;
  /** Related-article slugs to show at the end, in order; falls back to "first 3 others" when absent. */
  readNext?: string[];
}

export interface ServiceItem {
  title: string;
  body: string;
}

export interface Lead {
  leadId: string;
  createdAt: string;
  customerName: string;
  phoneNumber: string;
  interestedModel: string;
  variant?: string;
  preferredColor?: string;
  purchaseType?: string;
  vehiclePrice?: Money;
  downPayment?: Money;
  loanTerm?: number;
  monthlyPayment?: Money;
  selectedAccessories?: string[];
  accessoriesTotal?: Money;
  leadSource: string;
  pageUrl: string;
  note?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

/* ---------------------------------------------------------------------- */
/* Operating Lease (Fleet) — /lease                                        */
/* ---------------------------------------------------------------------- */

/** Per-vehicle monthly lease rate (THB, incl. VAT) keyed by contract term in months. */
export type LeaseTermRates = Record<number, number>;

export interface LeaseRateEntry {
  list: Money;
  label: string;
  /** Keyed by the mileage ceiling (km/vehicle/month) the tier applies up to. */
  tiers: Record<number, LeaseTermRates>;
}

/** Keyed by a fleet-calculator "model" id (e.g. 'porta', 'darion-comfort', 'darion-premium'). */
export type LeaseRates = Record<string, LeaseRateEntry>;

export interface LeaseVehicle {
  slug: string;
  name: string;
  headline: string;
  tags: string[];
  description: string;
}

export interface LeaseCompareRow {
  label: string;
  buy: string;
  lease: string;
}

export interface LeaseBenefit {
  n: string;
  title: string;
  body: string;
}

export interface LeaseStep {
  n: string;
  title: string;
  body: string;
}

export const PLACEHOLDER = 'ข้อมูลรอยืนยัน';
export const TBC_COST = 'รอข้อมูลจากผู้จำหน่าย';
