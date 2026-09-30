import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Activity history of one lead, newest first (was apiLog_ in Code.gs). */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/leads/[id]/activity">) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("activity_id, lead_id, activity_at, activity_type, activity_channel, activity_status, activity_notes, last_modified_by, lead_status, lead_temperature")
    .eq("lead_id", decodeURIComponent(id))
    .order("activity_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, rows: data }, { headers: { "Cache-Control": "no-store" } });
}
