import { PLACEHOLDER, Vehicle, VehicleColor, VehicleHighlight, VehicleImageSlot, SpecGroup } from './types';

/** Shared across models until real color runs are confirmed per model. */
export const colors: VehicleColor[] = [
  { name: 'ขาว', code: '#f0efec', slug: 'white' },
  { name: 'เงิน', code: '#b9bcbe', slug: 'silver' },
  { name: 'ดำ', code: '#232326', slug: 'black' },
  { name: 'น้ำเงิน', code: '#12315f', slug: 'blue' },
];

export const exteriorViews: VehicleImageSlot[] = [
  { slug: 'front', label: 'หน้าตรง'},
  { slug: 'rear', label: 'ด้านท้าย'},
  { slug: 'side', label: 'ด้านข้าง'},
  { slug: 'front-34', label: 'หน้า 3/4'},
  { slug: 'rear-34', label: 'ท้าย 3/4'},
  { slug: 'details', label: 'รายละเอียด'},
];

export const interiorViews: VehicleImageSlot[] = [
  { slug: 'dashboard', label: 'แผงหน้าปัด'},
  { slug: 'steering-wheel', label: 'พวงมาลัย'},
  { slug: 'center-display', label: 'จอกลาง'},
  { slug: 'front-seats', label: 'เบาะหน้า'},
  { slug: 'rear-seats', label: 'เบาะหลัง'},
  { slug: 'cargo-area', label: 'พื้นที่เก็บของ'},
  { slug: 'details', label: 'รายละเอียดภายใน'},
];

/** Numbers are unconfirmed for every model — placeholder rule applies until the dealer signs off. */
export const genericHighlights: VehicleHighlight[] = [
  { value: 'XXX', unit: 'KM', label: 'ระยะทางต่อการชาร์จ' },
  { value: 'X', unit: 'SEATS', label: 'จำนวนที่นั่ง' },
  { value: 'XX', unit: 'kWh', label: 'ความจุแบตเตอรี่' },
  { value: 'XXX', unit: 'Nm', label: 'แรงบิดสูงสุด' },
];

const specTemplate: { id: string; title: string; rows: string[] }[] = [
  { id: 'dimensions', title: 'ขนาดตัวรถ', rows: ['ความยาว', 'ความกว้าง', 'ความสูง', 'ระยะฐานล้อ', 'น้ำหนักรถ'] },
  { id: 'motor', title: 'มอเตอร์ไฟฟ้า', rows: ['ชนิดมอเตอร์', 'กำลังสูงสุด', 'แรงบิดสูงสุด', 'ระบบขับเคลื่อน'] },
  { id: 'battery', title: 'แบตเตอรี่', rows: ['ชนิดแบตเตอรี่', 'ความจุแบตเตอรี่', 'ตำแหน่งติดตั้ง'] },
  { id: 'range', title: 'ระยะทางการขับขี่', rows: ['ระยะทางต่อการชาร์จ', 'อัตราสิ้นเปลืองพลังงาน'] },
  { id: 'charging', title: 'การชาร์จ', rows: ['DC ชาร์จเร็ว', 'AC ชาร์จปกติ', 'ชนิดหัวชาร์จ'] },
  { id: 'exterior', title: 'ภายนอก', rows: ['ขนาดล้อ', 'ไฟหน้า', 'ไฟท้าย', 'กระจกมองข้าง'] },
  { id: 'interior', title: 'ภายใน', rows: ['หน้าจอกลาง', 'เรือนไมล์', 'วัสดุหุ้มเบาะ', 'ระบบปรับอากาศ'] },
  { id: 'safety', title: 'ความปลอดภัย', rows: ['ถุงลมนิรภัย', 'ระบบเบรก ABS/EBD', 'ระบบควบคุมเสถียรภาพ', 'กล้องมองหลัง'] },
  { id: 'adas', title: 'ระบบช่วยขับขี่ (ADAS)', rows: ['ระบบเตือนการชน', 'ครูสคอนโทรล', 'เตือนจุดอับสายตา'] },
  { id: 'convenience', title: 'ความสะดวก', rows: ['ระบบกุญแจ', 'ช่องชาร์จ USB', 'ระบบเชื่อมต่อ'] },
  { id: 'warranty', title: 'การรับประกัน', rows: ['รับประกันตัวรถ', 'รับประกันแบตเตอรี่', 'รับประกันมอเตอร์'] },
];

export const genericSpecifications: SpecGroup[] = specTemplate.map((g) => ({
  id: g.id,
  title: g.title,
  rows: g.rows.map((label) => ({ label, value: PLACEHOLDER })),
}));

export const vehicles: Vehicle[] = [
  {
    slug: 'porta',
    name: 'WULING PORTA EV',
    shortName: 'PORTA EV',
    tagline: 'รถเพื่อการพาณิชย์ไฟฟ้า ที่ปรับพื้นที่ได้ตามงานของคุณ',
    positioning: 'EV for Business',
    vehicleType: 'Commercial EV',
    seats: 'XX',
    startingPrice: 499000,
    colors,
    exteriorViews,
    interiorViews,
    highlights: genericHighlights,
    specifications: genericSpecifications,
    isConfigurable: true,
    variants: [
      {
        id: 'standard',
        name: 'Standard',
        price: 499000,
        features: ['พื้นที่บรรทุกมาตรฐาน', 'รองรับชาร์จ DC/AC', 'รับประกันแบตเตอรี่'],
      },
      {
        id: 'cargo-plus',
        name: 'Cargo Plus',
        price: 539000,
        promotionLabel: 'ฟรีชุดกรุพื้น',
        recommended: true,
        features: ['กรุพื้นอลูมิเนียม', 'กรุผนังด้านข้าง', 'เบาะหุ้มหนัง'],
      },
    ],
  },
  {
    slug: 'darion',
    name: 'WULING DARION',
    shortName: 'DARION',
    tagline: 'MPV ไฟฟ้าสำหรับครอบครัว พื้นที่กว้างทุกแถวที่นั่ง',
    positioning: 'Family Electric MPV',
    vehicleType: 'Electric MPV',
    seats: 'XX',
    startingPrice: 799000,
    colors,
    exteriorViews,
    interiorViews,
    highlights: genericHighlights,
    specifications: genericSpecifications,
    variants: [
      {
        id: 'standard',
        name: 'Standard',
        price: 799000,
        features: ['เบาะ 3 แถว', 'จอกลางระบบสัมผัส', 'กล้องมองหลัง'],
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 869000,
        recommended: true,
        features: ['ระบบ ADAS', 'หลังคาซันรูฟ', 'เบาะหุ้มหนัง'],
      },
    ],
  },
  {
    slug: 'binguo',
    name: 'WULING BINGUO',
    shortName: 'BINGUO',
    tagline: 'รถไฟฟ้าขนาดกะทัดรัด คล่องตัวสำหรับการใช้งานในเมือง',
    positioning: 'Urban Electric Car',
    vehicleType: 'Urban EV',
    seats: 'XX',
    startingPrice: 549000,
    colors,
    exteriorViews,
    interiorViews,
    highlights: genericHighlights,
    specifications: genericSpecifications,
    variants: [
      {
        id: 'standard',
        name: 'Standard',
        price: 549000,
        features: ['ขนาดกะทัดรัด', 'ชาร์จ AC ที่บ้าน', 'จอกลางระบบสัมผัส'],
      },
      {
        id: 'long-range',
        name: 'Long Range',
        price: 599000,
        promotionLabel: 'ฟรีเครื่องชาร์จบ้าน',
        recommended: true,
        features: ['แบตเตอรี่ความจุสูง', 'ล้ออัลลอย', 'กล้องรอบคัน'],
      },
    ],
  },
  {
    slug: 'ekxion',
    name: 'WULING EKXION',
    shortName: 'EKXION',
    tagline: 'เจเนอเรชันใหม่ของ WULING ดีไซน์และเทคโนโลยีรุ่นล่าสุด',
    positioning: 'New Generation WULING',
    vehicleType: 'New Generation EV',
    seats: 'XX',
    startingPrice: 699000,
    colors,
    exteriorViews,
    interiorViews,
    highlights: genericHighlights,
    specifications: genericSpecifications,
    variants: [
      {
        id: 'standard',
        name: 'Standard',
        price: 699000,
        features: ['ดีไซน์เจเนอเรชันใหม่', 'ระบบเชื่อมต่อสมาร์ตโฟน', 'กล้องมองหลัง'],
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 759000,
        recommended: true,
        features: ['ระบบ ADAS', 'จอคู่', 'ชุดแต่งรอบคัน'],
      },
    ],
  },
];

export function getVehicle(slug: string): Vehicle | undefined {
  return vehicles.find((v) => v.slug === slug);
}
