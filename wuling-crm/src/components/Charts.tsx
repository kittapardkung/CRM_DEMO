import { DAY_SPANS } from "@/lib/constants";
import type { dailyStats, makePie, testDriveStats } from "@/lib/metrics";

type Daily = ReturnType<typeof dailyStats>;
type Pie = ReturnType<typeof makePie>;
type TestDrive = ReturnType<typeof testDriveStats>;

export function SpanPicker({ value, onPick }: { value: number; onPick: (n: number) => void }) {
  return (
    <div style={{ marginLeft: "auto", display: "flex", gap: 5, flexWrap: "wrap" }}>
      {DAY_SPANS.map((n) => (
        <div
          key={n} role="button" onClick={() => onPick(n)} className="h-text"
          style={{
            fontSize: 11.5, padding: "5px 12px", borderRadius: 999, cursor: "pointer",
            background: value === n ? "var(--raised)" : "transparent",
            border: `1px solid ${value === n ? "var(--line)" : "var(--lineSoft)"}`,
            color: value === n ? "var(--text)" : "var(--faint)",
          }}
        >
          {n} วัน
        </div>
      ))}
    </div>
  );
}

/** Daily new-leads bar chart. `full` = the dashboard variant with best day / active days. */
export function DailyLeadsCard({ title, source, stats, span, onSpan, full }: {
  title: string; source: string; stats: Daily; span: number; onSpan: (n: number) => void; full?: boolean;
}) {
  const big = full ? 34 : 30, mid = full ? 24 : 22;
  return (
    <div className="card" style={{ padding: full ? 20 : "18px 20px", marginBottom: full ? 18 : 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <h3 className="h3" style={{ fontSize: full ? 14 : 13.5 }}>{title}</h3>
        <span className="eyebrow">{source}{stats.range}</span>
        <SpanPicker value={span} onPick={onSpan} />
      </div>
      <div style={{ display: "flex", gap: full ? 28 : 26, flexWrap: "wrap", marginBottom: full ? 20 : 18, alignItems: "flex-end" }}>
        <div style={{ paddingRight: full ? 28 : 26, borderRight: "1px solid var(--lineSoft)" }}>
          <div className="mono" style={{ fontSize: big, fontWeight: 600, letterSpacing: "-.03em", lineHeight: 1 }}>{stats.total.toLocaleString("en-US")}</div>
          <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 5 }}>ลีดรวมในช่วงนี้</div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 2 }}>ย้อนหลัง {span} วัน · นับจาก created_date</div>
        </div>
        <Stat value={stats.today} label={stats.today || !full ? "เข้าวันนี้" : "วันนี้ยังไม่มีลีดเข้า"} size={mid} color="var(--amber)" />
        <Stat value={stats.avg} label="เฉลี่ยต่อวัน" size={mid} />
        {full && <Stat value={stats.best} label="วันที่ได้มากสุด" size={mid} color="var(--blue)" />}
        {full && <Stat value={`${stats.activeDays}/${stats.days.length}`} label="วันที่มีลีดเข้า" size={mid} />}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: full ? 150 : 132, overflowX: "auto", paddingBottom: 2 }}>
        {stats.bars.map((b, i) => (
          <div key={i} style={{ flex: 1, minWidth: full ? 34 : 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%", justifyContent: "flex-end" }}>
            <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: b.valueColor }}>{b.value}</span>
            <div style={{ width: "100%", borderRadius: "5px 5px 0 0", height: b.height, background: b.color }} />
            <span className="mono" style={{ fontSize: 9.5, color: b.labelColor, whiteSpace: "nowrap" }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ value, label, size, color }: { value: string | number; label: string; size: number; color?: string }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: size, fontWeight: 600, letterSpacing: "-.02em", color }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 3 }}>{label}</div>
    </div>
  );
}

export function TestDriveCard({ stats, span, onSpan, full }: { stats: TestDrive; span: number; onSpan: (n: number) => void; full?: boolean }) {
  return (
    <div className="card" style={{ padding: full ? 20 : "18px 20px", marginBottom: full ? 18 : 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: full ? 18 : 16 }}>
        <h3 className="h3">ทดลองขับแล้ว</h3>
        <span className="mono" style={{ fontSize: full ? 24 : 22, fontWeight: 600, letterSpacing: "-.02em", color: "#2A6C9A" }}>{stats.total}</span>
        <span style={{ fontSize: 11.5, color: "var(--faint)" }}>จาก {stats.all} ราย ({stats.pctAll})</span>
        <SpanPicker value={span} onPick={onSpan} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: full ? 12 : 11 }}>
        {stats.byStatus.map((t) => (
          <div key={t.label} style={{ display: "grid", gridTemplateColumns: full ? "140px 1fr 56px" : "132px 1fr 52px", alignItems: "center", gap: full ? 14 : 12 }}>
            <span style={{ fontSize: full ? 12 : 11.5, fontWeight: 500, color: t.color }}>{t.label}</span>
            <div style={{ background: "var(--bg)", borderRadius: 7, height: full ? 20 : 18, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 7, width: t.pct, background: t.color, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                <span className="mono" style={{ fontSize: 10, fontWeight: 600, color: "#fff" }}>{t.count}</span>
              </div>
            </div>
            <span className="mono" style={{ textAlign: "right", fontSize: 11, color: "var(--dim)" }}>{t.share}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PieChart({ pie, size, compact }: { pie: Pie; size: number; compact?: boolean }) {
  const inset = compact ? 21 : 26;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: compact ? 14 : 18 }}>
      <div style={{ position: "relative", width: size, height: size, borderRadius: "50%", flex: "none", background: pie.gradient }}>
        <div style={{ position: "absolute", inset, borderRadius: "50%", background: compact ? "var(--panel2)" : "var(--panel)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
          <span className="mono" style={{ fontSize: compact ? 16 : 20, fontWeight: 600, lineHeight: 1 }}>{pie.total}</span>
          {!compact && <span style={{ fontSize: 9.5, color: "var(--faint)" }}>ลีด</span>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 4 : 5, minWidth: 0, flex: 1 }}>
        <span className="eyebrow" style={{ fontSize: compact ? 10 : 10.5, fontWeight: 600, marginBottom: compact ? 0 : 2 }}>{pie.title}</span>
        {pie.slices.map((s) => (
          <div key={s.label} style={{ display: "grid", gridTemplateColumns: `${compact ? 9 : 10}px 1fr auto auto`, alignItems: "center", gap: compact ? 7 : 8 }}>
            <span style={{ width: compact ? 7 : 8, height: compact ? 7 : 8, borderRadius: 2, background: s.color }} />
            <span style={{ fontSize: compact ? 11 : 11.5, color: "var(--dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</span>
            <span className="mono" style={{ fontSize: compact ? 11 : 11.5, minWidth: compact ? 44 : 46, textAlign: "right" }}>{s.pct}</span>
            <span className="mono" style={{ fontSize: compact ? 10.5 : 11, color: "var(--faint)", minWidth: compact ? 36 : 40, textAlign: "right" }}>{s.count} ราย</span>
          </div>
        ))}
      </div>
    </div>
  );
}
