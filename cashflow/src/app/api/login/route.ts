import { checkPassword, makeSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let password = "";
  try { password = String((await req.json()).password ?? ""); } catch { /* fall through */ }
  let ok = false;
  try { ok = checkPassword(password); } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return Response.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }
  return Response.json({ ok: true }, { headers: { "Set-Cookie": makeSessionCookie() } });
}
