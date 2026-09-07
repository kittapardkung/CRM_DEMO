import type { Metadata } from 'next';
import Link from 'next/link';
import CTASection from '@/components/CTASection';
import { serviceProvinces } from '@/lib/data/dealer';

export const metadata: Metadata = {
  title: 'พื้นที่ให้บริการ WULING ชลบุรี ระยอง ฉะเชิงเทรา',
  description: 'ตัวแทนจำหน่ายวู่หลิง (WULING) ให้บริการทดลองขับ ส่งมอบรถถึงที่ และศูนย์บริการครอบคลุม 3 จังหวัด ชลบุรี ระยอง และฉะเชิงเทรา',
  alternates: { canonical: '/areas' },
};

export default function AreasPage() {
  return (
    <div className="wrap">
      <section style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        <p className="kicker">Coverage Area</p>
        <h1 style={{ fontSize: 'clamp(29px,4vw,45px)', margin: '0 0 var(--space-3)' }}>พื้นที่ให้บริการ</h1>
        <p style={{ margin: 0, maxWidth: '62ch', color: 'var(--color-neutral-800)', fontSize: 16 }}>
          WULING CHONBURI เป็นตัวแทนจำหน่ายวู่หลิงอย่างเป็นทางการ มีโชว์รูมตั้งอยู่ที่จังหวัดชลบุรี
          และให้บริการลูกค้าในพื้นที่ภาคตะวันออกครอบคลุม 3 จังหวัดหลัก ได้แก่ ชลบุรี ระยอง และฉะเชิงเทรา
          ทั้งการทดลองขับ การซื้อขาย และบริการหลังการขาย
        </p>
      </section>

      <section style={{ paddingBottom: 'var(--space-8)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-6)' }}>
        {serviceProvinces.map((p) => (
          <article key={p.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>{p.tag}</p>
              <h2 style={{ fontSize: 26, fontWeight: 400, margin: 0 }}>{p.name}</h2>
            </div>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--color-neutral-800)' }}>{p.note}</p>
            {p.districts.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                {p.districts.map((d) => (
                  <span
                    key={d}
                    style={{
                      fontSize: 13,
                      padding: '4px 10px',
                      borderRadius: 999,
                      border: '1px solid var(--color-neutral-300)',
                      color: 'var(--color-neutral-800)',
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </section>

      <section style={{ paddingBottom: 'var(--space-8)' }}>
        <p className="kicker" style={{ margin: '0 0 var(--space-3)' }}>How It Works</p>
        <h2 style={{ fontSize: 'clamp(23px,3vw,32px)', margin: '0 0 var(--space-6)' }}>บริการที่ครอบคลุมทุกพื้นที่</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-6)' }}>
          <div style={{ borderTop: '1px solid var(--color-text)', paddingTop: 'var(--space-3)' }}>
            <h3 style={{ fontSize: 19, margin: '0 0 var(--space-2)' }}>ทดลองขับถึงที่</h3>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--color-neutral-800)' }}>
              นัดหมายให้ทีมงานนำรถไปให้ทดลองขับที่บ้านหรือบริษัทของคุณในพื้นที่ให้บริการ
            </p>
          </div>
          <div style={{ borderTop: '1px solid var(--color-text)', paddingTop: 'var(--space-3)' }}>
            <h3 style={{ fontSize: 19, margin: '0 0 var(--space-2)' }}>ส่งมอบรถถึงหน้างาน</h3>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--color-neutral-800)' }}>
              ปิดการขายแล้วนัดรับรถได้ทั้งที่โชว์รูมชลบุรี หรือให้ทีมงานนำรถไปส่งถึงพื้นที่ของคุณ
            </p>
          </div>
          <div style={{ borderTop: '1px solid var(--color-text)', paddingTop: 'var(--space-3)' }}>
            <h3 style={{ fontSize: 19, margin: '0 0 var(--space-2)' }}>บริการหลังการขาย</h3>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--color-neutral-800)' }}>
              เช็กระยะและซ่อมบำรุงที่ศูนย์บริการชลบุรี ดู<Link href="/service" style={{ color: 'inherit' }}>รายละเอียดศูนย์บริการ</Link>
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 'var(--space-8)' }}>
        <CTASection
          heading="อยู่ในพื้นที่ให้บริการไหม?"
          body={`โทรสอบถามหรือนัดทดลองขับได้เลย ทีมงานพร้อมให้บริการทั้งชลบุรี ระยอง และฉะเชิงเทรา`}
        />
      </section>
    </div>
  );
}
