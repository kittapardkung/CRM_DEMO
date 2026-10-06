export type Temperature = 'HOT' | 'WARM' | 'COLD';

/** One lead row from the SHEET_1_TEL tab of the LOGGING sheet. */
export interface SheetLead {
  leadId: string;
  createdDate: string; // YYYY-MM-DD
  customerName: string;
  phone: string;
  source: string;
  assignedSales: string; // e.g. "SA0002 - โอ๋"
  status: string;
  temperature: string;
  lastFollowUp: string; // YYYY-MM-DD or ''
  nextFollowUp: string; // YYYY-MM-DD or ''
  note: string;
  interestedModel: string;
}

/** One lead's weekly check-in, as submitted by the salesperson. */
export interface ReportEntry {
  leadId: string;
  customerName: string;
  phone: string;
  status: string;
  temperature: Temperature;
  isProspect: boolean;
  nextFollowUp: string;
  note: string;
  /** Status / temperature as they stood in the sheet when the report was written. */
  prevStatus: string;
  prevTemperature: string;
}

export interface WeeklyReport {
  week: string; // Monday of the report week, YYYY-MM-DD
  sales: string;
  submittedAt: string; // ISO timestamp
  highlights: string;
  helpNeeded: string;
  entries: ReportEntry[];
}
