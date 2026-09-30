"use client";

import { PALETTE, STAGES, TEMP_DEFS } from "@/lib/constants";
import { dueState } from "@/lib/dates";
import {
  dailyStats, funnel, initialOf, isOverdue, makePie, noteOf, salesList, statusOf, STATUS_PIE_DEFS, str, tempKey,
  tempOf, testDriveStats,
} from "@/lib/metrics";
import type { Lead } from "@/lib/types";
import { DailyLeadsCard, PieChart, TestDriveCard } from "./Charts";
import type { BoardUi } from "./BoardView";

export default function DashboardView({ rows, ui, setUi, onOpen }: {
  rows: Lead[]; ui: BoardUi; setUi: (p: Partial<BoardUi>) => void; onOpen: (r: Lead) => void;
}) {
  const sales = salesList(rows);
  const won = rows.filter((r) => statusOf(r) === "WON").length;
  const lost = rows.filter((r) => statusOf(r) === "LOST").length;
  const rate = won + lost ? Math.round((won / (won + lost)) * 100) : 0;
  const resp = rows.map((r) => parseFloat(str(r.response_minutes))).filter((n) => !isNaN(n)).map(Math.abs);
  const avgResp = resp.length ? Math.round(resp.reduce((a, b) => a + b, 0) / resp.length) : null;

  const stats = [
    { value: rows.length, label: "ลีดทั้งหมด", color: "var(--text)" },
    { value: won, label: "ปิดการขาย", color: "var(--teal)" },
    { value: lost, label: "ยกเลิก", color: "var(--red)" },
    { value: rate + "%", label: "อัตราปิดการขาย", color: "var(--amber)" },
    { value: avgResp == null ? "—" : avgResp, label: "นาที — ตอบกลับเฉลี่ย", color: "var(--blue)" },
  ];

  const owners = sales.map((s, i) => ({ key: s.key, name: s.name, color: PALETTE[i % PALETTE.length] }));
  if (rows.some((r) => !str(r.assigned_sales))) owners.push({ key: "", name: "ยังไม่มอบหมาย", color: "#6A7683" });

  const queue = rows
    .map((r) => ({ r, d: dueState(r.next_follow_up) }))
    .filter((x): x is { r: Lead; d: NonNullable<typeof x.d> } => !!x.d && x.d.diff <= 1)
    .sort((a, b) => a.d.diff - b.d.diff);

  const cols = `1.4fr repeat(${STAGES.length + 1}, minmax(58px, 1fr))`;

  return (
    <div style={{ padding: "18px clamp(16px, 3vw, 26px) 30px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(158px, 1fr))", gap: 12, marginBottom: 20 }}>
        {stats.map((s) => (
          <div key={s.label} className="card" style={{ padding: 16 }}>
            <div className="mono" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <DailyLeadsCard full title="ลีดเข้าใหม่รายวัน" source="leads · " stats={dailyStats(rows, ui.daySpan)} span={ui.daySpan} onSpan={(n) => setUi({ daySpan: n })} />

      <Panel title="Lead Temperature — ความร้อนแรงของลีด">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {TEMP_DEFS.map((t) => {
            const mine = rows.filter((r) => tempKey(r) === t.id);
            const w = rows.length ? Math.round((mine.length / rows.length) * 100) : 0;
            const wonN = mine.filter((r) => statusOf(r) === "WON").length;
            const overdueN = mine.filter(isOverdue).length;
            return (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "148px 1fr 62px", alignItems: "center", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: t.color, flex: "none" }} />
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: t.color }}>{t.label}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
                  <div style={{ background: "var(--bg)", borderRadius: 7, height: 22, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 7, width: Math.max(w, 2) + "%", background: t.color, display: "flex", alignItems: "center", paddingLeft: 9 }}>
                      <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{mine.length}</span>
                    </div>
                  </div>
                  <div className="mono" style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--faint)" }}>
                    <span>ปิดได้ {wonN}</span>
                    <span style={{ color: overdueN ? "var(--red)" : "var(--faint)" }}>เลยกำหนด {overdueN}</span>
                  </div>
                </div>
                <span className="mono" style={{ textAlign: "right", fontSize: 12.5, color: "var(--dim)" }}>{w}%</span>
              </div>
            );
          })}
        </div>
      </Panel>

      <TestDriveCard full stats={testDriveStats(rows, ui.tdSpan)} span={ui.tdSpan} onSpan={(n) => setUi({ tdSpan: n })} />

      <Panel title="Conversion แต่ละขั้น">
        {funnel(rows).map((f) => (
          <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 11 }}>
            <span style={{ width: 110, fontSize: 12, flexShrink: 0, fontWeight: 500, color: f.color }}>{f.label}</span>
            <div style={{ flex: 1, background: "var(--bg)", borderRadius: 7, height: 26, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 7, display: "flex", alignItems: "center", paddingLeft: 10, width: f.pct, background: f.color }}>
                <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>{f.count}</span>
              </div>
            </div>
            <span className="mono" style={{ width: 96, textAlign: "right", fontSize: 11.5, color: "var(--faint)", flexShrink: 0 }}>{f.conv}</span>
          </div>
        ))}
        <p style={{ fontSize: 11.5, color: "var(--faint)", margin: "16px 0 0", lineHeight: 1.6 }}>
          นับแบบสะสม — ลีดที่ไปถึงขั้นนี้หรือไกลกว่า ไม่รวมลีดที่ยกเลิก · เปอร์เซ็นต์คือสัดส่วนที่ผ่านมาจากขั้นก่อนหน้า
        </p>
      </Panel>

      <Panel title="สรุปตามเซลล์">
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
          {owners.map((o) => {
            const mine = rows.filter((r) => str(r.assigned_sales) === o.key);
            const wonN = mine.filter((r) => statusOf(r) === "WON").length;
            const overdueN = mine.filter(isOverdue).length;
            return (
              <div key={o.key || "none"} style={{ background: "var(--panel2)", border: "1px solid var(--lineSoft)", borderRadius: 12, padding: 16, display: "grid", gridTemplateColumns: "150px 1fr", gap: 18, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fDisplay)", flex: "none", background: o.color + "22", color: o.color }}>{initialOf(o.name)}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--fDisplay)" }}>{o.name}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--dim)" }}>{mine.length} ลีด</div>
                    <div style={{ fontSize: 10.5, color: overdueN ? "var(--red)" : "var(--faint)" }}>ปิดได้ {wonN} · เลยกำหนด {overdueN}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(268px, 1fr))", gap: 20 }}>
                  <PieChart compact size={92} pie={makePie(mine, "Lead Status", STATUS_PIE_DEFS, statusOf)} />
                  <PieChart compact size={92} pie={makePie(mine, "Lead Temperature", TEMP_DEFS.map((t) => ({ id: t.id, label: t.id === "NONE" ? "ยังไม่ประเมิน" : t.id, color: t.color })), tempKey)} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="eyebrow" style={{ fontWeight: 600, margin: "0 0 10px" }}>ตารางจำนวนรายขั้น</p>
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 720, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "grid", gridTemplateColumns: cols, paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>
              <Head label="เซลล์" color="var(--faint)" align="left" />
              {STAGES.map((s) => <Head key={s.id} label={s.label} color={s.color} align="right" />)}
              <Head label="รวม" color="var(--amber)" align="right" />
            </div>
            {owners.map((o) => {
              const mine = rows.filter((r) => str(r.assigned_sales) === o.key);
              return (
                <div key={o.key || "none"} className="h-row" style={{ display: "grid", gridTemplateColumns: cols, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--lineSoft)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px", fontSize: 12.5 }}>
                    <span style={{ width: 24, height: 24, borderRadius: 7, fontSize: 10.5, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fDisplay)", flexShrink: 0, background: o.color + "22", color: o.color }}>{initialOf(o.name)}</span>
                    <span>{o.name}</span>
                  </div>
                  {STAGES.map((s) => {
                    const n = mine.filter((r) => statusOf(r) === s.id).length;
                    return <Cell key={s.id} value={n} color={n ? "var(--dim)" : "var(--faint)"} />;
                  })}
                  <Cell value={mine.length} color="var(--amber)" />
                </div>
              );
            })}
          </div>
        </div>
      </Panel>

      <Panel title="คิวติดตาม">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {queue.map(({ r, d }) => {
            const t = tempOf(r);
            return (
              <div key={r.lead_id} onClick={() => onOpen(r)} className="h-row"
                style={{ display: "grid", gridTemplateColumns: "128px 76px 1.1fr 1fr 2fr", gap: 14, alignItems: "baseline", padding: "11px 0", borderBottom: "1px solid var(--lineSoft)", cursor: "pointer" }}>
                <span className="mono" style={{ fontSize: 11.5, color: d.color }}>{d.text}</span>
                <span className="mono" style={{ justifySelf: "start", fontSize: 10, fontWeight: 600, letterSpacing: ".03em", padding: "2px 7px", borderRadius: 6, background: t ? t.color + "1F" : "rgba(22,32,43,.055)", color: t?.color ?? "#6A7683" }}>{t?.label ?? "—"}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{r.customer_name || "ยังไม่ทราบชื่อ"}</span>
                <span className="mono" style={{ fontSize: 12, color: "var(--dim)" }}>{r.phone_number || "-"}</span>
                <span style={{ fontSize: 12, color: "var(--faint)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{noteOf(r) || "—"}</span>
              </div>
            );
          })}
          {queue.length === 0 && <p style={{ margin: 0, fontSize: 12, color: "var(--faint)", padding: "16px 0" }}>ไม่มีลีดที่ถึงกำหนดติดตาม</p>}
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 20, marginBottom: 18 }}>
      <h3 className="h3" style={{ margin: "0 0 18px", fontSize: 14 }}>{title}</h3>
      {children}
    </div>
  );
}

const Head = ({ label, color, align }: { label: string; color: string; align: "left" | "right" }) => (
  <div style={{ fontSize: 11.5, color, padding: "0 8px", textAlign: align, whiteSpace: "nowrap" }}>{label}</div>
);
const Cell = ({ value, color }: { value: number; color: string }) => (
  <div className="mono" style={{ padding: "0 8px", textAlign: "right", fontSize: 12, color }}>{value}</div>
);
