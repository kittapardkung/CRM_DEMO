import type { Metadata } from 'next';
import ImageSlot from '@/components/ImageSlot';
import PhoneLink from '@/components/PhoneLink';
import { services } from '@/lib/data/services';
import { dealer } from '@/lib/data/dealer';

export const metadata: Metadata = {
  title: 'ศูนย์บริการ WULING ชลบุรี',
  description: 'เช็กระยะ ซ่อมบำรุง และอะไหล่แท้สำหรับรถยนต์ WULING',
  alternates: { canonical: '/service' },
};

export default function ServicePage() {
  return (
    <div className="wrap">
      <section style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        <p className="kicker">Service</p>
        <h1 style={{ fontSize: 'clamp(29px,4vw,45px)', margin: '0 0 var(--space-3)' }}>ศูนย์บริการ</h1>
        <p style={{ margin: 0, maxWidth: '54ch', color: 'var(--color-neutral-800)' }}>
          งานเช็กระยะ ซ่อมบำรุง อะไหล่แท้ และการดูแลระบบไฟฟ้าแรงสูงโดยช่างที่ผ่านการอบรม
        </p>
      </section>
      <section style={{ paddingBottom: 'var(--space-8)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 'var(--space-6)' }}>
        {services.map((s) => (
          <div key={s.title} style={{ borderTop: '1px solid var(--color-text)', paddingTop: 'var(--space-3)' }}>
            <h2 style={{ fontSize: 21, margin: '0 0 var(--space-2)' }}>{s.title}</h2>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--color-neutral-800)' }}>{s.body}</p>
          </div>
        ))}
      </section>
      <section style={{ paddingBottom: 'var(--space-8)', paddingTop: 'var(--space-8)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-6)', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(22px,2.8vw,30px)', margin: '0 0 var(--space-3)' }}>นัดหมายเข้าศูนย์บริการ</h2>
          <p style={{ margin: '0 0 var(--space-4)', color: 'var(--color-neutral-800)' }}>โทรนัดล่วงหน้าเพื่อลดเวลารอคอย</p>
          <PhoneLink className="btn btn-primary">โทร {dealer.phoneDisplay}</PhoneLink>
        </div>
        <ImageSlot aspectRatio="16 / 10" caption="SERVICE · Workshop Photo" filename="service-workshop.webp" />
      </section>
    </div>
  );
}
