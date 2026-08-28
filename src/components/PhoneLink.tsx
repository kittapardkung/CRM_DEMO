'use client';

import { CSSProperties, ReactNode } from 'react';
import { dealer } from '@/lib/data/dealer';
import { track } from '@/lib/analytics';

/** The one interactive island a plain `tel:` link needs — a click_phone track call. */
export default function PhoneLink({ className, style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <a href={dealer.phoneHref} className={className} style={style} onClick={() => track('click_phone')}>
      {children}
    </a>
  );
}
