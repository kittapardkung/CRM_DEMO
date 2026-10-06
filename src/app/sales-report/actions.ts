'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE, authCookieValue, checkPasscode, isAuthed } from '@/lib/report/auth';
import { STATUSES, TEMPERATURES } from '@/lib/report/config';
import { todayTh, weekStart } from '@/lib/report/dates';
import { loadLeads, isOpen } from '@/lib/report/leads';
import { saveReport } from '@/lib/report/store';
import { ReportEntry, Temperature } from '@/lib/report/types';

export async function login(formData: FormData) {
  if (!checkPasscode(String(formData.get('passcode') ?? ''))) redirect('/sales-report?error=1');
  (await cookies()).set(AUTH_COOKIE, authCookieValue(), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 30, path: '/sales-report',
  });
  redirect('/sales-report');
}

export async function submitReport(formData: FormData) {
  if (!(await isAuthed())) redirect('/sales-report');
  const sales = String(formData.get('sales') ?? '');
  const str = (k: string) => String(formData.get(k) ?? '').trim();

  // Re-read the leads server-side: trust the sheet for who owns what, the form only for the answers.
  const leads = (await loadLeads()).filter((l) => l.assignedSales === sales && isOpen(l));
  if (!sales || leads.length === 0) redirect('/sales-report');

  // Rows are matched by lead id, not position: the page shows the stalest leads first.
  const byId = new Map(leads.map((l) => [l.leadId, l]));
  const entries: ReportEntry[] = [];
  for (let i = 0; formData.has(`lead_${i}`); i++) {
    const l = byId.get(str(`lead_${i}`));
    if (!l) continue;
    const status = str(`status_${i}`);
    const temp = str(`temp_${i}`) as Temperature;
    entries.push({
      leadId: l.leadId, customerName: l.customerName, phone: l.phone,
      status: (STATUSES as readonly string[]).includes(status) ? status : l.status,
      temperature: TEMPERATURES.includes(temp) ? temp : 'COLD',
      isProspect: formData.get(`prospect_${i}`) === 'on',
      nextFollowUp: str(`next_${i}`), note: str(`note_${i}`),
      prevStatus: l.status, prevTemperature: l.temperature,
    });
  }

  const week = weekStart(todayTh());
  await saveReport({
    week, sales, submittedAt: new Date().toISOString(),
    highlights: str('highlights'), helpNeeded: str('helpNeeded'), entries,
  });
  redirect(`/sales-report?sales=${encodeURIComponent(sales)}&done=1`);
}
