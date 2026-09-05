import { LeaseBenefit, LeaseCompareRow, LeaseRates, LeaseStep, LeaseVehicle, TBC_COST } from './types';

/**
 * Real ORIX Operating Lease rates — source: ใบเสนอราคา, บริษัทไทยโอริกซ์ลีสซิ่ง จำกัด,
 * เลขที่เสนอราคา 26/08/2026, ลูกค้า JUSTICE GROUP CO., LTD. Prices are per vehicle per
 * month, VAT included. Tier keys are the mileage ceiling (km/vehicle/month) each rate
 * applies up to; a fleet whose usage exceeds every listed tier has no rate here yet.
 */
export const LEASE_RATES: LeaseRates = {
  porta: {
    list: 659000,
    label: 'WULING PORTA EV',
    tiers: {
      4000: { 36: 23647, 48: 20811.5, 60: 19474 },
      5000: { 36: 24610, 48: 21560.5, 60: 20116 },
      6000: { 36: 25359, 48: 22256 },
    },
  },
  'darion-comfort': {
    list: 839000,
    label: 'WULING DARION EV (Comfort)',
    tiers: {
      4000: { 36: 28408.5, 48: 24824, 60: 23165.5 },
      5000: { 36: 29478.5, 48: 25680, 60: 23914.5 },
      6000: { 36: 30281, 48: 26429 },
    },
  },
  'darion-premium': {
    list: 899000,
    label: 'WULING DARION EV (Premium)',
    tiers: {
      4000: { 36: 29960, 48: 26108, 60: 24342.5 },
      5000: { 36: 31083.5, 48: 26964, 60: 23914.5 },
      6000: { 36: 31886, 48: 27766.5 },
    },
  },
};

export const leaseVehicles: LeaseVehicle[] = [
  {
    slug: 'porta',
    name: 'WULING PORTA EV',
    headline: 'รถตู้ไฟฟ้าสำหรับธุรกิจ',
    tags: ['LOGISTICS', 'SERVICE', 'FACTORY', 'DELIVERY', 'MAINTENANCE'],
    description: 'เหมาะสำหรับงานขนส่งสินค้า งาน Service Maintenance Logistics และการใช้งานภายในโรงงาน',
  },
  {
    slug: 'darion',
    name: 'WULING STARLIGHT DARION EV',
    headline: 'MPV ไฟฟ้าสำหรับองค์กร',
    tags: ['EXECUTIVE', 'SHUTTLE', 'CORPORATE', 'CUSTOMER TRANSPORT'],
    description: 'เหมาะสำหรับรถผู้บริหาร รับรองลูกค้า รับส่งบุคลากร และรถประจำตำแหน่ง',
  },
];

export const leaseCompareRows: LeaseCompareRow[] = [
  { label: 'เงินลงทุนเริ่มต้น', buy: 'ใช้เงินก้อนหรือจัดสินเชื่อ', lease: 'วางแผนเป็นค่าใช้จ่ายตามสัญญา' },
  { label: 'การถือครอง', buy: 'บริษัทถือครองรถ', lease: 'ใช้รถตามระยะเวลาสัญญา' },
  { label: 'ประกัน', buy: 'บริษัทต้องบริหารเอง', lease: 'รวมอยู่ในแพ็กเกจได้ตามเงื่อนไข' },
  { label: 'Maintenance', buy: 'บริษัทบริหารเอง', lease: 'มีบริการตามเงื่อนไขของสัญญา' },
  { label: 'การจัดการรถหลังใช้งาน', buy: 'ต้องจัดการรถเมื่อเลิกใช้งาน', lease: 'คืนรถตามเงื่อนไขเมื่อครบสัญญา' },
  { label: 'ราคาขายต่อ', buy: 'รับความเสี่ยงเรื่องมูลค่ารถในอนาคต', lease: 'ลดภาระเรื่องการบริหารรถหลังหมดสัญญา' },
  { label: 'Budget', buy: 'มีค่าใช้จ่ายหลายส่วน', lease: 'ช่วยวางแผนต้นทุนรถรายเดือนได้ง่ายขึ้น' },
];

export const leaseBenefits: LeaseBenefit[] = [
  { n: '01', title: 'ค่าใช้จ่ายด้านพลังงาน', body: 'ช่วยให้องค์กรสามารถวิเคราะห์และควบคุมต้นทุนการเดินทางได้ชัดเจนขึ้น' },
  { n: '02', title: 'เหมาะกับรถที่วิ่งประจำ', body: 'โดยเฉพาะรถที่มีเส้นทางหรือระยะทางใช้งานค่อนข้างแน่นอน' },
  { n: '03', title: 'ลดงานดูแลระบบเครื่องยนต์บางส่วน', body: 'รถ EV มีโครงสร้างระบบขับเคลื่อนแตกต่างจากรถเครื่องยนต์สันดาป' },
  { n: '04', title: 'สนับสนุนการเปลี่ยนผ่านสู่ Fleet EV', body: 'เหมาะกับองค์กรที่กำลังวางแผนเพิ่มรถ EV เข้ามาใน Fleet' },
];

export const leaseSteps: LeaseStep[] = [
  { n: '01', title: 'แจ้งความต้องการ', body: 'เลือกรุ่นรถ จำนวนรถ และรูปแบบการใช้งาน' },
  { n: '02', title: 'วิเคราะห์การใช้งาน', body: 'ประเมิน Mileage และลักษณะการใช้งานขององค์กร' },
  { n: '03', title: 'เสนอแพ็กเกจ', body: 'จัดทำ Operating Lease Proposal ตามความต้องการ' },
  { n: '04', title: 'ทดลองรถ', body: 'นัดหมาย Company Test Drive สำหรับทีมงาน' },
  { n: '05', title: 'เริ่มใช้งาน', body: 'ดำเนินการตามสัญญาและส่งมอบรถ' },
];

export const leasePeriods = ['36 เดือน', '48 เดือน', '60 เดือน'];

export const leaseBizOptions = ['โรงงาน', 'Logistics', 'SME', 'Corporate', 'Service', 'Hotel', 'Other'];
export const leaseModelOptions = ['PORTA EV', 'DARION EV', 'ทั้งสองรุ่น', 'ขอคำแนะนำ'];
export const leaseFleetSizeOptions = ['1', '2–5', '6–10', '11–20', '20+'];
export const leasePeriodOptions = ['36 เดือน', '48 เดือน', '60 เดือน', 'ขอคำแนะนำ'];
export const leaseMileageOptions = ['ต่ำกว่า 4,000 km', 'ประมาณ 4,000 km', 'ประมาณ 5,000 km', 'ประมาณ 6,000 km', 'มากกว่า 6,000 km', 'ไม่แน่ใจ'];

export interface FleetInput {
  count: number;
  kmDay: number;
  daysMonth: number;
  model: keyof typeof LEASE_RATES | string;
  term: 36 | 48 | 60;
}

export interface FleetOutput {
  kmPerVehicleMonth: string;
  kmFleetMonth: string;
  kmFleetYear: string;
  leaseCost: string;
  totalCost: string;
  rateNote: string;
}

/** Live fleet cost calculator — mirrors the design export's `calcFleet()` exactly. */
export function calcFleet(fleet: FleetInput): FleetOutput {
  const kmVehicleMonth = fleet.kmDay * fleet.daysMonth;
  const kmFleetMonth = fleet.count * kmVehicleMonth;
  const rate = LEASE_RATES[fleet.model];
  const tiers = Object.keys(rate.tiers).map(Number).sort((a, b) => a - b);
  const tier = tiers.find((t) => t >= kmVehicleMonth);

  let leaseCost = TBC_COST;
  let totalCost = TBC_COST;
  let note = '';

  if (!tier) {
    note = `ระยะทางเกินอัตราสูงสุดที่มีข้อมูล (${tiers[tiers.length - 1].toLocaleString('en-US')} กม./เดือน/คัน) — โปรดติดต่อทีมงานเพื่อขอราคาเฉพาะ`;
  } else {
    const perVehicle = rate.tiers[tier][fleet.term];
    if (!perVehicle) {
      note = `ไม่มีอัตราค่าเช่าสำหรับระยะสัญญานี้ที่ระยะทาง ${tier.toLocaleString('en-US')} กม./เดือน — โปรดติดต่อทีมงาน`;
    } else {
      const total = perVehicle * fleet.count;
      leaseCost = '฿' + perVehicle.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' /คัน/เดือน';
      totalCost = '฿' + total.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' /เดือน';
      note = `อัตราอ้างอิงที่ระยะทาง ${tier.toLocaleString('en-US')} กม./เดือน/คัน สัญญา ${fleet.term} เดือน (รวม VAT) — ไม่รวมค่าพลังงาน`;
    }
  }

  return {
    kmPerVehicleMonth: kmVehicleMonth.toLocaleString('en-US') + ' กม.',
    kmFleetMonth: kmFleetMonth.toLocaleString('en-US') + ' กม.',
    kmFleetYear: (kmFleetMonth * 12).toLocaleString('en-US') + ' กม.',
    leaseCost,
    totalCost,
    rateNote: note,
  };
}
