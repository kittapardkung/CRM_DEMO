import type { Metadata } from 'next';
import { Suspense } from 'react';
import TestDriveForm from '@/components/TestDriveForm';

export const metadata: Metadata = {
  title: 'ลงทะเบียนทดลองขับ WULING',
  description: 'ทดลองขับ WULING ทุกรุ่นได้ที่โชว์รูมชลบุรี หรือนัดทีมงานนำรถไปให้ลองถึงที่ทำงานในชลบุรี ระยอง และฉะเชิงเทรา กรอกฟอร์มแล้วทีมงานจะติดต่อกลับเพื่อนัดวันเวลา',
  alternates: { canonical: '/test-drive' },
};

export default function TestDrivePage() {
  return (
    <div className="wrap">
      <section style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        <p className="kicker">Test Drive</p>
        <h1 style={{ fontSize: 'clamp(29px,4vw,45px)', margin: '0 0 var(--space-3)' }}>ลงทะเบียนทดลองขับ</h1>
        <p style={{ margin: 0, maxWidth: '52ch', color: 'var(--color-neutral-800)' }}>กรอกข้อมูลเพื่อให้ทีมงานติดต่อนัดวันและเวลา</p>
      </section>
      <Suspense fallback={null}>
        <TestDriveForm />
      </Suspense>
    </div>
  );
}
