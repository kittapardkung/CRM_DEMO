import Link from 'next/link';
import type { Metadata } from 'next';
import ImageSlot from '@/components/ImageSlot';
import { vehicles } from '@/lib/data/vehicles';
import { money } from '@/lib/format';

export const metadata: Metadata = {
  title: 'รถยนต์ WULING ทุกรุ่น',
  description: 'เปรียบเทียบรถยนต์ไฟฟ้า WULING ทุกรุ่น พร้อมราคาเริ่มต้นและรายละเอียด',
  alternates: { canonical: '/models' },
};

export default function ModelsPage() {
  return (
    <div className="wrap">
      <section style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        <p className="kicker">Models</p>
        <h1 style={{ fontSize: 'clamp(30px,4.2vw,48px)', margin: '0 0 var(--space-3)' }}>รถยนต์ WULING</h1>
        <p style={{ margin: 0, maxWidth: '52ch', color: 'var(--color-neutral-800)' }}>
          ทั้งรถเพื่อธุรกิจและรถสำหรับครอบครัว เลือกดูรายละเอียด สเปก และราคาของแต่ละรุ่น
        </p>
      </section>
      <section style={{ paddingBottom: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {vehicles.map((v) => (
          <article key={v.slug} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'var(--space-6)', alignItems: 'center' }}>
            <ImageSlot aspectRatio="16 / 10" caption={`${v.shortName} · Exterior Front 3/4`} filename={v.image ?? `${v.slug}-front-34.webp`} />
            <div>
              <p style={{ margin: '0 0 var(--space-2)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>{v.positioning}</p>
              <h2 style={{ fontSize: 'clamp(24px,3.1vw,34px)', margin: '0 0 var(--space-2)' }}>{v.shortName}</h2>
              <p style={{ margin: '0 0 var(--space-3)', color: 'var(--color-neutral-800)' }}>{v.tagline}</p>
              <dl style={{ margin: '0 0 var(--space-4)', display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 'var(--space-3)' }}>
                <div>
                  <dt style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>ราคาเริ่มต้น</dt>
                  <dd className="tnum" style={{ margin: '4px 0 0', fontSize: 17 }}>{money(v.startingPrice)}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>ประเภท</dt>
                  <dd style={{ margin: '4px 0 0', fontSize: 17 }}>{v.vehicleType}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>ที่นั่ง</dt>
                  <dd className="tnum" style={{ margin: '4px 0 0', fontSize: 17 }}>{v.seats}</dd>
                </div>
              </dl>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <Link href={`/models/${v.slug}`} className="btn btn-primary">ดูรายละเอียด</Link>
                <Link href="/compare" className="btn btn-ghost">เปรียบเทียบ</Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
