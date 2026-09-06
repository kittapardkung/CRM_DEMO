import Link from 'next/link';
import { vehicles } from '@/lib/data/vehicles';
import { dealer } from '@/lib/data/dealer';
import { footerServiceLinks } from '@/lib/nav';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--wl-ink)', color: '#fff', marginTop: 'var(--space-8)' }}>
      <div
        className="wrap"
        style={{
          padding: 'var(--space-8) var(--space-4) 120px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
          gap: 'var(--space-6)',
        }}
      >
        <div>
          <p style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 21, letterSpacing: '0.08em', color: '#fff' }}>
            {dealer.name}
          </p>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
            ผู้จำหน่ายรถยนต์ WULING จังหวัดชลบุรี · โทร {dealer.phoneDisplay}
          </p>
        </div>
        <div>
          <p style={{ margin: '0 0 var(--space-3)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--wl-lime)' }}>รถยนต์</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {vehicles.map((v) => (
              <Link key={v.slug} href={`/models/${v.slug}`} style={{ fontSize: 15, textDecoration: 'none', color: 'rgba(255,255,255,0.82)' }}>
                {v.shortName}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p style={{ margin: '0 0 var(--space-3)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--wl-lime)' }}>บริการ</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {footerServiceLinks.map((f) => (
              <Link key={f.href} href={f.href} style={{ fontSize: 15, textDecoration: 'none', color: 'rgba(255,255,255,0.82)' }}>
                {f.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p style={{ margin: '0 0 var(--space-3)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--wl-lime)' }}>เวลาทำการ</p>
          <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>{dealer.hours}</p>
        </div>
        <div>
          <p style={{ margin: '0 0 var(--space-3)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--wl-lime)' }}>ติดตามเรา</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <a href={dealer.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, textDecoration: 'none', color: 'rgba(255,255,255,0.82)' }}>
              Facebook
            </a>
            <a href={dealer.lineUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, textDecoration: 'none', color: 'rgba(255,255,255,0.82)' }}>
              LINE
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
