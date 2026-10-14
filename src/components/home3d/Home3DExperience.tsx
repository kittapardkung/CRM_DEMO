'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { detect3D } from '@/lib/detect3d';

const Home3DCanvas = dynamic(() => import('./Home3DCanvas'), { ssr: false });

export interface Home3DData {
  logo: string | null;
  phoneDisplay: string;
  phoneHref: string;
  lineUrl: string;
  hours: string;
  address: string;
  mapsUrl: string;
  colors: { name: string; code: string }[];
  services: { title: string; body: string }[];
}

const CHAPTERS = [
  { id: 'city', kicker: 'ตัวแทนจำหน่ายวู่หลิงอย่างเป็นทางการ · ชลบุรี ระยอง ฉะเชิงเทรา', title: 'Find Your WULING', sub: 'รถยนต์ไฟฟ้าที่ตอบโจทย์ทุกการเดินทาง และทุกธุรกิจ', start: 0 },
  { id: 'models', kicker: 'Model Lineup', title: 'เลือกรุ่นที่ใช่สำหรับคุณ', sub: 'PORTA EV · DARION EV · BINGUO · EKXION', start: 0.26 },
  { id: 'service', kicker: 'Service', title: 'ศูนย์บริการ WULING CHONBURI', sub: 'งานเช็กระยะ ซ่อมบำรุง อะไหล่แท้ และการดูแลระบบไฟฟ้าแรงสูงโดยช่างที่ผ่านการอบรม', start: 0.54 },
  { id: 'contact', kicker: 'WULING CHONBURI', title: 'พบกับรถยนต์ไฟฟ้า WULING ที่ชลบุรี', sub: 'พร้อมให้คำปรึกษา ทดลองขับ และเสนอราคาที่เหมาะกับคุณ', start: 0.8 },
] as const;

const noop = () => () => {};

export default function Home3DExperience({ data }: { data: Home3DData }) {
  const capable = useSyncExternalStore(noop, detect3D, () => 'static' as const);
  const [lost, setLost] = useState(false);
  if (capable === 'static' || lost) return <StaticHome data={data} />;
  return <Stage data={data} onLost={() => setLost(true)} />;
}

function Cta({ chapter, data }: { chapter: number; data: Home3DData }) {
  if (chapter === 0)
    return (
      <div className="sr-row">
        <Link href="/models" className="btn btn-primary">ดูรถทั้งหมด</Link>
        <Link href="/test-drive" className="btn btn-on-dark">ทดลองขับ</Link>
      </div>
    );
  if (chapter === 1)
    return (
      <div className="sr-row">
        <Link href="/models" className="btn btn-primary">ดูรถทุกรุ่น</Link>
        <Link href="/compare" className="btn btn-on-dark">เปรียบเทียบรุ่น</Link>
        <Link href="/lease" className="btn btn-on-dark">Operating Lease</Link>
      </div>
    );
  if (chapter === 2)
    return (
      <>
        <ul style={{ margin: '0 0 var(--space-4)', paddingLeft: '1.1em', color: 'rgba(255,255,255,0.85)', display: 'grid', gap: 4 }}>
          {data.services.map((s) => (
            <li key={s.title}>{s.title}</li>
          ))}
        </ul>
        <div className="sr-row">
          <a href={data.phoneHref} className="btn btn-primary">นัดเข้าศูนย์บริการ {data.phoneDisplay}</a>
          <Link href="/service" className="btn btn-on-dark">ดูรายละเอียดบริการ</Link>
          <a href={data.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-on-dark">นำทางมาที่ศูนย์</a>
        </div>
        <p style={{ margin: 'var(--space-2) 0 0', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{data.hours}</p>
      </>
    );
  return (
    <div className="sr-row">
      <a href={data.lineUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">คุยกับฝ่ายขาย</a>
      <a href={data.phoneHref} className="btn btn-on-dark">โทรหาเรา {data.phoneDisplay}</a>
      <Link href="/test-drive" className="btn btn-on-dark">นัดทดลองขับ</Link>
      <Link href="/models" className="btn btn-on-dark">ดูรถทุกรุ่น</Link>
    </div>
  );
}

function Stage({ data, onLost }: { data: Home3DData; onLost: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [chapter, setChapter] = useState(0);
  const [inView, setInView] = useState(true);
  const [color, setColor] = useState(data.colors[0]?.code ?? '#d8d6d0');

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = box.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      progress.current = p;
      let c = 0;
      CHAPTERS.forEach((ch, i) => {
        if (p >= ch.start) c = i;
      });
      setChapter((cur) => (cur === c ? cur : c));
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

  const goTo = (i: number) => {
    const el = box.current;
    if (!el) return;
    window.scrollTo({ top: el.offsetTop + CHAPTERS[i].start * (el.offsetHeight - window.innerHeight) + (i ? 4 : 0), behavior: 'smooth' });
  };

  return (
    <div ref={box} style={{ height: '520vh', position: 'relative' }}>
      <div className="sr-stage" style={{ background: '#0a1a38' }}>
        <Home3DCanvas progress={progress} color={color} paused={!inView} logo={data.logo} onLost={onLost} />
        <p className="sr-badge">ต้นแบบ: รถจำลองที่สร้างด้วยโค้ด ไม่ใช่รูปทรงจริงของ WULING</p>

        <div className="sr-copy">
          {CHAPTERS.map((c, i) => {
            const H = i === 0 ? 'h1' : 'h2';
            return (
              <section key={c.id} className="sr-chapter" data-active={chapter === i} inert={chapter !== i} aria-label={c.title}>
                <p className="kicker" style={{ margin: '0 0 6px', color: 'var(--wl-lime)', letterSpacing: '0.22em' }}>{c.kicker}</p>
                <H style={{ margin: '0 0 var(--space-2)', color: '#fff', fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px,4.4vw,56px)', lineHeight: 1.1 }}>{c.title}</H>
                <p style={{ margin: '0 0 var(--space-4)', color: 'rgba(255,255,255,0.82)', maxWidth: '56ch', fontSize: 'clamp(15px,1.6vw,18px)' }}>{c.sub}</p>
                <Cta chapter={i} data={data} />
              </section>
            );
          })}
        </div>

        <div className="sr-colors" role="group" aria-label="สีรถตัวอย่าง">
          {data.colors.map((c) => (
            <button key={c.name} type="button" className="sr-swatch" aria-pressed={color === c.code} aria-label={c.name} title={c.name} style={{ background: c.code }} onClick={() => setColor(c.code)} />
          ))}
        </div>

        <nav className="sr-dots" aria-label="บทของหน้าแรก">
          {CHAPTERS.map((c, i) => (
            <button key={c.id} type="button" aria-label={`ไปที่ ${c.title}`} aria-current={chapter === i} onClick={() => goTo(i)} />
          ))}
        </nav>
        {chapter === 0 ? <p className="sr-scroll">เลื่อนเพื่อสำรวจ ↓</p> : null}
      </div>
    </div>
  );
}

/** No-WebGL / reduced-motion fallback: the same four chapters as plain, indexable sections. */
function StaticHome({ data }: { data: Home3DData }) {
  return (
    <div className="wrap" style={{ display: 'grid', gap: 'var(--space-8)', padding: 'var(--space-6) 0 var(--space-8)' }}>
      {CHAPTERS.map((c, i) => {
        const H = i === 0 ? 'h1' : 'h2';
        return (
          <section key={c.id} style={{ background: 'var(--wl-ink)', borderRadius: 'var(--radius-lg)', padding: 'clamp(24px,5vw,48px)' }}>
            <p className="kicker" style={{ color: 'var(--wl-lime)' }}>{c.kicker}</p>
            <H style={{ color: '#fff', margin: '0 0 var(--space-2)' }}>{c.title}</H>
            <p style={{ color: 'rgba(255,255,255,0.82)', margin: '0 0 var(--space-4)' }}>{c.sub}</p>
            <Cta chapter={i} data={data} />
          </section>
        );
      })}
    </div>
  );
}
