'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vehicle } from '@/lib/data/types';
import { accessories, useCases, resolveConfiguratorImage } from '@/lib/data/accessories';
import { money } from '@/lib/format';
import { track } from '@/lib/analytics';

export default function PortaConfigurator({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [useCase, setUseCase] = useState<string | null>(null);

  const selectedAccessories = accessories.filter((a) => selected[a.id]);
  const accTotal = selectedAccessories.reduce((sum, a) => sum + a.price, 0);
  const basePrice = vehicle.startingPrice ?? 0;
  const total = basePrice + accTotal;

  const visualLayerIds = useMemo(
    () => accessories.filter((a) => a.isVisualLayer && selected[a.id]).map((a) => a.id),
    [selected],
  );
  const { key: imageKey, fallbackOf } = resolveConfiguratorImage(visualLayerIds);
  const cfgTitle = imageKey === 'base' ? 'Cargo Standard' : 'Cargo ' + imageKey.split('+').join(' + ');
  const cfgFile = `porta-cargo-${imageKey}.webp`;
  const layerTags = visualLayerIds.length ? visualLayerIds : ['standard'];

  function toggleAccessory(id: string) {
    const on = !!selected[id];
    track(on ? 'remove_accessory' : 'add_accessory', { accessory: id });
    setSelected((prev) => {
      const next = { ...prev };
      if (on) delete next[id];
      else next[id] = true;
      return next;
    });
    setUseCase('custom');
  }

  function pickUseCase(id: string) {
    track('select_porta_package', { use_case: id });
    setUseCase(id);
    if (id === 'custom') return;
    const pkg = useCases.find((u) => u.id === id);
    const next: Record<string, boolean> = {};
    pkg?.accessoryIds.forEach((accId) => {
      next[accId] = true;
    });
    setSelected(next);
  }

  function submitQuote() {
    track('submit_quote', {
      model: vehicle.shortName,
      accessories: selectedAccessories.map((a) => a.id).join(','),
      total,
    });
    const note = selectedAccessories.length
      ? 'ขอใบเสนอราคาสเปก: ' + selectedAccessories.map((a) => a.name).join(', ')
      : 'ขอใบเสนอราคาสเปก: สเปกมาตรฐาน';
    const params = new URLSearchParams({
      model: vehicle.name,
      note,
      accessories: selectedAccessories.map((a) => a.name).join(', '),
      accessoriesTotal: String(accTotal),
    });
    router.push(`/test-drive?${params.toString()}`);
  }

  return (
    <section className="section">
      <p className="kicker kicker-2">Cargo</p>
      <h2 style={{ fontSize: 'clamp(24px,3.2vw,35px)', margin: '0 0 var(--space-4)' }}>สร้าง PORTA ในแบบธุรกิจของคุณ</h2>
      <p style={{ margin: '0 0 var(--space-6)', maxWidth: '56ch', color: 'var(--color-neutral-800)' }}>
        เลือกการใช้งานเพื่อดูแพ็กเกจที่แนะนำ หรือเลือกอุปกรณ์เสริมเองทีละรายการ ภาพตัวอย่างและราคาจะอัปเดตตามสเปกที่เลือก
      </p>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <p style={{ margin: '0 0 var(--space-3)', fontSize: 16 }}>คุณจะใช้ PORTA ทำอะไร?</p>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {useCases.map((u) => {
            const active = useCase === u.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => pickUseCase(u.id)}
                className="pill-btn"
                style={{
                  background: active ? 'var(--color-accent-100)' : 'transparent',
                  color: active ? 'var(--color-accent-800)' : 'var(--color-text)',
                  border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-neutral-400)'}`,
                }}
              >
                {u.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 'var(--space-6)', alignItems: 'start' }}>
        <div style={{ position: 'sticky', top: 96 }}>
          <div
            style={{
              aspectRatio: '4 / 3',
              background: 'var(--color-neutral-200)',
              border: '1px solid var(--color-neutral-300)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {layerTags.map((t) => (
                <span key={t} className="tag tag-accent" style={{ fontSize: 11 }}>{t}</span>
              ))}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-800)' }}>PORTA · {cfgTitle}</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--color-neutral-600)' }}>{cfgFile}</p>
              {fallbackOf ? (
                <p style={{ margin: 'var(--space-2) 0 0', fontSize: 11, color: 'var(--color-accent-2-700)', borderTop: '1px solid var(--color-accent-2-300)', paddingTop: 6 }}>
                  ยังไม่มีภาพของชุดสเปกนี้ — ใช้ภาพสำรอง porta-cargo-{fallbackOf}.webp
                </p>
              ) : null}
            </div>
          </div>
          <div className="card" style={{ borderTop: 'none', padding: 'var(--space-4)' }}>
            <p style={{ margin: '0 0 var(--space-3)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>สรุปสเปกและราคา</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', fontSize: 15, paddingBottom: 'var(--space-2)' }}>
              <span>{vehicle.name}</span>
              <span className="tnum">{money(vehicle.startingPrice)}</span>
            </div>
            {selectedAccessories.map((a) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', fontSize: 14, color: 'var(--color-neutral-800)', padding: '3px 0' }}>
                <span>{a.name}</span>
                <span className="tnum">+ {money(a.price)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', fontSize: 14, borderTop: '1px solid var(--color-divider)', marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)' }}>
              <span>รวมอุปกรณ์เสริม ({selectedAccessories.length} รายการ)</span>
              <span className="tnum">{money(accTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', alignItems: 'baseline', borderTop: '1px solid var(--color-text)', marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)' }}>
              <span style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>รวมทั้งหมด</span>
              <span className="tnum" style={{ fontFamily: 'var(--font-heading)', fontSize: 30 }}>{money(total)}</span>
            </div>
            <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 'var(--space-4)' }} onClick={submitQuote}>
              ขอใบเสนอราคาสเปกนี้
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {accessories.map((a) => {
            const on = !!selected[a.id];
            return (
              <div
                key={a.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '96px 1fr',
                  gap: 'var(--space-4)',
                  border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                  background: on ? 'var(--color-accent-100)' : 'transparent',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                }}
              >
                <div
                  style={{
                    aspectRatio: '1',
                    background: 'var(--color-neutral-200)',
                    border: '1px solid var(--color-neutral-300)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontSize: 10,
                    color: 'var(--color-neutral-700)',
                    padding: 4,
                  }}
                >
                  ACC · {a.id}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, lineHeight: 1.2 }}>{a.name}</p>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-800)' }}>{a.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', marginTop: 6, flexWrap: 'wrap' }}>
                    <span className="tnum" style={{ fontSize: 16 }}>+ {money(a.price)}</span>
                    <button
                      type="button"
                      onClick={() => toggleAccessory(a.id)}
                      style={{
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        fontSize: 14,
                        padding: '7px var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-accent-700)',
                        background: on ? 'var(--color-accent-700)' : 'transparent',
                        color: on ? 'var(--color-neutral-100)' : 'var(--color-accent-700)',
                      }}
                    >
                      {on ? '✓ เพิ่มแล้ว' : '+ เพิ่ม'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
