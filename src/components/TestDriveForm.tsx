'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { vehicles } from '@/lib/data/vehicles';
import { money } from '@/lib/format';
import { track } from '@/lib/analytics';

const timeOptions = ['ช่วงเช้า 09:00–12:00', 'ช่วงบ่าย 13:00–16:00', 'ช่วงเย็น 16:00–18:00'];

export default function TestDriveForm() {
  const searchParams = useSearchParams();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [model, setModel] = useState(searchParams.get('model') || vehicles[0].name);
  const [date, setDate] = useState('');
  const [time, setTime] = useState(timeOptions[0]);
  const [province, setProvince] = useState('ชลบุรี');
  const [note, setNote] = useState(searchParams.get('note') || '');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const accessories = searchParams.get('accessories') || '';
  const accessoriesTotal = Number(searchParams.get('accessoriesTotal')) || 0;

  async function submit() {
    if (!name || !phone) {
      setError('กรุณากรอกชื่อและเบอร์โทรศัพท์');
      return;
    }
    setError('');
    track('submit_test_drive', { model });

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          phoneNumber: phone,
          interestedModel: model,
          selectedAccessories: accessories ? accessories.split(', ') : undefined,
          accessoriesTotal: accessories ? accessoriesTotal : undefined,
          leadSource: 'website / test-drive',
          pageUrl: '/test-drive',
          note,
        }),
      });
    } catch {
      // Non-blocking: still show the success screen — no CRM connected yet (§ lead_dest).
    }

    setSent(true);
  }

  if (sent) {
    const payload: [string, string][] = [
      ['Interested_Model', model],
      ['Customer_Name', name || '—'],
      ['Phone_Number', phone || '—'],
      ['Preferred_Date', (date || '—') + ' · ' + time],
      ['Province', province || '—'],
      ['Selected_Accessories', accessories || '—'],
      ['Accessories_Total', accessories ? money(accessoriesTotal) : '—'],
      ['Lead_Source', 'website / test-drive'],
      ['Page_URL', '/test-drive'],
    ];

    return (
      <section style={{ paddingBottom: 'var(--space-8)', maxWidth: 620 }}>
        <div style={{ border: '1px solid var(--color-accent)', padding: 'var(--space-6)' }}>
          <p style={{ margin: '0 0 var(--space-2)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>ส่งข้อมูลเรียบร้อย</p>
          <h2 style={{ fontSize: 34, margin: '0 0 var(--space-3)' }}>ขอบคุณครับ {name}</h2>
          <p style={{ margin: '0 0 var(--space-4)', color: 'var(--color-neutral-800)' }}>
            ทีมงาน WULING CHONBURI จะติดต่อกลับที่ {phone} เพื่อยืนยันการทดลองขับ {model}
          </p>
          <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 'var(--space-4)', fontSize: 14, color: 'var(--color-neutral-700)' }}>
            <p style={{ margin: '0 0 var(--space-2)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase' }}>ข้อมูลที่ส่ง (Lead Payload)</p>
            {payload.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', padding: '3px 0' }}>
                <span>{k}</span>
                <span className="tnum">{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-6)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setSent(false)}>ส่งข้อมูลอีกครั้ง</button>
            <Link href="/models" className="btn btn-ghost">ดูรถรุ่นอื่น</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      style={{ paddingBottom: 'var(--space-8)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-6)', maxWidth: 900 }}
    >
      <label className="field">
        <span>ชื่อ–นามสกุล *</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อผู้ติดต่อ" />
      </label>
      <label className="field">
        <span>เบอร์โทรศัพท์ *</span>
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08X-XXX-XXXX" />
      </label>
      <label className="field">
        <span>รุ่นที่สนใจ</span>
        <select className="input" value={model} onChange={(e) => setModel(e.target.value)}>
          {vehicles.map((v) => (
            <option key={v.slug} value={v.name}>{v.name}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>วันที่สะดวก</span>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label className="field">
        <span>ช่วงเวลา</span>
        <select className="input" value={time} onChange={(e) => setTime(e.target.value)}>
          {timeOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>จังหวัด</span>
        <input className="input" value={province} onChange={(e) => setProvince(e.target.value)} />
      </label>
      <label className="field" style={{ gridColumn: '1 / -1' }}>
        <span>หมายเหตุ</span>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น สนใจสเปก PORTA ที่จัดไว้" />
      </label>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={submit}>ลงทะเบียนทดลองขับ</button>
        {error ? <span style={{ fontSize: 14, color: 'var(--color-accent-2-700)' }}>{error}</span> : null}
      </div>
    </section>
  );
}
