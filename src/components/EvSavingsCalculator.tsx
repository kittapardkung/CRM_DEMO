'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { vehicles } from '@/lib/data/vehicles';
import { dealer } from '@/lib/data/dealer';
import { money } from '@/lib/format';
import { track } from '@/lib/analytics';
import PhoneLink from './PhoneLink';
import TcoChart from './TcoChart';

interface EvOption {
  id: string;
  label: string;
  price: number;
  /** Confirmed battery capacity (kWh) — the numerator behind consumptionPer100km, kept so the panel can show the actual calculation, not just its result. */
  battery: number;
  /** Confirmed CLTC range (km) — the denominator behind consumptionPer100km. */
  range: number;
  /** kWh consumed per 100 km, derived from the confirmed battery capacity ÷ CLTC range. Not user-editable — it comes straight from the dealer's spec sheet. */
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
      battery,
      range,
      consumptionPer100km: Math.round((battery / range) * 1000) / 10,
    }));
});

const fuelPresets = [
  { id: 'gasohol91', label: 'แก๊สโซฮอล์ 91', pricePerLitre: 33.5 },
  { id: 'gasohol95', label: 'แก๊สโซฮอล์ 95', pricePerLitre: 34.5 },
  { id: 'diesel', label: 'ดีเซล B7', pricePerLitre: 32 },
];

const ownershipYears = [1, 3, 5];
const loanTermOptions = [36, 48, 60, 72, 84];

const EV_PANEL_BG = 'linear-gradient(180deg, rgba(27,58,107,0.07), rgba(27,58,107,0.02))';
const EV_PANEL_BORDER = 'rgba(27,58,107,0.22)';
const FUEL_PANEL_BG = 'linear-gradient(180deg, rgba(194,65,12,0.08), rgba(194,65,12,0.02))';
const FUEL_PANEL_BORDER = 'rgba(194,65,12,0.25)';

function baht(n: number): string {
  return '฿' + Math.round(n).toLocaleString('en-US');
}

function bahtPerKm(n: number): string {
  return '฿' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '/กม.';
}

export default function EvSavingsCalculator() {
  const [evId, setEvId] = useState(evOptions[0]?.id ?? '');
  const [elecPrice, setElecPrice] = useState(4);
  const [evOtherAnnual, setEvOtherAnnual] = useState(0);
  const [evInsuranceAnnual, setEvInsuranceAnnual] = useState(0);
  const [evTaxAnnual, setEvTaxAnnual] = useState(0);
  const [evMode, setEvMode] = useState<'cash' | 'credit'>('cash');
  const [evDownPct, setEvDownPct] = useState(20);
  const [evInterestRate, setEvInterestRate] = useState(2.99);
  const [evTermMonths, setEvTermMonths] = useState(60);

  const [fuelCarPrice, setFuelCarPrice] = useState(650000);
  const [fuelPresetId, setFuelPresetId] = useState('');
  const [fuelPrice, setFuelPrice] = useState(38);
  const [fuelConsumption, setFuelConsumption] = useState(10);
  const [fuelOtherAnnual, setFuelOtherAnnual] = useState(0);
  const [fuelInsuranceAnnual, setFuelInsuranceAnnual] = useState(0);
  const [fuelTaxAnnual, setFuelTaxAnnual] = useState(0);
  const [fuelMode, setFuelMode] = useState<'cash' | 'credit'>('cash');
  const [fuelDownPct, setFuelDownPct] = useState(20);
  const [fuelInterestRate, setFuelInterestRate] = useState(2.99);
  const [fuelTermMonths, setFuelTermMonths] = useState(60);

  const [kmPerMonth, setKmPerMonth] = useState(3000);
  const [years, setYears] = useState<number>(3);

  const ev = evOptions.find((o) => o.id === evId) ?? evOptions[0];

  const result = useMemo(() => {
    if (!ev) return null;
    const evKwhPerMonth = (kmPerMonth / 100) * ev.consumptionPer100km;
    const litersPerMonth = fuelConsumption ? kmPerMonth / fuelConsumption : 0;
    const evEnergyMonthlyCost = evKwhPerMonth * elecPrice;
    const fuelEnergyMonthlyCost = litersPerMonth * fuelPrice;
    const evCostPerKm = (ev.consumptionPer100km / 100) * elecPrice;
    const fuelCostPerKm = fuelConsumption ? fuelPrice / fuelConsumption : 0;

    const evAnnualExtra = evOtherAnnual + evInsuranceAnnual + evTaxAnnual;
    const fuelAnnualExtra = fuelOtherAnnual + fuelInsuranceAnnual + fuelTaxAnnual;
    const evExtraMonthly = evAnnualExtra / 12;
    const fuelExtraMonthly = fuelAnnualExtra / 12;

    // Flat-rate installment — same formula as the site's own /calculator (InstallmentCalculator).
    const evDown = ev.price * (evDownPct / 100);
    const evFinance = Math.max(0, ev.price - evDown);
    const evInstallment = evTermMonths ? (evFinance + evFinance * (evInterestRate / 100) * (evTermMonths / 12)) / evTermMonths : 0;
    const evUpfront = evMode === 'credit' ? evDown : ev.price;
    const evVehicleMonthly = evMode === 'credit' ? evInstallment : 0;

    const fuelDown = fuelCarPrice * (fuelDownPct / 100);
    const fuelFinance = Math.max(0, fuelCarPrice - fuelDown);
    const fuelInstallment = fuelTermMonths ? (fuelFinance + fuelFinance * (fuelInterestRate / 100) * (fuelTermMonths / 12)) / fuelTermMonths : 0;
    const fuelUpfront = fuelMode === 'credit' ? fuelDown : fuelCarPrice;
    const fuelVehicleMonthly = fuelMode === 'credit' ? fuelInstallment : 0;

    const evMonthlyCost = evEnergyMonthlyCost + evExtraMonthly + evVehicleMonthly;
    const fuelMonthlyCost = fuelEnergyMonthlyCost + fuelExtraMonthly + fuelVehicleMonthly;

    const monthlySavings = fuelMonthlyCost - evMonthlyCost;
    const priceDiff = evUpfront - fuelUpfront;
    const cumulativeSavings = monthlySavings * 12 * years;
    const netAfterYears = cumulativeSavings - priceDiff;
    const breakevenMonths = priceDiff > 0 && monthlySavings > 0 ? priceDiff / monthlySavings : null;
    return {
      evKwhPerMonth, litersPerMonth, evEnergyMonthlyCost, fuelEnergyMonthlyCost, evCostPerKm, fuelCostPerKm,
      evAnnualExtra, fuelAnnualExtra, evDown, evInstallment, evUpfront, fuelDown, fuelInstallment, fuelUpfront,
      evMonthlyCost, fuelMonthlyCost, monthlySavings, priceDiff, cumulativeSavings, netAfterYears, breakevenMonths,
    };
  }, [
    ev, elecPrice, evOtherAnnual, evInsuranceAnnual, evTaxAnnual, evMode, evDownPct, evInterestRate, evTermMonths,
    fuelCarPrice, fuelConsumption, fuelPrice, fuelOtherAnnual, fuelInsuranceAnnual, fuelTaxAnnual,
    fuelMode, fuelDownPct, fuelInterestRate, fuelTermMonths,
    kmPerMonth, years,
  ]);

  function onFuelPreset(id: string) {
    const preset = fuelPresets.find((p) => p.id === id);
    setFuelPresetId(id);
    if (preset) setFuelPrice(preset.pricePerLitre);
  }

  if (!ev || !result) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Shared usage inputs — apply to both sides of the comparison. */}
      <div
        className="card"
        style={{ padding: 'var(--space-4) var(--space-6)', display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'flex-end' }}
      >
        <label className="field" style={{ flex: '1 1 200px' }}>
          <span>ระยะทางเฉลี่ย (กม./เดือน)</span>
          <input className="input" type="number" min={0} value={kmPerMonth} onChange={(e) => setKmPerMonth(Number(e.target.value) || 0)} />
          <span style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>
            เฉลี่ย <span className="tnum">{(kmPerMonth / 30).toLocaleString('en-US', { maximumFractionDigits: 1 })}</span> กม./วัน
          </span>
        </label>
        <div className="field" style={{ flex: '1 1 200px' }}>
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

      {/* Two-column comparison: EV (left, navy tint) vs. fuel car (right, orange tint). */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'var(--space-6)', alignItems: 'start' }}>
        <div style={{ background: EV_PANEL_BG, border: `1px solid ${EV_PANEL_BORDER}`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
          <p className="kicker" style={{ color: '#1b3a6b' }}>รถไฟฟ้าที่สนใจ</p>
          <label className="field">
            <span>รุ่น WULING EV</span>
            <select className="input" value={ev.id} onChange={(e) => setEvId(e.target.value)}>
              {evOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.label} — {money(o.price)}</option>
              ))}
            </select>
          </label>

          <div className="field" style={{ marginTop: 'var(--space-4)' }}>
            <span>วิธีชำระเงิน</span>
            <div className="seg" style={{ marginTop: 'var(--space-2)' }}>
              <button
                type="button"
                className="seg-opt"
                onClick={() => setEvMode('cash')}
                style={{ cursor: 'pointer', background: evMode === 'cash' ? 'var(--color-accent-100)' : 'transparent', color: evMode === 'cash' ? 'var(--color-accent-800)' : 'var(--color-text)' }}
              >
                เงินสด
              </button>
              <button
                type="button"
                className="seg-opt"
                onClick={() => setEvMode('credit')}
                style={{ cursor: 'pointer', background: evMode === 'credit' ? 'var(--color-accent-100)' : 'transparent', color: evMode === 'credit' ? 'var(--color-accent-800)' : 'var(--color-text)' }}
              >
                ผ่อนชำระ (สินเชื่อ)
              </button>
            </div>
          </div>

          {evMode === 'credit' ? (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 'var(--space-3)' }}>
                <label className="field">
                  <span>เงินดาวน์ (%)</span>
                  <input className="input" type="number" min={0} max={100} value={evDownPct} onChange={(e) => setEvDownPct(Number(e.target.value) || 0)} />
                </label>
                <label className="field">
                  <span>ดอกเบี้ย (%/ปี)</span>
                  <input className="input" type="number" step="0.01" min={0} value={evInterestRate} onChange={(e) => setEvInterestRate(Number(e.target.value) || 0)} />
                </label>
              </div>
              <div className="field" style={{ marginTop: 'var(--space-3)' }}>
                <span>ระยะเวลาผ่อน</span>
                <div className="seg" style={{ marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {loanTermOptions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className="seg-opt tnum"
                      onClick={() => setEvTermMonths(t)}
                      style={{ cursor: 'pointer', background: evTermMonths === t ? 'var(--color-accent-100)' : 'transparent', color: evTermMonths === t ? 'var(--color-accent-800)' : 'var(--color-text)' }}
                    >
                      {t} ด.
                    </button>
                  ))}
                </div>
              </div>
              <p style={{ margin: 'var(--space-2) 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>
                เงินดาวน์ <b className="tnum">{baht(result.evDown)}</b> · ค่างวดโดยประมาณ{' '}
                <b className="tnum" style={{ color: '#1b3a6b' }}>{baht(result.evInstallment)}</b>/เดือน
              </p>
            </div>
          ) : null}

          <label className="field" style={{ marginTop: 'var(--space-4)' }}>
            <span>ค่าไฟฟ้า (บาท/หน่วย)</span>
            <input className="input" type="number" step="0.1" min={0} value={elecPrice} onChange={(e) => setElecPrice(Number(e.target.value) || 0)} />
          </label>

          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: `1px dashed ${EV_PANEL_BORDER}` }}>
            <span style={{ display: 'block', fontSize: 13, color: 'var(--color-neutral-700)' }}>อัตราสิ้นเปลือง (คำนวณอัตโนมัติ ไม่สามารถแก้ไขเองได้)</span>
            <b className="tnum" style={{ display: 'block', marginTop: 4, fontSize: 22, fontWeight: 700, color: '#1b3a6b' }}>{ev.consumptionPer100km} kWh/100กม.</b>
            <p style={{ margin: 'var(--space-2) 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>
              วิธีคำนวณ: แบตเตอรี่ {ev.battery} kWh ÷ ระยะทางวิ่งสูงสุด {ev.range} กม. × 100 ={' '}
              <b className="tnum">{ev.consumptionPer100km}</b> kWh/100กม.
            </p>
            <p style={{ margin: 'var(--space-1) 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>
              คิดเป็นค่าไฟ: {(ev.consumptionPer100km / 100).toFixed(3)} kWh/กม. × ฿{elecPrice.toFixed(2)}/หน่วย ={' '}
              <b className="tnum" style={{ color: '#1b3a6b' }}>{bahtPerKm(result.evCostPerKm)}</b>
            </p>
            <p style={{ margin: 'var(--space-1) 0 0', fontSize: 12, color: 'var(--color-neutral-600)' }}>
              ตัวเลขจากสเปกทางการของ {ev.label} (มาตรฐาน CLTC) — การใช้งานจริงอาจสูงกว่านี้ตามสภาพถนนและรูปแบบการขับขี่
            </p>
          </div>

          <p style={{ margin: 'var(--space-3) 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>
            รายการคำนวณค่าไฟ: {kmPerMonth.toLocaleString('en-US')} กม./เดือน ÷ 100 × {ev.consumptionPer100km} kWh ={' '}
            <b className="tnum">{result.evKwhPerMonth.toLocaleString('en-US', { maximumFractionDigits: 1 })}</b> kWh/เดือน
          </p>

          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: `1px dashed ${EV_PANEL_BORDER}` }}>
            <span style={{ display: 'block', fontSize: 13, color: 'var(--color-neutral-700)' }}>ค่าใช้จ่ายอื่นๆ ต่อปี (ระบุเอง)</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <label className="field">
                <span>ค่าใช้จ่ายอื่นๆ (บาท/ปี)</span>
                <input className="input" type="number" min={0} value={evOtherAnnual} onChange={(e) => setEvOtherAnnual(Number(e.target.value) || 0)} />
              </label>
              <label className="field">
                <span>ค่าประกันภัย (บาท/ปี)</span>
                <input className="input" type="number" min={0} value={evInsuranceAnnual} onChange={(e) => setEvInsuranceAnnual(Number(e.target.value) || 0)} />
              </label>
              <label className="field">
                <span>ค่าภาษี (บาท/ปี)</span>
                <input className="input" type="number" min={0} value={evTaxAnnual} onChange={(e) => setEvTaxAnnual(Number(e.target.value) || 0)} />
              </label>
            </div>
            {result.evAnnualExtra > 0 ? (
              <p style={{ margin: 'var(--space-2) 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>
                รวม <b className="tnum">{baht(result.evAnnualExtra)}</b>/ปี ={' '}
                <b className="tnum" style={{ color: '#1b3a6b' }}>{baht(result.evAnnualExtra / 12)}</b>/เดือน
              </p>
            ) : null}
          </div>
        </div>

        <div style={{ background: FUEL_PANEL_BG, border: `1px solid ${FUEL_PANEL_BORDER}`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)' }}>
          <p className="kicker" style={{ color: '#c2410c' }}>รถน้ำมันที่จะเทียบ</p>
          <label className="field">
            <span>ราคารถน้ำมัน (บาท)</span>
            <input className="input" type="number" min={0} value={fuelCarPrice} onChange={(e) => setFuelCarPrice(Number(e.target.value) || 0)} />
          </label>

          <div className="field" style={{ marginTop: 'var(--space-4)' }}>
            <span>วิธีชำระเงิน</span>
            <div className="seg" style={{ marginTop: 'var(--space-2)' }}>
              <button
                type="button"
                className="seg-opt"
                onClick={() => setFuelMode('cash')}
                style={{ cursor: 'pointer', background: fuelMode === 'cash' ? 'rgba(194,65,12,0.14)' : 'transparent', color: fuelMode === 'cash' ? '#9a3412' : 'var(--color-text)' }}
              >
                เงินสด
              </button>
              <button
                type="button"
                className="seg-opt"
                onClick={() => setFuelMode('credit')}
                style={{ cursor: 'pointer', background: fuelMode === 'credit' ? 'rgba(194,65,12,0.14)' : 'transparent', color: fuelMode === 'credit' ? '#9a3412' : 'var(--color-text)' }}
              >
                ผ่อนชำระ (สินเชื่อ)
              </button>
            </div>
          </div>

          {fuelMode === 'credit' ? (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 'var(--space-3)' }}>
                <label className="field">
                  <span>เงินดาวน์ (%)</span>
                  <input className="input" type="number" min={0} max={100} value={fuelDownPct} onChange={(e) => setFuelDownPct(Number(e.target.value) || 0)} />
                </label>
                <label className="field">
                  <span>ดอกเบี้ย (%/ปี)</span>
                  <input className="input" type="number" step="0.01" min={0} value={fuelInterestRate} onChange={(e) => setFuelInterestRate(Number(e.target.value) || 0)} />
                </label>
              </div>
              <div className="field" style={{ marginTop: 'var(--space-3)' }}>
                <span>ระยะเวลาผ่อน</span>
                <div className="seg" style={{ marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {loanTermOptions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className="seg-opt tnum"
                      onClick={() => setFuelTermMonths(t)}
                      style={{ cursor: 'pointer', background: fuelTermMonths === t ? 'rgba(194,65,12,0.14)' : 'transparent', color: fuelTermMonths === t ? '#9a3412' : 'var(--color-text)' }}
                    >
                      {t} ด.
                    </button>
                  ))}
                </div>
              </div>
              <p style={{ margin: 'var(--space-2) 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>
                เงินดาวน์ <b className="tnum">{baht(result.fuelDown)}</b> · ค่างวดโดยประมาณ{' '}
                <b className="tnum" style={{ color: '#c2410c' }}>{baht(result.fuelInstallment)}</b>/เดือน
              </p>
            </div>
          ) : null}

          <div className="field" style={{ marginTop: 'var(--space-4)' }}>
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
                    background: fuelPresetId === p.id ? 'rgba(194,65,12,0.14)' : 'transparent',
                    color: fuelPresetId === p.id ? '#9a3412' : 'var(--color-text)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <label className="field" style={{ marginTop: 'var(--space-4)' }}>
            <span>ราคาน้ำมัน (บาท/ลิตร)</span>
            <input className="input" type="number" step="0.1" min={0} value={fuelPrice} onChange={(e) => setFuelPrice(Number(e.target.value) || 0)} />
          </label>
          <label className="field" style={{ marginTop: 'var(--space-4)' }}>
            <span>อัตราสิ้นเปลือง (กม./ลิตร)</span>
            <input className="input" type="number" min={1} value={fuelConsumption} onChange={(e) => setFuelConsumption(Number(e.target.value) || 0)} />
          </label>
          <p style={{ margin: 'var(--space-3) 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>
            คิดเป็นค่าน้ำมัน: ฿{fuelPrice.toFixed(2)}/ลิตร ÷ {fuelConsumption || 0} กม./ลิตร ={' '}
            <b className="tnum" style={{ color: '#c2410c' }}>{bahtPerKm(result.fuelCostPerKm)}</b>
          </p>
          <p style={{ margin: 'var(--space-2) 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>
            รายการคำนวณ: {kmPerMonth.toLocaleString('en-US')} กม. ÷ {fuelConsumption || 0} กม./ลิตร ={' '}
            <b className="tnum">{result.litersPerMonth.toLocaleString('en-US', { maximumFractionDigits: 1 })}</b> ลิตร/เดือน
          </p>

          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: `1px dashed ${FUEL_PANEL_BORDER}` }}>
            <span style={{ display: 'block', fontSize: 13, color: 'var(--color-neutral-700)' }}>ค่าใช้จ่ายอื่นๆ ต่อปี (ระบุเอง)</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <label className="field">
                <span>ค่าใช้จ่ายอื่นๆ (บาท/ปี)</span>
                <input className="input" type="number" min={0} value={fuelOtherAnnual} onChange={(e) => setFuelOtherAnnual(Number(e.target.value) || 0)} />
              </label>
              <label className="field">
                <span>ค่าประกันภัย (บาท/ปี)</span>
                <input className="input" type="number" min={0} value={fuelInsuranceAnnual} onChange={(e) => setFuelInsuranceAnnual(Number(e.target.value) || 0)} />
              </label>
              <label className="field">
                <span>ค่าภาษี (บาท/ปี)</span>
                <input className="input" type="number" min={0} value={fuelTaxAnnual} onChange={(e) => setFuelTaxAnnual(Number(e.target.value) || 0)} />
              </label>
            </div>
            {result.fuelAnnualExtra > 0 ? (
              <p style={{ margin: 'var(--space-2) 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>
                รวม <b className="tnum">{baht(result.fuelAnnualExtra)}</b>/ปี ={' '}
                <b className="tnum" style={{ color: '#c2410c' }}>{baht(result.fuelAnnualExtra / 12)}</b>/เดือน
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Results — the cumulative-savings figure is the headline; everything else supports it. */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <p style={{ margin: '0 0 var(--space-3)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>
          ผลการเปรียบเทียบ
        </p>

        <div
          style={{
            background: 'var(--wl-ink)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(28px,4vw,48px) clamp(24px,4vw,52px)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-4)',
          }}
        >
          <span style={{ fontSize: 'clamp(20px,2.6vw,28px)', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>ประหยัดสะสมใน {years} ปี</span>
          <span
            className="tnum"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 'clamp(52px,9vw,92px)',
              lineHeight: 1,
              color: result.cumulativeSavings >= 0 ? 'var(--wl-lime)' : '#ff9d7a',
            }}
          >
            {result.cumulativeSavings >= 0 ? '' : '−'}{baht(Math.abs(result.cumulativeSavings))}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-8)' }}>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <span style={{ display: 'block', fontSize: 13, color: 'var(--color-neutral-700)' }}>ค่าใช้จ่ายรวม {ev.label} / เดือน</span>
            <b className="tnum" style={{ display: 'block', marginTop: 4, fontSize: 22, fontWeight: 700, color: '#1b3a6b' }}>{baht(result.evMonthlyCost)}</b>
            {result.evAnnualExtra > 0 || evMode === 'credit' ? (
              <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: 'var(--color-neutral-600)' }}>
                {[
                  `ค่าไฟ ${baht(result.evEnergyMonthlyCost)}`,
                  evMode === 'credit' ? `ค่างวด ${baht(result.evInstallment)}` : null,
                  result.evAnnualExtra > 0 ? `อื่นๆ ${baht(result.evAnnualExtra / 12)}` : null,
                ].filter(Boolean).join(' + ')}
              </span>
            ) : null}
          </div>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <span style={{ display: 'block', fontSize: 13, color: 'var(--color-neutral-700)' }}>ค่าใช้จ่ายรวมรถน้ำมัน / เดือน</span>
            <b className="tnum" style={{ display: 'block', marginTop: 4, fontSize: 22, fontWeight: 700, color: '#c2410c' }}>{baht(result.fuelMonthlyCost)}</b>
            {result.fuelAnnualExtra > 0 || fuelMode === 'credit' ? (
              <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: 'var(--color-neutral-600)' }}>
                {[
                  `ค่าน้ำมัน ${baht(result.fuelEnergyMonthlyCost)}`,
                  fuelMode === 'credit' ? `ค่างวด ${baht(result.fuelInstallment)}` : null,
                  result.fuelAnnualExtra > 0 ? `อื่นๆ ${baht(result.fuelAnnualExtra / 12)}` : null,
                ].filter(Boolean).join(' + ')}
              </span>
            ) : null}
          </div>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <span style={{ display: 'block', fontSize: 13, color: 'var(--color-neutral-700)' }}>ประหยัดค่าใช้จ่าย / เดือน</span>
            <b className="tnum" style={{ display: 'block', marginTop: 4, fontSize: 22, fontWeight: 700 }}>{baht(result.monthlySavings)}</b>
          </div>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <span style={{ display: 'block', fontSize: 13, color: 'var(--color-neutral-700)' }}>
              {evMode === 'credit' || fuelMode === 'credit' ? 'ส่วนต่างเงินจ่ายตอนซื้อ (EV − น้ำมัน)' : 'ส่วนต่างราคารถ (EV − น้ำมัน)'}
            </span>
            <b className="tnum" style={{ display: 'block', marginTop: 4, fontSize: 22, fontWeight: 700 }}>{result.priceDiff > 0 ? baht(result.priceDiff) : `−${baht(Math.abs(result.priceDiff))}`}</b>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-6)' }}>
          <p style={{ margin: '0 0 var(--space-3)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>
            ต้นทุนรวมสะสม (เงินจ่ายตอนซื้อ + ค่าใช้จ่ายรายเดือนทั้งหมด)
          </p>
          <TcoChart
            evLabel={ev.label}
            evPrice={result.evUpfront}
            evMonthlyCost={result.evMonthlyCost}
            fuelLabel="รถน้ำมัน"
            fuelPrice={result.fuelUpfront}
            fuelMonthlyCost={result.fuelMonthlyCost}
            years={years}
            breakevenMonths={result.breakevenMonths}
          />
        </div>

        {/* Breakeven — a supporting callout under the chart, sized well below the ประหยัดสะสม hero above. */}
        <div
          style={{
            marginTop: 'var(--space-8)',
            marginBottom: 'var(--space-4)',
            background: 'var(--wl-ink)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(18px,2.4vw,28px)',
            textAlign: 'center',
          }}
        >
          {result.breakevenMonths ? (
            <>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>จุดคุ้มทุน</p>
              <p className="tnum" style={{ margin: 'var(--space-1) 0 0', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(28px,4.2vw,40px)', lineHeight: 1, color: 'var(--wl-lime)' }}>
                {Math.ceil(result.breakevenMonths)} <span style={{ fontSize: '0.5em' }}>เดือน</span>
              </p>
              <p style={{ margin: 'var(--space-1) 0 0', fontSize: 13, color: 'rgba(255,255,255,0.78)' }}>
                {result.netAfterYears >= 0
                  ? `ที่ ${years} ปี ประหยัดสุทธิ ${baht(result.netAfterYears)}`
                  : `ยังไม่ถึงจุดคุ้มทุนภายใน ${years} ปีที่เลือก`}
              </p>
            </>
          ) : result.priceDiff <= 0 ? (
            <>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>จุดคุ้มทุน</p>
              <p style={{ margin: 'var(--space-1) 0 0', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(22px,3.2vw,30px)', lineHeight: 1.1, color: 'var(--wl-lime)' }}>
                คุ้มทันที
              </p>
              <p style={{ margin: 'var(--space-1) 0 0', fontSize: 13, color: 'rgba(255,255,255,0.78)' }}>
                เงินที่ต้องจ่ายตอนซื้อ {ev.label} ไม่สูงกว่ารถน้ำมันคันที่เทียบ แถมยังประหยัดค่าใช้จ่ายทุกเดือน
              </p>
            </>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>จุดคุ้มทุน</p>
              <p style={{ margin: 'var(--space-1) 0 0', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(18px,2.4vw,22px)', lineHeight: 1.2, color: '#ff9d7a' }}>
                ยังไม่คุ้มทุนด้วยตัวเลขนี้
              </p>
              <p style={{ margin: 'var(--space-1) 0 0', fontSize: 13, color: 'rgba(255,255,255,0.78)' }}>
                ค่าใช้จ่ายยังไม่ประหยัดพอที่จะคุ้มส่วนต่างเงินจ่ายตอนซื้อ ลองปรับระยะทาง/เดือนดู
              </p>
            </>
          )}
        </div>

        <p style={{ margin: 'var(--space-5) 0 0', fontSize: 12, color: 'var(--color-neutral-600)' }}>
          ตัวเลขทั้งหมดเป็นการประมาณการเพื่อใช้เปรียบเทียบเท่านั้น อัตราสิ้นเปลืองไฟอ้างอิงสเปกทางการ (มาตรฐาน CLTC) การใช้งานจริงอาจแตกต่างกันไปตามสภาพถนนและรูปแบบการขับขี่ ค่าใช้จ่ายอื่นๆ/ค่าประกันภัย/ค่าภาษี เป็นตัวเลขที่ผู้ใช้ระบุเอง หากไม่กรอกระบบจะคำนวณเฉพาะค่าพลังงาน ไม่รวมค่าบำรุงรักษา ค่างวดกรณีผ่อนชำระคำนวณแบบอัตราดอกเบี้ยคงที่ (Flat Rate) เช่นเดียวกับหน้าคำนวณค่างวด เพื่อการเปรียบเทียบเท่านั้น เงื่อนไขจริงขึ้นอยู่กับการอนุมัติของสถาบันการเงิน และกราฟยังคงคิดค่างวดต่อเนื่องตลอดช่วงเวลาที่เลือกแม้ผ่อนครบก่อนหน้านั้น
        </p>
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
