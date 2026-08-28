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
  price: Money;
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
  startingPrice: Money;
  colors: VehicleColor[];
  exteriorViews: VehicleImageSlot[];
  interiorViews: VehicleImageSlot[];
  highlights: VehicleHighlight[];
  specifications: SpecGroup[];
  variants: VehicleVariant[];
  /** True only for PORTA EV — the commercial, configurable product. */
  isConfigurable?: boolean;
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

export interface Promotion {
  id: string;
  title: string;
  modelLabel: string;
  detail: string;
  validity: string;
  /** Vehicle slug this promotion links to, or a route ('models' | 'contact'). */
  linkTo: string;
}

export interface ArticleSection {
  id: string;
  heading: string;
  body: string;
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

export const PLACEHOLDER = 'ข้อมูลรอยืนยัน';
