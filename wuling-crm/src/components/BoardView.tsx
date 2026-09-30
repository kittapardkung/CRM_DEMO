"use client";

import { PALETTE, STAGES, TEMP_DEFS } from "@/lib/constants";
import { dueState } from "@/lib/dates";
import {
  ageLabel, createdLabel, dailyStats, daysSince, initialOf, inScope, isOpen, isOverdue, makePie, matchesSearch,
  modelOf, noteOf, placeOf, salesList, stageOf, statusOf, STATUS_PIE_DEFS, str, tempKey, tempOf, testDriveStats,
} from "@/lib/metrics";
import type { Lead } from "@/lib/types";
import { DailyLeadsCard, PieChart, TestDriveCard } from "./Charts";

export interface BoardUi {
  mode: "inbox" | "recent" | "stale";
  bucket: "7" | "15" | "30";
  inboxStage: string;
  temp: string;
  daySpan: number;
  tdSpan: number;
}

interface Props {
  rows: Lead[];
  view: string;
  query: string;
  ui: BoardUi;
  setUi: (patch: Partial<BoardUi>) => void;
  pins: string[];
  togglePin: (id: string) => void;
  onOpen: (r: Lead) => void;
  onClearQuery: () => void;
}

const nameOf = (r: Lead) => r.customer_name || "ยังไม่ทราบชื่อ";
const dueOf = (r: Lead, fallback: string) => dueState(r.next_follow_up)?.text ?? fallback;
const dueColorOf = (r: Lead) => dueState(r.next_follow_up)?.color ?? "#BE3A2B";

export default function BoardView({ rows, view, query, ui, setUi, pins, togglePin, onOpen, onClearQuery }: Props) {
  const sales = salesList(rows);
  const person = sales.find((s) => s.code === view);
  const personIdx = sales.findIndex((s) => s.code === view);
  const personColor = PALETTE[Math.max(personIdx, 0) % PALETTE.length];
  const scoped = rows.filter((r) => inScope(r, view));
  const searching = query.trim().length > 0;

  // searching looks across every tab and filter so a lead can always be found
  const list = searching
    ? rows.filter((r) => matchesSearch(r, query))
    : scoped.filter((r) => ui.temp === "ALL" || tempKey(r) === ui.temp);

  const openLeads = list.filter(isOpen);
  const overdueBy = (min: number) =>
    openLeads.filter((r) => { const k = daysSince(r); return k != null && k >= min; }).sort((a, b) => daysSince(b)! - daysSince(a)!);
  const createdMs = (r: Lead) => (r.created_date ? Date.parse(r.created_date) : 0);
  const recent = [...list].sort((a, b) => createdMs(b) - createdMs(a) || str(b.created_time).localeCompare(str(a.created_time)));
  const stale = overdueBy(parseInt(ui.bucket, 10));
  const prospects = scoped.filter((r) => statusOf(r) === "PROSPECT").sort((a, b) => (daysSince(b) || 0) - (daysSince(a) || 0));
  const pinned = rows.filter((r) => pins.includes(r.lead_id));

  const active = scoped.filter(isOpen).length;
  const hot = scoped.filter((r) => r.lead_temperature === "HOT").length;
  const overdue = scoped.filter(isOverdue).length;

  const flat = searching ? list : ui.mode === "recent" ? recent : ui.mode === "stale" ? stale : null;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ScopeHeader
        person={person} color={personColor} count={scoped.length}
        chips={[
          { value: active, label: "กำลังดำเนินการ", color: "var(--text)" },
          { value: hot, label: "ลีด HOT", color: "var(--red)" },
          { value: overdue, label: "เลยกำหนดติดตาม", color: overdue ? "var(--red)" : "var(--dim)" },
        ]}
      />

      <div style={{ padding: "18px clamp(16px, 3vw, 26px) 0" }}>
        <DailyLeadsCard
          title={person ? "ลีดเข้าใหม่รายวัน — " + person.name : "ลีดเข้าใหม่รายวัน — ทั้งทีม"}
          source="" stats={dailyStats(scoped, ui.daySpan)} span={ui.daySpan} onSpan={(n) => setUi({ daySpan: n })}
        />
        <TestDriveCard stats={testDriveStats(scoped, ui.tdSpan)} span={ui.tdSpan} onSpan={(n) => setUi({ tdSpan: n })} />
        <div className="card" style={{ padding: "18px 20px" }}>
          <h3 className="h3" style={{ margin: "0 0 16px" }}>{person ? "ภาพรวมของ " + person.name : "ภาพรวมทั้งทีม"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            <PieChart size={116} pie={makePie(scoped, "ตามขั้นการขาย", STATUS_PIE_DEFS, statusOf)} />
            <PieChart size={116} pie={makePie(scoped, "ตามความร้อนแรง", TEMP_DEFS.map((t) => ({ id: t.id, label: t.short, color: t.color })), tempKey)} />
          </div>
        </div>
      </div>

      {!searching && pinned.length > 0 && <PinnedPanel rows={pinned} onOpen={onOpen} unpin={togglePin} />}
      {!searching && prospects.length > 0 && <ProspectPanel rows={prospects} onOpen={onOpen} />}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "18px clamp(16px, 3vw, 26px) 0" }}>
        {searching && (
          <div role="button" onClick={onClearQuery} className="h-line"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 11, cursor: "pointer", background: "var(--raised)", border: "1px solid var(--line)" }}>
            <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--fDisplay)" }}>กำลังค้นหา</span>
            <span className="mono" style={{ fontSize: 12, color: "var(--dim)" }}>{list.length} รายการ</span>
            <span style={{ fontSize: 12, color: "var(--faint)" }}>✕ ล้าง</span>
          </div>
        )}
        {([
          { id: "inbox", label: "กล่องลีด", hint: "รายการเดียว เลื่อนดูเร็ว", n: list.length },
          { id: "recent", label: "ลีดใหม่ล่าสุด", hint: "ใหม่ไปเก่า", n: recent.length },
          { id: "stale", label: "กำหนดติดตาม", hint: "เลยกำหนดแล้ว", n: overdueBy(7).length },
        ] as const).map((m) => {
          const on = ui.mode === m.id;
          return (
            <div key={m.id} role="button" onClick={() => setUi({ mode: m.id })} className="h-line"
              style={{ display: "flex", flexDirection: "column", gap: 2, padding: "10px 14px", borderRadius: 11, cursor: "pointer", minWidth: 168, background: on ? "rgba(179,106,0,.11)" : "var(--panel)", border: `1px solid ${on ? "rgba(179,106,0,.45)" : "var(--lineSoft)"}` }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--fDisplay)", color: on ? "var(--amber)" : "var(--dim)" }}>{m.label}</span>
                <span className="mono" style={{ fontSize: 12, color: on ? "var(--amber)" : "var(--faint)" }}>{m.n}</span>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--faint)" }}>{m.hint}</span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "16px clamp(16px, 3vw, 26px) 0" }}>
        <span className="eyebrow" style={{ letterSpacing: ".07em", fontWeight: 600, marginRight: 4 }}>Lead Temperature</span>
        {[{ id: "ALL", label: "ทุกระดับ", color: "#90A9B0" }, ...TEMP_DEFS.map((t) => ({ id: t.id as string, label: t.short, color: t.color as string }))].map((t) => {
          const n = t.id === "ALL" ? scoped.length : scoped.filter((r) => tempKey(r) === t.id).length;
          const on = ui.temp === t.id;
          return (
            <div key={t.id} role="button" onClick={() => setUi({ temp: t.id })} className="h-line"
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 9, cursor: "pointer", fontSize: 12.5, background: on ? t.color + "26" : "var(--panel)", color: on ? t.color : "var(--dim)", border: `1px solid ${on ? t.color + "66" : "var(--lineSoft)"}` }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: t.color }} />
              <span>{t.label}</span>
              <span className="mono" style={{ fontSize: 11, opacity: .8 }}>{n}</span>
            </div>
          );
        })}
      </div>

      {flat ? (
        <FlatList
          rows={flat} searching={searching} mode={ui.mode} bucket={ui.bucket} query={query}
          buckets={[
            { id: "7", label: "7+ Days", note: "เริ่มเย็นลง", n: overdueBy(7).length },
            { id: "15", label: "15+ Days", note: "ต้องรีบตาม", n: overdueBy(15).length },
            { id: "30", label: "30+ Days", note: "เสี่ยงหลุด", n: overdueBy(30).length },
          ]}
          setBucket={(b) => setUi({ bucket: b })} onOpen={onOpen}
        />
      ) : (
        <Inbox rows={list} stage={ui.inboxStage} setStage={(s) => setUi({ inboxStage: s })} pins={pins} togglePin={togglePin} onOpen={onOpen} />
      )}
    </div>
  );
}

function ScopeHeader({ person, color, count, chips }: {
  person?: { code: string; name: string }; color: string; count: number; chips: { value: number; label: string; color: string }[];
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "16px clamp(16px, 3vw, 26px) 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {person && (
          <span style={{ width: 42, height: 42, borderRadius: 12, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fDisplay)", flexShrink: 0, background: color + "22", color }}>
            {initialOf(person.name)}
          </span>
        )}
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontFamily: "var(--fDisplay)", fontWeight: 600 }}>{person ? person.name : "ลีดทั้งทีม"}</h2>
          <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--faint)" }}>
            {person ? `${person.code} · ${count} ลีดในความดูแล` : `ทุกคนในทีมขายรวมกัน · ${count} ลีด`}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: "auto" }}>
        {chips.map((c) => (
          <span key={c.label} style={{ display: "inline-flex", alignItems: "baseline", gap: 6, padding: "7px 12px", background: "var(--panel)", border: "1px solid var(--lineSoft)", borderRadius: 9 }}>
            <b className="mono" style={{ fontSize: 14, fontWeight: 600, color: c.color }}>{c.value}</b>
            <span style={{ fontSize: 11, color: "var(--faint)" }}>{c.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Pin({ on, onClick, size = 15 }: { on: boolean; onClick: (e: React.MouseEvent) => void; size?: number }) {
  return (
    <span role="button" aria-label={on ? "เอาหมุดออก" : "ปักหมุด"} onClick={onClick} className="h-fade"
      style={{ fontSize: size, lineHeight: 1, cursor: "pointer", color: on ? "#B36A00" : "var(--faint)" }}>
      {on ? "★" : "☆"}
    </span>
  );
}

function PinnedPanel({ rows, onOpen, unpin }: { rows: Lead[]; onOpen: (r: Lead) => void; unpin: (id: string) => void }) {
  return (
    <div style={{ padding: "18px clamp(16px, 3vw, 26px) 0" }}>
      <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderTop: "3px solid #B36A00", borderRadius: 14, padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: "#B36A00" }}>★</span>
          <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 600, fontFamily: "var(--fDisplay)" }}>ลูกค้าที่ปักหมุดไว้</h3>
          <span className="mono" style={{ fontSize: 12, color: "#B36A00" }}>{rows.length} ราย</span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--faint)" }}>กดดาวบนการ์ดลีดเพื่อเพิ่ม/เอาออก — เก็บไว้เฉพาะเครื่องนี้</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(268px, 1fr))", gap: 10 }}>
          {rows.map((r) => {
            const st = stageOf(r), t = tempOf(r), k = daysSince(r);
            return (
              <div key={r.lead_id} onClick={() => onOpen(r)} className="h-card"
                style={{ background: "var(--panel2)", border: "1px solid var(--lineSoft)", borderRadius: 11, padding: "12px 13px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 9 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600 }}>{nameOf(r)}</span>
                  <Pin on onClick={(e) => { e.stopPropagation(); unpin(r.lead_id); }} size={14} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 12px", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: st.color + "1F", color: st.color }}>{st.label}</span>
                  <span className="mono" style={{ fontSize: 11, color: t?.color ?? "#6A7683" }}>{t?.label ?? "—"}</span>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--dim)" }}>☎ {r.phone_number || "-"}</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--dim)" }}>{modelOf(r) || "—"}</span>
                <span style={{ fontSize: 11.5, color: "var(--faint)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{noteOf(r) || "—"}</span>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, paddingTop: 7, borderTop: "1px solid var(--lineSoft)" }}>
                  <span className="mono" style={{ fontSize: 11, color: dueColorOf(r) }}>{dueOf(r, "ยังไม่ตั้งกำหนด")}</span>
                  <span style={{ fontSize: 10.5, color: "var(--faint)" }}>{k == null ? "" : ageLabel(k)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProspectPanel({ rows, onOpen }: { rows: Lead[]; onOpen: (r: Lead) => void }) {
  return (
    <div style={{ padding: "18px clamp(16px, 3vw, 26px) 0" }}>
      <div style={{ background: "var(--panel)", border: "2px solid #B0006C", borderRadius: 14, padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#B0006C", flex: "none" }} />
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, fontFamily: "var(--fDisplay)", color: "#B0006C" }}>ลูกค้ามุ่งหวัง — ใกล้ปิดการขาย</h3>
          <span className="mono" style={{ fontSize: 12.5, color: "#B0006C" }}>{rows.length} ราย</span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--faint)" }}>ห้ามลืม — โทรตามถี่ และเคลียร์เงื่อนไขที่ค้างให้จบ</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(292px, 1fr))", gap: 12, marginTop: 14 }}>
          {rows.map((r) => {
            const k = daysSince(r);
            const blockers = [
              { label: "เงื่อนไขปิด", value: str(r.closing_condition) },
              { label: "โปรโมชั่น", value: str(r.promotion_name) },
              { label: "ของแถม", value: str(r.free_items) },
              { label: "สินเชื่อ", value: str(r.financing_status) },
            ].filter((b) => b.value);
            if (!blockers.length) blockers.push({ label: "ยังไม่ระบุเงื่อนไข", value: "เปิดลีดเพื่อกรอกเงื่อนไขปิดการขาย โปรโมชั่น หรือของแถม" });
            return (
              <div key={r.lead_id} onClick={() => onOpen(r)} className="h-card"
                style={{ background: "var(--panel2)", border: "1px solid var(--lineSoft)", borderLeft: "3px solid #B0006C", borderRadius: 11, padding: "13px 14px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{nameOf(r)}</span>
                  <span className="mono" style={{ fontSize: 11, whiteSpace: "nowrap", color: k == null ? "var(--faint)" : k >= 7 ? "#BE3A2B" : k >= 3 ? "#B36A00" : "var(--dim)" }}>{ageLabel(k)}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 12, color: "var(--dim)" }}>
                  <span className="mono">☎ {r.phone_number || "-"}</span>
                  <span>{modelOf(r) || "—"}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 8, borderTop: "1px dashed var(--lineSoft)" }}>
                  {blockers.map((b) => (
                    <div key={b.label} style={{ display: "grid", gridTemplateColumns: "78px 1fr", gap: 8, alignItems: "baseline" }}>
                      <span style={{ fontSize: 10.5, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--faint)" }}>{b.label}</span>
                      <span style={{ fontSize: 12, lineHeight: 1.5 }}>{b.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, paddingTop: 7, borderTop: "1px solid var(--lineSoft)" }}>
                  <span className="mono" style={{ fontSize: 11.5, color: dueColorOf(r) }}>{dueOf(r, "ยังไม่ตั้งกำหนดติดตาม")}</span>
                  <span style={{ fontSize: 11, color: "var(--faint)" }}>{r.assigned_sales || "ยังไม่มอบหมาย"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const FLAT_COLS = "132px 1.2fr 1.3fr 110px 84px 128px 1fr";

function FlatList({ rows, searching, mode, bucket, query, buckets, setBucket, onOpen }: {
  rows: Lead[]; searching: boolean; mode: string; bucket: string; query: string;
  buckets: { id: "7" | "15" | "30"; label: string; note: string; n: number }[];
  setBucket: (b: "7" | "15" | "30") => void; onOpen: (r: Lead) => void;
}) {
  const recent = mode === "recent";
  return (
    <div style={{ padding: "18px clamp(16px, 3vw, 26px) 30px" }}>
      <div className="card" style={{ padding: "18px 18px 6px" }}>
        <h3 className="h3" style={{ margin: "0 0 4px", fontSize: 14 }}>
          {searching ? `ผลค้นหา “${query.trim()}”` : recent ? "ลีดใหม่ล่าสุด" : `กำหนดติดตาม — เลยกำหนด ${bucket} วันขึ้นไป`}
        </h3>
        <p style={{ margin: "0 0 14px", fontSize: 11.5, color: "var(--faint)", lineHeight: 1.55 }}>
          {searching
            ? "ค้นหาข้ามทุกแท็บและทุกสถานะ — ชื่อ เบอร์ (พิมพ์แค่เลขท้ายก็ได้) รุ่น จังหวัด โน้ต โปรโมชั่น หรือ Lead ID"
            : recent
              ? "เรียงจากลีดที่เข้ามาล่าสุด กดเพื่อรับและอัปเดตสถานะ"
              : "ดูจากการอัปเดตล่าสุด (last_follow_up / เวลารับลีด) — โทรติดตามแล้วกดบันทึกการโทรซ้ำ เพื่อรีเซ็ตกำหนด"}
        </p>
        {!searching && mode === "stale" && (
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 16 }}>
            {buckets.map((b) => {
              const on = bucket === b.id;
              const tone = b.id === "30" ? "var(--red)" : b.id === "15" ? "var(--amber)" : "var(--blue)";
              return (
                <div key={b.id} role="button" onClick={() => setBucket(b.id)} className="h-line"
                  style={{ display: "flex", alignItems: "baseline", gap: 9, padding: "9px 14px", borderRadius: 10, cursor: "pointer", background: on ? "var(--raised)" : "var(--panel)", border: `1px solid ${on ? tone : "var(--lineSoft)"}` }}>
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--fDisplay)", color: on ? tone : "var(--dim)" }}>{b.label}</span>
                  <span className="mono" style={{ fontSize: 15, fontWeight: 600, color: b.n ? tone : "var(--faint)" }}>{b.n}</span>
                  <span style={{ fontSize: 10.5, color: "var(--faint)" }}>{b.note}</span>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 860 }}>
            <div style={{ display: "grid", gridTemplateColumns: FLAT_COLS, gap: 12, paddingBottom: 9, borderBottom: "1px solid var(--line)", fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--faint)" }}>
              <span>{searching ? "อัปเดตล่าสุด" : recent ? "เข้ามาเมื่อ" : "เงียบไปนาน"}</span>
              <span>ลูกค้า</span><span>รุ่น / ที่อยู่</span><span>สถานะ</span><span>Temp</span><span>เซลส์</span><span>Lead ID</span>
            </div>
            {rows.map((r) => {
              const st = stageOf(r), t = tempOf(r), k = daysSince(r), place = placeOf(r);
              return (
                <div key={r.lead_id} onClick={() => onOpen(r)} className="h-row"
                  style={{ display: "grid", gridTemplateColumns: FLAT_COLS, gap: 12, alignItems: "center", padding: "11px 0", borderBottom: "1px solid var(--lineSoft)", cursor: "pointer" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span className="mono" style={{ fontSize: 12, color: k == null ? "var(--faint)" : k >= 30 ? "#BE3A2B" : k >= 14 ? "#B36A00" : "var(--dim)" }}>{ageLabel(k)}</span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>{createdLabel(r)}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: r.customer_name ? "var(--text)" : "var(--faint)" }}>{nameOf(r)}</span>
                    <span className="mono" style={{ fontSize: 11.5, color: "var(--dim)" }}>{r.phone_number || "-"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                    <span style={{ fontSize: 12.5, color: "var(--dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.interested_model || "—"}</span>
                    <span style={{ fontSize: 10.5, color: "var(--faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{[place ? "📍 " + place : "", r.source].filter(Boolean).join(" · ") || "—"}</span>
                  </div>
                  <span style={{ justifySelf: "start", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: st.color + "1F", color: st.color, whiteSpace: "nowrap" }}>{st.label}</span>
                  <span className="mono" style={{ justifySelf: "start", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 6, background: t ? t.color + "1F" : "rgba(22,32,43,.055)", color: t?.color ?? "#6A7683" }}>{t?.label ?? "—"}</span>
                  <span style={{ fontSize: 11.5, color: "var(--dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.assigned_sales || "ยังไม่มอบหมาย"}</span>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--faint)" }}>{r.lead_id}</span>
                </div>
              );
            })}
            {rows.length === 0 && (
              <p style={{ margin: 0, padding: "26px 0", fontSize: 12.5, color: "var(--faint)", textAlign: "center" }}>
                {searching ? "ไม่พบลีดที่ตรงกับคำค้น — ลองพิมพ์แค่เลขท้ายเบอร์ หรือชื่อบางส่วน" : recent ? "ไม่มีลีดในมุมมองนี้" : "ไม่มีลีดตกค้าง — ทีมติดตามครบทุกรายแล้ว"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Inbox({ rows, stage, setStage, pins, togglePin, onOpen }: {
  rows: Lead[]; stage: string; setStage: (s: string) => void; pins: string[]; togglePin: (id: string) => void; onOpen: (r: Lead) => void;
}) {
  const steps = [{ id: "ALL", label: "ทั้งหมด", color: "var(--text)" }, ...STAGES.filter((s) => s.id !== "LOST")];
  const shown = (stage === "ALL" ? rows : rows.filter((r) => statusOf(r) === stage))
    .slice().sort((a, b) => (b.created_date ? Date.parse(b.created_date) : 0) - (a.created_date ? Date.parse(a.created_date) : 0));

  return (
    <div style={{ padding: "18px clamp(16px, 3vw, 26px) 30px" }}>
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 2, overflowX: "auto", borderBottom: "1px solid var(--lineSoft)", background: "#FAFBFC" }}>
          {steps.map((d, i) => {
            const n = d.id === "ALL" ? rows.length : rows.filter((r) => statusOf(r) === d.id).length;
            const on = stage === d.id;
            return (
              <div key={d.id} role="button" onClick={() => setStage(d.id)} className="h-text"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 16px 11px", cursor: "pointer", whiteSpace: "nowrap", borderBottom: `2px solid ${on ? d.color : "transparent"}`, color: on ? d.color : "var(--dim)", fontWeight: on ? 600 : 400, fontSize: 13 }}>
                <span>{d.label}</span>
                <span className="mono" style={{ fontSize: 10.5, padding: "1px 7px", borderRadius: 999, background: on ? d.color + "1F" : "var(--raised)", color: on ? d.color : "var(--faint)" }}>{n}</span>
                <span className="mono" style={{ fontSize: 9.5, color: "var(--faint)" }}>{i === 0 ? "" : i}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {shown.map((r) => {
            const st = stageOf(r), t = tempOf(r), due = dueState(r.next_follow_up), place = placeOf(r);
            const driven = r.test_drive_done;
            const tags: { text: string; bg: string }[] = [];
            if (t) tags.push({ text: t.label, bg: t.color });
            if (str(r.source)) tags.push({ text: str(r.source), bg: "#2A6C9A" });
            if (place) tags.push({ text: place, bg: "#6B4FBB" });
            if (str(r.purchase_type)) tags.push({ text: str(r.purchase_type), bg: "#0E7A63" });
            if (r.has_trade_in) tags.push({ text: "มีรถเทิร์น", bg: "#B36A00" });
            if (driven) tags.push({ text: "✓ ทดลองขับแล้ว", bg: "#2A6C9A" });
            const price = parseFloat(str(r.vehicle_price || r.budget).replace(/[^0-9.]/g, ""));
            const note = noteOf(r);
            return (
              <div key={r.lead_id} onClick={() => onOpen(r)} className="h-inbox"
                style={{ display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 14, padding: "15px 18px", borderBottom: "1px solid var(--lineSoft)", cursor: "pointer", alignItems: "start", background: driven ? "#EAF3FA" : "transparent" }}>
                <span style={{ width: 40, height: 40, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fDisplay)", fontSize: 15, fontWeight: 700, background: st.color + "1A", color: st.color }}>
                  {initialOf(r.customer_name)}
                </span>
                <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: r.customer_name ? "var(--text)" : "var(--faint)" }}>{nameOf(r)}</span>
                    <span style={{ fontSize: 11.5, color: st.color }}>{st.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px 16px", flexWrap: "wrap", fontSize: 12.5, color: "var(--dim)" }}>
                    <span>{r.assigned_sales || "ยังไม่มอบหมาย"}</span>
                    <span>{modelOf(r) || "ยังไม่ระบุรุ่น"}</span>
                    <span className="mono">{r.phone_number || "-"}</span>
                  </div>
                  {note && <span style={{ fontSize: 12, color: "var(--faint)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "62ch" }}>{note}</span>}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                    {tags.map((g) => (
                      <span key={g.text} style={{ fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: g.bg, color: "#fff" }}>{g.text}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 3 }}>
                    <span className="mono" style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: "-.01em" }}>{price ? price.toLocaleString("en-US") + " THB" : "—"}</span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--faint)" }}>{createdLabel(r)}</span>
                    <span className="mono" style={{ fontSize: 11, color: due?.color ?? "#BE3A2B" }}>{due ? due.text : "ยังไม่ตั้งกำหนด"}</span>
                  </div>
                  <span style={{ paddingTop: 2 }}>
                    <Pin on={pins.includes(r.lead_id)} onClick={(e) => { e.stopPropagation(); togglePin(r.lead_id); }} />
                  </span>
                </div>
              </div>
            );
          })}
          {shown.length === 0 && <p style={{ margin: 0, padding: "40px 18px", textAlign: "center", fontSize: 12.5, color: "var(--faint)" }}>ยังไม่มีลีดในขั้นนี้</p>}
        </div>
      </div>
    </div>
  );
}
