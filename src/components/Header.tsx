'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { primaryNav, isNavActive, isNavGroup, isNavGroupActive } from '@/lib/nav';

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close any open dropdown / the mobile menu whenever the route changes.
  // Derived during render (React's recommended "adjusting state when a prop
  // changes" pattern) rather than in an effect, to avoid the extra
  // commit-then-re-render round trip an effect-based reset would cause.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
    setOpenGroup(null);
  }

  // Close an open dropdown on outside click or Escape.
  useEffect(() => {
    if (!openGroup) return;
    function onPointerDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenGroup(null);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openGroup]);

  return (
    <header
      className="nav"
      style={{ position: 'sticky', top: 0, zIndex: 60, background: 'var(--color-bg)', borderBottom: '1px solid var(--color-divider)' }}
    >
      <div className="wrap" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', textDecoration: 'none', color: 'inherit', flex: '0 0 auto' }}
        >
          <Image
            src="/assets/wuling-chonburi-logo.jpg"
            alt="WULING CHONBURI"
            width={40}
            height={40}
            style={{ width: 40, height: 40, display: 'block', borderRadius: 'var(--radius-sm)' }}
            priority
          />
          <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 19, letterSpacing: '0.12em' }}>WULING</span>
            <span style={{ fontSize: 11, letterSpacing: '0.22em', color: 'var(--color-neutral-700)' }}>CHONBURI</span>
          </span>
        </Link>

        <nav ref={navRef} className="om-desk" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginLeft: 'auto', flexWrap: 'wrap' }}>
          {primaryNav.map((n) => {
            if (isNavGroup(n)) {
              const active = isNavGroupActive(n, pathname);
              const open = openGroup === n.label;
              return (
                <div key={n.label} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setOpenGroup(open ? null : n.label)}
                    aria-expanded={open}
                    aria-haspopup="true"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      font: 'inherit',
                      fontSize: 15,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '6px 0',
                      borderBottom: `1px solid ${active ? 'var(--color-accent)' : 'transparent'}`,
                      color: active ? 'var(--color-accent-700)' : 'var(--color-text)',
                    }}
                  >
                    {n.label}
                    <span style={{ fontSize: 10, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>▾</span>
                  </button>
                  {open ? (
                    <div
                      role="menu"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        left: 0,
                        minWidth: 220,
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-divider)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.12))',
                        padding: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      {n.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          onClick={() => setOpenGroup(null)}
                          style={{
                            fontSize: 14.5,
                            textDecoration: 'none',
                            padding: '9px 10px',
                            borderRadius: 'var(--radius-sm)',
                            color: isNavActive(item.href, pathname) ? 'var(--color-accent-700)' : 'var(--color-text)',
                            background: isNavActive(item.href, pathname) ? 'var(--color-neutral-100)' : 'transparent',
                          }}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }

            const active = isNavActive(n.href, pathname);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? 'page' : undefined}
                style={{
                  fontSize: 15,
                  textDecoration: 'none',
                  padding: '6px 0',
                  borderBottom: `1px solid ${active ? 'var(--color-accent)' : 'transparent'}`,
                  color: active ? 'var(--color-accent-700)' : 'var(--color-text)',
                }}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/test-drive" className="btn btn-primary om-desk" style={{ flex: '0 0 auto' }}>
          ทดลองขับ
        </Link>

        <button
          type="button"
          className="btn btn-ghost om-mob"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="เมนู"
          aria-expanded={menuOpen}
          style={{ marginLeft: 'auto', fontSize: 20, display: 'none' }}
        >
          ≡
        </button>
      </div>

      {menuOpen ? (
        <div
          style={{
            borderTop: '1px solid var(--color-divider)',
            padding: 'var(--space-3) var(--space-4) var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {primaryNav.map((n) => {
            if (isNavGroup(n)) {
              return (
                <div key={n.label} style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>
                    {n.label}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {n.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          fontSize: 16,
                          textDecoration: 'none',
                          color: isNavActive(item.href, pathname) ? 'var(--color-accent-700)' : 'var(--color-text)',
                          padding: 'var(--space-2) 0 var(--space-2) var(--space-3)',
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontSize: 17,
                  textDecoration: 'none',
                  color: 'var(--color-text)',
                  padding: 'var(--space-2) 0',
                  borderBottom: '1px solid var(--color-divider)',
                }}
              >
                {n.label}
              </Link>
            );
          })}
          <Link href="/test-drive" onClick={() => setMenuOpen(false)} className="btn btn-primary btn-block" style={{ marginTop: 'var(--space-3)' }}>
            ลงทะเบียนทดลองขับ
          </Link>
        </div>
      ) : null}
    </header>
  );
}
