'use client';

import { useState } from 'react';

export default function BeforeAfterSlider({ afterCaption, afterFile }: { afterCaption: string; afterFile: string }) {
  const [pct, setPct] = useState(45);

  return (
    <section className="section">
      <h2 style={{ fontSize: 'clamp(23px,3vw,32px)', margin: '0 0 var(--space-4)' }}>ก่อน / หลังติดตั้ง</h2>
      <div style={{ position: 'relative', aspectRatio: '16 / 9', border: '1px solid var(--color-neutral-300)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-neutral-200)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--color-neutral-200)' }} />
        <span style={{ position: 'absolute', right: 'var(--space-6)', top: '50%', transform: 'translateY(-50%)', textAlign: 'right', fontSize: 13, color: 'var(--color-neutral-700)' }}>
          AFTER · {afterCaption}
          <br />
          <span style={{ fontSize: 11 }}>{afterFile}</span>
        </span>
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: `${pct}%`,
            overflow: 'hidden',
            borderRight: '2px solid var(--color-accent)',
            background: 'var(--color-neutral-300)',
          }}
        >
          <span style={{ position: 'absolute', left: 'var(--space-6)', top: '50%', transform: 'translateY(-50%)', textAlign: 'left', fontSize: 13, color: 'var(--color-neutral-800)', whiteSpace: 'nowrap' }}>
            BEFORE · PORTA Standard
            <br />
            <span style={{ fontSize: 11 }}>porta-cargo-standard.webp</span>
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          aria-label="เลื่อนเปรียบเทียบก่อน/หลัง"
          style={{ position: 'absolute', left: 'var(--space-4)', right: 'var(--space-4)', bottom: 'var(--space-4)', width: 'auto', accentColor: 'var(--color-accent)' }}
        />
      </div>
    </section>
  );
}
