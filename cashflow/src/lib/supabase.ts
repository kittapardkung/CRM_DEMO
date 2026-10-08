import { createClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = ReturnType<typeof createClient<any, "cashflow">>;
let client: Client | null = null;

/** Server-only client using the service_role key (bypasses RLS). */
export function db(): Client {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set");
  client = createClient<any, "cashflow">(url, key, {
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
