import { Vehicle, PLACEHOLDER } from './types';
import { money } from '../format';

export interface CompareRow {
  label: string;
  value: (v: Vehicle) => string;
}

export const compareRows: CompareRow[] = [
  { label: 'ราคาเริ่มต้น', value: (v) => money(v.startingPrice) },
  { label: 'ประเภทรถ', value: (v) => v.vehicleType },
  { label: 'จำนวนที่นั่ง', value: (v) => v.seats },
  { label: 'ขนาดตัวรถ', value: () => PLACEHOLDER },
  { label: 'แบตเตอรี่', value: () => PLACEHOLDER },
  { label: 'ระยะทางต่อการชาร์จ', value: () => PLACEHOLDER },
  { label: 'มอเตอร์', value: () => PLACEHOLDER },
  { label: 'แรงบิด', value: () => PLACEHOLDER },
  { label: 'การชาร์จ', value: () => PLACEHOLDER },
  { label: 'พื้นที่บรรทุก', value: () => PLACEHOLDER },
  { label: 'การรับประกัน', value: () => PLACEHOLDER },
  { label: 'ฟีเจอร์เด่น', value: (v) => v.tagline },
];
