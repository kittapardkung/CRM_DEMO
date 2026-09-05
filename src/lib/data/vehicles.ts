import { PLACEHOLDER, Vehicle, VehicleColor, VehicleHighlight, VehicleImageSlot, SpecGroup } from './types';

/** Shared across models that don't have a confirmed color run of their own (BINGUO, EKXION). */
export const colors: VehicleColor[] = [
  { name: 'ขาว', code: '#f0efec', slug: 'white' },
  { name: 'เงิน', code: '#b9bcbe', slug: 'silver' },
  { name: 'ดำ', code: '#232326', slug: 'black' },
  { name: 'น้ำเงิน', code: '#12315f', slug: 'blue' },
];

export const exteriorViews: VehicleImageSlot[] = [
  { slug: 'front', label: 'หน้าตรง' },
  { slug: 'front-34', label: 'หน้า 3/4' },
  { slug: 'rear', label: 'ด้านท้าย' },
  { slug: 'side', label: 'ด้านข้าง' },
  { slug: 'rear-34', label: 'ท้าย 3/4' },
];

export const interiorViews: VehicleImageSlot[] = [
  { slug: 'dashboard', label: 'แผงหน้าปัด' },
  { slug: 'steering-wheel', label: 'พวงมาลัย' },
  { slug: 'center-display', label: 'จอกลาง' },
  { slug: 'front-seats', label: 'เบาะหน้า' },
  { slug: 'rear-seats', label: 'เบาะหลัง' },
  { slug: 'cargo-area', label: 'พื้นที่เก็บของ' },
  { slug: 'details', label: 'รายละเอียดภายใน' },
];

/** PORTA has no rear seats / cargo area / center display / details interior shots — it's a 2-seat cargo van. */
const portaInteriorViews = interiorViews.filter(
  (v) => !['rear-seats', 'cargo-area', 'details', 'center-display'].includes(v.slug),
);

/** Numbers are unconfirmed for BINGUO and EKXION — placeholder rule applies until the dealer signs off. */
export const genericHighlights: VehicleHighlight[] = [
  { value: 'XXX', unit: 'KM', label: 'ระยะทางต่อการชาร์จ' },
  { value: 'X', unit: 'SEATS', label: 'จำนวนที่นั่ง' },
  { value: 'XX', unit: 'kWh', label: 'ความจุแบตเตอรี่' },
  { value: 'XXX', unit: 'Nm', label: 'แรงบิดสูงสุด' },
];

/**
 * Master specification template — the superset of every attribute row
 * that appears across all four models. Each vehicle supplies only the
 * rows it has confirmed values for via `specValues`; everything else
 * falls back to the Placeholder Rule automatically (see `buildSpecGroups`).
 */
const specTemplate: { id: string; title: string; rows: string[] }[] = [
  { id: 'dimensions', title: 'ขนาดตัวรถ', rows: ['ความยาว', 'ความกว้าง', 'ความสูง', 'ระยะฐานล้อ', 'น้ำหนักรถ'] },
  { id: 'motor', title: 'มอเตอร์ไฟฟ้า', rows: ['ชนิดมอเตอร์', 'กำลังสูงสุด', 'แรงบิดสูงสุด', 'ระบบขับเคลื่อน', 'ระบบส่งกำลัง'] },
  { id: 'battery', title: 'แบตเตอรี่', rows: ['ชนิดแบตเตอรี่', 'ความจุแบตเตอรี่', 'ตำแหน่งติดตั้ง'] },
  { id: 'range', title: 'ระยะทางการขับขี่', rows: ['ระยะทางต่อการชาร์จ'] },
  { id: 'charging', title: 'การชาร์จ', rows: ['DC ชาร์จเร็ว', 'AC ชาร์จปกติ', 'ชนิดหัวชาร์จ'] },
  {
    id: 'exterior',
    title: 'ภายนอก',
    rows: [
      'ขนาดล้อ', 'ไฟหน้า', 'ไฟท้าย', 'กระจกมองข้าง', 'ระบบเบรก', 'ระบบกันสะเทือน', 'ระบบพวงมาลัย',
      'ประตูสไลด์', 'หลังคา Sunroof', 'พื้นที่บรรทุก', 'มุมเปิดบานพับหลัง', 'ประตูข้าง',
      'ขนาดห้องบรรจุ (ยาว×กว้าง)', 'ความกว้างระหว่างซุ้มล้อ', 'ความสูงใต้หลังคา',
    ],
  },
  { id: 'interior', title: 'ภายใน', rows: ['หน้าจอกลาง', 'เรือนไมล์', 'วัสดุหุ้มเบาะ', 'ระบบปรับอากาศ', 'เบาะแถวสอง', 'เบาะคนขับ'] },
  {
    id: 'safety',
    title: 'ความปลอดภัย',
    rows: ['ถุงลมนิรภัย', 'ระบบเบรก ABS/EBD', 'ระบบควบคุมเสถียรภาพ', 'กล้องมองหลัง', 'เบรกมือไฟฟ้า', 'ระบบช่วยออกตัวบนทางลาด', 'TPMS', 'ISOFIX', 'ระบบช่วยขับขี่ (ADAS)'],
  },
  { id: 'convenience', title: 'ความสะดวก', rows: ['ระบบกุญแจ', 'ช่องชาร์จ USB', 'ที่ชาร์จโทรศัพท์ไร้สาย', 'ระบบเชื่อมต่อ', 'ลำโพง', 'ระบบสั่งการด้วยเสียง'] },
  { id: 'warranty', title: 'การรับประกัน', rows: ['รับประกันตัวรถ', 'รับประกันแบตเตอรี่', 'รับประกันมอเตอร์'] },
];

/** Resolves the shared spec template against one vehicle's confirmed values, placeholder for the rest. */
function buildSpecGroups(specValues?: Record<string, string>): SpecGroup[] {
  return specTemplate.map((g) => ({
    id: g.id,
    title: g.title,
    rows: g.rows.map((label) => ({ label, value: specValues?.[label] ?? PLACEHOLDER })),
  }));
}

export const genericSpecifications: SpecGroup[] = buildSpecGroups();

/** Real confirmed specs — source: WULING PORTA EV spec sheet + Wuling Chonburi v2 design export. */
const portaSpecValues: Record<string, string> = {
  ความยาว: '5,010 มม.', ความกว้าง: '1,800 มม.', ความสูง: '1,975 มม.', ระยะฐานล้อ: '3,050 มม.', น้ำหนักรถ: '1,665 กก.',
  ชนิดมอเตอร์: 'Permanent Magnet Synchronous Motor', กำลังสูงสุด: '75 kW', แรงบิดสูงสุด: '180 Nm', ระบบขับเคลื่อน: 'ขับเคลื่อนล้อหลัง',
  ชนิดแบตเตอรี่: 'Lithium Iron Phosphate (LFP)', ความจุแบตเตอรี่: '56.9 kWh', ตำแหน่งติดตั้ง: 'กลางตัวรถ',
  ระยะทางต่อการชาร์จ: '400 กม. (มาตรฐาน CLTC)',
  'DC ชาร์จเร็ว': '30 นาที (30–80%)', 'AC ชาร์จปกติ': '6–8 ชม.', ชนิดหัวชาร์จ: 'CCS Type 2',
  ขนาดล้อ: 'ล้อเหล็ก 15 นิ้ว ยาง 195/70 R15C', ไฟหน้า: 'LED',
  พื้นที่บรรทุก: '6.5 ลูกบาศก์เมตร', มุมเปิดบานพับหลัง: '270 องศา', ประตูข้าง: 'ประตูสไลด์ 2 บาน',
  'ขนาดห้องบรรจุ (ยาว×กว้าง)': '2.83 × 1.65 ม.', ความกว้างระหว่างซุ้มล้อ: '1.25 ม.', ความสูงใต้หลังคา: '1.35 ม.',
  หน้าจอกลาง: 'จอเครื่องเสียง 7 นิ้ว', วัสดุหุ้มเบาะ: 'ผ้า', ระบบปรับอากาศ: 'มี',
  ถุงลมนิรภัย: 'คู่หน้า', 'ระบบเบรก ABS/EBD': 'มี ABS และ EBD', ระบบควบคุมเสถียรภาพ: 'มี', กล้องมองหลัง: 'มี',
  ระบบกุญแจ: 'มี', 'ช่องชาร์จ USB': 'มี', ระบบเชื่อมต่อ: 'วิทยุ AM/FM พร้อม USB และบลูทูธ',
  รับประกันตัวรถ: '3 ปี / 100,000 กม.', รับประกันแบตเตอรี่: '5 ปี / 200,000 กม.', รับประกันมอเตอร์: '5 ปี / 200,000 กม.',
};

/** Real confirmed specs — source: WULING STARLIGHT DARION EV spec sheet + Wuling Chonburi v2 design export. */
const darionSpecValues: Record<string, string> = {
  ความยาว: '4,910 มม.', ความกว้าง: '1,870 มม.', ความสูง: '1,770 มม.', ระยะฐานล้อ: '2,910 มม.',
  ชนิดมอเตอร์: 'มอเตอร์ไฟฟ้า', กำลังสูงสุด: '150 kW (201 hp)', แรงบิดสูงสุด: '310 Nm', ระบบขับเคลื่อน: 'ขับเคลื่อนล้อหน้า', ระบบส่งกำลัง: 'แบบ Single Reduction',
  ชนิดแบตเตอรี่: 'ลิเธียมไอออน', ความจุแบตเตอรี่: '69.2 kWh',
  ระยะทางต่อการชาร์จ: '540 กม. (มาตรฐาน CLTC)',
  'DC ชาร์จเร็ว': '20 นาที (30–80%)',
  ขนาดล้อ: 'ล้ออัลลอย 17 นิ้ว ยาง 215/55 R17', ไฟหน้า: 'LED พร้อมไฟส่องมุมและไฟกลางวัน (DRL)',
  ระบบเบรก: 'ดิสก์ (หน้า) / ดิสก์ (หลัง)', ระบบกันสะเทือน: 'แมคเฟอร์สันอิสระ (หน้า) / อิสระควบคุมการขับขี่ (หลัง)',
  ระบบพวงมาลัย: 'พวงมาลัยพาวเวอร์ไฟฟ้า', ประตูสไลด์: 'ไฟฟ้าอัตโนมัติทั้ง 2 ฝั่ง (Premium)', 'หลังคา Sunroof': 'แบบไฟฟ้า (Premium)',
  หน้าจอกลาง: '12.8 นิ้ว HD', เรือนไมล์: 'จอมาตรวัด 8.8 นิ้ว', วัสดุหุ้มเบาะ: 'หนังสังเคราะห์',
  ระบบปรับอากาศ: 'แอร์อัตโนมัติพร้อมแผ่นกรอง PM2.5', เบาะแถวสอง: 'Captain Seat แบบแยก (ทำความเย็นใน Premium)', เบาะคนขับ: 'ปรับไฟฟ้า 6 ทิศทาง',
  ถุงลมนิรภัย: '4 ใบ (Comfort) / 6 ใบ (Premium)', 'ระบบเบรก ABS/EBD': 'ABS + EBD with ESC', ระบบควบคุมเสถียรภาพ: 'มี',
  กล้องมองหลัง: 'มี (360 องศาใน Premium)', เบรกมือไฟฟ้า: 'Electric Parking Brake with Auto-Hold', ระบบช่วยออกตัวบนทางลาด: 'Hill Hold Control',
  TPMS: 'ระบบตรวจวัดแรงดันลมยาง', ISOFIX: 'สำหรับเบาะแถว 2 และ 3',
  'ระบบช่วยขับขี่ (ADAS)': 'Level-2 — ACC, IDA, FCW, AEB, LDW, BSD, LCA, DOW, RCTA, RCW, IHMA',
  ระบบกุญแจ: 'กุญแจอัจฉริยะพร้อมปุ่มสตาร์ท', 'ช่องชาร์จ USB': 'มี พร้อมช่องจ่ายไฟ 12V', ที่ชาร์จโทรศัพท์ไร้สาย: '50W (Premium)',
  ระบบเชื่อมต่อ: 'วิทยุ AM/FM, บลูทูธ, USB, เชื่อมต่อ Smartphone, Apple CarPlay และ Android Auto (Premium)',
  ลำโพง: '6 ตัว', ระบบสั่งการด้วยเสียง: 'มี',
  รับประกันตัวรถ: '6 ปี / 150,000 กม.', รับประกันแบตเตอรี่: '8 ปี / 150,000 กม.',
};

export const vehicles: Vehicle[] = [
  {
    slug: 'porta',
    name: 'WULING PORTA EV',
    shortName: 'PORTA EV',
    tagline: 'รถเพื่อการพาณิชย์ไฟฟ้า ที่ปรับพื้นที่ได้ตามงานของคุณ',
    positioning: 'EV for Business',
    vehicleType: 'Commercial EV',
    seats: '2',
    startingPrice: 659000,
    colors: [{ name: 'ขาว (Polar White)', code: '#f0efec', slug: 'white' }],
    exteriorViews,
    interiorViews: portaInteriorViews,
    highlights: [
      { value: '400', unit: 'KM (CLTC)', label: 'ระยะทางวิ่งสูงสุด' },
      { value: '2', unit: 'SEATS', label: 'จำนวนที่นั่ง' },
      { value: '56.9', unit: 'kWh', label: 'ความจุแบตเตอรี่' },
      { value: '180', unit: 'Nm', label: 'แรงบิดสูงสุด' },
      { value: '6.5', unit: 'm³', label: 'พื้นที่บรรทุก' },
    ],
    specifications: buildSpecGroups(portaSpecValues),
    specValues: portaSpecValues,
    isConfigurable: true,
    variants: [
      {
        id: 'standard',
        name: 'Standard',
        price: 659000,
        features: ['พื้นที่บรรทุกมาตรฐาน 6.5 ลบ.ม.', 'รองรับชาร์จ DC/AC', 'รับประกันแบตเตอรี่ 5 ปี / 200,000 กม.'],
      },
    ],
  },
  {
    slug: 'darion',
    name: 'WULING STARLIGHT DARION EV',
    shortName: 'DARION',
    tagline: 'MPV ไฟฟ้าสำหรับครอบครัว พื้นที่กว้างทุกแถวที่นั่ง',
    positioning: 'Family Electric MPV',
    vehicleType: 'Electric MPV',
    seats: '7',
    startingPrice: 839000,
    colors: [
      { name: 'Haze Grey', code: '#d8d6d0', slug: 'haze-grey' },
      { name: 'Frosty White', code: '#f3f3f1', slug: 'frosty-white' },
      { name: 'Orchid Purple', code: '#3b2440', slug: 'orchid-purple' },
      { name: 'Starry Black', code: '#1c1c1e', slug: 'starry-black' },
    ],
    exteriorViews,
    interiorViews,
    highlights: [
      { value: '540', unit: 'KM', label: 'ระยะทางต่อการชาร์จ (CLTC)' },
      { value: '7', unit: 'SEATS', label: 'จำนวนที่นั่ง' },
      { value: '69.2', unit: 'kWh', label: 'ความจุแบตเตอรี่' },
      { value: '310', unit: 'Nm', label: 'แรงบิดสูงสุด' },
    ],
    specifications: buildSpecGroups(darionSpecValues),
    specValues: darionSpecValues,
    variants: [
      {
        id: 'comfort',
        name: 'Comfort',
        price: 839000,
        features: ['Captain Seat แถวสอง', 'จอกลาง 12.8 นิ้ว', 'ADAS Level-2', 'ถุงลม 6 ใบ'],
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 899000,
        features: ['ประตูสไลด์ไฟฟ้า 2 ฝั่ง', 'ซันรูฟไฟฟ้า', 'กล้อง 360 องศา', 'ถุงลม 6 ใบ'],
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
    startingPrice: 399000,
    colors,
    exteriorViews,
    interiorViews,
    highlights: genericHighlights,
    specifications: genericSpecifications,
    variants: [
      {
        id: 'standard',
        name: 'Standard',
        price: 399000,
        features: ['ขนาดกะทัดรัด', 'ชาร์จ AC ที่บ้าน', 'จอกลางระบบสัมผัส'],
      },
      {
        id: 'long-range',
        name: 'Long Range',
        price: 449000,
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
    startingPrice: null,
    colors,
    exteriorViews,
    interiorViews,
    highlights: genericHighlights,
    specifications: genericSpecifications,
    variants: [
      {
        id: 'standard',
        name: 'Standard',
        price: null,
        features: ['ดีไซน์เจเนอเรชันใหม่', 'ระบบเชื่อมต่อสมาร์ตโฟน', 'กล้องมองหลัง'],
      },
      {
        id: 'premium',
        name: 'Premium',
        price: null,
        features: ['ระบบ ADAS', 'จอคู่', 'ชุดแต่งรอบคัน'],
      },
    ],
  },
];

export function getVehicle(slug: string): Vehicle | undefined {
  return vehicles.find((v) => v.slug === slug);
}
