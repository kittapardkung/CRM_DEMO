import Link from 'next/link';
import { isAuthed } from '@/lib/report/auth';
import { STALE_DAYS, STATUSES, STATUS_LABEL, TEMPERATURES, TEMPERATURE_LABEL } from '@/lib/report/config';
import { daysBetween, formatThaiDate, parseSheetDate, todayTh, weekStart } from '@/lib/report/dates';
import { isOpen, loadLeads, salesNames } from '@/lib/report/leads';
import { sheetsConfigured } from '@/lib/report/sheets';
import { login, submitReport } from './actions';

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : '');

  if (!(await isAuthed())) {
    return (
      <form action={login} className="sr-card sr-narrow">
        <h1>รีพอร์ตเซลล์รายสัปดาห์</h1>
        <label>
          รหัสผ่านทีมขาย
          <input name="passcode" type="password" required autoFocus />
        </label>
        {one('error') && <p className="sr-error">รหัสไม่ถูกต้อง</p>}
        <button className="btn btn-primary">เข้าสู่ระบบ</button>
      </form>
    );
  }

  const leads = await loadLeads();
  const today = todayTh();
  const week = weekStart(today);
  const sales = one('sales');
  const names = salesNames(leads.filter(isOpen));

  const banner = !sheetsConfigured && (
    <p className="sr-note">โหมดตัวอย่าง: ยังไม่ได้เชื่อม Google Sheet (ใช้ข้อมูลสมมติ และเก็บรีพอร์ตในไฟล์ในเครื่อง)</p>
  );

  if (!sales || !names.includes(sales)) {
    return (
      <>
        <h1>รีพอร์ตเซลล์รายสัปดาห์</h1>
        {banner}
        <p>เลือกชื่อของคุณเพื่อเช็กลูกค้าประจำสัปดาห์ที่เริ่ม {formatThaiDate(week)}</p>
        <div className="sr-grid">
          {names.map((n) => (
            <Link key={n} className="sr-card sr-pick" href={`/sales-report?sales=${encodeURIComponent(n)}`}>
              {n}
            </Link>
          ))}
        </div>
        <p><Link href="/sales-report/meeting">ดูสรุปสำหรับที่ประชุม →</Link></p>
      </>
    );
  }

  const mine = leads
    .filter((l) => l.assignedSales === sales && isOpen(l))
    .map((l) => {
      const last = parseSheetDate(l.lastFollowUp) ?? parseSheetDate(l.createdDate);
      return { l, idle: last ? daysBetween(last, today) : null };
    })
    // stalest first: that's where data goes missing and prospects hide
    .sort((a, b) => (b.idle ?? 9999) - (a.idle ?? 9999));

  return (
    <>
      <p><Link href="/sales-report">← เปลี่ยนเซลล์</Link></p>
      <h1>{sales}</h1>
      {banner}
      {one('done') && <p className="sr-ok">ส่งรีพอร์ตสัปดาห์นี้เรียบร้อย — ส่งซ้ำได้ ระบบจะใช้ฉบับล่าสุด</p>}
      <p>
        สัปดาห์เริ่ม {formatThaiDate(week)} · ลูกค้าที่ยังเปิดอยู่ {mine.length} ราย · ติ๊ก “ลูกค้ามุ่งหวัง” เมื่อมีโอกาสปิดการขายจริง
        ลูกค้าที่ไม่ได้ติดตามเกิน {STALE_DAYS} วัน (สีแดง) ต้องใส่บันทึกก่อนส่ง
      </p>

      <form action={submitReport}>
        <input type="hidden" name="sales" value={sales} />
        {mine.map(({ l, idle }, i) => {
          const stale = idle === null || idle > STALE_DAYS;
          return (
            <fieldset key={l.leadId} className={`sr-card sr-lead${stale ? ' sr-stale' : ''}`}>
              <input type="hidden" name={`lead_${i}`} value={l.leadId} />
              <legend>
                {l.customerName || 'ไม่ระบุชื่อ'} · {l.phone || 'ไม่มีเบอร์'}
              </legend>
              <p className="sr-meta">
                {l.interestedModel || 'ยังไม่ระบุรุ่น'} · เข้ามา {formatThaiDate(l.createdDate)} ·{' '}
                {idle === null ? 'ยังไม่เคยติดตาม' : `ติดตามล่าสุด ${idle} วันก่อน`}
                {l.note && <> · “{l.note.slice(0, 80)}”</>}
              </p>
              <div className="sr-row">
                <label>
                  สถานะ
                  <select name={`status_${i}`} defaultValue={l.status}>
                    {[...new Set([l.status, ...STATUSES])].map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s] ?? s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  ความสนใจ
                  <select name={`temp_${i}`} defaultValue={l.temperature || 'COLD'}>
                    {TEMPERATURES.map((t) => <option key={t} value={t}>{TEMPERATURE_LABEL[t]}</option>)}
                  </select>
                </label>
                <label>
                  นัดติดตามครั้งถัดไป
                  <input type="date" name={`next_${i}`} defaultValue={l.nextFollowUp} />
                </label>
                <label className="sr-check">
                  <input type="checkbox" name={`prospect_${i}`} defaultChecked={l.temperature === 'HOT'} />
                  ลูกค้ามุ่งหวัง
                </label>
              </div>
              <label>
                บันทึกสัปดาห์นี้{stale && ' (จำเป็น)'}
                <textarea name={`note_${i}`} rows={2} required={stale} placeholder="คุยอะไรกับลูกค้า / ติดอะไรอยู่ / ขั้นต่อไป" />
              </label>
            </fieldset>
          );
        })}

        <div className="sr-card">
          <label>
            ไฮไลต์ / ลูกค้ามุ่งหวังใหม่ที่หาเจอสัปดาห์นี้
            <textarea name="highlights" rows={3} />
          </label>
          <label>
            ต้องการให้ผู้จัดการช่วยอะไร
            <textarea name="helpNeeded" rows={2} />
          </label>
        </div>
        <button className="btn btn-primary">ส่งรีพอร์ตประจำสัปดาห์</button>
      </form>
    </>
  );
}
