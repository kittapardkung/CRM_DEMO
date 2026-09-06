import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import ImageSlot from '@/components/ImageSlot';
import ModelCard from '@/components/ModelCard';
import { resolveAsset } from '@/lib/assets';
import ArticleCard from '@/components/ArticleCard';
import PhoneLink from '@/components/PhoneLink';
import { vehicles } from '@/lib/data/vehicles';
import { articles } from '@/lib/data/articles';
import { dealer } from '@/lib/data/dealer';
import { quickLinks } from '@/lib/nav';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'WULING CHONBURI | ศูนย์รถยนต์ไฟฟ้า WULING ชลบุรี',
  description: 'ดูรถ WULING ทุกรุ่น ราคา สเปก โปรโมชั่น และลงทะเบียนทดลองขับที่ชลบุรี',
  alternates: { canonical: '/' },
};

const leaseFacts = [
  { label: 'สัญญาเช่า', value: '36 / 48 / 60 เดือน', tnum: true },
  { label: 'รวมประกันภัยและบำรุงรักษา', value: 'รวมในค่าเช่า', tnum: false },
  { label: 'เหมาะกับ', value: 'บริษัท โรงงาน SME', tnum: false },
];

export default function HomePage() {
  const topArticles = articles.slice(0, 3);
  const heroSrc = resolveAsset('hero-wuling-front-34.webp');

  return (
    <div className="wrap">
      <section style={{ padding: 'var(--space-4) 0 var(--space-8)' }}>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'radial-gradient(120% 120% at 74% 78%, #1b3f6d 0%, #123156 44%, #0d2244 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(26px,4vw,52px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
            gap: 'var(--space-6)',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '38ch' }}>
            <p style={{ margin: '0 0 var(--space-3)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--wl-lime)' }}>
              ผู้จำหน่ายอย่างเป็นทางการ · ชลบุรี
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(34px,4.6vw,58px)', lineHeight: 1.12, margin: '0 0 var(--space-3)', color: '#fff', letterSpacing: '-0.01em' }}>
              Find Your WULING
            </h1>
            <p style={{ margin: '0 0 var(--space-6)', fontSize: 18, color: 'rgba(255,255,255,0.78)' }}>
              รถยนต์ไฟฟ้าที่ตอบโจทย์ทุกการเดินทาง และทุกธุรกิจ
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Link href="/models" className="btn btn-primary">ดูรถทั้งหมด</Link>
              <Link href="/test-drive" className="btn btn-on-dark">ทดลองขับ</Link>
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 2, paddingRight: 'clamp(18px,2vw,28px)' }}>
            <div
              style={{
                position: 'relative',
                aspectRatio: '4 / 3',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: heroSrc ? 'transparent' : 'rgba(255,255,255,0.06)',
                border: heroSrc ? 'none' : '1px dashed rgba(255,255,255,0.4)',
                display: heroSrc ? undefined : 'flex',
                alignItems: heroSrc ? undefined : 'center',
                justifyContent: heroSrc ? undefined : 'center',
                textAlign: heroSrc ? undefined : 'center',
                padding: heroSrc ? undefined : 'var(--space-4)',
              }}
            >
              {heroSrc ? (
                <Image
                  src={heroSrc}
                  alt="รถยนต์ไฟฟ้า WULING ทุกรุ่น"
                  fill
                  priority
                  sizes="(max-width: 820px) 100vw, 50vw"
                  style={{ objectFit: 'cover', objectPosition: 'center 54%' }}
                />
              ) : (
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)' }}>
                  WULING Lineup · Hero
                  <br />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>hero-wuling-front-34.webp</span>
                </span>
              )}
            </div>
            <span
              aria-hidden
              style={{
                position: 'absolute',
                right: 0,
                top: '16%',
                bottom: '16%',
                width: 'clamp(8px,1vw,14px)',
                background: 'var(--wl-lime)',
                borderRadius: 999,
                display: 'block',
              }}
            />
          </div>
        </div>
      </section>

      <section style={{ padding: 'var(--space-8) 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
          <div>
            <p className="kicker" style={{ margin: '0 0 var(--space-2)' }}>Model Lineup</p>
            <h2 style={{ fontSize: 'clamp(25px,3.2vw,35px)', margin: 0 }}>รถยนต์ WULING ทุกรุ่น</h2>
          </div>
          <Link href="/models" style={{ fontSize: 15 }}>ดูทั้งหมด →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 'var(--space-4)' }}>
          {vehicles.map((v) => (
            <ModelCard key={v.slug} vehicle={v} />
          ))}
        </div>
      </section>

      <section style={{ padding: 'var(--space-8) 0' }}>
        <p className="kicker kicker-2" style={{ margin: '0 0 var(--space-2)', letterSpacing: '0.24em' }}>Operating Lease</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'clamp(23px,2.9vw,31px)', margin: 0 }}>เช่าระยะยาวสำหรับองค์กร</h2>
          <Link href="/lease" style={{ fontSize: 15 }}>ดูรายละเอียด →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-6)', alignItems: 'start' }}>
          <div>
            <p style={{ margin: '0 0 var(--space-4)', maxWidth: '48ch', fontSize: 17, color: 'var(--color-neutral-800)' }}>
              ใช้รถไฟฟ้าทั้ง Fleet โดยไม่ต้องลงทุนซื้อ จ่ายเป็นค่าเช่ารายเดือนคงที่ รวมประกันภัย ทะเบียน และการบำรุงรักษา ลงบัญชีเป็นค่าใช้จ่ายได้ทั้งจำนวน
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              {leaseFacts.map((f, i) => (
                <div
                  key={f.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 'var(--space-4)',
                    paddingBottom: i < leaseFacts.length - 1 ? 'var(--space-2)' : 0,
                    borderBottom: i < leaseFacts.length - 1 ? '1px solid var(--color-neutral-200)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 15 }}>{f.label}</span>
                  <span className={f.tnum ? 'tnum' : undefined} style={{ fontSize: 15, color: 'var(--color-neutral-700)' }}>{f.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Link href="/lease#lease-form" className="btn btn-primary">ขอใบเสนอราคาสำหรับบริษัท</Link>
              <Link href="/lease#lease-calc" className="btn btn-secondary">คำนวณค่าเช่ารายเดือน</Link>
            </div>
          </div>
          <ImageSlot aspectRatio="4 / 3" caption="Operating Lease · WULING PORTA EV และ DARION EV" filename="lease-fleet-promo.png" />
        </div>
      </section>

      <section style={{ padding: 'var(--space-8) 0' }}>
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
          {quickLinks.map((q) => (
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
