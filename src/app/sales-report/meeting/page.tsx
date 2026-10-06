import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/report/auth';
import { STATUS_LABEL, TEMPERATURE_LABEL } from '@/lib/report/config';
import { addWeeks, formatThaiDate, parseSheetDate, todayTh, weekStart } from '@/lib/report/dates';
import { isOpen, loadLeads, salesNames } from '@/lib/report/leads';
import { loadReports } from '@/lib/report/store';

export default async function MeetingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (!(await isAuthed())) redirect('/sales-report');
  const sp = await searchParams;
  const q = typeof sp.week === 'string' ? parseSheetDate(sp.week) : null;
  const week = weekStart(q ?? todayTh());

  const [leads, reports] = await Promise.all([loadLeads(), loadReports(week)]);
  const team = salesNames(leads.filter(isOpen));
  const submitted = new Set(reports.map((r) => r.sales));
  const missing = team.filter((n) => !submitted.has(n));

  const prospects = reports.flatMap((r) => r.entries.filter((e) => e.isProspect).map((e) => ({ ...e, sales: r.sales })));
  const changed = reports.flatMap((r) =>
    r.entries
      .filter((e) => e.status !== e.prevStatus || (e.prevTemperature && e.temperature !== e.prevTemperature))
      .map((e) => ({ ...e, sales: r.sales })),
  );

  return (
    <>
      <p><Link href="/sales-report">← หน้ารีพอร์ตเซลล์</Link></p>
      <h1>สรุปประชุมประจำสัปดาห์ · เริ่ม {formatThaiDate(week)}</h1>
      <p className="sr-nav">
        <Link href={`/sales-report/meeting?week=${addWeeks(week, -1)}`}>← สัปดาห์ก่อน</Link>
        <Link href={`/sales-report/meeting?week=${addWeeks(week, 1)}`}>สัปดาห์ถัดไป →</Link>
      </p>

      <section className="sr-card">
        <h2>สถานะการส่งรีพอร์ต ({submitted.size}/{team.length})</h2>
        {missing.length === 0 ? (
          <p className="sr-ok">ส่งครบทุกคน</p>
        ) : (
          <p className="sr-error">ยังไม่ส่ง: {missing.join(', ')}</p>
        )}
      </section>

      <section className="sr-card">
        <h2>ลูกค้ามุ่งหวัง ({prospects.length})</h2>
        {prospects.length === 0 ? <p>ยังไม่มีลูกค้ามุ่งหวังที่เซลล์ติ๊กไว้</p> : (
          <table className="sr-table">
            <thead><tr><th>ลูกค้า</th><th>เซลล์</th><th>สถานะ</th><th>ความสนใจ</th><th>นัดครั้งถัดไป</th><th>บันทึก</th></tr></thead>
            <tbody>
              {prospects.map((p) => (
                <tr key={p.sales + p.leadId}>
                  <td>{p.customerName || '-'}<br /><small>{p.phone}</small></td>
                  <td>{p.sales}</td>
                  <td>{STATUS_LABEL[p.status] ?? p.status}</td>
                  <td>{TEMPERATURE_LABEL[p.temperature]}</td>
                  <td>{p.nextFollowUp ? formatThaiDate(p.nextFollowUp) : <span className="sr-error">ยังไม่นัด</span>}</td>
                  <td>{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="sr-card">
        <h2>สถานะที่เปลี่ยนในสัปดาห์นี้ ({changed.length})</h2>
        {changed.length === 0 ? <p>ไม่มีการเปลี่ยนแปลง</p> : (
          <ul>
            {changed.map((c) => (
              <li key={c.sales + c.leadId}>
                {c.customerName || c.phone} ({c.sales}): {STATUS_LABEL[c.prevStatus] ?? c.prevStatus} → {STATUS_LABEL[c.status] ?? c.status}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="sr-card">
        <h2>ไฮไลต์และเรื่องที่ต้องการให้ช่วย</h2>
        {reports.map((r) => (
          <div key={r.sales} className="sr-person">
            <h3>{r.sales}</h3>
            <p><b>ไฮไลต์:</b> {r.highlights || '-'}</p>
            <p><b>ต้องการความช่วยเหลือ:</b> {r.helpNeeded || '-'}</p>
          </div>
        ))}
      </section>
    </>
  );
}
