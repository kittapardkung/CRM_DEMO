'use client';

import { useEffect, useState } from 'react';

export interface PageIndexItem {
  id: string;
  label: string;
}

/**
 * Sticky horizontal in-page nav for model detail pages — scroll-spy across
 * the section ids passed in, click-to-jump with a smooth scroll that
 * accounts for the sticky header + this bar's own height.
 */
export default function PageIndexNav({ items }: { items: PageIndexItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '');

  useEffect(() => {
    function onScroll() {
      const header = document.querySelector('header.nav');
      const headerH = header ? header.getBoundingClientRect().height : 0;
      const line = headerH + 60;
      let current = items[0]?.id ?? '';
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) current = item.id;
      }
      setActive((prev) => (prev === current ? prev : current));
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function jump(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const header = document.querySelector('header.nav');
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const rail = document.getElementById('page-index-rail');
    const railH = rail ? rail.getBoundingClientRect().height : 48;
    const y = el.getBoundingClientRect().top + window.scrollY - (headerH + railH + 12);
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }

  return (
    <nav
      id="page-index-rail"
      aria-label="สารบัญหน้านี้"
      style={{
        position: 'sticky',
        top: 'var(--header-h, 64px)',
        zIndex: 30,
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-divider)',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        padding: 'var(--space-2) 0',
        marginBottom: 'var(--space-2)',
      }}
    >
      {items.map((item, i) => (
        <span key={item.id}>
          {i > 0 ? <span style={{ color: 'var(--color-neutral-500)', margin: '0 8px' }}>/</span> : null}
          <button
            type="button"
            onClick={() => jump(item.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              font: 'inherit',
              fontSize: 14,
              padding: '4px 2px',
              color: active === item.id ? 'var(--wl-ink)' : 'var(--color-neutral-700)',
              fontWeight: active === item.id ? 600 : 400,
              borderBottom: active === item.id ? '2px solid var(--wl-lime)' : '2px solid transparent',
            }}
          >
            {item.label}
          </button>
        </span>
      ))}
    </nav>
  );
}
