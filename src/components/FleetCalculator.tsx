'use client';

import { useMemo, useState } from 'react';
import { calcFleet, FleetInput } from '@/lib/data/lease';
import { track } from '@/lib/analytics';

const modelOptions = [
  { value: 'porta', label: 'PORTA EV' },
  { value: 'darion-comfort', label: 'DARION EV (Comfort)' },
  { value: 'darion-premium', label: 'DARION EV (Premium)' },
];

const terms: Array<FleetInput['term']> = [36, 48, 60];

/**
 * Live Fleet cost calculator. Rates come from `LEASE_RATES` (real ORIX
 * quotation), so a fleet whose usage exceeds every tier — or has no rate for
 * the chosen term — surfaces a "contact us" note instead of a made-up number.
 */
export default function FleetCalculator() {
  const [fleet, setFleet] = useState<FleetInput>({ count: 5, kmDay: 200, daysMonth: 26, model: 'porta', term: 36 });

  const out = useMemo(() => calcFleet(fleet), [fleet]);

  function patch(next: Partial<FleetInput>) {
    setFleet((prev) => ({ ...prev, ...next }));
  }

  const rows = [
    { label: 'ระยะทางรวม / เดือน / คัน', value: out.kmPerVehicleMonth, muted: false },
    { label: 'ระยะทางรวมของ Fleet / เดือน', value: out.kmFleetMonth, muted: false },
    { label: 'ระยะทางรวมของ Fleet / ปี', value: out.kmFleetYear, muted: false },
    { label: 'ค่าเช่าประมาณการ / เดือน', value: out.leaseCost, muted: true },
    { label: 'ต้นทุน Fleet ประมาณการ / เดือน', value: out.totalCost, muted: true },
  ];

  return (
    <div id="lease-calc" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-8)', alignItems: 'start', scrollMarginTop: 96 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <label className="field">
          <span>จำนวนรถ</span>
          <input className="input" type="number" min={1} value={fleet.count} onChange={(e) => patch({ count: Number(e.target.value) || 0 })} />
        </label>
        <label className="field">
          <span>ระยะทางเฉลี่ย (กม./วัน/คัน)</span>
          <input className="input" type="number" min={1} value={fleet.kmDay} onChange={(e) => patch({ kmDay: Number(e.target.value) || 0 })} />
        </label>
        <label className="field">
          <span>วันใช้งาน (วัน/เดือน)</span>
          <input className="input" type="number" min={1} max={31} value={fleet.daysMonth} onChange={(e) => patch({ daysMonth: Number(e.target.value) || 0 })} />
        </label>
        <label className="field">
          <span>ประเภทรถ</span>
          <select className="input" value={fleet.model} onChange={(e) => patch({ model: e.target.value })}>
            {modelOptions.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </label>
        <div className="field">
          <span>ระยะสัญญา</span>
          <div className="seg" style={{ marginTop: 'var(--space-2)' }}>
            {terms.map((t) => (
              <button
                key={t}
                type="button"
                className="seg-opt tnum"
                onClick={() => {
                  track('calculate_fleet', { term: t });
                  patch({ term: t });
                }}
                style={{
                  cursor: 'pointer',
                  background: fleet.term === t ? 'var(--color-accent-100)' : 'transparent',
                  color: fleet.term === t ? 'var(--color-accent-800)' : 'var(--color-text)',
                }}
              >
                {t} เดือน
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)' }}>
        <p style={{ margin: '0 0 var(--space-4)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>ผลประเมิน</p>
        {rows.map((r, i) => (
          <div
            key={r.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 'var(--space-3)',
              padding: 'var(--space-2) 0',
              borderBottom: i < rows.length - 1 ? '1px solid var(--color-divider)' : 'none',
            }}
          >
            <span>{r.label}</span>
            <b className={r.muted ? undefined : 'tnum'} style={{ fontWeight: 600, color: r.muted ? 'var(--color-neutral-600)' : undefined }}>{r.value}</b>
          </div>
        ))}
        {out.rateNote ? (
          <p style={{ margin: 'var(--space-3) 0 0', fontSize: 12, color: 'var(--color-accent-700)' }}>{out.rateNote}</p>
        ) : null}
        <p style={{ margin: 'var(--space-3) 0 0', fontSize: 12, color: 'var(--color-neutral-600)' }}>
          ผลการคำนวณเป็นเพียงประมาณการ ค่าใช้จ่ายจริงขึ้นอยู่กับรูปแบบการใช้งานและเงื่อนไขของแต่ละบริษัท
        </p>
        <a href="#lease-form" className="btn btn-primary btn-block" style={{ marginTop: 'var(--space-4)' }}>ขอใบเสนอราคา</a>
      </div>
    </div>
  );
}
