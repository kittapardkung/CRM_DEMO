'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { track } from '@/lib/analytics';

const terms = [48, 60, 72, 84];

function baht(n: number): string {
  return '฿' + Math.round(n).toLocaleString('en-US');
}

export default function InstallmentCalculator() {
  const searchParams = useSearchParams();
  const initialPrice = Number(searchParams.get('price')) || 500000;

  const [price, setPrice] = useState(initialPrice);
  const [downPct, setDownPct] = useState(20);
  const [down, setDown] = useState(Math.round(initialPrice * 0.2));
  const [rate, setRate] = useState(2.99);
  const [term, setTerm] = useState(60);

  const result = useMemo(() => {
    const finance = Math.max(0, price - down);
    const years = term / 12;
    const interest = finance * (rate / 100) * years;
    const monthly = term ? (finance + interest) / term : 0;
    return { finance, interest, monthly };
  }, [price, down, rate, term]);

  function onPrice(v: number) {
    setPrice(v);
    setDown(Math.round(v * (downPct / 100)));
  }
  function onDownPct(v: number) {
    setDownPct(v);
    setDown(Math.round(price * (v / 100)));
  }
  function onDown(v: number) {
    setDown(v);
    setDownPct(price ? Math.round((v / price) * 1000) / 10 : 0);
  }

  return (
    <section style={{ paddingBottom: 'var(--space-8)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'var(--space-8)', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <label className="field">
          <span>ราคารถ (บาท)</span>
          <input className="input" type="number" value={price} onChange={(e) => onPrice(Number(e.target.value) || 0)} />
        </label>
        <label className="field">
          <span>เงินดาวน์ (%)</span>
          <input className="input" type="number" value={downPct} onChange={(e) => onDownPct(Number(e.target.value) || 0)} />
        </label>
        <label className="field">
          <span>เงินดาวน์ (บาท)</span>
          <input className="input" type="number" value={down} onChange={(e) => onDown(Number(e.target.value) || 0)} />
        </label>
        <label className="field">
          <span>อัตราดอกเบี้ยต่อปี (%)</span>
          <input className="input" type="number" step="0.01" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} />
        </label>
        <div className="field">
          <span>ระยะเวลาผ่อน (เดือน)</span>
          <div className="seg" style={{ marginTop: 'var(--space-2)' }}>
            {terms.map((t) => (
              <button
                key={t}
                type="button"
                className="seg-opt tnum"
                onClick={() => {
                  track('calculate_installment', { term: t });
                  setTerm(t);
                }}
                style={{ cursor: 'pointer', background: term === t ? 'var(--color-accent-100)' : 'transparent', color: term === t ? 'var(--color-accent-800)' : 'var(--color-text)' }}
              >
                {t} เดือน
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <p style={{ margin: '0 0 var(--space-4)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>ผลการคำนวณ</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}>
          <span>ยอดจัดสินเชื่อ</span>
          <b className="tnum" style={{ fontWeight: 600 }}>{baht(result.finance)}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-divider)' }}>
          <span>ดอกเบี้ยรวม (ประมาณ)</span>
          <b className="tnum" style={{ fontWeight: 600 }}>{baht(result.interest)}</b>
        </div>
        <p style={{ margin: 'var(--space-6) 0 0', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>ค่างวดต่อเดือน (ประมาณ)</p>
        <p className="tnum" style={{ margin: 'var(--space-2) 0 0', fontFamily: 'var(--font-heading)', fontSize: 'clamp(34px,5vw,50px)', lineHeight: 1 }}>{baht(result.monthly)}</p>
        <p style={{ margin: 'var(--space-4) 0 0', fontSize: 13, color: 'var(--color-neutral-600)' }}>
          ตัวเลขทั้งหมดเป็นการประมาณการเพื่อใช้เปรียบเทียบเท่านั้น เงื่อนไข อัตราดอกเบี้ย และค่างวดจริงขึ้นอยู่กับการอนุมัติของสถาบันการเงิน
        </p>
        <Link href="/test-drive" className="btn btn-primary btn-block" style={{ marginTop: 'var(--space-4)' }}>ขอใบเสนอราคา</Link>
      </div>
    </section>
  );
}
