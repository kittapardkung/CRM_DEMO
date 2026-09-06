import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import ImageSlot from '@/components/ImageSlot';
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

const packageItems = [
  'ตัวรถ',
  'ค่าจดทะเบียนและ พ.ร.บ.',
  'ประกันภัยชั้น 1 (ตามเงื่อนไข)',
  'การบำรุงรักษาตามระยะ (ตามเงื่อนไข)',
  'รถยนต์ทดแทน (ตามเงื่อนไข)',
  'รายการอื่นตามที่กำหนดในสัญญา',
];

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

      <section style={{ padding: 'var(--space-2) 0 var(--space-8)' }}>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--wl-ink)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(26px,4vw,52px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
            gap: 'var(--space-8)',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '44ch' }}>
            <p style={{ margin: '0 0 var(--space-2)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--wl-lime)' }}>
              EV FLEET SOLUTION FOR BUSINESS
            </p>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(32px,4.6vw,54px)', lineHeight: 1.14, margin: '0 0 var(--space-3)', color: '#fff' }}>
              รถ EV สำหรับองค์กร ใช้งานระยะยาว โดยไม่จำเป็นต้องซื้อรถ
            </h1>
            <p style={{ margin: '0 0 var(--space-6)', fontSize: 17, color: 'rgba(255,255,255,0.78)' }}>
              Operating Lease สำหรับบริษัท โรงงาน และธุรกิจ ช่วยให้องค์กรวางแผนค่าใช้จ่ายรถยนต์เป็นรายเดือน พร้อมบริการดูแลตลอดอายุสัญญาตามเงื่อนไข
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <a href="#lease-form" className="btn btn-primary">ขอใบเสนอราคาสำหรับบริษัท</a>
              <a href="#lease-calc" className="btn btn-on-dark">ปรึกษาเรื่อง Fleet กับเรา</a>
            </div>
            <p style={{ margin: 'var(--space-6) 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              สำหรับบริษัท โรงงาน SME และองค์กรในพื้นที่ชลบุรี ศรีราชา พัทยา อมตะซิตี้ ระยอง ฉะเชิงเทรา และ EEC
            </p>
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span
              aria-hidden
              style={{ position: 'absolute', right: '-5%', top: '14%', width: '38%', height: '72%', background: 'var(--wl-lime)', borderRadius: 'var(--radius-lg)', display: 'block' }}
            />
            <div style={{ position: 'relative', zIndex: 2, aspectRatio: '4 / 3', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <ImageSlot aspectRatio="auto" caption="PORTA EV สำหรับองค์กร" filename="porta-front-34.jpg" style={{ height: '100%' }} />
              <ImageSlot aspectRatio="auto" caption="DARION EV สำหรับองค์กร" filename="darion-hero.jpg" style={{ height: '100%' }} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 'var(--space-8)', maxWidth: '78ch' }}>
        <h2 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 var(--space-4)' }}>Operating Lease คืออะไร?</h2>
        <p style={{ margin: '0 0 var(--space-4)', color: 'var(--color-neutral-800)' }}>
          Operating Lease คือรูปแบบการใช้รถระยะยาว โดยองค์กรชำระค่าเช่ารายเดือนตามระยะเวลาและระยะทางที่กำหนด แทนการซื้อและถือครองรถด้วยตัวเอง
          แพ็กเกจสามารถครอบคลุมค่าใช้จ่ายเกี่ยวกับรถได้ตามเงื่อนไขของสัญญา เช่น
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.3em', display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--color-neutral-800)' }}>
          {packageItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p style={{ margin: 'var(--space-4) 0 0', fontSize: 13, color: 'var(--color-neutral-600)' }}>
          รายการที่ครอบคลุมขึ้นอยู่กับแพ็กเกจและเงื่อนไขของสัญญาของแต่ละองค์กร
        </p>
      </section>

      <section style={{ paddingBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 var(--space-2)' }}>ซื้อรถ หรือ Operating Lease แบบไหนเหมาะกับองค์กรของคุณ?</h2>
        <div className="om-desk" style={{ overflowX: 'auto', marginTop: 'var(--space-4)' }}>
          <table className="table" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th>หัวข้อ</th>
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
        <div className="om-mob" style={{ flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
          {leaseCompareRows.map((r) => (
            <div key={r.label} className="card">
              <p className="card-kicker" style={{ margin: '0 0 var(--space-2)' }}>{r.label}</p>
              <p style={{ margin: '0 0 4px', fontSize: 14 }}><b style={{ fontWeight: 600 }}>ซื้อ:</b> {r.buy}</p>
              <p style={{ margin: 0, fontSize: 14 }}><b style={{ fontWeight: 600 }}>เช่า:</b> {r.lease}</p>
            </div>
          ))}
        </div>
        <p style={{ margin: 'var(--space-6) 0 0', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 19, maxWidth: '48ch' }}>
          ให้ธุรกิจโฟกัสกับการใช้รถเพื่อสร้างงาน แทนการใช้ทรัพยากรไปกับการบริหารรถ
        </p>
      </section>

      <section style={{ paddingBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 var(--space-6)' }}>ทำไม EV ถึงน่าสนใจสำหรับ Fleet องค์กร?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-4)' }}>
          {leaseBenefits.map((b) => (
            <div key={b.n} className="card">
              <p style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 26, color: 'var(--color-accent-700)' }}>{b.n}</p>
              <p className="card-title" style={{ margin: '0 0 var(--space-2)', fontWeight: 600, fontSize: 18 }}>{b.title}</p>
              <p className="card-body" style={{ margin: 0 }}>{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ paddingBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 var(--space-6)' }}>เลือกรถให้เหมาะกับงานขององค์กร</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 'var(--space-6)' }}>
          {leaseVehicles.map((v) => (
            <article key={v.slug} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <ImageSlot
                aspectRatio="16 / 10"
                caption={`${v.name} สำหรับองค์กร`}
                filename={`${v.slug}-front-34.jpg`}
                style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}
              />
              <div style={{ padding: 'var(--space-4)' }}>
                <p className="card-kicker" style={{ margin: '0 0 var(--space-2)' }}>{v.name}</p>
                <h3 className="card-title" style={{ margin: '0 0 var(--space-2)', fontWeight: 600, fontSize: 24 }}>{v.headline}</h3>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                  {v.tags.map((t) => (
                    <span key={t} className="tag tag-accent" style={{ fontSize: 11 }}>{t}</span>
                  ))}
                </div>
                <p className="card-body" style={{ margin: '0 0 var(--space-4)' }}>{v.description}</p>
                <Link href={`/models/${v.slug}`} className="btn btn-secondary">
                  ดู {v.name.replace('WULING ', '')} สำหรับองค์กร
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section style={{ paddingBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 var(--space-4)' }}>เลือกระยะเวลาที่เหมาะกับ Fleet ของคุณ</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
          {leasePeriods.map((p) => (
            <span key={p} className="tag tag-outline" style={{ fontSize: 14, padding: '8px 18px' }}>{p}</span>
          ))}
        </div>
        <p style={{ margin: '0 0 var(--space-4)', fontSize: 14, color: 'var(--color-neutral-600)' }}>
          ค่าเช่าขึ้นอยู่กับรุ่นรถ ระยะเวลาสัญญา ระยะทางใช้งาน และเงื่อนไขของแต่ละองค์กร
        </p>
        <a href="#lease-form" className="btn btn-primary">ขอราคาเฉพาะบริษัทของคุณ</a>
      </section>

      <section style={{ paddingBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 var(--space-6)' }}>เริ่มต้น Fleet EV ได้อย่างไร?</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {leaseSteps.map((s) => (
            <div key={s.n} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 'var(--space-4)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-divider)' }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 26, color: 'var(--color-accent-700)' }}>{s.n}</p>
              <div>
                <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 17 }}>{s.title}</p>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-700)' }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ paddingBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 var(--space-6)' }}>ลองประเมิน Fleet ขององค์กรคุณ</h2>
        <FleetCalculator />
      </section>

      <section style={{ paddingBottom: 'var(--space-8)' }}>
        <div
          style={{
            background: 'var(--wl-ink)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(24px,3.4vw,44px)',
            display: 'flex',
            gap: 'var(--space-4)',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ maxWidth: '44ch' }}>
            <h2 style={{ fontSize: 'clamp(22px,2.8vw,30px)', margin: '0 0 var(--space-2)', color: '#fff' }}>
              อยากรู้ว่า EV เหมาะกับงานของบริษัทคุณหรือไม่?
            </h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.78)' }}>
              นัดหมาย Company Test Drive ให้ทีมงานทดลองรถกับรูปแบบการใช้งานจริงขององค์กร
            </p>
          </div>
          <Link
            href="/test-drive?note=Company%20Test%20Drive%20%E2%80%94%20Operating%20Lease"
            className="btn btn-primary"
          >
            นัดหมาย Company Test Drive
          </Link>
        </div>
      </section>

      <section style={{ paddingBottom: 'var(--space-8)', maxWidth: 900 }}>
        <h2 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 var(--space-4)' }}>ขอใบเสนอราคา Operating Lease</h2>
        <LeaseInquiryForm />
      </section>

      <section style={{ paddingBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'clamp(24px,2.8vw,30px)', margin: '0 0 var(--space-6)' }}>ความรู้สำหรับองค์กรที่กำลังวางแผน Fleet</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 'var(--space-6)' }}>
          {leaseArticles.map((a) => (
            <article key={a.slug} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <ImageSlot aspectRatio="16 / 10" caption="ARTICLE" filename={`article-${a.slug}.webp`} />
              <p style={{ margin: 'var(--space-2) 0 0', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>{a.category}</p>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, margin: 0, lineHeight: 1.3 }}>
                <Link href={`/articles/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{a.title}</Link>
              </h3>
              <p style={{ margin: 0, color: 'var(--color-neutral-800)', fontSize: 15 }}>{a.excerpt}</p>
              <Link href={`/articles/${a.slug}`} style={{ fontSize: 15, marginTop: 'var(--space-1)' }}>อ่านต่อ →</Link>
            </article>
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
