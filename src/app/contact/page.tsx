import type { Metadata } from 'next';
import Link from 'next/link';
import PhoneLink from '@/components/PhoneLink';
import { contactRows, dealer } from '@/lib/data/dealer';

export const metadata: Metadata = {
  title: 'ติดต่อ WULING CHONBURI',
  description: 'ที่ตั้ง เบอร์โทร และช่องทางติดต่อผู้จำหน่าย WULING ชลบุรี',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  const mapEmbedSrc = `https://www.google.com/maps?q=${dealer.latitude},${dealer.longitude}&output=embed`;

  return (
    <div className="wrap">
      <section style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        <p className="kicker">Contact</p>
        <h1 style={{ fontSize: 'clamp(29px,4vw,45px)', margin: 0 }}>ติดต่อเรา</h1>
      </section>
      <section style={{ paddingBottom: 'var(--space-8)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-8)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {contactRows.map((c) => (
            <div key={c.label} style={{ borderBottom: '1px solid var(--color-divider)', paddingBottom: 'var(--space-3)' }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>{c.label}</p>
              {c.href ? (
                <a href={c.href} className="tnum" style={{ margin: 0, fontSize: 19, color: 'inherit' }} target={c.href.startsWith('http') ? '_blank' : undefined} rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                  {c.value}
                </a>
              ) : (
                <p className="tnum" style={{ margin: 0, fontSize: 19 }}>{c.value}</p>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
            <PhoneLink className="btn btn-primary">โทรเลย</PhoneLink>
            <Link href="/test-drive" className="btn btn-secondary">ทดลองขับ</Link>
            <a href={dealer.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">นำทางมาที่ร้าน</a>
          </div>
        </div>
        <div
          style={{
            position: 'relative',
            aspectRatio: '4 / 3',
            overflow: 'hidden',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-neutral-300)',
            background: 'var(--color-neutral-200)',
          }}
        >
          <iframe
            title={`แผนที่โชว์รูม ${dealer.name}`}
            src={mapEmbedSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        </div>
      </section>
    </div>
  );
}
