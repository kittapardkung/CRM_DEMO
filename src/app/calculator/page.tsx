import type { Metadata } from 'next';
import { Suspense } from 'react';
import InstallmentCalculator from '@/components/InstallmentCalculator';

export const metadata: Metadata = {
  title: 'คำนวณค่างวดรถ WULING',
  description: 'ประมาณการค่างวดต่อเดือนจากราคารถ เงินดาวน์ ดอกเบี้ย และระยะเวลาผ่อน',
  alternates: { canonical: '/calculator' },
};

export default function CalculatorPage() {
  return (
    <div className="wrap">
      <section style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        <p className="kicker">Calculator</p>
        <h1 style={{ fontSize: 'clamp(29px,4vw,45px)', margin: '0 0 var(--space-3)' }}>คำนวณค่างวด</h1>
        <p style={{ margin: 0, maxWidth: '52ch', color: 'var(--color-neutral-800)' }}>ประมาณการค่างวดต่อเดือนแบบอัตราดอกเบี้ยคงที่ (Flat Rate)</p>
      </section>
      <Suspense fallback={null}>
        <InstallmentCalculator />
      </Suspense>
    </div>
  );
}
