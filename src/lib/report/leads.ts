import { CLOSED_STATUSES, SHEET_TABS } from './config';
import { parseSheetDate, toIsoDate } from './dates';
import { readTab, sheetsConfigured } from './sheets';
import { SheetLead } from './types';

function normDate(v: string): string {
  const d = parseSheetDate(v);
  return d ? toIsoDate(d) : '';
}

/** Header-name → column lookup, so reordering sheet columns doesn't break us. */
function indexer(header: string[]) {
  const idx = new Map(header.map((h, i) => [h.trim().toLowerCase(), i]));
  return (row: string[], ...names: string[]) => {
    for (const n of names) {
      const i = idx.get(n.toLowerCase());
      if (i !== undefined && row[i]) return row[i].trim();
    }
    return '';
  };
}

export async function loadLeads(): Promise<SheetLead[]> {
  if (!sheetsConfigured) return DEMO_LEADS;
  const rows = await readTab(SHEET_TABS.leads);
  if (rows.length < 2) return [];
  const get = indexer(rows[0]);
  return rows
    .slice(1)
    .map((r) => ({
      leadId: get(r, 'Lead_ID'),
      createdDate: normDate(get(r, 'Created_Date')),
      customerName: get(r, 'Customer_Name'),
      phone: get(r, 'Phone_Number'),
      source: get(r, 'Source'),
      assignedSales: get(r, 'Assigned_Sales'),
      status: get(r, 'Lead_Status').toUpperCase(),
      temperature: get(r, 'Lead_Temperature', 'Lead_Temper').toUpperCase(),
      lastFollowUp: normDate(get(r, 'Last_Follow_Up')),
      nextFollowUp: normDate(get(r, 'Next_Follow_Up')),
      note: get(r, 'Follow_Up_Note'),
      interestedModel: get(r, 'Interested_Model', 'Interested_Vehicle'),
    }))
    .filter((l) => l.leadId);
}

export const isOpen = (l: SheetLead) => !CLOSED_STATUSES.includes(l.status);

export function salesNames(leads: SheetLead[]): string[] {
  return [...new Set(leads.map((l) => l.assignedSales).filter(Boolean))].sort();
}

const demo = (
  n: number, sales: string, name: string, status: string, temp: string, last: string, model: string,
): SheetLead => ({
  leadId: `DEMO-${n}`, createdDate: '2026-09-15', customerName: name, phone: `08100000${n.toString().padStart(2, '0')}`,
  source: 'Facebook Messenger', assignedSales: sales, status, temperature: temp,
  lastFollowUp: last, nextFollowUp: '', note: 'ข้อมูลตัวอย่าง', interestedModel: model,
});

const DEMO_LEADS: SheetLead[] = [
  demo(1, 'SA0001 - เซลล์ตัวอย่าง A', 'คุณสมชาย', 'TEST_DRIVE', 'WARM', '2026-09-20', 'BINGUO EV'),
  demo(2, 'SA0001 - เซลล์ตัวอย่าง A', 'คุณมาลี', 'NEW', 'COLD', '', 'PORTA'),
  demo(3, 'SA0001 - เซลล์ตัวอย่าง A', 'คุณวิชัย', 'QUOTATION', 'HOT', '2026-10-03', 'DARION'),
  demo(4, 'SA0002 - เซลล์ตัวอย่าง B', 'คุณอรทัย', 'CONTACTED', 'WARM', '2026-09-28', 'EKXION'),
  demo(5, 'SA0002 - เซลล์ตัวอย่าง B', 'คุณธนา', 'NEW', 'COLD', '2026-09-10', 'BINGUO EV'),
  demo(6, 'SA0002 - เซลล์ตัวอย่าง B', 'คุณปรีชา', 'LOST', 'COLD', '2026-08-11', 'PORTA'),
];
