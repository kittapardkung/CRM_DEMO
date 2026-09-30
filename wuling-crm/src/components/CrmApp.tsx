"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PALETTE } from "@/lib/constants";
import { initialOf, inScope, salesList } from "@/lib/metrics";
import { createClient } from "@/lib/supabase/browser";
import { usePins } from "@/lib/usePins";
import type { Lead, LeadChanges } from "@/lib/types";
import BoardView, { type BoardUi } from "./BoardView";
import CallModal from "./CallModal";
import DashboardView from "./DashboardView";
import LeadModal from "./LeadModal";

type Sync = "loading" | "ok" | "empty" | "fail";
const REFRESH_MS = 20_000;

const BANNER: Record<Sync, { bg: string; fg: string; border: string }> = {
  ok: { bg: "rgba(14,122,99,.09)", fg: "var(--teal)", border: "rgba(14,122,99,.24)" },
  fail: { bg: "rgba(190,58,43,.09)", fg: "var(--red)", border: "rgba(190,58,43,.24)" },
  loading: { bg: "rgba(42,108,154,.09)", fg: "var(--blue)", border: "rgba(42,108,154,.22)" },
  empty: { bg: "rgba(42,108,154,.09)", fg: "var(--blue)", border: "rgba(42,108,154,.22)" },
};

export default function CrmApp({ userLabel }: { userLabel: string }) {
  const router = useRouter();
  const [rows, setRows] = useState<Lead[]>([]);
  const [sync, setSync] = useState<Sync>("loading");
  const [at, setAt] = useState("");
  const [view, setView] = useState("all");
  const [query, setQuery] = useState("");
  const [pins, togglePin] = usePins();
  const [selId, setSelId] = useState<string | null>(null);
  const [callOpen, setCallOpen] = useState(false);
  const [ui, setUiState] = useState<BoardUi>({ mode: "inbox", bucket: "7", inboxStage: "ALL", temp: "ALL", daySpan: 7, tdSpan: 7 });
  const setUi = (patch: Partial<BoardUi>) => setUiState((u) => ({ ...u, ...patch }));

  const fetchLeads = useCallback(async (): Promise<{ state: "ok"; rows: Lead[] } | { state: "fail" } | { state: "unauthorized" }> => {
    try {
      const res = await fetch("/api/leads", { cache: "no-store" });
      if (res.status === 401) return { state: "unauthorized" };
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      return { state: "ok", rows: data.rows };
    } catch {
      return { state: "fail" };
    }
  }, []);

  const apply = useCallback((r: Awaited<ReturnType<typeof fetchLeads>>) => {
    if (r.state === "unauthorized") { router.replace("/login"); return; }
    if (r.state === "fail") { setSync("fail"); return; }
    setRows(r.rows);
    setSync(r.rows.length ? "ok" : "empty");
    setAt(new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }));
  }, [router]);

  const load = useCallback(async () => {
    setSync("loading");
    apply(await fetchLeads());
  }, [apply, fetchLeads]);

  const selRef = useRef<string | null>(null);
  useEffect(() => { selRef.current = selId; }, [selId]);

  useEffect(() => {
    let alive = true;
    const tick = () => fetchLeads().then((r) => { if (alive) apply(r); });
    tick(); // first load; state starts as "loading"
    const t = setInterval(() => { if (!selRef.current) tick(); }, REFRESH_MS);
    return () => { alive = false; clearInterval(t); };
  }, [apply, fetchLeads]);

  const save = async (leadId: string, changes: LeadChanges): Promise<string | null> => {
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ changes }),
      });
      if (res.status === 401) { router.replace("/login"); return "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่"; }
      const data = await res.json();
      if (!data.ok) return data.error || "ไม่ทราบสาเหตุ";
      if (data.lead) setRows((rs) => rs.map((r) => (r.lead_id === leadId ? (data.lead as Lead) : r)));
      setCallOpen(false);
      setSelId(null);
      return null;
    } catch {
      return "ติดต่อเซิร์ฟเวอร์ไม่ได้ ลองอีกครั้ง";
    }
  };

  const signOut = async () => {
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  const sales = useMemo(() => salesList(rows), [rows]);
  const sel = rows.find((r) => r.lead_id === selId) ?? null;
  const countFor = (v: string) => rows.filter((r) => inScope(r, v)).length;

  const tabs = [
    { id: "all", label: "บอร์ดทั้งหมด", badge: rows.length as number | undefined, color: undefined as string | undefined, initial: "" },
    ...sales.map((s, i) => ({ id: s.code, label: s.name, badge: countFor(s.code), color: PALETTE[i % PALETTE.length], initial: initialOf(s.name) })),
    { id: "dash", label: "แดชบอร์ด", badge: undefined, color: undefined, initial: "" },
  ];

  const countLine =
    sync === "loading" ? "กำลังโหลดข้อมูล…" : sync === "ok" ? `${rows.length} ลีด · ซิงก์ ${at}` : sync === "empty" ? "เชื่อมต่อแล้ว แต่ยังไม่มีข้อมูลลีด" : "โหลดข้อมูลไม่สำเร็จ";
  const bannerText =
    sync === "ok" ? `เชื่อมต่อ Supabase · ตาราง leads (${rows.length} แถว) — การแก้ไขบันทึกลงฐานข้อมูลทันที`
    : sync === "loading" ? "กำลังอ่านข้อมูลจากฐานข้อมูล…"
    : sync === "empty" ? "เชื่อมต่อฐานข้อมูลได้ แต่ยังไม่มีแถวในตาราง leads — นำเข้าข้อมูลจากชีตด้วย Apps Script (ดู README)"
    : "อ่านข้อมูลไม่สำเร็จ — กดรีเฟรชเพื่อลองใหม่";
  const b = BANNER[sync];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, padding: "16px clamp(16px, 3vw, 26px)", background: "linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)", borderBottom: "1px solid var(--lineSoft)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: "linear-gradient(145deg, #B36A00, #9A5B00)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fDisplay)", fontWeight: 700, fontSize: 15, boxShadow: "0 2px 8px rgba(179,106,0,0.22)" }}>W</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, fontFamily: "var(--fDisplay)", letterSpacing: "-0.015em" }}>Wuling Sales CRM</h1>
            <p className="mono" style={{ margin: "2px 0 0", color: "var(--faint)", fontSize: 11.5 }}>{countLine}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", background: "var(--bg)", border: "1px solid var(--lineSoft)", borderRadius: 10 }}>
            <span style={{ width: 12, height: 12, border: "1.6px solid var(--faint)", borderRadius: "50%", flex: "none" }} />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)} aria-label="ค้นหา"
              placeholder="ค้นหา ชื่อ / เลขท้ายเบอร์ / รุ่น / จังหวัด / โน้ต"
              style={{ background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 13, width: 230, maxWidth: "52vw" }}
            />
          </div>
          <div role="button" onClick={() => load()} className="h-raise"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer", background: "var(--raised)", color: "var(--text)", border: "1px solid var(--lineSoft)", borderRadius: 10, padding: "9px 14px", fontSize: 13 }}>
            รีเฟรช
          </div>
          <div role="button" onClick={signOut} title={userLabel} className="h-raise"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer", background: "var(--raised)", color: "var(--dim)", border: "1px solid var(--lineSoft)", borderRadius: 10, padding: "9px 14px", fontSize: 13 }}>
            ออกจากระบบ
          </div>
        </div>
      </header>

      <div style={{ margin: "14px clamp(16px, 3vw, 26px) 0", padding: "11px 15px", borderRadius: 10, fontSize: 12.5, display: "flex", alignItems: "center", gap: 9, background: b.bg, color: b.fg, border: `1px solid ${b.border}` }}>{bannerText}</div>

      <div style={{ display: "flex", gap: 2, padding: "0 clamp(12px, 2vw, 22px)", overflowX: "auto", background: "#FAFBFC", borderBottom: "1px solid var(--lineSoft)" }}>
        {tabs.map((t) => {
          const on = view === t.id;
          return (
            <div key={t.id} role="tab" aria-selected={on} onClick={() => { setView(t.id); setSelId(null); }} className="h-dim"
              style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 8, color: on ? "var(--text)" : "var(--faint)", fontWeight: on ? 600 : 400, fontSize: 13, padding: "13px 14px 12px", cursor: "pointer", whiteSpace: "nowrap", borderBottom: `2px solid ${on ? "var(--amber)" : "transparent"}` }}>
              {t.color && (
                <span style={{ width: 20, height: 20, borderRadius: 6, fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fDisplay)", flexShrink: 0, background: t.color + "22", color: t.color }}>{t.initial}</span>
              )}
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span className="mono" style={{ fontSize: 10.5, padding: "1px 6px", borderRadius: 5, background: on ? "rgba(179,106,0,.12)" : "var(--raised)", color: on ? "var(--amber)" : "var(--dim)" }}>{t.badge}</span>
              )}
            </div>
          );
        })}
      </div>

      {view === "dash" ? (
        <DashboardView rows={rows} ui={ui} setUi={setUi} onOpen={(r) => setSelId(r.lead_id)} />
      ) : (
        <BoardView
          rows={rows} view={view} query={query} ui={ui} setUi={setUi} pins={pins} togglePin={togglePin}
          onOpen={(r) => { setSelId(r.lead_id); setCallOpen(false); }} onClearQuery={() => setQuery("")}
        />
      )}

      {sel && (
        <LeadModal
          key={sel.lead_id} lead={sel} salesKeys={sales.map((s) => s.key)} pinned={pins.includes(sel.lead_id)}
          togglePin={() => togglePin(sel.lead_id)} onClose={() => setSelId(null)} onSave={save} onLogCall={() => setCallOpen(true)}
        />
      )}
      {sel && callOpen && <CallModal key={"call" + sel.lead_id} lead={sel} onClose={() => setCallOpen(false)} onSave={save} />}
    </div>
  );
}
