'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { primaryNav, isNavActive } from '@/lib/nav';

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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

        <nav className="om-desk" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginLeft: 'auto', flexWrap: 'wrap' }}>
          {primaryNav.map((n) => {
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
          {primaryNav.map((n) => (
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
          ))}
          <Link href="/test-drive" onClick={() => setMenuOpen(false)} className="btn btn-primary btn-block" style={{ marginTop: 'var(--space-3)' }}>
            ลงทะเบียนทดลองขับ
          </Link>
        </div>
      ) : null}
    </header>
  );
}
