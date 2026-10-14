import Image from 'next/image';
import Link from 'next/link';
import { CHAPTERS } from '@/lib/showroom/config';
import type { ShowroomData } from '@/lib/showroom/data';
import { LeaseFacts } from './parts';

/**
 * Lightweight, fully server-rendered version of the six chapters: used while the
 * page loads (so crawlers and no-JS visitors get real content) and for devices
 * that can't or shouldn't run the WebGL scene.
 */
export default function MobileShowroomFallback({ data }: { data: ShowroomData }) {
  return (
    <div className="wrap" style={{ display: 'grid', gap: 'var(--space-8)', padding: 'var(--space-6) 0 var(--space-8)' }}>
      <section aria-labelledby="sr-s0" style={{ background: 'var(--wl-ink)', color: '#fff', borderRadius: 'var(--radius-lg)', padding: 'clamp(24px,5vw,48px)' }}>
        <p className="kicker" style={{ color: 'var(--wl-lime)' }}>{CHAPTERS[0].kicker}</p>
        <h1 id="sr-s0" style={{ color: '#fff', margin: '0 0 var(--space-2)', fontSize: 'clamp(34px,6vw,56px)' }}>{CHAPTERS[0].title}</h1>
        <p style={{ margin: '0 0 var(--space-4)', color: 'rgba(255,255,255,0.8)' }}>{CHAPTERS[0].sub}</p>
        <Link href="/models" className="btn btn-primary">ดูรถทั้งหมด</Link>
      </section>

      <section aria-labelledby="sr-s1">
        <h2 id="sr-s1" style={{ fontSize: 'clamp(24px,3.4vw,34px)' }}>{CHAPTERS[1].title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 'var(--space-4)' }}>
          {data.vehicles.map((v) => (
            <article key={v.slug} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {v.photo ? (
                <div style={{ position: 'relative', aspectRatio: '16 / 11' }}>
                  <Image src={v.photo} alt={v.name} fill sizes="(max-width: 700px) 100vw, 25vw" style={{ objectFit: 'cover' }} />
                </div>
              ) : null}
              <div style={{ padding: 'var(--space-4)' }}>
                <h3 style={{ margin: '0 0 6px' }}>{v.name}</h3>
                <p style={{ margin: '0 0 6px', color: 'var(--color-neutral-800)' }}>{v.tagline}</p>
                <p style={{ margin: '0 0 var(--space-3)', fontWeight: 600 }}>{v.price}</p>
                <Link href={`/models/${v.slug}`} className="btn btn-secondary">ดูรายละเอียด</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="sr-s2">
        <p className="kicker kicker-2">{CHAPTERS[2].kicker}</p>
        <h2 id="sr-s2" style={{ fontSize: 'clamp(24px,3.4vw,34px)' }}>{CHAPTERS[2].title}</h2>
        <p style={{ maxWidth: '56ch' }}>{CHAPTERS[2].sub}</p>
        <LeaseFacts />
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-4)' }}>
          <Link href="/lease#lease-form" className="btn btn-primary">ขอใบเสนอราคาเช่ารถ</Link>
          <Link href="/lease" className="btn btn-secondary">ดูรายละเอียด Operating Lease</Link>
        </div>
      </section>

      <section aria-labelledby="sr-s3">
        <h2 id="sr-s3" style={{ fontSize: 'clamp(24px,3.4vw,34px)' }}>{CHAPTERS[3].title}</h2>
        <ul style={{ display: 'grid', gap: 'var(--space-2)', paddingLeft: '1.1em' }}>
          {data.articles.map((a) => (
            <li key={a.slug}><Link href={`/articles/${a.slug}`}>{a.title}</Link></li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sr-s4">
        <p className="kicker">{CHAPTERS[4].kicker}</p>
        <h2 id="sr-s4" style={{ fontSize: 'clamp(24px,3.4vw,34px)' }}>{CHAPTERS[4].title}</h2>
        <ul style={{ display: 'grid', gap: 'var(--space-2)', paddingLeft: '1.1em' }}>
          {data.videos.map((v) => (
            <li key={v.id}><a href={`https://www.youtube.com/watch?v=${v.youtubeId}`} target="_blank" rel="noopener noreferrer">{v.title}</a></li>
          ))}
        </ul>
        <Link href="/videos">ดูวิดีโอทั้งหมด →</Link>
      </section>

      <section aria-labelledby="sr-s5" style={{ background: 'var(--wl-ink)', color: '#fff', borderRadius: 'var(--radius-lg)', padding: 'clamp(24px,5vw,48px)' }}>
        <p className="kicker" style={{ color: 'var(--wl-lime)' }}>{CHAPTERS[5].kicker}</p>
        <h2 id="sr-s5" style={{ color: '#fff', margin: '0 0 var(--space-2)' }}>{CHAPTERS[5].title}</h2>
        <p style={{ margin: '0 0 var(--space-4)', color: 'rgba(255,255,255,0.8)' }}>{CHAPTERS[5].sub}</p>
        <ContactButtons data={data} />
      </section>
    </div>
  );
}

function ContactButtons({ data }: { data: ShowroomData }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
      <a href={data.dealer.lineUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">คุยกับฝ่ายขาย</a>
      <a href={data.dealer.phoneHref} className="btn btn-on-dark">โทรหาเรา {data.dealer.phoneDisplay}</a>
      <Link href="/test-drive" className="btn btn-on-dark">นัดทดลองขับ</Link>
      <Link href="/models" className="btn btn-on-dark">ดูรถทุกรุ่น</Link>
    </div>
  );
}
export { ContactButtons };
