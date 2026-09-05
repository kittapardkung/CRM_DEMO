'use client';

import { useMemo, useState } from 'react';
import { calcFleet, FleetInput } from '@/lib/data/lease';
import { track } from '@/lib/analytics';

const modelOptions: { value: string; label: string }[] = [
  { value: 'porta', label: 'WULING PORTA EV' },
  { value: 'darion-comfort', label: 'WULING DARION EV (Comfort)' },
  { value: 'darion-premium', label: 'WULING DARION EV (Premium)' },
];

const terms: Array<FleetInput['term']> = [36, 48, 60];

/**
 * Live Fleet cost calculator — inputs: vehicle count, km/day, days/month,
 * vehicle type, contract term. Rates come from `LEASE_RATES` (real ORIX
 * quotation), so a fleet whose usage exceeds every tier or has no rate for
 * a given term surfaces a "contact us" note instead of a made-up number.
 */
export default function FleetCalculator() {
  const [fleet, setFleet] = useState<FleetInput>({ count: 5, kmDay: 200, daysMonth: 26, model: 'porta', term: 36 });

  const out = useMemo(() => calcFleet(fleet), [fleet]);

  function patch(next: Partial<FleetInput>) {
    setFleet((prev) => ({ ...prev, ...next }));
  }

  return (
    <div id="lease-calc" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'var(--space-8)', alignItems: 'start', scrollMarginTop: 96 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <label className="field">
          <span>จำนวนรถ (คัน)</span>
          <input className="input" type="number" min={1} value={fleet.count} onChange={(e) => patch({ count: Number(e.target.value) || 0 })} />
        </label>
        <label className="field">
          <span>ระยะทางต่อวัน (กม./คัน)</span>
          <input className="input" type="number" min={0} value={fleet.kmDay} onChange={(e) => patch({ kmDay: Number(e.target.value) || 0 })} />
        </label>
        <label className="field">
          <span>จำนวนวันที่ใช้งานต่อเดือน</span>
          <input className="input" type="number" min={1} max={31} value={fleet.daysMonth} onChange={(e) => patch({ daysMonth: Number(e.target.value) || 0 })} />
        </label>
        <label className="field">
          <span>รุ่นรถ</span>
          <select className="input" value={fleet.model} onChange={(e) => patch({ model: e.target.value })}>
            {modelOptions.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </label>
        <div className="field">
          <span>ระยะเวลาสัญญา</span>
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
                style={{ cursor: 'pointer', background: fleet.term === t ? 'var(--color-accent-100)' : 'transparent', color: fleet.term === t ? 'var(--color-accent-800)' : 'var(--color-text)' }}
              >
                {t} เดือน
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <p style={{ margin: '0 0 var(--space-4)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>ผลการประเมิน Fleet</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}>
          <span>ระยะทางต่อคันต่อเดือน</span>
          <b className="tnum" style={{ fontWeight: 600 }}>{out.kmPerVehicleMonth}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}>
          <span>ระยะทางรวมของ Fleet ต่อเดือน</span>
          <b className="tnum" style={{ fontWeight: 600 }}>{out.kmFleetMonth}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}>
          <span>ระยะทางรวมของ Fleet ต่อปี</span>
          <b className="tnum" style={{ fontWeight: 600 }}>{out.kmFleetYear}</b>
        </div>
        <p style={{ margin: 'var(--space-6) 0 0', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>ค่าเช่าโดยประมาณ</p>
        <p className="tnum" style={{ margin: 'var(--space-2) 0 0', fontFamily: 'var(--font-heading)', fontSize: 'clamp(26px,3.6vw,36px)', lineHeight: 1.2 }}>{out.leaseCost}</p>
        <p className="tnum" style={{ margin: 'var(--space-1) 0 0', fontSize: 15, color: 'var(--color-neutral-700)' }}>รวม Fleet: {out.totalCost}</p>
        <p style={{ margin: 'var(--space-4) 0 0', fontSize: 13, color: 'var(--color-neutral-600)' }}>{out.rateNote}</p>
      </div>
    </div>
  );
}
