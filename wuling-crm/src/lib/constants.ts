import type { StageId, TempId } from "./types.ts";

export const STAGES: { id: StageId; label: string; color: string }[] = [
  { id: "NEW", label: "ลูกค้าใหม่", color: "#2A6C9A" },
  { id: "CONTACTED", label: "ติดต่อแล้ว", color: "#3D6FB8" },
  { id: "FOLLOW_UP", label: "ติดตามอยู่", color: "#4F5BB5" },
  { id: "APPOINTMENT", label: "นัดหมาย", color: "#6B4FBB" },
  { id: "PROSPECT", label: "ลูกค้ามุ่งหวัง", color: "#B0006C" },
  { id: "QUOTATION", label: "เสนอราคา", color: "#B03A85" },
  { id: "BOOKING", label: "จองรถ", color: "#B36A00" },
  { id: "FINANCE_APPROVED", label: "อนุมัติไฟแนนซ์", color: "#8A7000" },
  { id: "WON", label: "ปิดการขาย", color: "#0E7A63" },
  { id: "LOST", label: "ยกเลิก", color: "#BE3A2B" },
];

export const STAGE_IDS = STAGES.map((s) => s.id);

export const TEMPS: Record<TempId, { color: string; label: string }> = {
  HOT: { color: "#BE3A2B", label: "HOT" },
  WARM: { color: "#B36A00", label: "WARM" },
  COLD: { color: "#2A6C9A", label: "COLD" },
};

export const TEMP_DEFS = [
  { id: "HOT", label: "HOT — พร้อมซื้อ", short: "HOT พร้อมซื้อ", color: "#BE3A2B" },
  { id: "WARM", label: "WARM — สนใจอยู่", short: "WARM สนใจอยู่", color: "#B36A00" },
  { id: "COLD", label: "COLD — ยังไม่รีบ", short: "COLD ยังไม่รีบ", color: "#2A6C9A" },
  { id: "NONE", label: "ยังไม่ประเมิน", short: "ยังไม่ประเมิน", color: "#6A7683" },
] as const;

export const PALETTE = ["#2A6C9A", "#6B4FBB", "#B36A00", "#0E7A63", "#BE3A2B", "#3E7D4F"];

export const DAY_SPANS = [7, 14, 21, 30] as const;

export type FieldType = "text" | "num" | "date" | "area" | "select";
export interface EditGroup {
  id: string;
  title: string;
  color: string;
  fields: { key: string; label: string; type: FieldType; options?: string[] }[];
}

const f = (key: string, label: string, type: FieldType = "text", options?: string[]) => ({ key, label, type, options });

/** "เพิ่ม / แก้ไขข้อมูลลูกค้า" accordion in the lead modal. Keys are column names of public.leads. */
export const EDIT_GROUPS: EditGroup[] = [
  { id: "cust", title: "ข้อมูลลูกค้า", color: "#2A6C9A", fields: [
    f("customer_name", "ชื่อลูกค้า"), f("phone_number", "เบอร์โทร"),
    f("customer_district", "เขต/อำเภอ"), f("customer_province", "จังหวัด"),
    f("occupation", "อาชีพ"), f("source", "ช่องทางที่มา"),
    f("customer_message", "ข้อความจากลูกค้า", "area"),
  ] },
  { id: "prod", title: "ความสนใจรถ", color: "#6B4FBB", fields: [
    f("interested_brand", "แบรนด์"), f("interested_model", "รุ่นที่สนใจ"),
    f("variant", "รุ่นย่อย"), f("preferred_variant", "รุ่นย่อยที่ต้องการ"),
    f("preferred_color", "สีที่ต้องการ"),
    f("purchase_type", "ประเภทการซื้อ", "select", ["", "เงินสด", "ผ่อน/ไฟแนนซ์", "ลีสซิ่ง"]),
  ] },
  { id: "price", title: "ราคาและค่างวด", color: "#B36A00", fields: [
    f("budget", "งบประมาณ (บาท)", "num"), f("vehicle_price", "ราคารถ (บาท)", "num"),
    f("down_payment", "เงินดาวน์ (บาท)", "num"), f("loan_term", "จำนวนงวด (เดือน)", "num"),
    f("interest_rate", "ดอกเบี้ย (%)"), f("monthly_payment", "ค่างวด/เดือน (บาท)", "num"),
  ] },
  { id: "fin", title: "สินเชื่อ / ไฟแนนซ์", color: "#8A7000", fields: [
    f("financing_required", "ต้องใช้สินเชื่อ", "select", ["", "ต้องใช้", "ไม่ต้องใช้"]),
    f("financing_status", "สถานะสินเชื่อ", "select", ["", "ยังไม่ยื่น", "เตรียมเอกสาร", "ยื่นแล้ว", "รออนุมัติ", "อนุมัติแล้ว", "ไม่อนุมัติ"]),
    f("financing_bank", "ธนาคาร / ไฟแนนซ์"), f("finance_amount", "ยอดจัด (บาท)", "num"),
    f("finance_note", "หมายเหตุสินเชื่อ", "area"),
  ] },
  { id: "trade", title: "รถเทิร์น (เทรดรถเก่า)", color: "#3E7D4F", fields: [
    f("has_trade_in", "มีรถเทิร์น", "select", ["", "มี", "ไม่มี"]),
    f("trade_in_brand", "ยี่ห้อรถเก่า"), f("trade_in_model", "รุ่นรถเก่า"),
    f("trade_in_year", "ปีรถเก่า", "num"), f("trade_in_expected_price", "ราคาที่ลูกค้าหวัง (บาท)", "num"),
    f("trade_in_appraised_price", "ราคาประเมิน (บาท)", "num"), f("trade_in_value", "มูลค่าที่ใช้หัก (บาท)", "num"),
    f("trade_in_status", "สถานะประเมิน", "select", ["", "รอประเมิน", "ประเมินแล้ว", "ตกลงราคาแล้ว", "ลูกค้าไม่รับราคา"]),
    f("trade_in", "รายละเอียดรถเก่า", "area"),
  ] },
  { id: "promo", title: "โปรโมชั่น & เงื่อนไขปิด", color: "#B03A85", fields: [
    f("promotion_name", "โปรโมชั่น"), f("discount_amount", "ส่วนลด (บาท)", "num"),
    f("free_items", "ของแถม", "area"), f("closing_condition", "เงื่อนไขปิดการขาย", "area"),
  ] },
  { id: "sla", title: "นัดหมาย & SLA", color: "#0E7A63", fields: [
    f("appointment_date", "วันนัดหมาย", "date"), f("last_follow_up", "ติดตามล่าสุด", "date"),
    f("lead_score", "คะแนนลีด (0-100)", "num"), f("accepted_by", "ผู้รับลีด"),
    f("accepted_time", "เวลารับลีด"), f("response_minutes", "เวลาตอบกลับ (นาที)", "num"),
    f("telegram_status", "สถานะแจ้ง Telegram", "select", ["", "PENDING", "SENT", "FAILED"]),
  ] },
];
