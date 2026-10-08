import { isAuthed } from "@/lib/auth";
import { handlers } from "@/lib/rpc";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAuthed(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  let body: { fn?: string; args?: unknown[] };
  try { body = await req.json(); } catch { return Response.json({ error: "bad request" }, { status: 400 }); }
  const fn = body.fn && Object.hasOwn(handlers, body.fn) ? handlers[body.fn] : null;
  if (!fn) return Response.json({ error: `unknown function: ${body.fn}` }, { status: 404 });
  try {
    const result = await fn(...(Array.isArray(body.args) ? body.args : []));
    return Response.json({ result: result ?? null });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
