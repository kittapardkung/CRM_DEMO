import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BadValueError, coerceValue, LEAD_COLS } from "@/lib/normalize";

/**
 * Partial update (was doPost in Code.gs).
 * Body: { changes: { column: "value", ... } } — UI strings; the Postgres function update_lead()
 * diffs against the current row, writes only what changed and appends one activity_log row.
 */
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/leads/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const raw = body?.changes;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return NextResponse.json({ ok: false, error: "missing changes" }, { status: 400 });
  }

  const changes: Record<string, unknown> = {};
  try {
    for (const [col, value] of Object.entries(raw)) {
      if (col === "lead_id" || !LEAD_COLS.has(col)) continue; // unknown / immutable keys are ignored
      changes[col] = coerceValue(col, value);
    }
  } catch (e) {
    if (e instanceof BadValueError) return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    throw e;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const by = String(user.user_metadata?.full_name || user.user_metadata?.name || user.email || "CRM App");

  const { data, error } = await supabase.rpc("update_lead", { p_lead_id: decodeURIComponent(id), p_changes: changes, p_by: by });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  if (!data?.ok) return NextResponse.json(data, { status: 404 });
  return NextResponse.json(data);
}
