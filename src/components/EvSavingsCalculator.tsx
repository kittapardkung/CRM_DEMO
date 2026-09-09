'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { vehicles } from '@/lib/data/vehicles';
import { dealer } from '@/lib/data/dealer';
import { money } from '@/lib/format';
import { track } from '@/lib/analytics';
import PhoneLink from './PhoneLink';

interface EvOption {
  id: string;
  label: string;
  price: number;
  /** kWh consumed per 100 km, derived from the confirmed battery capacity ÷ CLTC range. */
  consumptionPer100km: number;
}

/**
 * EV options pulled straight from the product data — every price and every
 * consumption figure traces back to a confirmed `specValues` entry in
 * `lib/data/vehicles.ts`, so a model with no confirmed price or spec (e.g.
 * EKXION, not yet launched) is skipped rather than guessed at.
 */
const evOptions: EvOption[] = vehicles.flatMap((v) => {
  const battery = parseFloat(v.specValues?.['ความจุแบตเตอรี่'] ?? '');
  const range = parseFloat(v.specValues?.['ระยะทางต่อการชาร์จ'] ?? '');
  if (!battery || !range) return [];
  return v.variants
    .filter((variant) => variant.price != null)
    .map((variant) => ({
      id: `${v.slug}-${variant.id}`,
      label: v.variants.length > 1 ? `${v.shortName} (${variant.name})` : v.shortName,
      price: variant.price as number,
      consumptionPer100km: Math.round((battery / range) * 1000) / 10,
    }));
});

const fuelPresets = [
  { id: 'gasohol91', label: 'แก๊สโซฮอล์ 91', pricePerLitre: 33.5 },
  { id: 'gasohol95', label: 'แก๊สโซฮอล์ 95', pricePerLitre: 34.5 },
  { id: 'diesel', label: 'ดีเซล B7', pricePerLitre: 32 },
];

const ownershipYears = [1, 3, 5];

function baht(n: number): string {
  return '฿' + Math.round(n).toLocaleString('en-US');
}

export default function EvSavingsCalculator() {
  const [evId, setEvId] = useState(evOptions[0]?.id ?? '');
  const [elecPrice, setElecPrice] = useState(4.5);

  const [fuelCarPrice, setFuelCarPrice] = useState(650000);
  const [fuelPresetId, setFuelPresetId] = useState('gasohol91');
  const [fuelPrice, setFuelPrice] = useState(fuelPresets[0].pricePerLitre);
  const [fuelConsumption, setFuelConsumption] = useState(12);

  const [kmPerMonth, setKmPerMonth] = useState(1500);
  const [years, setYears] = useState<number>(3);

  const ev = evOptions.find((o) => o.id === evId) ?? evOptions[0];

  const result = useMemo(() => {
    if (!ev) return null;
    const evMonthlyCost = (kmPerMonth / 100) * ev.consumptionPer100km * elecPrice;
    const fuelMonthlyCost = fuelConsumption ? (kmPerMonth / fuelConsumption) * fuelPrice : 0;
    const monthlySavings = fuelMonthlyCost - evMonthlyCost;
    const priceDiff = ev.price - fuelCarPrice;
    const cumulativeSavings = monthlySavings * 12 * years;
    const netAfterYears = cumulativeSavings - priceDiff;
    const breakevenMonths = priceDiff > 0 && monthlySavings > 0 ? priceDiff / monthlySavings : null;
    return { evMonthlyCost, fuelMonthlyCost, monthlySavings, priceDiff, cumulativeSavings, netAfterYears, breakevenMonths };
  }, [ev, elecPrice, fuelCarPrice, fuelConsumption, fuelPrice, kmPerMonth, years]);

  function onFuelPreset(id: string) {
    const preset = fuelPresets.find((p) => p.id === id);
    setFuelPresetId(id);
    if (preset) setFuelPrice(preset.pricePerLitre);
  }

  if (!ev || !result) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'var(--space-8)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p className="kicker">รถไฟฟ้าที่สนใจ</p>
          <label className="field">
            <span>รุ่น WULING EV</span>
            <select className="input" value={ev.id} onChange={(e) => setEvId(e.target.value)}>
              {evOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.label} — {money(o.price)}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>ค่าไฟฟ้า (บาท/หน่วย)</span>
            <input className="input" type="number" step="0.1" min={0} value={elecPrice} onChange={(e) => setElecPrice(Number(e.target.value) || 0)} />
          </label>

          <p className="kicker" style={{ marginTop: 'var(--space-4)' }}>รถน้ำมันที่จะเทียบ</p>
          <label className="field">
            <span>ราคารถน้ำมัน (บาท)</span>
            <input className="input" type="number" min={0} value={fuelCarPrice} onChange={(e) => setFuelCarPrice(Number(e.target.value) || 0)} />
          </label>
          <div className="field">
            <span>ชนิดน้ำมัน</span>
            <div className="seg" style={{ marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
              {fuelPresets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="seg-opt"
                  onClick={() => onFuelPreset(p.id)}
                  style={{
                    cursor: 'pointer',
                    background: fuelPresetId === p.id ? 'var(--color-accent-100)' : 'transparent',
                    color: fuelPresetId === p.id ? 'var(--color-accent-800)' : 'var(--color-text)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <label className="field">
            <span>ราคาน้ำมัน (บาท/ลิตร)</span>
            <input className="input" type="number" step="0.1" min={0} value={fuelPrice} onChange={(e) => setFuelPrice(Number(e.target.value) || 0)} />
          </label>
          <label className="field">
            <span>อัตราสิ้นเปลือง (กม./ลิตร)</span>
            <input className="input" type="number" min={1} value={fuelConsumption} onChange={(e) => setFuelConsumption(Number(e.target.value) || 0)} />
          </label>

          <p className="kicker" style={{ marginTop: 'var(--space-4)' }}>การใช้งาน</p>
          <label className="field">
            <span>ระยะทางเฉลี่ย (กม./เดือน)</span>
            <input className="input" type="number" min={0} value={kmPerMonth} onChange={(e) => setKmPerMonth(Number(e.target.value) || 0)} />
          </label>
          <div className="field">
            <span>ระยะเวลาถือครอง</span>
            <div className="seg" style={{ marginTop: 'var(--space-2)' }}>
              {ownershipYears.map((y) => (
                <button
                  key={y}
                  type="button"
                  className="seg-opt tnum"
                  onClick={() => {
                    track('calculate_savings', { years: y, model: ev.id });
                    setYears(y);
                  }}
                  style={{
                    cursor: 'pointer',
                    background: years === y ? 'var(--color-accent-100)' : 'transparent',
                    color: years === y ? 'var(--color-accent-800)' : 'var(--color-text)',
                  }}
                >
                  {y} ปี
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <p style={{ margin: '0 0 var(--space-4)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>ผลเปรียบเทียบต่อเดือน</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}>
            <span>ค่าไฟ {ev.label} ({ev.consumptionPer100km} kWh/100กม.)</span>
            <b className="tnum" style={{ fontWeight: 600 }}>{baht(result.evMonthlyCost)}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}>
            <span>ค่าน้ำมัน ({fuelConsumption || 0} กม./ลิตร)</span>
            <b className="tnum" style={{ fontWeight: 600 }}>{baht(result.fuelMonthlyCost)}</b>
          </div>

          <p style={{ margin: 'var(--space-6) 0 0', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-2-700)' }}>
            ประหยัดค่าพลังงาน / เดือน
          </p>
          <p className="tnum" style={{ margin: 'var(--space-2) 0 0', fontFamily: 'var(--font-heading)', fontSize: 'clamp(34px,5vw,50px)', lineHeight: 1, color: result.monthlySavings >= 0 ? 'var(--color-accent-700)' : 'var(--color-text)' }}>
            {baht(result.monthlySavings)}
          </p>

          <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}>
            <span>ประหยัดสะสมใน {years} ปี</span>
            <b className="tnum" style={{ fontWeight: 600 }}>{baht(result.cumulativeSavings)}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}>
            <span>ส่วนต่างราคารถ (EV − น้ำมัน)</span>
            <b className="tnum" style={{ fontWeight: 600 }}>{result.priceDiff > 0 ? baht(result.priceDiff) : `−${baht(Math.abs(result.priceDiff))}`}</b>
          </div>

          {result.breakevenMonths ? (
            <p style={{ margin: 'var(--space-3) 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>
              คุ้มทุนส่วนต่างราคารถใน <b className="tnum">{Math.ceil(result.breakevenMonths)}</b> เดือน
              {result.netAfterYears >= 0 ? ` — ที่ ${years} ปี ประหยัดสุทธิ ${baht(result.netAfterYears)}` : ` — ยังไม่ถึงจุดคุ้มทุนภายใน ${years} ปีที่เลือก`}
            </p>
          ) : result.priceDiff <= 0 ? (
            <p style={{ margin: 'var(--space-3) 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>
              ราคา {ev.label} ไม่สูงกว่ารถน้ำมันคันที่เทียบ แถมยังประหยัดค่าพลังงานทุกเดือน
            </p>
          ) : (
            <p style={{ margin: 'var(--space-3) 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>
              ด้วยตัวเลขที่ตั้งไว้ ค่าพลังงานยังไม่ประหยัดพอที่จะคุ้มส่วนต่างราคารถ ลองปรับระยะทาง/เดือนดู
            </p>
          )}

          <p style={{ margin: 'var(--space-4) 0 0', fontSize: 12, color: 'var(--color-neutral-600)' }}>
            ตัวเลขทั้งหมดเป็นการประมาณการเพื่อใช้เปรียบเทียบเท่านั้น อัตราสิ้นเปลืองไฟอ้างอิงสเปกทางการ (มาตรฐาน CLTC) การใช้งานจริงอาจแตกต่างกันไปตามสภาพถนนและรูปแบบการขับขี่ ไม่รวมค่าบำรุงรักษาและค่าประกันภัย
          </p>
        </div>
      </div>

      <section
        style={{
          background: 'var(--wl-ink)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(24px,3.4vw,44px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'clamp(22px,2.8vw,31px)', margin: 0, color: '#fff' }}>
            อยากได้ตัวเลขที่ตรงกับการใช้งานจริง?
          </h2>
          <p style={{ margin: 'var(--space-2) 0 0', fontSize: 15, color: 'rgba(255,255,255,0.78)', maxWidth: '52ch' }}>
            คุยกับฝ่ายขายเพื่อรับใบเสนอราคาและประเมินความคุ้มค่าสำหรับการใช้งานของคุณโดยเฉพาะ หรือติดตามโปรโมชั่นและรีวิวการใช้งานจริงผ่านช่องทางของเรา
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Link href="/contact" className="btn btn-primary" onClick={() => track('click_contact', { source: 'savings_calculator' })}>
            ติดต่อฝ่ายขาย
          </Link>
          <a
            href={dealer.lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-on-dark"
            onClick={() => track('click_social', { platform: 'line', source: 'savings_calculator' })}
          >
            เป็นเพื่อนกับเรา แอดไลน์
          </a>
          <a
            href={dealer.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-on-dark"
            onClick={() => track('click_social', { platform: 'facebook', source: 'savings_calculator' })}
          >
            Facebook
          </a>
          <a
            href={dealer.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-on-dark"
            onClick={() => track('click_social', { platform: 'tiktok', source: 'savings_calculator' })}
          >
            TikTok
          </a>
          <a
            href={dealer.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-on-dark"
            onClick={() => track('click_social', { platform: 'youtube', source: 'savings_calculator' })}
          >
            YouTube
          </a>
          <PhoneLink className="btn" style={{ color: 'var(--wl-lime)' }}>{dealer.phoneDisplay}</PhoneLink>
        </div>
      </section>
    </div>
  );
}
