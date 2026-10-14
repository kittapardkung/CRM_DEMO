'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CHAPTERS, SCENE_STARTS, allAuthentic3D, sceneAt, type VehicleSlug } from '@/lib/showroom/config';
import type { ShowroomData } from '@/lib/showroom/data';
import type { Interaction } from './ShowroomCanvas';
import MobileShowroomFallback, { ContactButtons } from './MobileShowroomFallback';
import { ArticleModal, VideoModal } from './ShowroomModals';
import { LeaseFacts } from './parts';

// One persistent canvas, loaded only on the client and only when the device is up to it.
const ShowroomCanvas = dynamic(() => import('./ShowroomCanvas'), { ssr: false });
const LoadingBadge = dynamic(() => import('./ShowroomCanvas').then((m) => m.LoadingBadge), { ssr: false });

let webglOk: boolean | null = null;
function detect(): 'static' | '3d' {
  const q = new URLSearchParams(location.search).get('mode');
  if (q === 'static' || q === '3d') return q;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'static';
  const nav = navigator as Navigator & { deviceMemory?: number };
  if ((nav.deviceMemory ?? 8) <= 2 || (nav.hardwareConcurrency ?? 8) <= 2) return 'static';
  if (webglOk === null) {
    try {
      const c = document.createElement('canvas');
      webglOk = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      webglOk = false;
    }
  }
  return webglOk ? '3d' : 'static';
}
const noopSubscribe = () => () => {};

export default function ShowroomExperience({ data }: { data: ShowroomData }) {
  // Server + first paint render the static, indexable version; capable devices then upgrade to 3D.
  const capable = useSyncExternalStore(noopSubscribe, detect, () => 'static' as const);
  const [lost, setLost] = useState(false);
  if (capable === 'static' || lost) return <MobileShowroomFallback data={data} />;
  return <Stage data={data} onLost={() => setLost(true)} />;
}

function Stage({ data, onLost }: { data: ShowroomData; onLost: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const interaction = useRef<Interaction>({ progress: 0, yaw: 0, zoom: 1 });
  const [scene, setScene] = useState(0);
  const [inView, setInView] = useState(true);
  const [selected, setSelected] = useState<VehicleSlug | null>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const [article, setArticle] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const modalOpen = article !== null || video !== null;
  const frozen = useRef(false);
  useEffect(() => {
    frozen.current = modalOpen;
  }, [modalOpen]);

  // Scroll drives the timeline; a modal freezes it so the scene doesn't move underneath.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = box.current;
      if (!el || frozen.current) return;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / span));
      interaction.current.progress = p;
      const sc = sceneAt(p);
      setScene((cur) => (cur === sc ? cur : sc));
      if (sc !== 1) setSelected((cur) => (cur ? null : cur));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    if (box.current) io.observe(box.current);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const select = useCallback((s: VehicleSlug | null) => {
    interaction.current.yaw = 0;
    interaction.current.zoom = 1;
    setColorIndex(0);
    setSelected(s);
  }, []);

  const goTo = (i: number) => {
    const el = box.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + SCENE_STARTS[i] * span + (i > 0 ? 4 : 0), behavior: 'smooth' });
  };

  // Drag-to-rotate: while a model is selected this layer owns the gesture (touch-action: none),
  // so dragging turns the car instead of scrolling the page; releasing restores normal scrolling.
  const drag = useRef<{ x: number } | null>(null);
  const dragging = selected !== null && scene === 1;
  const sel = data.vehicles.find((v) => v.slug === selected) ?? null;
  const zoom = (d: number) => {
    interaction.current.zoom = Math.min(1.5, Math.max(0.8, interaction.current.zoom + d));
  };
  const a = data.articles.find((x) => x.slug === article) ?? null;
  const placeholder = !allAuthentic3D();

  return (
    <div ref={box} style={{ height: '760vh', position: 'relative' }}>
      <div className="sr-stage">
        <ShowroomCanvas
          vehicles={data.vehicles}
          articles={data.articles}
          logo={data.logo}
          scene={scene}
          selected={selected}
          colorIndex={colorIndex}
          paused={modalOpen || !inView}
          interaction={interaction}
          onSelect={(s) => scene === 1 && select(s)}
          onArticle={setArticle}
          onWheel={() => setVideo(data.videos[0]?.id ?? null)}
          onLost={onLost}
        />
        <LoadingBadge />

        {dragging ? (
          <div
            className="sr-drag"
            aria-hidden
            onPointerDown={(e) => {
              drag.current = { x: e.clientX };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              interaction.current.yaw += (e.clientX - drag.current.x) * 0.01;
              drag.current.x = e.clientX;
            }}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
          />
        ) : null}

        {placeholder ? (
          <p className="sr-badge">ต้นแบบ: ใช้ภาพถ่ายจริงบนการ์ด ยังไม่ใช่โมเดล 3D — รอไฟล์ GLB ที่ตรวจสอบแล้ว</p>
        ) : null}

        <div className="sr-copy">
          {CHAPTERS.map((c, i) => {
            const Heading = i === 0 ? 'h1' : 'h2';
            const dark = i === 5;
            return (
              <section key={c.id} className="sr-chapter" data-active={scene === i} inert={scene !== i} aria-label={c.title}>
                <p className="kicker" style={{ margin: '0 0 6px', color: 'var(--wl-lime)', letterSpacing: '0.22em' }}>{c.kicker}</p>
                <Heading style={{ margin: '0 0 var(--space-2)', color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px,4.4vw,56px)', lineHeight: 1.1 }}>{c.title}</Heading>
                <p style={{ margin: '0 0 var(--space-4)', color: 'rgba(255,255,255,0.82)', maxWidth: '52ch', fontSize: 'clamp(15px,1.6vw,18px)' }}>{c.sub}</p>

                {i === 0 ? (
                  <div className="sr-row">
                    <Link href="/models" className="btn btn-primary">ดูรถทั้งหมด</Link>
                    <Link href="/test-drive" className="btn btn-on-dark">ทดลองขับ</Link>
                  </div>
                ) : null}

                {i === 1 ? (
                  <>
                    <div className="sr-row" role="group" aria-label="เลือกรุ่นรถ">
                      {data.vehicles.map((v) => (
                        <button key={v.slug} type="button" className="sr-pill" aria-pressed={selected === v.slug} onClick={() => select(selected === v.slug ? null : v.slug)}>
                          {v.label}
                        </button>
                      ))}
                    </div>
                    {sel ? (
                      <div className="sr-panel">
                        <h3 style={{ margin: '0 0 4px', color: '#fff', fontSize: 20 }}>{sel.name}</h3>
                        <p style={{ margin: '0 0 4px', color: 'rgba(255,255,255,0.8)' }}>{sel.tagline}</p>
                        <p style={{ margin: '0 0 var(--space-3)', color: 'var(--wl-lime)', fontWeight: 600 }}>{sel.price}</p>
                        {sel.colors.length > 1 ? (
                          <div className="sr-row" role="group" aria-label="เลือกสี" style={{ marginBottom: 'var(--space-3)' }}>
                            {sel.colors.map((c, k) => (
                              <button key={c.name} type="button" className="sr-swatch" aria-pressed={k === colorIndex} aria-label={c.name} title={c.name} style={{ background: c.code }} onClick={() => setColorIndex(k)} />
                            ))}
                          </div>
                        ) : null}
                        <div className="sr-row">
                          <Link href={`/models/${sel.slug}`} className="btn btn-primary">ดูรายละเอียด</Link>
                          <Link href={`/test-drive?model=${encodeURIComponent(sel.name)}`} className="btn btn-on-dark">ทดลองขับ</Link>
                          <button type="button" className="sr-pill" onClick={() => zoom(-0.2)} aria-label="ซูมออก">−</button>
                          <button type="button" className="sr-pill" onClick={() => zoom(0.2)} aria-label="ซูมเข้า">+</button>
                          <button type="button" className="sr-pill" onClick={() => select(null)}>← กลับสู่ไลน์อัป</button>
                        </div>
                        <p style={{ margin: 'var(--space-2) 0 0', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>ลากบนฉากเพื่อหมุนดูรถ</p>
                      </div>
                    ) : null}
                  </>
                ) : null}

                {i === 2 ? (
                  <>
                    <LeaseFacts dark />
                    <div className="sr-row" style={{ marginTop: 'var(--space-4)' }}>
                      <Link href="/lease#lease-form" className="btn btn-primary">ขอใบเสนอราคาเช่ารถ</Link>
                      <Link href="/lease" className="btn btn-on-dark">ดูรายละเอียด Operating Lease</Link>
                    </div>
                  </>
                ) : null}

                {i === 3 ? (
                  <ul className="sr-links">
                    {data.articles.map((x) => (
                      <li key={x.slug}>
                        <button type="button" onClick={() => setArticle(x.slug)}>{x.title}</button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {i === 4 ? (
                  <ul className="sr-links">
                    {data.videos.map((v) => (
                      <li key={v.id}>
                        <button type="button" onClick={() => setVideo(v.id)}>▶ {v.title}</button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {dark ? <ContactButtons data={data} /> : null}
              </section>
            );
          })}
        </div>

        <nav className="sr-dots" aria-label="บทของโชว์รูม">
          {CHAPTERS.map((c, i) => (
            <button key={c.id} type="button" aria-label={`ไปที่ ${c.title}`} aria-current={scene === i} onClick={() => goTo(i)} />
          ))}
        </nav>
        {scene === 0 ? <p className="sr-scroll">เลื่อนเพื่อสำรวจ ↓</p> : null}
      </div>

      {a ? <ArticleModal article={a} onClose={() => setArticle(null)} /> : null}
      {video ? <VideoModal videos={data.videos} activeId={video} onSelect={setVideo} onClose={() => setVideo(null)} /> : null}
    </div>
  );
}
