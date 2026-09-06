'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Vehicle } from '@/lib/data/types';
import { money, priceNote } from '@/lib/format';
import { track } from '@/lib/analytics';
import PageIndexNav, { PageIndexItem } from './PageIndexNav';

/**
 * Hero image + color selector + exterior gallery for a model detail page.
 * These three sections share the selected color / exterior view, so they
 * live in one client island; everything else on the page stays server
 * rendered.
 *
 * Real photo paths are resolved on the server (this is a client component, so
 * it can't touch the filesystem) and passed in via `heroSrc` / `exteriorSrc`;
 * anything still missing falls back to a labelled placeholder.
 */
export default function VehicleVisuals({
  vehicle,
  pageIndex,
  heroSrc = null,
  exteriorSrc = {},
}: {
  vehicle: Vehicle;
  pageIndex: PageIndexItem[];
  heroSrc?: string | null;
  /** Keyed by `${viewSlug}-${colorSlug}`. */
  exteriorSrc?: Record<string, string | null>;
}) {
  const [colorIndex, setColorIndex] = useState(0);
  const [extIndex, setExtIndex] = useState(1); // default to the "front 3/4" hero angle
  const dialogRef = useRef<HTMLDialogElement>(null);

  const color = vehicle.colors[colorIndex];
  const extView = vehicle.exteriorViews[extIndex];
  const extFile = `${vehicle.slug}-${extView.slug}-${color.slug}.webp`;
  const confirmedColors = vehicle.slug === 'porta' || vehicle.slug === 'darion';
  const extMainSrc = exteriorSrc[`${extView.slug}-${color.slug}`] ?? null;
  const extMainLabel = `${vehicle.shortName} · ${extView.label} · สี${color.name}`;

  const openLightbox = () => dialogRef.current?.showModal();
  const closeLightbox = () => dialogRef.current?.close();

  return (
    <>
      <section style={{ padding: 'var(--space-2) 0 var(--space-8)' }}>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--wl-ink)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(26px,4vw,52px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
            gap: 'var(--space-6)',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <p style={{ margin: '0 0 var(--space-2)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--wl-lime)' }}>{vehicle.positioning}</p>
            <h1 style={{ fontSize: 'clamp(34px,5vw,60px)', lineHeight: 1.1, margin: '0 0 var(--space-3)', color: '#fff' }}>{vehicle.shortName}</h1>
            <p style={{ margin: '0 0 var(--space-4)', fontSize: 18, maxWidth: '36ch', color: 'rgba(255,255,255,0.78)' }}>{vehicle.tagline}</p>
            <p style={{ margin: '0 0 var(--space-6)', fontSize: 16, color: 'rgba(255,255,255,0.78)' }}>
              เริ่มต้น <b className="tnum" style={{ fontWeight: 600, fontSize: 24, color: 'var(--wl-lime)' }}>{money(vehicle.startingPrice)}</b>{' '}
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{priceNote}</span>
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Link href="/test-drive" className="btn btn-primary" onClick={() => track('click_test_drive')}>ทดลองขับ</Link>
              <Link
                href={`/test-drive?model=${encodeURIComponent(vehicle.name)}&note=${encodeURIComponent('ขอใบเสนอราคา ' + vehicle.name)}`}
                className="btn btn-on-dark"
              >
                ขอใบเสนอราคา
              </Link>
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ position: 'absolute', right: '-5%', top: '14%', width: '38%', height: '72%', background: 'var(--wl-lime)', borderRadius: 'var(--radius-lg)', display: 'block' }} />
            <button
              type="button"
              onClick={openLightbox}
              aria-label="ดูภาพขยาย"
              style={{
                position: 'relative',
                zIndex: 2,
                width: '100%',
                aspectRatio: '4 / 3',
                overflow: 'hidden',
                background: '#0b1730',
                border: heroSrc ? 'none' : '1px dashed rgba(255,255,255,0.4)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: heroSrc ? 0 : 'var(--space-4)',
                cursor: 'zoom-in',
                font: 'inherit',
              }}
            >
              {heroSrc ? (
                <Image
                  src={heroSrc}
                  alt={`WULING ${vehicle.shortName} มุมหน้า 3/4 — ${vehicle.positioning}`}
                  fill
                  priority
                  sizes="(max-width: 820px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)' }}>
                  {vehicle.shortName} · Exterior Front 3/4 · สี{color.name}
                  <br />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{vehicle.slug}-front-34-{color.slug}.webp</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      <PageIndexNav items={pageIndex} />

      <section id="sec-colors" style={{ padding: 'var(--space-6) 0', scrollMarginTop: 140 }}>
        <p className="kicker" style={{ margin: '0 0 var(--space-3)' }}>Colors · {confirmedColors ? 'สีที่จำหน่ายจริง' : 'ตัวอย่างชุดสี (รอยืนยัน)'}</p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          {vehicle.colors.map((c, i) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => {
                track('select_color', { model: vehicle.shortName, color: c.slug });
                setColorIndex(i);
              }}
              aria-pressed={i === colorIndex}
              aria-label={c.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                background: 'none',
                cursor: 'pointer',
                padding: '6px var(--space-3) 6px 6px',
                border: `1px solid ${i === colorIndex ? 'var(--color-accent)' : 'var(--color-neutral-300)'}`,
                borderRadius: 999,
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                color: 'var(--color-text)',
              }}
            >
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: c.code, border: '1px solid var(--color-neutral-400)', display: 'block' }} />
              {c.name}
            </button>
          ))}
        </div>
      </section>

      <section id="sec-exterior" style={{ padding: 'var(--space-6) 0', scrollMarginTop: 140 }}>
        <h2 style={{ fontSize: 'clamp(23px,3vw,32px)', margin: '0 0 var(--space-4)' }}>ภายนอก</h2>
        <button
          type="button"
          onClick={openLightbox}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            overflow: 'hidden',
            background: 'var(--color-neutral-200)',
            border: '1px solid var(--color-neutral-300)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 'var(--space-4)',
            cursor: 'zoom-in',
            font: 'inherit',
          }}
        >
          {extMainSrc ? (
            <Image src={extMainSrc} alt={extMainLabel} fill sizes="(max-width: 1100px) 100vw, 1100px" style={{ objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>
              {extMainLabel} — {extFile}
            </span>
          )}
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          {vehicle.exteriorViews.map((e, i) => {
            const thumbSrc = exteriorSrc[`${e.slug}-${color.slug}`] ?? null;
            return (
              <button
                key={e.slug}
                type="button"
                onClick={() => setExtIndex(i)}
                style={{
                  position: 'relative',
                  aspectRatio: '4 / 3',
                  overflow: 'hidden',
                  background: 'var(--color-neutral-200)',
                  border: `1px solid ${i === extIndex ? 'var(--color-accent)' : 'var(--color-neutral-300)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  color: 'var(--color-neutral-700)',
                  padding: 'var(--space-2)',
                }}
              >
                {thumbSrc ? (
                  <Image src={thumbSrc} alt={e.label} fill sizes="160px" style={{ objectFit: 'cover' }} />
                ) : (
                  e.label
                )}
              </button>
            );
          })}
        </div>
      </section>

      <dialog
        ref={dialogRef}
        className="dialog-backdrop"
        style={{ border: 'none', padding: 'var(--space-4)', maxWidth: 1100, width: '90vw', background: 'transparent' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeLightbox();
        }}
      >
        <div className="dialog">
          <p className="dialog-title" style={{ margin: '0 0 var(--space-3)' }}>
            {extMainLabel}
          </p>
          <div
            style={{
              position: 'relative',
              aspectRatio: '16 / 9',
              overflow: 'hidden',
              background: extMainSrc ? '#000' : 'var(--color-neutral-200)',
              border: '1px solid var(--color-neutral-300)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: 'var(--color-neutral-700)',
            }}
          >
            {extMainSrc ? (
              <Image src={extMainSrc} alt={extMainLabel} fill sizes="1100px" style={{ objectFit: 'contain' }} />
            ) : (
              'FULL SCREEN GALLERY · รอไฟล์ภาพจริง'
            )}
          </div>
          <div className="dialog-actions" style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={closeLightbox}>ปิด</button>
          </div>
        </div>
      </dialog>
    </>
  );
}
