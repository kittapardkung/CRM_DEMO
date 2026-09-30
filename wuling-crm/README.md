# Wuling Sales CRM

Next.js 16 (App Router) on Vercel · Supabase (Postgres + Auth) · source on GitHub.
Rebuild of the Google Apps Script CRM; UI follows `crm-design-reference.html`.

## What is in here

| | |
|---|---|
| `supabase/migrations/0001_init.sql` | `leads`, `activity_log`, RLS, and `update_lead()` — the partial-update + audit function (replaces `doPost`/`LockService`) |
| `src/app/api/leads` | `GET` all leads · `PATCH /:id` partial update · `GET /:id/activity` history |
| `src/app/api/sync` | Sheet → Supabase feed (insert-only), secret-protected |
| `src/proxy.ts` | Session refresh + redirect to `/login` |
| `src/components` | Board, Dashboard, Lead modal, Call-log modal (all 4 screens from the design) |
| `apps-script/SupabaseSync.gs` | Add to the existing Apps Script project to push sheet rows into Supabase |

Write rule preserved: the browser never writes tables directly. `PATCH` → `update_lead()` diffs against the current
row, writes only changed columns, skips no-ops, and appends one `activity_log` row (with `before`/`after` jsonb) in a
single transaction. The daily-new-leads chart is computed from `leads.created_date` (no `day_log` table).

## Setup

1. **Supabase** — create a project. In *SQL Editor* run `supabase/migrations/0001_init.sql`.
   *Authentication → Providers → Email*: turn **off** "Allow new users to sign up", then add each team member under
   *Authentication → Users* (auto-confirm). Set `full_name` in user metadata to record a name instead of the email in history.
2. **Vercel** — import the GitHub repo (Root Directory = this folder if it lives inside a larger repo) and add the env
   vars from `.env.example`. Pushing to the production branch deploys.
3. **Import the sheet** — in the Apps Script project add `apps-script/SupabaseSync.gs`, set the two Script properties,
   run `backfillAll()` once, then `installTrigger()` so new sheet rows keep flowing in every 5 minutes.
   The sync never overwrites a lead that already exists in Supabase, so CRM edits are safe while both run.
   Run `removeTrigger()` at cut-over.

## Local dev

```bash
cp .env.example .env.local   # fill in
npm install
npm run dev
npm test                      # date / sheet-value normalisation
```

## Decisions made (change freely)

- Auth: Supabase email + password, invite-only. Any signed-in user can read/edit every lead (small team).
- `lead_id` stays text in the sheet format `yyyyMMdd-NNNNNN`.
- Audit columns collapsed to `updated_at` / `updated_by`.
- Pins (★) stay in the browser's localStorage, as in the design.
- Numeric-looking sheet fields (budget, price, …) are stored as text because the sheet holds free text like "599,000".
