import type { Metadata } from 'next';
import Link from 'next/link';
import ImageSlot from '@/components/ImageSlot';
import { promotions } from '@/lib/data/promotions';

export const metadata: Metadata = {
  title: 'โปรโมชั่นรถยนต์ WULING',
  description: 'ข้อเสนอและโปรโมชั่นล่าสุดสำหรับรถยนต์ WULING ที่ชลบุรี',
  alternates: { canonical: '/promotions' },
};

const promoLinkHref = (linkTo: string) => {
  if (linkTo === 'contact') return '/contact';
  if (linkTo === 'models') return '/models';
  return `/models/${linkTo}`;
};

export default function PromotionsPage() {
  return (
    <div className="wrap">
      <section style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        <p className="kicker kicker-2">Promotions</p>
        <h1 style={{ fontSize: 'clamp(29px,4vw,45px)', margin: '0 0 var(--space-3)' }}>โปรโมชั่น</h1>
        <p style={{ margin: 0, color: 'var(--color-neutral-800)' }}>รายละเอียดข้อเสนอทั้งหมดรอยืนยันจากผู้จำหน่าย</p>
      </section>
      <section style={{ paddingBottom: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {promotions.map((p) => (
          <article key={p.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 'var(--space-6)', alignItems: 'center', paddingTop: 'var(--space-6)' }}>
            <ImageSlot aspectRatio="16 / 9" caption={`PROMOTION · ${p.title}`} />
            <div>
              <p style={{ margin: '0 0 var(--space-2)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>{p.modelLabel}</p>
              <h2 style={{ fontSize: 'clamp(22px,2.8vw,30px)', margin: '0 0 var(--space-2)' }}>{p.title}</h2>
              <p style={{ margin: '0 0 var(--space-2)', color: 'var(--color-neutral-800)' }}>{p.detail}</p>
              <p style={{ margin: '0 0 var(--space-4)', fontSize: 13, color: 'var(--color-neutral-600)' }}>{p.validity}</p>
              <Link href={promoLinkHref(p.linkTo)} className="btn btn-secondary">ดูรุ่นนี้</Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
