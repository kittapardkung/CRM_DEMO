import { Accessory, AccessoryUseCase, CargoShot, TradePersona } from './types';

/**
 * PORTA configurator accessories — 7 real, confirmed items.
 * `isVisualLayer` accessories are the ones the configurator's image-mapping
 * system composites into the cargo preview; the rest only affect price.
 */
export const accessories: Accessory[] = [
  {
    id: 'floor',
    name: 'กรุพื้นอลูมิเนียม',
    description: 'พื้นอลูมิเนียมสำหรับพื้นที่บรรทุก ทนแรงกระแทกและทำความสะอาดง่าย',
    price: 18000,
    isVisualLayer: true,
  },
  {
    id: 'panel',
    name: 'กรุผนังอลูมิเนียม',
    description: 'ป้องกันผนังห้องบรรทุกจากการขนถ่ายสินค้า',
    price: 9000,
    isVisualLayer: true,
  },
  {
    id: 'ac',
    name: 'ติดตั้งแอร์ปรับอากาศ',
    description: 'เพิ่มความเย็นให้พื้นที่ด้านหลัง เหมาะกับผู้โดยสารและสินค้าบางประเภท',
    price: 25000,
    isVisualLayer: true,
  },
  {
    id: 'roofrack',
    name: 'RACK หลังคา',
    description: 'เพิ่มพื้นที่บรรทุกด้านบน เหมาะกับสินค้าที่มีขนาดยาวหรือเบา',
    price: 12000,
    isVisualLayer: false,
  },
  {
    id: 'ladder',
    name: 'บันไดปีนท้ายรถ',
    description: 'บันไดพับสำหรับขึ้น-ลงพื้นที่บรรทุกด้านหลัง',
    price: 4500,
    isVisualLayer: false,
  },
  {
    id: 'leafspring',
    name: 'เสริมแหนบ',
    description: 'เพิ่มความสามารถในการรับน้ำหนักบรรทุก เหมาะกับงานขนส่งของหนัก',
    price: 8000,
    isVisualLayer: false,
  },
  {
    id: 'window',
    name: 'เจาะหน้าต่าง',
    description: 'เจาะช่องหน้าต่างด้านข้างห้องบรรทุก เพิ่มแสงและการระบายอากาศ',
    price: 6500,
    isVisualLayer: false,
  },
];

/** Layer order the configurator's image-mapping system composites in. */
export const layerOrder = ['floor', 'panel', 'ac'] as const;

/** Combinations that have a real (in this build: labeled placeholder) preview image. */
export const configuratorImageMap = ['base', 'floor', 'floor+panel', 'floor+ac', 'floor+panel+ac', 'ac', 'panel'];

/** Photo grid of all 7 accessories shown ahead of the picker — same order as the design export. */
export const accessoryGalleryOrder = ['floor', 'roofrack', 'ladder', 'window', 'panel', 'ac', 'leafspring'];

export const useCases: AccessoryUseCase[] = [
  { id: 'cargo', label: 'ขนส่งสินค้า', accessoryIds: ['floor', 'panel'] },
  { id: 'factory', label: 'ใช้งานในโรงงาน', accessoryIds: ['floor'] },
  { id: 'service', label: 'Service Vehicle', accessoryIds: ['floor'] },
  { id: 'cold', label: 'ขนส่งควบคุมอุณหภูมิ', accessoryIds: ['floor', 'panel', 'ac'] },
  { id: 'custom', label: 'กำหนดเอง', accessoryIds: [] },
];

/** Persona quick-pick cards — "เลือกอุปกรณ์ตามสายงาน" section. */
export const tradePersonas: TradePersona[] = [
  {
    title: 'สายขนส่ง',
    description: 'วิ่งส่งของทุกวัน ต้องบรรทุกได้เต็มพื้นที่และทนทาน',
    accessoryIds: ['floor', 'panel', 'roofrack'],
    icon: 'truck',
  },
  {
    title: 'สายช่าง',
    description: 'ขนอุปกรณ์และเครื่องมือหน้างาน ต้องขึ้น-ลงของสะดวก',
    accessoryIds: ['floor', 'ladder', 'roofrack'],
    icon: 'wrench',
  },
  {
    title: 'ร้านค้า ค้าส่ง / ค้าปลีก',
    description: 'ขนสินค้าคละขนาด ต้องการอากาศถ่ายเทและแสงสว่างในตู้',
    accessoryIds: ['panel', 'ac', 'window'],
    icon: 'store',
  },
];

export const cargoShots: CargoShot[] = [
  { label: 'พื้นที่บรรทุก', filename: 'porta-cargo-area.webp' },
  { label: 'เปิดประตูท้าย', filename: 'porta-rear-door-open.webp' },
  { label: 'เปิดประตูข้าง', filename: 'porta-side-door-open.webp' },
  { label: 'พื้นห้องบรรทุก', filename: 'porta-cargo-floor.webp' },
];

/** Real cargo dimensions + everyday-object equivalents — source: PORTA EV spec sheet + design export. */
export const cargoCapacity = {
  volume: '6.5',
  volumeUnit: 'ลบ.ม.',
  lengthM: 2.83,
  widthM: 1.65,
  wheelArchWidthM: 1.25,
  heightM: 1.35,
  toleranceNote: 'ขนาดอาจมีความคลาดเคลื่อนประมาณ 2–3 เซนติเมตร',
  equivalents: [
    { item: 'พาเลทมาตรฐาน 1.0 × 1.2 ม.', amount: '2 พาเลท' },
    { item: 'ลังพลาสติกขนส่ง 60 × 40 × 32 ซม.', amount: 'ประมาณ 80 ลัง' },
    { item: 'ถังน้ำดื่ม 20 ลิตร', amount: 'ประมาณ 60 ถัง' },
  ],
  payloadKg: 1249,
};

/** 3 real customer-use video shorts embedded on the PORTA page (YouTube Shorts, click-to-load). */
export const portaVideos = [
  { id: 'v1', title: 'PORTA EV กับงานขนส่งจริง', youtubeId: '-fzMjtyf83M' },
  { id: 'v2', title: 'บรรทุกงานจริง 1.2 ตัน !!', youtubeId: 'lzMDBgkcE9w' },
  { id: 'v3', title: 'อาชีพยอดฮิตที่ซื้อ PORTA EV', youtubeId: 'ZnW460R0rw0' },
];

export function getAccessory(id: string): Accessory | undefined {
  return accessories.find((a) => a.id === id);
}

/**
 * Resolve which configurator preview image key applies for a set of
 * selected visual-layer accessory ids, falling back to the closest
 * combination that does have an image rather than ever showing a broken
 * one (Placeholder Rule / section 16).
 */
export function resolveConfiguratorImage(selectedIds: string[]): { key: string; fallbackOf: string | null } {
  const selected = layerOrder.filter((id) => selectedIds.includes(id));
  const key = selected.length ? selected.join('+') : 'base';
  if (configuratorImageMap.includes(key)) return { key, fallbackOf: null };

  const probe = [...selected];
  while (probe.length) {
    probe.pop();
    const candidate = probe.length ? probe.join('+') : 'base';
    if (configuratorImageMap.includes(candidate)) return { key, fallbackOf: candidate };
  }
  return { key, fallbackOf: 'base' };
}
