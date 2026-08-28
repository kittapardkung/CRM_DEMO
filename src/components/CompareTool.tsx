'use client';

import { useState } from 'react';
import { vehicles, getVehicle } from '@/lib/data/vehicles';
import { compareRows } from '@/lib/data/compare';

export default function CompareTool() {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(['porta', 'darion']);

  function toggle(slug: string) {
    setSelectedSlugs((prev) => {
      const on = prev.includes(slug);
      if (on) {
        return prev.length > 2 ? prev.filter((s) => s !== slug) : prev;
      }
      const next = prev.length >= 3 ? prev.slice(1) : prev;
      return [...next, slug];
    });
  }

  const selected = selectedSlugs.map((s) => getVehicle(s)!).filter(Boolean);

  return (
    <>
      <section style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        <p className="kicker">Compare</p>
        <h1 style={{ fontSize: 'clamp(29px,4vw,45px)', margin: '0 0 var(--space-3)' }}>เปรียบเทียบรถ</h1>
        <p style={{ margin: '0 0 var(--space-4)', color: 'var(--color-neutral-800)' }}>เลือกได้ 2–3 รุ่น</p>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {vehicles.map((v) => {
            const on = selectedSlugs.includes(v.slug);
            return (
              <button
                key={v.slug}
                type="button"
                onClick={() => toggle(v.slug)}
                className="pill-btn"
                aria-pressed={on}
                style={{
                  background: on ? 'var(--color-accent-100)' : 'transparent',
                  color: on ? 'var(--color-accent-800)' : 'var(--color-text)',
                  border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-neutral-400)'}`,
                }}
              >
                {v.shortName}
              </button>
            );
          })}
        </div>
      </section>
      <section style={{ paddingBottom: 'var(--space-8)', overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: 640 }}>
          <thead>
            <tr>
              <th>รายการ</th>
              {selected.map((v) => (
                <th key={v.slug}>{v.shortName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareRows.map((row) => (
              <tr key={row.label}>
                <th scope="row" style={{ fontWeight: 400, color: 'var(--color-neutral-700)' }}>{row.label}</th>
                {selected.map((v) => (
                  <td key={v.slug} className="tnum">{row.value(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
