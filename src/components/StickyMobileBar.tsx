'use client';

import Link from 'next/link';
import { dealer } from '@/lib/data/dealer';
import { track } from '@/lib/analytics';

/** Mobile-only sticky CTA bar (master prompt §4 / §36): โทร | LINE/ติดต่อ | ทดลองขับ. */
export default function StickyMobileBar() {
  return (
    <div
      className="om-mob"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 70,
        background: 'var(--color-bg)',
        borderTop: '1px solid var(--color-text)',
        padding: 'var(--space-2)',
        gap: 'var(--space-2)',
        display: 'none',
      }}
    >
      <a href={dealer.phoneHref} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => track('click_phone')}>
        โทร
      </a>
      <Link href="/contact" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => track('click_contact')}>
        LINE
      </Link>
      <Link href="/test-drive" className="btn btn-primary" style={{ flex: 1.2, justifyContent: 'center' }} onClick={() => track('click_test_drive')}>
        ทดลองขับ
      </Link>
    </div>
  );
}
