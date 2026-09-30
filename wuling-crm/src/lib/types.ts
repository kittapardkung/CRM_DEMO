export type StageId =
  | "NEW" | "CONTACTED" | "FOLLOW_UP" | "APPOINTMENT" | "PROSPECT"
  | "QUOTATION" | "BOOKING" | "FINANCE_APPROVED" | "WON" | "LOST";

export type TempId = "HOT" | "WARM" | "COLD";

/** One row of public.leads (see supabase/migrations/0001_init.sql). Dates are 'YYYY-MM-DD'. */
export interface Lead {
  lead_id: string;
  created_date: string | null;
  created_time: string | null;
  customer_name: string | null;
  phone_number: string | null;
  facebook_user_id: string | null;
  customer_district: string | null;
  customer_province: string | null;
  occupation: string | null;
  source: string | null;
  customer_message: string | null;
  interested_brand: string | null;
  interested_model: string | null;
  variant: string | null;
  preferred_variant: string | null;
  preferred_color: string | null;
  purchase_type: string | null;
  budget: string | null;
  vehicle_price: string | null;
  down_payment: string | null;
  loan_term: string | null;
  interest_rate: string | null;
  monthly_payment: string | null;
  financing_required: string | null;
  financing_status: string | null;
  finance_amount: string | null;
  financing_bank: string | null;
  finance_note: string | null;
  has_trade_in: boolean | null;
  trade_in: string | null;
  trade_in_brand: string | null;
  trade_in_model: string | null;
  trade_in_year: string | null;
  trade_in_expected_price: string | null;
  trade_in_appraised_price: string | null;
  trade_in_status: string | null;
  trade_in_value: string | null;
  promotion_name: string | null;
  discount_amount: string | null;
  free_items: string | null;
  closing_condition: string | null;
  lead_score: string | null;
  accepted_date: string | null;
  accepted_time: string | null;
  accepted_by: string | null;
  response_minutes: string | null;
  appointment_date: string | null;
  last_follow_up: string | null;
  telegram_status: string | null;
  lead_status: StageId;
  lead_temperature: TempId | null;
  assigned_sales: string | null;
  next_follow_up: string | null;
  sales_reply: string | null;
  follow_up_note: string | null;
  test_drive_done: boolean;
  call_attempts: number;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface ActivityRow {
  activity_id: string;
  lead_id: string;
  activity_at: string;
  activity_type: string;
  activity_channel: string;
  activity_status: string | null;
  activity_notes: string | null;
  last_modified_by: string | null;
  lead_status: StageId | null;
  lead_temperature: TempId | null;
}

/** Values sent to PATCH /api/leads/:id — column name -> UI string. */
export type LeadChanges = Record<string, string>;
