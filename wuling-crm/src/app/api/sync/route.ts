import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { normalizeSheetActivity, normalizeSheetLead } from "@/lib/normalize";

const CHUNK = 500;

function authorized(request: NextRequest) {
  const expected = process.env.SYNC_SECRET;
  const got = request.headers.get("x-sync-secret") ?? "";
  if (!expected || !got) return false;
  const a = Buffer.from(got), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Google Sheet -> Supabase feed, called by apps-script/SupabaseSync.gs.
 * Body: { table: "leads" | "activity_log", rows: [ {sheet header: value, ...} ] }
 * Insert-only: rows whose id already exists are left alone, so edits made in the CRM are never
 * overwritten by a later sheet sync. (New leads arriving in the sheet flow in; nothing else changes.)
 */
export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const rows: Record<string, unknown>[] | undefined = body?.rows;
  if (!Array.isArray(rows) || (body.table !== "leads" && body.table !== "activity_log")) {
    return NextResponse.json({ ok: false, error: "expected { table: 'leads'|'activity_log', rows: [] }" }, { status: 400 });
  }

  const db = createServiceClient();
  const ignored = new Set<string>();
  let received = 0, skippedNoId = 0;

  if (body.table === "leads") {
    const list = [];
    for (const raw of rows) {
      const { row, ignored: ig } = normalizeSheetLead(raw);
      ig.forEach((h) => ignored.add(h));
      if (!row.lead_id) { skippedNoId++; continue; }
      list.push(row);
    }
    received = list.length;
    for (let i = 0; i < list.length; i += CHUNK) {
      const { error } = await db.from("leads").upsert(list.slice(i, i + CHUNK), { onConflict: "lead_id", ignoreDuplicates: true });
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
  } else {
    const list = rows.map(normalizeSheetActivity).filter((r) => {
      if (r.activity_id && r.lead_id) return true;
      skippedNoId++;
      return false;
    });
    received = list.length;
    // activity_log.lead_id is a foreign key: keep only history whose lead exists.
    const ids = [...new Set(list.map((r) => r.lead_id))];
    const known = new Set<string>();
    for (let i = 0; i < ids.length; i += CHUNK) {
      const { data, error } = await db.from("leads").select("lead_id").in("lead_id", ids.slice(i, i + CHUNK));
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      data.forEach((r) => known.add(r.lead_id));
    }
    const valid = list.filter((r) => known.has(r.lead_id));
    for (let i = 0; i < valid.length; i += CHUNK) {
      const { error } = await db.from("activity_log").upsert(valid.slice(i, i + CHUNK), { onConflict: "activity_id", ignoreDuplicates: true });
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    skippedNoId += list.length - valid.length;
  }

  return NextResponse.json({ ok: true, table: body.table, received, skipped: skippedNoId, ignoredColumns: [...ignored] });
}
