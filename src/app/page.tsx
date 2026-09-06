import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import ImageSlot from '@/components/ImageSlot';
import ModelCard from '@/components/ModelCard';
import ArticleCard from '@/components/ArticleCard';
import PhoneLink from '@/components/PhoneLink';
import { vehicles } from '@/lib/data/vehicles';
import { promotions } from '@/lib/data/promotions';
import { articles } from '@/lib/data/articles';
import { dealer } from '@/lib/data/dealer';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'WULING CHONBURI | ศูนย์รถยนต์ไฟฟ้า WULING ชลบุรี',
  description: 'ดูรถ WULING ทุกรุ่น ราคา สเปก โปรโมชั่น และลงทะเบียนทดลองขับที่ชลบุรี',
  alternates: { canonical: '/' },
};

const promoLinkHref = (linkTo: string) => {
  if (linkTo === 'contact') return '/contact';
  if (linkTo === 'models') return '/models';
  return `/models/${linkTo}`;
};

export default function HomePage() {
  const topArticles = articles.slice(0, 3);

  return (
    <div className="wrap">
      <section style={{ padding: 'var(--space-4) 0 var(--space-8)' }}>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--wl-ink)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(26px,4vw,52px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
            gap: 'var(--space-6)',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{ margin: '0 0 var(--space-3)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--wl-lime)' }}>
              ผู้จำหน่ายอย่างเป็นทางการ · ชลบุรี
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(34px,4.6vw,58px)', lineHeight: 1.12, margin: '0 0 var(--space-3)', color: '#fff', letterSpacing: '-0.01em' }}>
              Find Your WULING
            </h1>
            <p style={{ margin: '0 0 var(--space-6)', fontSize: 18, maxWidth: '34ch', color: 'rgba(255,255,255,0.78)' }}>
              รถยนต์ไฟฟ้าที่ตอบโจทย์ทุกการเดินทาง และทุกธุรกิจ
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Link href="/models" className="btn btn-primary">ดูรถทั้งหมด</Link>
              <Link href="/test-drive" className="btn btn-on-dark">ทดลองขับ</Link>
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 2, aspectRatio: '4 / 3' }}>
            <Image
              src="/images/hero-wuling-front-34.webp"
              alt="รถยนต์ไฟฟ้า WULING ทุกรุ่น"
              fill
              priority
              sizes="(max-width: 820px) 100vw, 50vw"
              style={{ objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
            />
          </div>
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 8,
              background: 'var(--wl-lime)',
              borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
              zIndex: 3,
            }}
          />
        </div>
      </section>

      <section className="section">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
          <div>
            <p className="kicker" style={{ margin: '0 0 var(--space-2)' }}>Model Lineup</p>
            <h2 style={{ fontSize: 'clamp(25px,3.2vw,35px)', margin: 0 }}>รถยนต์ WULING ทุกรุ่น</h2>
          </div>
          <Link href="/models" style={{ fontSize: 15 }}>ดูทั้งหมด →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'var(--space-6)' }}>
          {vehicles.map((v) => (
            <ModelCard key={v.slug} vehicle={v} />
          ))}
        </div>
      </section>

      <section
        style={{
          background: 'var(--wl-ink)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(24px,3.4vw,44px)',
          margin: 'var(--space-6) 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
          gap: 'var(--space-8)',
          alignItems: 'center',
        }}
      >
        <div>
          <p style={{ margin: '0 0 var(--space-2)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--wl-lime)' }}>Operating Lease · สำหรับองค์กร</p>
          <h2 style={{ fontSize: 'clamp(28px,3.6vw,42px)', margin: '0 0 var(--space-3)', color: '#fff' }}>เช่ารถไฟฟ้าระยะยาว วางแผนต้นทุนได้ทุกเดือน</h2>
          <p style={{ margin: '0 0 var(--space-4)', maxWidth: '44ch', color: 'rgba(255,255,255,0.78)' }}>
            บริการ Operating Lease รถยนต์ไฟฟ้า WULING PORTA EV และ DARION EV สำหรับบริษัท โรงงาน และองค์กร พร้อมเครื่องคำนวณต้นทุน Fleet
          </p>
          <Link href="/lease" className="btn btn-primary">ดู Operating Lease</Link>
        </div>
        <ImageSlot aspectRatio="16 / 10" caption="Fleet · WULING PORTA EV และ DARION EV" filename="lease-fleet-teaser.jpg" />
      </section>

      <section className="section">
        <h2 style={{ fontSize: 'clamp(23px,2.9vw,31px)', margin: '0 0 var(--space-6)' }}>โปรโมชั่นเดือนนี้</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 'var(--space-4)' }}>
          {promotions.map((p) => (
            <article key={p.id} className="card">
              <p className="card-kicker" style={{ margin: '0 0 var(--space-2)' }}>{p.modelLabel}</p>
              <h3 className="card-title" style={{ margin: '0 0 var(--space-2)', fontWeight: 400 }}>
                <Link href={promoLinkHref(p.linkTo)} style={{ color: 'inherit', textDecoration: 'none' }}>{p.title}</Link>
              </h3>
              <p className="card-body" style={{ margin: 0 }}>{p.detail}</p>
              <p className="card-meta" style={{ margin: 'var(--space-3) 0 0' }}>{p.validity}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'clamp(23px,2.9vw,31px)', margin: 0 }}>บทความและคู่มือเลือกรถ</h2>
          <Link href="/articles" style={{ fontSize: 15 }}>อ่านทั้งหมด →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-6)' }}>
          {topArticles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>

      <section style={{ padding: 'var(--space-8) 0 var(--space-4)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-6)', alignItems: 'start' }}>
        <div>
          <h2 style={{ fontSize: 'clamp(23px,2.9vw,31px)', margin: '0 0 var(--space-3)' }}>คุยกับฝ่ายขายที่ชลบุรี</h2>
          <p style={{ margin: '0 0 var(--space-4)', maxWidth: '40ch', color: 'var(--color-neutral-800)' }}>
            สอบถามราคา โปรโมชั่น ตารางผ่อน หรือขอทดลองขับ ทีมงานตอบกลับในเวลาทำการ
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <PhoneLink className="btn btn-primary">โทร {dealer.phoneDisplay}</PhoneLink>
            <Link href="/contact" className="btn btn-secondary">ช่องทางติดต่ออื่น</Link>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[
            { label: 'Operating Lease สำหรับองค์กร', href: '/lease' },
            { label: 'คำนวณค่างวด', href: '/calculator' },
            { label: 'เปรียบเทียบรถทุกรุ่น', href: '/compare' },
            { label: 'ศูนย์บริการและนัดหมาย', href: '/service' },
          ].map((q) => (
            <Link
              key={q.href}
              href={q.href}
              style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-divider)', textDecoration: 'none', color: 'var(--color-text)', fontSize: 16 }}
            >
              <span>{q.label}</span>
              <span style={{ color: 'var(--color-accent-700)' }}>→</span>
            </Link>
          ))}
        </div>
      </section>
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            url: `${SITE_URL}/`,
            itemListElement: vehicles.map((v, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${SITE_URL}/models/${v.slug}`,
              name: v.name,
            })),
          }),
        }}
      />
    </div>
  );
}
