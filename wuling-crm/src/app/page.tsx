import CrmApp from "@/components/CrmApp";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <CrmApp userLabel={String(user?.user_metadata?.full_name || user?.email || "")} />;
}
