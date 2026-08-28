import { Accessory, AccessoryUseCase, CargoShot } from './types';

/**
 * PORTA configurator accessories. `isVisualLayer` accessories are the ones
 * the configurator image-mapping system composites into the preview; the
 * rest (e.g. leather seats) only affect price, not the preview image.
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
    name: 'กรุผนังด้านข้าง',
    description: 'ป้องกันผนังห้องบรรทุกจากการขนถ่ายสินค้า',
    price: 9000,
    isVisualLayer: true,
  },
  {
    id: 'ac',
    name: 'เครื่องปรับอากาศด้านหลัง',
    description: 'เพิ่มความเย็นให้พื้นที่ด้านหลัง เหมาะกับผู้โดยสารและสินค้าบางประเภท',
    price: 25000,
    isVisualLayer: true,
  },
  {
    id: 'seat',
    name: 'เพิ่มเก้าอี้',
    description: 'เพิ่มที่นั่งสำหรับทีมงานหรือผู้โดยสารด้านหลัง',
    price: 12000,
    isVisualLayer: true,
  },
  {
    id: 'leather',
    name: 'หุ้มเบาะหนัง',
    description: 'หุ้มเบาะหนังสังเคราะห์ ดูแลรักษาง่าย',
    price: 15000,
    isVisualLayer: false,
  },
];

/** Layer order the configurator's image-mapping system composites in. */
export const layerOrder = ['floor', 'panel', 'ac', 'seat'] as const;

/** Combinations that have a real (in this prototype: labeled placeholder) preview image. */
export const configuratorImageMap = ['base', 'floor', 'floor+panel', 'floor+ac', 'floor+panel+ac', 'floor+panel+ac+seat', 'ac', 'panel'];

export const useCases: AccessoryUseCase[] = [
  { id: 'cargo', label: 'ขนส่งสินค้า', accessoryIds: ['floor', 'panel'] },
  { id: 'factory', label: 'ใช้งานในโรงงาน', accessoryIds: ['floor'] },
  { id: 'service', label: 'Service Vehicle', accessoryIds: ['floor', 'seat'] },
  { id: 'cold', label: 'ขนส่งควบคุมอุณหภูมิ', accessoryIds: ['floor', 'panel', 'ac'] },
  { id: 'passenger', label: 'รับส่งผู้โดยสาร', accessoryIds: ['floor', 'panel', 'ac', 'seat'] },
  { id: 'custom', label: 'กำหนดเอง', accessoryIds: [] },
];

export const cargoShots: CargoShot[] = [
  { label: 'พื้นที่บรรทุก', filename: 'porta-cargo-area.webp' },
  { label: 'เปิดประตูท้าย', filename: 'porta-rear-door-open.webp' },
  { label: 'เปิดประตูข้าง', filename: 'porta-side-door-open.webp' },
  { label: 'พื้นห้องบรรทุก', filename: 'porta-cargo-floor.webp' },
  { label: 'ขนาดพื้นที่บรรทุก', filename: 'porta-cargo-dimensions.webp', hasDimensionOverlay: true },
  { label: 'ตัวอย่างการบรรทุก', filename: 'porta-loading-example.webp' },
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
