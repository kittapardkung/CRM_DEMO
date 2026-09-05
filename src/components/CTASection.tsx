import Link from 'next/link';
import { ReactNode } from 'react';
import { dealer } from '@/lib/data/dealer';
import PhoneLink from './PhoneLink';

export default function CTASection({
  heading,
  body,
  showCalculator = true,
  showPhone = true,
  primaryLabel = 'ลงทะเบียนทดลองขับ',
  primaryHref = '/test-drive',
}: {
  heading: ReactNode;
  body?: ReactNode;
  showCalculator?: boolean;
  showPhone?: boolean;
  primaryLabel?: string;
  primaryHref?: string;
}) {
  return (
    <section
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
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(22px,2.8vw,31px)', margin: 0, color: '#fff' }}>{heading}</h2>
        {body ? <p style={{ margin: 'var(--space-2) 0 0', fontSize: 15, color: 'rgba(255,255,255,0.78)', maxWidth: '48ch' }}>{body}</p> : null}
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <Link href={primaryHref} className="btn btn-primary">{primaryLabel}</Link>
        {showCalculator ? (
          <Link href="/calculator" className="btn btn-on-dark">คำนวณค่างวด</Link>
        ) : null}
        {showPhone ? (
          <PhoneLink className="btn" style={{ color: 'var(--wl-lime)' }}>
            {dealer.phoneDisplay}
          </PhoneLink>
        ) : null}
      </div>
    </section>
  );
}
