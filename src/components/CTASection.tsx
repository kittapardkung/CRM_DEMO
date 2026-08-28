import Link from 'next/link';
import { ReactNode } from 'react';
import { dealer } from '@/lib/data/dealer';
import PhoneLink from './PhoneLink';

export default function CTASection({
  heading,
  showCalculator = true,
  showPhone = true,
}: {
  heading: ReactNode;
  showCalculator?: boolean;
  showPhone?: boolean;
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
      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(22px,2.8vw,31px)', margin: 0, color: '#fff' }}>{heading}</h2>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <Link href="/test-drive" className="btn btn-primary">ลงทะเบียนทดลองขับ</Link>
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
