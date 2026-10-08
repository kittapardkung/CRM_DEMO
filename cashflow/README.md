# Wuling Cash Flow (Next.js + Supabase)

Port of the Google Apps Script app to Vercel + Supabase. Same UI and
features; the Google Sheet is replaced by Postgres tables.

```
public/cashflow.html   the whole UI (served at /)
public/login.html      password page (served at /login)
src/app/api/rpc        authenticated endpoint the UI calls (replaces google.script.run)
src/lib/rpc.ts         every Code.gs function, rewritten against Supabase
supabase/schema.sql    tables (products, purchases, stock, transactions, balance)
scripts/import-csv.mjs one-off import of the existing Sheet data
```

## Setup

1. **Supabase**: create a project → SQL Editor → run `supabase/schema.sql`.
2. Copy `.env.example` to `.env.local` and fill in `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API), `APP_PASSWORD`,
   and `SESSION_SECRET` (`openssl rand -hex 32`).
3. `npm install && npm run dev` → http://localhost:3000
4. *(optional)* import the old data: export each Sheet tab as CSV
   (`Products.csv`, `Purchases.csv`, `Stock.csv`, `Transactions.csv`,
   `Balance.csv`) into a folder and run
   `node --env-file=.env.local scripts/import-csv.mjs ./that-folder`.

## Deploy to Vercel

This app lives in the `cashflow/` folder of the repo, so create a **new**
Vercel project and set **Root Directory = `cashflow`** (the existing
project that deploys the public website is untouched). Add the four
env vars from `.env.example` under Settings → Environment Variables.

## Security notes

* The `service_role` key is used only on the server; tables have RLS on
  with no policies, so the public anon key can read nothing.
* Access is a single shared password (signed, httpOnly cookie, 30 days).
  Good for a small team; for per-user accounts switch to Supabase Auth.
* Optional: put your logo at `public/logo.jpg`.
