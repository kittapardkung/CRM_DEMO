'use client';

import { CSSProperties, ReactNode, useEffect, useRef } from 'react';

/**
 * Pointer-driven 3D tilt. The wrapper rotates towards the cursor and exposes
 * `--t3d-x` / `--t3d-y` (−1…1) so children using the `.t3d-layer` class can
 * parallax by their own depth (`--z`). Pure CSS 3D — no WebGL, no extra bundle.
 *
 * Disabled for touch-only devices and `prefers-reduced-motion`, where it
 * renders as a plain static wrapper.
 */
export default function Tilt3D({
  children,
  className,
  style,
  max = 9,
  perspective = 1100,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Max rotation in degrees. */
  max?: number;
  perspective?: number;
  glare?: boolean;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stageEl = stage.current;
    const bodyEl = body.current;
    if (!stageEl || !bodyEl) return;
    const ok = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!ok.matches) return;

    let raf = 0;
    const set = (x: number, y: number) => {
      bodyEl.style.setProperty('--t3d-x', x.toFixed(3));
      bodyEl.style.setProperty('--t3d-y', y.toFixed(3));
      bodyEl.style.setProperty('--t3d-rx', `${(-y * max).toFixed(2)}deg`);
      bodyEl.style.setProperty('--t3d-ry', `${(x * max).toFixed(2)}deg`);
    };
    const onMove = (e: PointerEvent) => {
      const r = stageEl.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1;
      const y = ((e.clientY - r.top) / r.height) * 2 - 1;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        bodyEl.dataset.active = 'true';
        set(x, y);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      bodyEl.dataset.active = 'false';
      set(0, 0);
    };
    stageEl.addEventListener('pointermove', onMove);
    stageEl.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      stageEl.removeEventListener('pointermove', onMove);
      stageEl.removeEventListener('pointerleave', onLeave);
    };
  }, [max]);

  return (
    <div ref={stage} className={`t3d-stage ${className ?? ''}`} style={{ perspective, ...style }}>
      <div ref={body} className="t3d-body" data-glare={glare}>
        {children}
      </div>
    </div>
  );
}
