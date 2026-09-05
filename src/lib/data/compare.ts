import { Vehicle, PLACEHOLDER } from './types';
import { money } from '../format';

export interface CompareRow {
  label: string;
  value: (v: Vehicle) => string;
}

const spec = (label: string) => (v: Vehicle) => v.specValues?.[label] ?? PLACEHOLDER;

export const compareRows: CompareRow[] = [
  { label: 'ราคาเริ่มต้น', value: (v) => money(v.startingPrice) },
  { label: 'ประเภทรถ', value: (v) => v.vehicleType },
  { label: 'จำนวนที่นั่ง', value: (v) => v.seats },
  { label: 'ขนาดตัวรถ', value: (v) => (v.specValues ? `${v.specValues['ความยาว'] ?? PLACEHOLDER} × ${v.specValues['ความกว้าง'] ?? PLACEHOLDER} × ${v.specValues['ความสูง'] ?? PLACEHOLDER}` : PLACEHOLDER) },
  { label: 'แบตเตอรี่', value: spec('ความจุแบตเตอรี่') },
  { label: 'ระยะทางต่อการชาร์จ', value: spec('ระยะทางต่อการชาร์จ') },
  { label: 'มอเตอร์', value: spec('กำลังสูงสุด') },
  { label: 'แรงบิด', value: spec('แรงบิดสูงสุด') },
  { label: 'การชาร์จ', value: spec('DC ชาร์จเร็ว') },
  { label: 'พื้นที่บรรทุก', value: spec('พื้นที่บรรทุก') },
  { label: 'การรับประกัน', value: spec('รับประกันตัวรถ') },
  { label: 'ฟีเจอร์เด่น', value: (v) => v.tagline },
];
