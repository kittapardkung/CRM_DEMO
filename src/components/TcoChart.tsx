'use client';

import { useMemo, useRef, useState } from 'react';

/**
 * Total-cost-of-ownership line chart: two straight lines (cost grows
 * linearly with distance driven) — WULING EV starting at its price, the
 * fuel car starting at its price — showing where the EV's lower running
 * cost overtakes its higher (or lower) sticker price. Colors are the
 * site's own navy (EV) vs. a warm orange (fuel) — a blue/orange pair reads
 * as a safe, distinct pairing for colorblind viewers, and both series carry
 * a direct label + legend swatch so identity never rides on hue alone.
 */

const VB_W = 640;
const VB_H = 280;
const PAD_L = 64;
const PAD_R = 16;
const PAD_T = 20;
const PAD_B = 34;

const EV_COLOR = '#1b3a6b';
const FUEL_COLOR = '#c2410c';

function shortBaht(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1) + 'M';
  if (abs >= 1_000) return Math.round(n / 1000) + 'K';
  return Math.round(n).toString();
}

function baht(n: number): string {
  return '฿' + Math.round(n).toLocaleString('en-US');
}

export default function TcoChart({
  evLabel,
  evPrice,
  evMonthlyCost,
  fuelLabel,
  fuelPrice,
  fuelMonthlyCost,
  years,
  breakevenMonths,
}: {
  evLabel: string;
  evPrice: number;
  evMonthlyCost: number;
  fuelLabel: string;
  fuelPrice: number;
  fuelMonthlyCost: number;
  years: number;
  breakevenMonths: number | null;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverMonth, setHoverMonth] = useState<number | null>(null);

  const chart = useMemo(() => {
    const xMax = Math.min(96, Math.max(12, years * 12, breakevenMonths ? Math.ceil(breakevenMonths * 1.2) : 0));
    const valueAt = (price: number, monthlyCost: number, m: number) => price + m * monthlyCost;
    const evEnd = valueAt(evPrice, evMonthlyCost, xMax);
    const fuelEnd = valueAt(fuelPrice, fuelMonthlyCost, xMax);
    const values = [evPrice, fuelPrice, evEnd, fuelEnd];
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const span = rawMax - rawMin || 1;
    const minY = Math.max(0, rawMin - span * 0.08);
    const maxY = rawMax + span * 0.08;

    const scaleX = (m: number) => PAD_L + (m / xMax) * (VB_W - PAD_L - PAD_R);
    const scaleY = (v: number) => VB_H - PAD_B - ((v - minY) / (maxY - minY)) * (VB_H - PAD_T - PAD_B);

    return { xMax, valueAt, evEnd, fuelEnd, minY, maxY, scaleX, scaleY };
  }, [evPrice, evMonthlyCost, fuelPrice, fuelMonthlyCost, years, breakevenMonths]);

  const { xMax, valueAt, evEnd, fuelEnd, minY, maxY, scaleX, scaleY } = chart;
  const showBreakeven = breakevenMonths !== null && breakevenMonths >= 0 && breakevenMonths <= xMax;

  function updateHover(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * VB_W;
    const m = ((relX - PAD_L) / (VB_W - PAD_L - PAD_R)) * xMax;
    setHoverMonth(Math.min(xMax, Math.max(0, m)));
  }

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    updateHover(e.clientX);
  }

  function onTouch(e: React.TouchEvent<SVGSVGElement>) {
    const touch = e.touches[0];
    if (touch) updateHover(touch.clientX);
  }

  const gridValues = [minY, minY + (maxY - minY) / 2, maxY];
  const xTicks = [0, Math.round(xMax / 2), xMax];

  const hoverEv = hoverMonth !== null ? valueAt(evPrice, evMonthlyCost, hoverMonth) : null;
  const hoverFuel = hoverMonth !== null ? valueAt(fuelPrice, fuelMonthlyCost, hoverMonth) : null;

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-2)', fontSize: 13 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: EV_COLOR, display: 'inline-block' }} />
          {evLabel}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: FUEL_COLOR, display: 'inline-block' }} />
          {fuelLabel}
        </span>
      </div>

      {/*
        On a narrow phone, an SVG scaled to 100% width shrinks every font
        size in it proportionally — a 640px-wide chart squeezed into a
        340px screen makes 11px labels render at ~6px, unreadable. Instead
        the SVG keeps a real minimum pixel width and this wrapper scrolls
        horizontally on anything narrower, so text stays full-size and the
        chart pans instead of shrinking into illegibility.
      */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          style={{ width: '100%', minWidth: 480, height: 'auto', aspectRatio: `${VB_W} / ${VB_H}`, display: 'block', touchAction: 'pan-y' }}
          onMouseMove={onMove}
          onMouseLeave={() => setHoverMonth(null)}
          onTouchStart={onTouch}
          onTouchMove={onTouch}
          onTouchEnd={() => setHoverMonth(null)}
          role="img"
          aria-label={`กราฟเปรียบเทียบต้นทุนรวมสะสมระหว่าง ${evLabel} กับ ${fuelLabel} ตลอด ${Math.round(xMax / 12)} ปี`}
        >
        {gridValues.map((v, i) => (
          <g key={i}>
            <line x1={PAD_L} x2={VB_W - PAD_R} y1={scaleY(v)} y2={scaleY(v)} stroke="var(--color-divider)" strokeWidth={1} />
            <text x={PAD_L - 8} y={scaleY(v)} textAnchor="end" dominantBaseline="middle" fontSize={13} fill="var(--color-neutral-600)">
              {shortBaht(v)}
            </text>
          </g>
        ))}

        {xTicks.map((m) => (
          <text key={m} x={scaleX(m)} y={VB_H - 8} textAnchor="middle" fontSize={13} fill="var(--color-neutral-600)">
            {m} ด.
          </text>
        ))}

        <line x1={PAD_L} x2={VB_W - PAD_R} y1={VB_H - PAD_B} y2={VB_H - PAD_B} stroke="var(--color-neutral-400)" strokeWidth={1} />

        {showBreakeven && breakevenMonths !== null ? (
          <g>
            <line
              x1={scaleX(breakevenMonths)}
              x2={scaleX(breakevenMonths)}
              y1={PAD_T}
              y2={VB_H - PAD_B}
              stroke="var(--color-neutral-500)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <text x={scaleX(breakevenMonths)} y={PAD_T - 6} textAnchor="middle" fontSize={13} fill="var(--color-neutral-700)">
              จุดคุ้มทุน
            </text>
          </g>
        ) : null}

        <line x1={scaleX(0)} x2={scaleX(xMax)} y1={scaleY(evPrice)} y2={scaleY(evEnd)} stroke={EV_COLOR} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={scaleX(0)} x2={scaleX(xMax)} y1={scaleY(fuelPrice)} y2={scaleY(fuelEnd)} stroke={FUEL_COLOR} strokeWidth={2.5} strokeLinecap="round" />

        <circle cx={scaleX(0)} cy={scaleY(evPrice)} r={4} fill={EV_COLOR} />
        <circle cx={scaleX(xMax)} cy={scaleY(evEnd)} r={4} fill={EV_COLOR} />
        <circle cx={scaleX(0)} cy={scaleY(fuelPrice)} r={4} fill={FUEL_COLOR} />
        <circle cx={scaleX(xMax)} cy={scaleY(fuelEnd)} r={4} fill={FUEL_COLOR} />

        {hoverMonth !== null && hoverEv !== null && hoverFuel !== null ? (
          <g>
            <line x1={scaleX(hoverMonth)} x2={scaleX(hoverMonth)} y1={PAD_T} y2={VB_H - PAD_B} stroke="var(--color-neutral-400)" strokeWidth={1} />
            <circle cx={scaleX(hoverMonth)} cy={scaleY(hoverEv)} r={5} fill="#fff" stroke={EV_COLOR} strokeWidth={2} />
            <circle cx={scaleX(hoverMonth)} cy={scaleY(hoverFuel)} r={5} fill="#fff" stroke={FUEL_COLOR} strokeWidth={2} />
            {(() => {
              const boxW = 168;
              const boxH = 62;
              const nearRight = scaleX(hoverMonth) > VB_W - PAD_R - boxW - 8;
              const bx = nearRight ? scaleX(hoverMonth) - boxW - 10 : scaleX(hoverMonth) + 10;
              const by = PAD_T + 4;
              return (
                <g>
                  <rect x={bx} y={by} width={boxW} height={boxH} rx={8} fill="#fff" stroke="var(--color-neutral-300)" />
                  <text x={bx + 10} y={by + 18} fontSize={13} fill="var(--color-neutral-600)">
                    เดือนที่ {Math.round(hoverMonth)}
                  </text>
                  <text x={bx + 10} y={by + 35} fontSize={13} fill={EV_COLOR} fontWeight={600}>
                    {evLabel.length > 16 ? 'EV' : evLabel}: {baht(hoverEv)}
                  </text>
                  <text x={bx + 10} y={by + 51} fontSize={13} fill={FUEL_COLOR} fontWeight={600}>
                    น้ำมัน: {baht(hoverFuel)}
                  </text>
                </g>
              );
            })()}
          </g>
        ) : null}
        </svg>
      </div>
    </div>
  );
}
