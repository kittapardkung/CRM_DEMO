import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Server-only client using the service_role key (bypasses RLS). */
export function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set");
  client = createClient(url, key, {
    db: { schema: "cashflow" },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export function dashboardUrl(): string {
  const host = new URL(process.env.SUPABASE_URL || "https://x.supabase.co").hostname;
  const ref = host.split(".")[0];
  return `https://supabase.com/dashboard/project/${ref}/editor`;
}
