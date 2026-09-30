"use client";

import { useState } from "react";
import { STAGES } from "@/lib/constants";
import { isoAdd } from "@/lib/dates";
import type { Lead } from "@/lib/types";
import type { SaveFn } from "./LeadModal";

const QUICK = [{ d: 1, label: "พรุ่งนี้" }, { d: 3, label: "3 วัน" }, { d: 7, label: "1 สัปดาห์" }, { d: 14, label: "2 สัปดาห์" }];

/** "บันทึกการโทรซ้ำ" — every field is required before a call can be logged. */
export default function CallModal({ lead, onClose, onSave }: { lead: Lead; onClose: () => void; onSave: SaveFn }) {
  const [status, setStatus] = useState<string>(lead.lead_status);
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const [next, setNext] = useState(isoAdd(3));
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const attempt = (lead.call_attempts || 0) + 1;

  async function save() {
    const miss = [
      !status.trim() && "สถานะลีด", !reply.trim() && "สรุปการคุยล่าสุด",
      !note.trim() && "โน้ตติดตามต่อ", !next.trim() && "ติดตามครั้งต่อไป",
    ].filter(Boolean);
    if (miss.length) { setErr("กรอกให้ครบก่อนบันทึก: " + miss.join(" · ")); return; }
    setSaving(true);
    setErr("");
    const e = await onSave(lead.lead_id, {
      lead_status: status, sales_reply: reply.trim(), follow_up_note: note.trim(),
      next_follow_up: next, last_follow_up: isoAdd(0), call_attempts: String(attempt),
    });
    setSaving(false);
    if (e) setErr("บันทึกไม่สำเร็จ: " + e);
  }

  const req = <span style={{ color: "var(--red)" }}>*</span>;
  const cap = (t: string) => <span style={{ display: "block", fontSize: 11.5, color: "var(--dim)", marginBottom: 5, fontWeight: 500 }}>{t} {req}</span>;

  return (
    <div className="fade" role="dialog" aria-modal="true"
      style={{ position: "fixed", inset: 0, background: "rgba(22,32,43,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 60, backdropFilter: "blur(3px)" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0 }} />
      <div className="pop" style={{ position: "relative", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 16, width: "100%", maxWidth: 430, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(22,32,43,.22)" }}>
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--lineSoft)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, fontFamily: "var(--fDisplay)" }}>บันทึกการโทรซ้ำ</h3>
            <span className="mono" style={{ display: "block", marginTop: 3, fontSize: 11, color: "var(--faint)" }}>
              ครั้งที่ {attempt} · {lead.customer_name || "ยังไม่ทราบชื่อ"} · {lead.phone_number || "-"}
            </span>
          </div>
          <div role="button" aria-label="ปิด" onClick={onClose} className="h-close" style={{ color: "var(--dim)", cursor: "pointer", padding: "4px 8px", borderRadius: 7, fontSize: 15, flexShrink: 0 }}>✕</div>
        </div>
        <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <label>{cap("สถานะลีด")}
            <select className="field" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STAGES.map((s) => <option key={s.id} value={s.id}>{s.id} — {s.label}</option>)}
            </select>
          </label>
          <label>{cap("สรุปการคุยล่าสุด")}
            <textarea className="field" style={{ minHeight: 68, resize: "vertical", lineHeight: 1.5 }} value={reply} placeholder="โทรไปคุยอะไร ลูกค้าตอบว่าอย่างไร" onChange={(e) => setReply(e.target.value)} />
          </label>
          <label>{cap("โน้ตติดตามต่อ")}
            <textarea className="field" style={{ minHeight: 68, resize: "vertical", lineHeight: 1.5 }} value={note} placeholder="ครั้งหน้าต้องทำอะไร ต้องเตรียมอะไรไป" onChange={(e) => setNote(e.target.value)} />
          </label>
          <div>
            <label>{cap("ติดตามครั้งต่อไป")}
              <input type="date" className="field" value={next} onChange={(e) => setNext(e.target.value)} />
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {QUICK.map((q) => (
                <div key={q.d} role="button" onClick={() => setNext(isoAdd(q.d))} className="h-line h-text"
                  style={{ fontSize: 11.5, padding: "5px 11px", borderRadius: 999, cursor: "pointer", background: "var(--raised)", border: "1px solid var(--lineSoft)", color: "var(--dim)" }}>
                  {q.label}
                </div>
              ))}
            </div>
          </div>
          {err && <p style={{ margin: 0, fontSize: 12, color: "var(--red)", lineHeight: 1.5 }}>{err}</p>}
          <p style={{ margin: 0, fontSize: 11, color: "var(--faint)", lineHeight: 1.55 }}>ระบบจะบันทึกวันที่ติดตามล่าสุดเป็นวันนี้ นับจำนวนครั้งที่โทร และเขียนประวัติลง activity_log อัตโนมัติ</p>
          <button className="btn-primary h-bright" disabled={saving} onClick={save}>{saving ? "กำลังบันทึก…" : "บันทึกการโทรซ้ำ"}</button>
        </div>
      </div>
    </div>
  );
}
