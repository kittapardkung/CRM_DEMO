"use client";

import { useState } from "react";
import { EDIT_GROUPS, STAGES, TEMPS } from "@/lib/constants";
import { str } from "@/lib/metrics";
import type { ActivityRow, Lead, LeadChanges } from "@/lib/types";

/** Save handler: resolves to an error message, or null on success. */
export type SaveFn = (leadId: string, changes: LeadChanges) => Promise<string | null>;

/** Lead column -> the string the form edits (booleans/dates/nulls flattened). */
export function fieldStr(lead: Lead, col: string): string {
  const v = (lead as unknown as Record<string, unknown>)[col];
  if (col === "has_trade_in") return v === true ? "มี" : v === false ? "ไม่มี" : "";
  return v == null ? "" : String(v);
}

const STATUS_OPTIONS = STAGES.map((s) => ({ value: s.id as string, label: `${s.id} — ${s.label}` }));

const label = (t: string) => <span style={{ display: "block", fontSize: 11, color: "var(--dim)", marginBottom: 5, fontWeight: 500 }}>{t}</span>;
const sectionTitle = (t: string) => (
  <p className="eyebrow" style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: ".07em", margin: "0 0 11px" }}>{t}</p>
);

interface Draft { status: string; temp: string; sales: string; next: string; reply: string; note: string; driven: boolean; extra: Record<string, string> }

function makeDraft(r: Lead): Draft {
  const extra: Record<string, string> = {};
  EDIT_GROUPS.forEach((g) => g.fields.forEach((f) => (extra[f.key] = fieldStr(r, f.key))));
  return {
    status: r.lead_status, temp: r.lead_temperature ?? "", sales: r.assigned_sales ?? "", next: r.next_follow_up ?? "",
    reply: r.sales_reply ?? "", note: r.follow_up_note ?? "", driven: r.test_drive_done, extra,
  };
}

function diff(r: Lead, d: Draft): LeadChanges {
  const out: LeadChanges = {};
  const core: [string, string][] = [
    ["lead_status", d.status], ["lead_temperature", d.temp], ["assigned_sales", d.sales], ["next_follow_up", d.next],
    ["sales_reply", d.reply], ["follow_up_note", d.note], ["test_drive_done", d.driven ? "Y" : ""],
  ];
  for (const [k, v] of core) {
    const before = k === "test_drive_done" ? (r.test_drive_done ? "Y" : "") : fieldStr(r, k);
    if (before !== v) out[k] = v;
  }
  for (const [k, v] of Object.entries(d.extra)) if (fieldStr(r, k) !== v) out[k] = v;
  return out;
}

export default function LeadModal({ lead, salesKeys, pinned, togglePin, onClose, onSave, onLogCall }: {
  lead: Lead; salesKeys: string[]; pinned: boolean; togglePin: () => void;
  onClose: () => void; onSave: SaveFn; onLogCall: () => void;
}) {
  const [draft, setDraft] = useState(() => makeDraft(lead));
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<ActivityRow[] | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const setExtra = (k: string, v: string) => setDraft((d) => ({ ...d, extra: { ...d.extra, [k]: v } }));
  const changes = diff(lead, draft);
  const changed = Object.keys(changes).length;
  const digits = str(lead.phone_number).replace(/[^0-9+]/g, "");
  const shownName = draft.extra.customer_name.trim() || "ยังไม่ทราบชื่อ";
  const place = [draft.extra.customer_district, draft.extra.customer_province].map(str).filter(Boolean).join(" ");
  const meta = [place ? "📍 " + place : "📍 ยังไม่ระบุจังหวัด", lead.source, draft.extra.occupation, lead.lead_score ? "คะแนน " + lead.lead_score : ""]
    .map(str).filter(Boolean).join(" · ");

  async function toggleHistory() {
    if (historyOpen) { setHistoryOpen(false); return; }
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/leads/${encodeURIComponent(lead.lead_id)}/activity`, { cache: "no-store" });
      const data = await res.json();
      setHistory(data.rows ?? []);
    } catch { setHistory([]); }
    setHistoryLoading(false);
  }

  function dial() {
    if (!digits) return;
    navigator.clipboard?.writeText(digits).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {});
    onLogCall();
  }

  async function save() {
    if (!changed) { onClose(); return; }
    setSaving(true);
    setError("");
    const err = await onSave(lead.lead_id, changes);
    setSaving(false);
    if (err) setError(err);
  }

  const inputStyle = "field field-sm";

  return (
    <div className="fade" role="dialog" aria-modal="true"
      style={{ position: "fixed", inset: 0, background: "rgba(22,32,43,.42)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 50, backdropFilter: "blur(3px)" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0 }} />
      <div className="pop" style={{ position: "relative", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 18, width: "100%", maxWidth: 460, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(22,32,43,.22)" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 2, padding: "20px 22px 14px", background: "linear-gradient(180deg, #FFFFFF, #FCFDFE)", borderBottom: "1px solid var(--lineSoft)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, fontFamily: "var(--fDisplay)" }}>{shownName}</h3>
            <span className="mono" style={{ display: "block", marginTop: 3, fontSize: 10, color: "var(--faint)" }}>
              {lead.lead_id} · {STAGES.find((s) => s.id === lead.lead_status)?.label ?? lead.lead_status}
            </span>
            <span className="mono" style={{ display: "block", marginTop: 3, fontSize: 10, color: "var(--faint)", lineHeight: 1.5 }}>{meta}</span>
          </div>
          <div role="button" aria-label="ปิด" onClick={onClose} className="h-close" style={{ color: "var(--dim)", cursor: "pointer", padding: "5px 8px", borderRadius: 7, fontSize: 15, flexShrink: 0 }}>✕</div>
        </div>

        <div style={{ padding: "18px 22px 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginBottom: 8 }}>
            <a href={digits ? "tel:" + digits : undefined} onClick={dial}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(14,122,99,.09)", color: "var(--teal)", border: "1px solid rgba(14,122,99,.28)", borderRadius: 10, padding: 10, fontSize: 13.5, fontWeight: 600, opacity: digits ? 1 : 0.45, pointerEvents: digits ? "auto" : "none" }}>
              ☎ {digits ? "โทร " + lead.phone_number : "ไม่มีเบอร์โทร"}
            </a>
            <div role="button" onClick={onLogCall} className="h-line"
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 13px", borderRadius: 10, cursor: "pointer", background: "var(--raised)", border: "1px solid var(--lineSoft)", color: "var(--text)", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>
              บันทึกการโทรซ้ำ
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div role="button" onClick={togglePin}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 9, cursor: "pointer", background: "var(--bg)", border: `1px solid ${pinned ? "#B36A00" : "var(--lineSoft)"}`, color: pinned ? "#B36A00" : "var(--dim)", fontSize: 12, fontWeight: 600 }}>
              {pinned ? "★ ปักหมุดแล้ว" : "☆ ปักหมุดลูกค้านี้"}
            </div>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 9, cursor: "pointer", background: "var(--bg)", border: `1px solid ${draft.driven ? "#2A6C9A" : "var(--lineSoft)"}` }}>
              <input type="checkbox" checked={draft.driven} onChange={(e) => set({ driven: e.target.checked })} style={{ width: 15, height: 15, accentColor: "#2A6C9A", cursor: "pointer" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: draft.driven ? "#2A6C9A" : "var(--dim)" }}>ทดลองขับแล้ว</span>
            </label>
          </div>
          <p style={{ margin: "0 0 16px", fontSize: 11, color: "var(--faint)" }}>โทรมาแล้ว {lead.call_attempts || 0} ครั้ง</p>
          {copied && <p style={{ margin: "-8px 0 14px", fontSize: 11.5, color: "var(--teal)" }}>ก็อปเบอร์ไว้ให้แล้ว — ถ้าเครื่องไม่เปิดแอปโทรอัตโนมัติ วางเบอร์ในแอปโทรได้เลย</p>}

          <div style={{ background: "var(--bg)", borderRadius: 11, padding: 13, marginBottom: 18, display: "flex", flexDirection: "column", gap: 11 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {([["customer_name", "ชื่อลูกค้า", "กรอกชื่อลูกค้า"], ["phone_number", "เบอร์โทร", "08x-xxx-xxxx"], ["interested_model", "รุ่นที่สนใจ", "เช่น Porta EV"], ["customer_province", "จังหวัดที่ลูกค้าอยู่", "เช่น ชลบุรี"]] as const).map(([k, l, ph]) => (
                <label key={k} style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: 10.5, color: "var(--faint)", marginBottom: 4 }}>{l}</span>
                  <input className={inputStyle} value={draft.extra[k]} placeholder={ph} onChange={(e) => setExtra(k, e.target.value)} style={k === "phone_number" ? { fontFamily: "var(--fMono)" } : undefined} />
                </label>
              ))}
            </div>
            <Row k="เข้ามาเมื่อ" v={[lead.created_date, lead.created_time].filter(Boolean).join(" ") || "-"} mono />
            <Row k="ข้อความจากลูกค้า" v={lead.customer_message || "-"} />
          </div>

          {sectionTitle("สถานะการขาย")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>{label("สถานะ")}
              <select className="field" value={draft.status} onChange={(e) => set({ status: e.target.value })}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label>{label("ความร้อนแรง")}
              <select className="field" value={draft.temp} onChange={(e) => set({ temp: e.target.value })}>
                <option value="">ยังไม่ประเมิน</option>
                {(["HOT", "WARM", "COLD"] as const).map((t) => (
                  <option key={t} value={t}>{TEMPS[t].label} — {{ HOT: "พร้อมซื้อ", WARM: "สนใจอยู่", COLD: "ยังไม่รีบ" }[t]}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 13 }}>
            <label>{label("เซลล์ผู้ดูแล")}
              <select className="field" value={draft.sales} onChange={(e) => set({ sales: e.target.value })}>
                <option value="">ยังไม่มอบหมาย</option>
                {salesKeys.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </label>
            <label>{label("ติดตามครั้งต่อไป")}
              <input type="date" className="field" value={draft.next} onChange={(e) => set({ next: e.target.value })} />
            </label>
          </div>

          <div style={{ height: 1, background: "var(--lineSoft)", margin: "18px 0" }} />
          {sectionTitle("บันทึกการติดตาม")}
          <label style={{ display: "block", marginBottom: 13 }}>{label("สรุปการคุยล่าสุด")}
            <textarea className="field" style={{ minHeight: 62, resize: "vertical", lineHeight: 1.5 }} value={draft.reply} placeholder="คุยอะไรกับลูกค้าไปบ้าง" onChange={(e) => set({ reply: e.target.value })} />
          </label>
          <label style={{ display: "block", marginBottom: 13 }}>{label("โน้ตสำหรับติดตามต่อ")}
            <textarea className="field" style={{ minHeight: 62, resize: "vertical", lineHeight: 1.5 }} value={draft.note} placeholder="สิ่งที่ต้องทำหรือจำไว้ครั้งหน้า" onChange={(e) => set({ note: e.target.value })} />
          </label>

          <div style={{ height: 1, background: "var(--lineSoft)", margin: "6px 0 14px" }} />
          {sectionTitle("เพิ่ม / แก้ไขข้อมูลลูกค้า")}
          <p style={{ fontSize: 11.5, color: "var(--faint)", margin: "0 0 12px", lineHeight: 1.55 }}>กดหัวข้อที่ต้องการบันทึก แล้วกรอกเฉพาะช่องที่มีข้อมูลใหม่ — ที่เหลือปล่อยว่างไว้ได้</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {EDIT_GROUPS.map((g) => {
              const open = !!openGroups[g.id];
              const filled = g.fields.filter((f) => draft.extra[f.key].trim() !== "").length;
              return (
                <div key={g.id} style={{ background: "var(--bg)", border: "1px solid var(--lineSoft)", borderRadius: 10, overflow: "hidden" }}>
                  <div role="button" onClick={() => setOpenGroups((o) => ({ ...o, [g.id]: !open }))}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", cursor: "pointer", background: open ? "rgba(22,32,43,.045)" : "transparent" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: g.color, flex: "none" }} />
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{g.title}</span>
                    <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: filled ? g.color : "var(--faint)" }}>{filled ? `กรอกแล้ว ${filled}/${g.fields.length}` : "ยังไม่กรอก"}</span>
                    <span style={{ color: "var(--faint)", fontSize: 11, transform: open ? "rotate(180deg)" : "none" }}>▾</span>
                  </div>
                  {open && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, padding: "4px 13px 14px" }}>
                      {g.fields.map((f) => (
                        <label key={f.key} style={{ display: "block", gridColumn: f.type === "area" ? "1 / -1" : "auto" }}>
                          <span style={{ display: "block", fontSize: 10.5, color: "var(--dim)", marginBottom: 4 }}>{f.label}</span>
                          {f.type === "select" ? (
                            <select className={inputStyle} value={draft.extra[f.key]} onChange={(e) => setExtra(f.key, e.target.value)}>
                              {(f.options ?? []).map((o) => <option key={o} value={o}>{o === "" ? "— ยังไม่ระบุ —" : o}</option>)}
                            </select>
                          ) : f.type === "area" ? (
                            <textarea className={inputStyle} style={{ minHeight: 54, resize: "vertical", lineHeight: 1.5 }} value={draft.extra[f.key]} onChange={(e) => setExtra(f.key, e.target.value)} />
                          ) : (
                            <input className={inputStyle} type={f.type === "num" ? "number" : f.type === "date" ? "date" : "text"} value={draft.extra[f.key]} onChange={(e) => setExtra(f.key, e.target.value)} />
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ height: 1, background: "var(--lineSoft)", margin: "16px 0 12px" }} />
          <div role="button" onClick={toggleHistory} className="h-line"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg)", border: "1px solid var(--lineSoft)", borderRadius: 10, padding: "11px 13px", cursor: "pointer", color: "var(--dim)", fontSize: 12.5, fontWeight: 500 }}>
            <span>ประวัติการเปลี่ยนแปลง</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>{history ? history.length + " ครั้ง" : "ดูประวัติ"}</span>
              <span style={{ transform: historyOpen ? "rotate(180deg)" : "none" }}>▾</span>
            </span>
          </div>
          {historyOpen && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 9 }}>
              {historyLoading && <p style={{ margin: 0, fontSize: 12, color: "var(--faint)", padding: "10px 0" }}>กำลังโหลดประวัติ…</p>}
              {(history ?? []).map((h) => {
                const st = STAGES.find((s) => s.id === h.lead_status);
                const t = h.lead_temperature ? TEMPS[h.lead_temperature] : undefined;
                const when = new Date(h.activity_at).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "medium", timeZone: "Asia/Bangkok" });
                return (
                  <div key={h.activity_id} style={{ position: "relative", padding: "11px 12px 11px 22px", background: "var(--bg)", border: "1px solid var(--lineSoft)", borderRadius: 10 }}>
                    <span style={{ position: "absolute", left: 10, top: 15, width: 7, height: 7, borderRadius: "50%", background: st?.color ?? "var(--dim)" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 5 }}>
                      <span className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>{when}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 600, padding: "2px 7px", borderRadius: 5, background: st ? st.color + "1F" : "rgba(22,32,43,.055)", color: st?.color ?? "var(--dim)" }}>{st?.label ?? h.lead_status ?? "—"}</span>
                      {t && <span className="mono" style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 5, background: t.color + "1F", color: t.color }}>{t.label}</span>}
                      <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--faint)" }}>{h.last_modified_by || "—"}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, wordBreak: "break-word" }}>{h.activity_notes || "—"}</p>
                    <p className="mono" style={{ margin: "5px 0 0", fontSize: 9.5, color: "var(--faint)", wordBreak: "break-all" }}>{h.activity_id}</p>
                  </div>
                );
              })}
              {history && history.length === 0 && !historyLoading && <p style={{ margin: 0, fontSize: 12, color: "var(--faint)", padding: "8px 0" }}>ยังไม่มีประวัติการแก้ไขของลีดนี้</p>}
            </div>
          )}

          <p style={{ fontSize: 11.5, color: error ? "var(--red)" : "var(--teal)", margin: "16px 0 10px", lineHeight: 1.55 }}>
            {error || "บันทึกแล้วจะเขียนลง Supabase และเก็บประวัติการแก้ไขทันที"}
          </p>
          <button className="btn-primary h-bright" disabled={saving} onClick={save}>
            {saving ? "กำลังบันทึก…" : changed ? `บันทึก ${changed} ช่องที่แก้ไข` : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontSize: 11, color: "var(--faint)", flexShrink: 0 }}>{k}</span>
      <span className={mono ? "mono" : undefined} style={{ fontSize: 12.5, color: mono ? "var(--text)" : "var(--dim)", textAlign: "right", lineHeight: 1.5 }}>{v}</span>
    </div>
  );
}
