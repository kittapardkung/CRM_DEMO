'use client';

import { useEffect, useState } from 'react';

export interface PageIndexItem {
  id: string;
  label: string;
}

/**
 * Sticky in-page index for model detail pages. Desktop shows one scrollable
 * row separated by "/" with the active item highlighted in lime; mobile
 * collapses to a dropdown showing the active section.
 */
export default function PageIndexNav({ items }: { items: PageIndexItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '');
  const [open, setOpen] = useState(false);
  const [headerH, setHeaderH] = useState(126);

  useEffect(() => {
    function measure() {
      const header = document.querySelector('header.nav');
      if (header) setHeaderH(Math.round(header.getBoundingClientRect().height));
    }
    function onScroll() {
      const line = headerH + 60;
      let current = items[0]?.id ?? '';
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) current = item.id;
      }
      setActive((prev) => (prev === current ? prev : current));
    }
    measure();
    onScroll();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
    };
  }, [items, headerH]);

  function jump(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const rail = document.getElementById('page-index-rail');
    const railH = rail ? Math.round(rail.getBoundingClientRect().height) : 48;
    const pad = parseFloat(getComputedStyle(el).paddingTop) || 0;
    const y = el.getBoundingClientRect().top + window.scrollY + pad - (headerH + railH + 12);
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    setActive(id);
    setOpen(false);
  }

  const activeLabel = items.find((i) => i.id === active)?.label ?? items[0]?.label ?? '';
  const prefixStyle = {
    fontSize: 11,
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    color: 'var(--color-neutral-600)',
    flex: '0 0 auto',
  };

  return (
    <nav
      id="page-index-rail"
      aria-label="สารบัญหน้านี้"
      style={{
        position: 'sticky',
        top: headerH,
        zIndex: 41,
        background: 'var(--color-bg)',
        marginLeft: 'calc(-1 * var(--space-4))',
        marginRight: 'calc(-1 * var(--space-4))',
        padding: 'var(--space-4) var(--space-4) var(--space-1)',
      }}
    >
      <div
        className="om-desk"
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', whiteSpace: 'nowrap', fontSize: 15, overflowX: 'auto' }}
      >
        <span style={prefixStyle}>สารบัญหน้า :</span>
        {items.map((item, i) => (
          <span key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: '0 0 auto' }}>
            {i > 0 ? <span style={{ color: 'var(--color-neutral-400)' }}>/</span> : null}
            <button
              type="button"
              onClick={() => jump(item.id)}
              style={{
                background: active === item.id ? 'var(--wl-lime)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                font: 'inherit',
                color: active === item.id ? 'var(--wl-ink)' : 'var(--color-neutral-800)',
                display: 'inline-block',
                padding: '1px 5px',
                margin: '-1px -5px',
                lineHeight: 1.25,
                borderRadius: 2,
                transition: 'background 160ms ease, color 160ms ease',
              }}
            >
              {item.label}
            </button>
          </span>
        ))}
      </div>

      <div className="om-mob" style={{ flexDirection: 'column' }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            width: '100%',
            background: 'none',
            border: 0,
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            color: 'var(--color-text)',
            textAlign: 'left',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 0 }}>
            <span style={prefixStyle}>สารบัญหน้า :</span>
            <span style={{ background: 'var(--wl-lime)', padding: '1px 5px', borderRadius: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeLabel}
            </span>
          </span>
          <span style={{ flex: '0 0 auto', color: 'var(--color-neutral-600)', fontSize: 13 }}>{open ? '▲' : '▼'}</span>
        </button>
        {open ? (
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'var(--space-3)', borderTop: '1px solid var(--color-neutral-300)' }}>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => jump(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--color-neutral-200)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 17,
                  padding: 'var(--space-3) 0',
                  textAlign: 'left',
                  color: active === item.id ? 'var(--wl-ink)' : 'var(--color-neutral-800)',
                }}
              >
                <span style={{ background: active === item.id ? 'var(--wl-lime)' : 'transparent', padding: '1px 5px', marginLeft: -5, borderRadius: 2 }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
