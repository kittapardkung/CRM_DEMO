import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAGE = 1000; // PostgREST returns at most 1000 rows per request

/** All leads (was apiRead_ in Code.gs). */
export async function GET() {
  const supabase = await createClient();
  const rows: unknown[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("lead_id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return NextResponse.json({ ok: true, rows, at: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
