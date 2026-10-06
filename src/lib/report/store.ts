import { SHEET_TABS } from './config';
import { appendRows, readTab } from './sheets';
import { ReportEntry, Temperature, WeeklyReport } from './types';

const REPORT_HEADER = [
  'Week', 'Sales', 'Submitted_At', 'Lead_ID', 'Customer_Name', 'Phone', 'Status', 'Temperature',
  'Is_Prospect', 'Next_Follow_Up', 'Note', 'Prev_Status', 'Prev_Temperature',
];
const NOTES_HEADER = ['Week', 'Sales', 'Submitted_At', 'Highlights', 'Help_Needed'];

export async function saveReport(r: WeeklyReport) {
  await appendRows(
    SHEET_TABS.reports,
    REPORT_HEADER,
    r.entries.map((e) => [
      r.week, r.sales, r.submittedAt, e.leadId, e.customerName, e.phone, e.status, e.temperature,
      e.isProspect ? 'Y' : 'N', e.nextFollowUp, e.note, e.prevStatus, e.prevTemperature,
    ]),
  );
  await appendRows(SHEET_TABS.notes, NOTES_HEADER, [
    [r.week, r.sales, r.submittedAt, r.highlights, r.helpNeeded],
  ]);
}

/** Reports for one week. A resubmission replaces the earlier one (latest Submitted_At wins). */
export async function loadReports(week: string): Promise<WeeklyReport[]> {
  const [reportRows, noteRows] = await Promise.all([readTab(SHEET_TABS.reports), readTab(SHEET_TABS.notes)]);
  const latest = new Map<string, string>(); // sales -> latest submittedAt
  for (const r of reportRows.slice(1)) if (r[0] === week && (latest.get(r[1]) ?? '') < r[2]) latest.set(r[1], r[2]);
  for (const r of noteRows.slice(1)) if (r[0] === week && (latest.get(r[1]) ?? '') < r[2]) latest.set(r[1], r[2]);

  const reports = new Map<string, WeeklyReport>();
  for (const [sales, submittedAt] of latest) {
    reports.set(sales, { week, sales, submittedAt, highlights: '', helpNeeded: '', entries: [] });
  }
  for (const r of reportRows.slice(1)) {
    const rep = reports.get(r[1]);
    if (r[0] !== week || !rep || r[2] !== rep.submittedAt) continue;
    const entry: ReportEntry = {
      leadId: r[3] ?? '', customerName: r[4] ?? '', phone: r[5] ?? '', status: r[6] ?? '',
      temperature: (r[7] || 'COLD') as Temperature, isProspect: r[8] === 'Y', nextFollowUp: r[9] ?? '',
      note: r[10] ?? '', prevStatus: r[11] ?? '', prevTemperature: r[12] ?? '',
    };
    rep.entries.push(entry);
  }
  for (const r of noteRows.slice(1)) {
    const rep = reports.get(r[1]);
    if (r[0] === week && rep && r[2] === rep.submittedAt) {
      rep.highlights = r[3] ?? '';
      rep.helpNeeded = r[4] ?? '';
    }
  }
  return [...reports.values()];
}
