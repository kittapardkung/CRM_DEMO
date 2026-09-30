-- Wuling Sales CRM — initial schema
-- Replaces the Google Sheet tabs SHEET_1_TEL (leads) and ACTIVITY_LOG (activity_log).
-- DAY_LOG is not a table: daily new-lead counts are computed from leads.created_date.

create table public.leads (
  lead_id                   text primary key,          -- keeps the sheet format yyyyMMdd-NNNNNN
  created_date              date,
  created_time             text,
  customer_name             text,
  phone_number              text,
  facebook_user_id          text,
  customer_district         text,
  customer_province         text,
  occupation                text,
  source                    text,
  customer_message          text,

  interested_brand          text,
  interested_model          text,
  variant                   text,
  preferred_variant         text,
  preferred_color           text,

  purchase_type             text,
  budget                    text,
  vehicle_price             text,
  down_payment              text,
  loan_term                 text,
  interest_rate             text,
  monthly_payment           text,

  financing_required        text,
  financing_status          text,
  finance_amount            text,
  financing_bank            text,
  finance_note              text,

  has_trade_in              boolean,                    -- sheet: text starting with "มี" = true
  trade_in                  text,
  trade_in_brand            text,
  trade_in_model            text,
  trade_in_year             text,
  trade_in_expected_price   text,
  trade_in_appraised_price  text,
  trade_in_status           text,
  trade_in_value            text,

  promotion_name            text,
  discount_amount           text,
  free_items                text,
  closing_condition         text,

  lead_score                text,
  accepted_date             date,
  accepted_time             text,
  accepted_by               text,
  response_minutes          text,
  appointment_date          date,
  last_follow_up            date,
  telegram_status           text,

  lead_status               text not null default 'NEW'
    check (lead_status in ('NEW','CONTACTED','FOLLOW_UP','APPOINTMENT','PROSPECT',
                           'QUOTATION','BOOKING','FINANCE_APPROVED','WON','LOST')),
  lead_temperature          text check (lead_temperature in ('HOT','WARM','COLD')),
  assigned_sales            text,                       -- "SA0002 - โอ๋"; null = unassigned
  next_follow_up            date,
  sales_reply               text,
  follow_up_note            text,
  test_drive_done           boolean not null default false,
  call_attempts             integer not null default 0,

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  updated_by                text
);

create index leads_created_date_idx   on public.leads (created_date desc);
create index leads_assigned_sales_idx on public.leads (assigned_sales);
create index leads_lead_status_idx    on public.leads (lead_status);

create table public.activity_log (
  activity_id       text primary key default gen_random_uuid()::text,
  lead_id           text not null references public.leads (lead_id) on delete cascade,
  activity_at       timestamptz not null default now(),
  activity_type     text not null default 'UPDATE',
  activity_channel  text not null default 'CRM App',
  activity_status   text,                               -- comma-joined changed field names
  activity_notes    text,                               -- field: "old" → "new" | ...
  last_modified_by  text,
  lead_status       text,                               -- lead state after the change
  lead_temperature  text,
  before            jsonb,
  after             jsonb
);

create index activity_log_lead_idx on public.activity_log (lead_id, activity_at desc);

alter table public.leads        enable row level security;
alter table public.activity_log enable row level security;

-- Signed-in team members can read. All writes go through update_lead() below
-- (or the service-role sync endpoint), so there are deliberately no write policies.
create policy leads_read        on public.leads        for select to authenticated using (true);
create policy activity_log_read on public.activity_log for select to authenticated using (true);

-- Columns the CRM UI may change through update_lead().
create or replace function public.lead_editable_columns() returns text[]
language sql immutable as $$
  select array[
    'lead_status','lead_temperature','assigned_sales','next_follow_up','sales_reply','follow_up_note',
    'test_drive_done','call_attempts','last_follow_up',
    'customer_name','phone_number','customer_district','customer_province','occupation','source','customer_message',
    'interested_brand','interested_model','variant','preferred_variant','preferred_color','purchase_type',
    'budget','vehicle_price','down_payment','loan_term','interest_rate','monthly_payment',
    'financing_required','financing_status','financing_bank','finance_amount','finance_note',
    'has_trade_in','trade_in_brand','trade_in_model','trade_in_year','trade_in_expected_price',
    'trade_in_appraised_price','trade_in_value','trade_in_status','trade_in',
    'promotion_name','discount_amount','free_items','closing_condition',
    'appointment_date','lead_score','accepted_by','accepted_time','response_minutes','telegram_status'
  ]
$$;

-- Partial update + audit trail in one transaction (replaces doPost/LockService in Code.gs).
--   p_changes : {"lead_status":"WON", ...}   values already typed (null / boolean / 'YYYY-MM-DD' / text)
-- Only columns whose value actually changes are written; a no-op call writes nothing.
create or replace function public.update_lead(p_lead_id text, p_changes jsonb, p_by text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cur        public.leads;
  typed      public.leads;
  k          text;
  old_v      jsonb;
  new_v      jsonb;
  written    text[] := '{}';
  skipped    text[] := '{}';
  before_j   jsonb  := '{}';
  after_j    jsonb  := '{}';
  summary    text[] := '{}';
  who        text   := coalesce(nullif(trim(p_by), ''), 'CRM App');
  act_id     text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select * into cur from public.leads where lead_id = p_lead_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'ไม่พบ Lead_ID ' || p_lead_id);
  end if;

  typed := jsonb_populate_record(cur, p_changes);   -- casts each value to the column type

  for k in select jsonb_object_keys(p_changes) loop
    if not (k = any (public.lead_editable_columns())) then
      skipped := skipped || k;
      continue;
    end if;
    old_v := to_jsonb(cur)   -> k;
    new_v := to_jsonb(typed) -> k;
    if old_v is not distinct from new_v then
      continue;                                      -- unchanged = not written
    end if;
    execute format('update public.leads set %I = ($1).%I where lead_id = $2', k, k)
      using typed, p_lead_id;
    written  := written || k;
    before_j := before_j || jsonb_build_object(k, old_v);
    after_j  := after_j  || jsonb_build_object(k, new_v);
    summary  := summary  || format('%s: "%s" → "%s"', k,
                  coalesce(nullif(old_v #>> '{}', ''), '(ว่าง)'),
                  coalesce(nullif(new_v #>> '{}', ''), '(ว่าง)'));
  end loop;

  if cardinality(written) = 0 then
    return jsonb_build_object('ok', true, 'written', '[]'::jsonb, 'skipped', to_jsonb(skipped),
                              'note', 'ไม่มีค่าที่เปลี่ยน');
  end if;

  update public.leads set updated_at = now(), updated_by = who where lead_id = p_lead_id
    returning * into cur;

  act_id := p_lead_id || '_' || to_char(now() at time zone 'Asia/Bangkok', 'YYYYMMDDHH24MISS')
            || '_' || lpad(((select count(*) from public.activity_log where lead_id = p_lead_id) + 1)::text, 3, '0');

  insert into public.activity_log
    (activity_id, lead_id, activity_status, activity_notes, last_modified_by,
     lead_status, lead_temperature, before, after)
  values
    (act_id, p_lead_id, array_to_string(written, ', '), array_to_string(summary, ' | '), who,
     cur.lead_status, cur.lead_temperature, before_j, after_j);

  return jsonb_build_object('ok', true, 'written', to_jsonb(written), 'skipped', to_jsonb(skipped),
                            'activityId', act_id, 'lead', to_jsonb(cur));
end;
$$;

revoke all on function public.update_lead(text, jsonb, text) from public, anon;
grant execute on function public.update_lead(text, jsonb, text) to authenticated;
