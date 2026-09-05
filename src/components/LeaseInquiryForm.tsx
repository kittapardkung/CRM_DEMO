'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  leaseBizOptions,
  leaseFleetSizeOptions,
  leaseMileageOptions,
  leaseModelOptions,
  leasePeriodOptions,
} from '@/lib/data/lease';
import { track } from '@/lib/analytics';

const initial = {
  company: '',
  contact: '',
  phone: '',
  email: '',
  biz: leaseBizOptions[0],
  model: leaseModelOptions[2],
  fleetSize: leaseFleetSizeOptions[1],
  period: leasePeriodOptions[1],
  mileage: leaseMileageOptions[5],
  province: '',
  message: '',
  consent: false,
};

/** Lease inquiry form — company/contact/phone/email/business-type/model/fleet-size/period/mileage/province/message/consent. */
export default function LeaseInquiryForm() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  function set<K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    if (!form.company || !form.contact || !form.phone || !form.consent) {
      setError('กรุณากรอกข้อมูลที่จำเป็น (ชื่อบริษัท ผู้ติดต่อ เบอร์โทร) และยินยอมให้ติดต่อกลับ');
      return;
    }
    setError('');
    track('lease_form_submit', { company: form.company, model: form.model, fleet_size: form.fleetSize });

    const note = [
      `บริษัท: ${form.company}`,
      `ประเภทธุรกิจ: ${form.biz}`,
      `จำนวนรถใน Fleet: ${form.fleetSize}`,
      `ระยะเวลาสัญญาที่สนใจ: ${form.period}`,
      `ระยะทางใช้งานโดยประมาณ: ${form.mileage}`,
      `จังหวัด: ${form.province || '—'}`,
      form.message ? `ข้อความเพิ่มเติม: ${form.message}` : '',
    ].filter(Boolean).join(' / ');

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.contact,
          phoneNumber: form.phone,
          interestedModel: form.model,
          leadSource: 'website / lease',
          pageUrl: '/lease',
          note: `[Operating Lease] อีเมล: ${form.email || '—'} / ${note}`,
        }),
      });
    } catch {
      // Non-blocking — still show the success screen.
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div id="lease-form" style={{ border: '1px solid var(--color-accent)', padding: 'var(--space-6)', maxWidth: 620, scrollMarginTop: 96 }}>
        <p style={{ margin: '0 0 var(--space-2)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>ส่งข้อมูลเรียบร้อย</p>
        <h2 style={{ fontSize: 30, margin: '0 0 var(--space-3)' }}>ขอบคุณครับ คุณ{form.contact}</h2>
        <p style={{ margin: '0 0 var(--space-4)', color: 'var(--color-neutral-800)' }}>
          ทีมงาน WULING CHONBURI จะติดต่อกลับที่ {form.phone} เพื่อจัดทำข้อเสนอ Operating Lease สำหรับ {form.company}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setSent(false)}>ส่งข้อมูลอีกครั้ง</button>
          <Link href="/models" className="btn btn-ghost">ดูรถทุกรุ่น</Link>
        </div>
      </div>
    );
  }

  return (
    <div id="lease-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-6)', maxWidth: 900, scrollMarginTop: 96 }}>
      <label className="field">
        <span>ชื่อบริษัท *</span>
        <input className="input" value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="ชื่อบริษัท" />
      </label>
      <label className="field">
        <span>ชื่อผู้ติดต่อ *</span>
        <input className="input" value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="ชื่อ–นามสกุล" />
      </label>
      <label className="field">
        <span>เบอร์โทรศัพท์ *</span>
        <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="08X-XXX-XXXX" />
      </label>
      <label className="field">
        <span>อีเมล</span>
        <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@company.com" />
      </label>
      <label className="field">
        <span>ประเภทธุรกิจ</span>
        <select className="input" value={form.biz} onChange={(e) => set('biz', e.target.value)}>
          {leaseBizOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>รุ่นที่สนใจ</span>
        <select className="input" value={form.model} onChange={(e) => set('model', e.target.value)}>
          {leaseModelOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>จำนวนรถใน Fleet</span>
        <select className="input" value={form.fleetSize} onChange={(e) => set('fleetSize', e.target.value)}>
          {leaseFleetSizeOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>ระยะเวลาสัญญาที่สนใจ</span>
        <select className="input" value={form.period} onChange={(e) => set('period', e.target.value)}>
          {leasePeriodOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>ระยะทางใช้งานโดยประมาณ</span>
        <select className="input" value={form.mileage} onChange={(e) => set('mileage', e.target.value)}>
          {leaseMileageOptions.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>จังหวัด</span>
        <input className="input" value={form.province} onChange={(e) => set('province', e.target.value)} placeholder="เช่น ชลบุรี" />
      </label>
      <label className="field" style={{ gridColumn: '1 / -1' }}>
        <span>ข้อความเพิ่มเติม</span>
        <input className="input" value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับ Fleet ของคุณ" />
      </label>
      <label style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'var(--color-neutral-800)' }}>
        <input type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} style={{ marginTop: 3 }} />
        <span>ยินยอมให้ WULING CHONBURI ติดต่อกลับเพื่อจัดทำข้อเสนอ Operating Lease *</span>
      </label>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={submit}>ขอใบเสนอราคา Operating Lease</button>
        {error ? <span style={{ fontSize: 14, color: 'var(--color-accent-2-700)' }}>{error}</span> : null}
      </div>
    </div>
  );
}
