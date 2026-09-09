import type { Metadata } from 'next';
import EvSavingsCalculator from '@/components/EvSavingsCalculator';

export const metadata: Metadata = {
  title: 'คำนวณความคุ้มค่า เทียบรถน้ำมัน | WULING CHONBURI',
  description: 'คำนวณเปรียบเทียบค่าพลังงานและความคุ้มค่าระหว่างรถยนต์ไฟฟ้า WULING กับรถน้ำมัน จากระยะทางและค่าไฟ/ค่าน้ำมันที่คุณกำหนดเอง',
  alternates: { canonical: '/savings' },
};

export default function SavingsPage() {
  return (
    <div className="wrap">
      <section style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        <p className="kicker">Savings Calculator</p>
        <h1 style={{ fontSize: 'clamp(29px,4vw,45px)', margin: '0 0 var(--space-3)' }}>
          คำนวณความคุ้มค่า!!! เทียบรถน้ำมัน
        </h1>
        <p style={{ margin: 0, maxWidth: '56ch', color: 'var(--color-neutral-800)' }}>
          ใส่ระยะทางที่ใช้จริง ค่าไฟ และราคาน้ำมัน ดูว่าเปลี่ยนมาขับ WULING EV ประหยัดค่าพลังงานเดือนละเท่าไหร่ และคุ้มส่วนต่างราคารถภายในกี่เดือน
        </p>
      </section>
      <div style={{ paddingBottom: 'var(--space-8)' }}>
        <EvSavingsCalculator />
      </div>
    </div>
  );
}
