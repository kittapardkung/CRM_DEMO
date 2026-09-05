import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import ImageSlot from '@/components/ImageSlot';
import ArticleCard from '@/components/ArticleCard';
import FleetCalculator from '@/components/FleetCalculator';
import LeaseInquiryForm from '@/components/LeaseInquiryForm';
import { leaseBenefits, leaseCompareRows, leasePeriods, leaseSteps, leaseVehicles } from '@/lib/data/lease';
import { leaseArticles } from '@/lib/data/leaseArticles';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Operating Lease รถ EV สำหรับองค์กร',
  description:
    'บริการ Operating Lease รถยนต์ไฟฟ้าสำหรับบริษัท โรงงาน และองค์กร วางแผนค่าใช้จ่ายรถเป็นรายเดือน พร้อมบริการดูแลรถ ประกัน และบำรุงรักษาตามเงื่อนไข เลือก WULING PORTA EV และ DARION EV',
  alternates: { canonical: '/lease' },
};

export default function LeasePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Operating Lease',
    provider: { '@type': 'AutoDealer', name: 'WULING CHONBURI', telephone: '+66823247915', areaServed: 'ชลบุรี' },
    url: `${SITE_URL}/lease`,
  };

  return (
    <div className="wrap">
      <Breadcrumb items={[{ label: 'หน้าแรก', href: '/' }, { label: 'Operating Lease' }]} />

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
          <div>
            <p style={{ margin: '0 0 var(--space-3)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--wl-lime)' }}>
              Operating Lease · สำหรับองค์กร
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(32px,4.4vw,54px)', lineHeight: 1.14, margin: '0 0 var(--space-3)', color: '#fff' }}>
              เช่ารถไฟฟ้าระยะยาว วางแผนต้นทุนได้ทุกเดือน
            </h1>
            <p style={{ margin: '0 0 var(--space-6)', fontSize: 17, maxWidth: '42ch', color: 'rgba(255,255,255,0.78)' }}>
              บริการ Operating Lease รถยนต์ไฟฟ้า WULING สำหรับบริษัท โรงงาน และองค์กร พร้อมแพ็กเกจดูแลรถตามเงื่อนไขของสัญญา
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <a href="#lease-form" className="btn btn-primary">ขอใบเสนอราคา</a>
              <a href="#lease-calc" className="btn btn-on-dark">คำนวณต้นทุน Fleet</a>
            </div>
          </div>
          <ImageSlot aspectRatio="4 / 3" caption="Fleet · WULING PORTA EV และ DARION EV" filename="lease-fleet-hero.jpg" />
        </div>
      </section>

      <section className="section" style={{ maxWidth: 800 }}>
        <p className="kicker">Operating Lease คืออะไร</p>
        <h2 style={{ fontSize: 'clamp(24px,3.2vw,34px)', margin: '0 0 var(--space-4)' }}>ใช้รถระยะยาว จ่ายเป็นค่าเช่ารายเดือน</h2>
        <p style={{ margin: 0, color: 'var(--color-neutral-900)' }}>
          Operating Lease คือการใช้รถระยะยาวโดยชำระค่าเช่ารายเดือนตามระยะเวลาและระยะทางที่ตกลงกันไว้ แทนการซื้อและถือครองรถเอง
          องค์กรจึงสามารถวางแผนต้นทุนรถเป็นรายเดือนที่คาดการณ์ได้ชัดเจนขึ้น เหมาะกับองค์กรที่ต้องการลดภาระบริหารรถ
          หรือกำลังทดลองปรับ Fleet เป็นรถไฟฟ้าบางส่วน
        </p>
      </section>

      <section className="section">
        <h2 style={{ fontSize: 'clamp(23px,2.9vw,31px)', margin: '0 0 var(--space-6)' }}>ซื้อรถบริษัท เทียบกับ Operating Lease</h2>
        <div className="om-desk" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>รายการ</th>
                <th>ซื้อรถบริษัท</th>
                <th>Operating Lease</th>
              </tr>
            </thead>
            <tbody>
              {leaseCompareRows.map((r) => (
                <tr key={r.label}>
                  <th scope="row" style={{ fontWeight: 400, color: 'var(--color-neutral-700)' }}>{r.label}</th>
                  <td>{r.buy}</td>
                  <td>{r.lease}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="om-mob" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {leaseCompareRows.map((r) => (
            <div key={r.label} className="card" style={{ padding: 'var(--space-4)' }}>
              <p style={{ margin: '0 0 var(--space-2)', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>{r.label}</p>
              <p style={{ margin: '0 0 4px', fontSize: 15 }}><b>ซื้อ:</b> {r.buy}</p>
              <p style={{ margin: 0, fontSize: 15 }}><b>เช่า:</b> {r.lease}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 style={{ fontSize: 'clamp(23px,2.9vw,31px)', margin: '0 0 var(--space-6)' }}>ทำไมองค์กรเลือกปรับ Fleet เป็น EV</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-5)' }}>
          {leaseBenefits.map((b) => (
            <div key={b.n}>
              <p className="tnum" style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-heading)', fontSize: 32, color: 'var(--color-accent-700)' }}>{b.n}</p>
              <h3 style={{ margin: '0 0 6px', fontSize: 19 }}>{b.title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-800)' }}>{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 style={{ fontSize: 'clamp(23px,2.9vw,31px)', margin: '0 0 var(--space-2)' }}>รถที่รองรับ Operating Lease</h2>
        <p style={{ margin: '0 0 var(--space-6)', color: 'var(--color-neutral-800)' }}>ระยะเวลาสัญญา: {leasePeriods.join(' / ')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'var(--space-6)' }}>
          {leaseVehicles.map((v) => (
            <article key={v.slug} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 0, overflow: 'hidden' }}>
              <ImageSlot aspectRatio="16 / 11" caption={v.name} filename={`${v.slug}-lease-hero.jpg`} style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }} />
              <div style={{ padding: '0 var(--space-4) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <p className="card-kicker" style={{ margin: 0 }}>{v.headline}</p>
                <h3 className="card-title" style={{ margin: 0, fontSize: 23, fontWeight: 400 }}>{v.name}</h3>
                <p className="card-body" style={{ margin: 0 }}>{v.description}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: 'var(--space-2) 0' }}>
                  {v.tags.map((t) => (
                    <span key={t} className="tag" style={{ fontSize: 11 }}>{t}</span>
                  ))}
                </div>
                <Link href={`/models/${v.slug}`} className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
                  ดู {v.name.replace('WULING ', '')} สำหรับองค์กร
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 style={{ fontSize: 'clamp(23px,2.9vw,31px)', margin: '0 0 var(--space-6)' }}>ขั้นตอนการเริ่มใช้งาน</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 'var(--space-5)' }}>
          {leaseSteps.map((s) => (
            <div key={s.n}>
              <p className="tnum" style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-heading)', fontSize: 28, color: 'var(--color-accent-700)' }}>{s.n}</p>
              <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{s.title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-800)' }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <p className="kicker kicker-2">Fleet Calculator</p>
        <h2 style={{ fontSize: 'clamp(24px,3.2vw,35px)', margin: '0 0 var(--space-6)' }}>คำนวณต้นทุน Fleet ของคุณ</h2>
        <FleetCalculator />
      </section>

      <section className="section">
        <p className="kicker">ขอใบเสนอราคา</p>
        <h2 style={{ fontSize: 'clamp(24px,3.2vw,35px)', margin: '0 0 var(--space-6)' }}>ขอใบเสนอราคา Operating Lease</h2>
        <LeaseInquiryForm />
      </section>

      <section className="section">
        <h2 style={{ fontSize: 'clamp(23px,2.9vw,31px)', margin: '0 0 var(--space-6)' }}>บทความสำหรับองค์กร</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-6)' }}>
          {leaseArticles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
