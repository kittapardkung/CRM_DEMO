import type { Metadata } from 'next';
import CarDemo3DLoader from '@/components/CarDemo3DLoader';
import { getVehicle } from '@/lib/data/vehicles';

export const metadata: Metadata = {
  title: 'ต้นแบบรถ 3D (ทดลอง)',
  robots: { index: false, follow: false },
};

export default function CarLabPage() {
  const colors = getVehicle('darion')!.colors.map((c) => ({ name: c.name, code: c.code }));
  return (
    <div className="wrap" style={{ padding: 'var(--space-6) 0 var(--space-8)' }}>
      <h1 style={{ fontSize: 'clamp(26px,3.4vw,38px)', margin: '0 0 var(--space-2)' }}>ต้นแบบรถ 3D ที่สร้างด้วยโค้ด</h1>
      <p style={{ margin: '0 0 var(--space-4)', maxWidth: '60ch', color: 'var(--color-neutral-800)' }}>
        รถทรง MPV จำลองที่สร้างด้วยโค้ดล้วน ใช้ดูความรู้สึกของการหมุนและเปลี่ยนสีเท่านั้น <b>ไม่ใช่รูปทรงจริงของ DARION</b> หน้านี้ไม่ถูกเชื่อมจากเมนูและไม่ถูกเก็บโดย Google
      </p>
      <CarDemo3DLoader colors={colors} />
    </div>
  );
}
