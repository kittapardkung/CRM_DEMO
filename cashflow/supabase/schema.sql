-- Wuling Cash Flow — Supabase schema.
-- Run once in Supabase → SQL Editor. Mirrors the 5 Google Sheets tabs.
-- RLS is enabled with NO policies: anon/authenticated keys can read
-- nothing; only the server (service_role key) can access the data.

create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  code        text not null,
  name        text not null,
  buy_price   numeric(14,2) not null default 0,
  sell_price  numeric(14,2) not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists purchases (
  id             uuid primary key default gen_random_uuid(),
  date           date,
  car            text not null default '',
  product_id     uuid references products(id) on delete set null,
  price_per_unit numeric(14,2) not null default 0,
  quantity       integer not null default 1,
  total_amount   numeric(14,2) not null default 0,
  notes          text not null default '',
  created_at     timestamptz not null default now()
);

create table if not exists transactions (
  id                       uuid primary key default gen_random_uuid(),
  date                     date,
  customer                 text not null default '',
  car                      text not null default '',
  product_id               uuid references products(id) on delete set null,
  type                     text not null default 'installment'
                           check (type in ('installment','cash')),
  price_per_unit           numeric(14,2) not null default 0,
  quantity                 integer not null default 1,
  total_amount             numeric(14,2) not null default 0,
  down_payment             numeric(14,2) not null default 0,
  financing_fee            numeric(14,2) not null default 0,
  commission_fee           numeric(14,2) not null default 0,
  financing_expected_date  date,
  financing_status         text not null default 'n/a'
                           check (financing_status in ('pending','received','n/a')),
  financing_received_date  date,
  cash_amount              numeric(14,2) not null default 0,
  notes                    text not null default '',
  stock_id                 uuid,
  delivery_plan_date       date,
  created_at               timestamptz not null default now()
);

create table if not exists stock (
  id                 uuid primary key default gen_random_uuid(),
  purchase_id        uuid references purchases(id) on delete cascade,
  product_id         uuid references products(id) on delete set null,
  code               text not null default '',
  name               text not null default '',
  car                text not null default '',
  buy_price          numeric(14,2) not null default 0,
  purchase_date      date,
  status             text not null default 'in_stock'
                     check (status in ('in_stock','reserved','delivered')),
  customer           text not null default '',
  tx_id              uuid references transactions(id) on delete set null,
  delivery_plan_date date,
  delivered_date     date,
  notes              text not null default '',
  created_at         timestamptz not null default now()
);

create table if not exists balance (
  id         integer primary key default 1 check (id = 1),
  value      numeric(14,2) not null default 0,
  as_of_date date
);

create index if not exists idx_stock_purchase on stock(purchase_id);
create index if not exists idx_stock_status   on stock(status);
create index if not exists idx_tx_date        on transactions(date);
create index if not exists idx_purchases_date on purchases(date);

alter table products     enable row level security;
alter table purchases    enable row level security;
alter table transactions enable row level security;
alter table stock        enable row level security;
alter table balance      enable row level security;
