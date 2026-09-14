import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import CTASection from '@/components/CTASection';
import VideoEmbed from '@/components/VideoEmbed';
import TikTokEmbed from '@/components/TikTokEmbed';
import { serviceProvinces } from '@/lib/data/dealer';
import { videos } from '@/lib/data/videos';
import { getTiktokThumbnail } from '@/lib/tiktok';

/** Same line-icon convention as PersonaIcon in PortaAccessoryShowcase (viewBox 24, stroke 1.8, round caps). */
function CoverageStepIcon({ icon }: { icon: 'testdrive' | 'delivery' | 'service' }) {
  const common = {
    viewBox: '0 0 24 24',
    width: 24,
    height: 24,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (icon === 'testdrive') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2.4" />
        <path d="M12 5.6v3.9M6.7 15.3l3-1.9M17.3 15.3l-3-1.9" />
      </svg>
    );
  }
  if (icon === 'delivery') {
    return (
      <svg {...common}>
        <path d="M12 21s7-7.4 7-12.4A7 7 0 1 0 5 8.6C5 13.6 12 21 12 21z" />
        <circle cx="12" cy="8.6" r="2.4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6.6 6.6 2.6 2.6 6.6-6.6a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.6-2.6z" />
    </svg>
  );
}

const coverageSteps: { icon: 'testdrive' | 'delivery' | 'service'; title: string; body: ReactNode }[] = [
  {
    icon: 'testdrive',
    title: 'ทดลองขับถึงที่',
    body: 'นัดหมายให้ทีมงานนำรถไปให้ทดลองขับที่บ้านหรือบริษัทของคุณในพื้นที่ให้บริการ',
  },
  {
    icon: 'delivery',
    title: 'ส่งมอบรถถึงหน้างาน',
    body: 'ปิดการขายแล้วนัดรับรถได้ทั้งที่โชว์รูมชลบุรี หรือให้ทีมงานนำรถไปส่งถึงพื้นที่ของคุณ',
  },
  {
    icon: 'service',
    title: 'บริการหลังการขาย',
    body: (
      <>
        เช็กระยะและซ่อมบำรุงที่ศูนย์บริการชลบุรี ดู<Link href="/service" style={{ color: 'inherit' }}>รายละเอียดศูนย์บริการ</Link>
      </>
    ),
  },
];

const testDriveVideoIds = [
  'porta-invite-test-drive',
  'porta-chonburi-rayong-chachoengsao-test-drive',
  'porta-one-day-test-drive',
];
const testDriveVideos = testDriveVideoIds
  .map((id) => videos.find((v) => v.id === id))
  .filter((v) => v?.status === 'produced' && (v.youtubeId || v.tiktokId));

export const metadata: Metadata = {
  title: 'พื้นที่ให้บริการ WULING ชลบุรี ระยอง ฉะเชิงเทรา',
  description: 'ตัวแทนจำหน่ายวู่หลิง (WULING) ให้บริการทดลองขับ ส่งมอบรถถึงที่ และศูนย์บริการครอบคลุม 3 จังหวัด ชลบุรี ระยอง และฉะเชิงเทรา',
  alternates: { canonical: '/areas' },
};

export default async function AreasPage() {
  // Real thumbnails only exist for YouTube out of the box (i.ytimg.com); a
  // TikTok-sourced clip needs an oEmbed lookup to show one before play.
  const tiktokThumbnails = Object.fromEntries(
    await Promise.all(
      testDriveVideos
        .filter((v) => v!.tiktokId)
        .map(async (v) => [v!.tiktokId!, await getTiktokThumbnail(v!.tiktokId!)] as const)
    )
  );

  return (
    <div className="wrap">
      <section style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        <p className="kicker">Coverage Area</p>
        <h1 style={{ fontSize: 'clamp(29px,4vw,45px)', margin: '0 0 var(--space-3)' }}>พื้นที่ให้บริการ</h1>
        <p style={{ margin: 0, maxWidth: '62ch', color: 'var(--color-neutral-800)', fontSize: 16 }}>
          WULING CHONBURI เป็นตัวแทนจำหน่ายวู่หลิงอย่างเป็นทางการ มีโชว์รูมตั้งอยู่ที่จังหวัดชลบุรี
          และให้บริการลูกค้าในพื้นที่ภาคตะวันออกครอบคลุม 3 จังหวัดหลัก ได้แก่ ชลบุรี ระยอง และฉะเชิงเทรา
          ทั้งการทดลองขับ การซื้อขาย และบริการหลังการขาย
        </p>
      </section>

      <section style={{ paddingBottom: 'var(--space-8)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--space-6)' }}>
        {serviceProvinces.map((p) => (
          <article key={p.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>{p.tag}</p>
              <h2 style={{ fontSize: 26, fontWeight: 400, margin: 0 }}>{p.name}</h2>
            </div>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--color-neutral-800)' }}>{p.note}</p>
            {p.districts.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                {p.districts.map((d) => (
                  <span
                    key={d}
                    style={{
                      fontSize: 13,
                      padding: '4px 10px',
                      borderRadius: 999,
                      border: '1px solid var(--color-neutral-300)',
                      color: 'var(--color-neutral-800)',
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </section>

      <section style={{ paddingBottom: 'var(--space-8)' }}>
        <p className="kicker" style={{ margin: '0 0 var(--space-3)' }}>How It Works</p>
        <h2 style={{ fontSize: 'clamp(23px,3vw,32px)', margin: '0 0 var(--space-6)' }}>บริการที่ครอบคลุมทุกพื้นที่</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 'var(--space-6)' }}>
          {coverageSteps.map((s) => (
            <div
              key={s.title}
              style={{
                border: '1px solid var(--color-neutral-300)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                background: 'var(--color-surface)',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-accent-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-accent-700)',
                }}
              >
                <CoverageStepIcon icon={s.icon} />
              </div>
              <div>
                <h3 style={{ fontSize: 19, margin: '0 0 6px' }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: 15, color: 'var(--color-neutral-800)' }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {testDriveVideos.length > 0 ? (
        <section style={{ paddingBottom: 'var(--space-8)' }}>
          <p className="kicker" style={{ margin: '0 0 var(--space-3)' }}>Test Drive</p>
          <h2 style={{ fontSize: 'clamp(23px,3vw,32px)', margin: '0 0 4px' }}>ทดลองขับได้ ไม่ว่าคุณจะอยู่ที่ไหน</h2>
          <p style={{ margin: '0 0 var(--space-6)', fontSize: 15, color: 'var(--color-neutral-800)', maxWidth: '62ch' }}>
            ไม่ต้องเดินทางมาโชว์รูม ทีมงานนำรถไปให้ทดลองขับถึงหน้าบริษัทหรือบ้านของคุณได้ ไม่ว่าจะอยู่ที่ไหนในพื้นที่ให้บริการ
          </p>
          <div className="om-video-grid" style={{ maxWidth: 960 }}>
            {testDriveVideos.map((v) =>
              v!.youtubeId ? (
                <VideoEmbed key={v!.id} title={v!.title} youtubeId={v!.youtubeId} />
              ) : (
                <TikTokEmbed
                  key={v!.id}
                  title={v!.title}
                  tiktokId={v!.tiktokId!}
                  thumbnailUrl={tiktokThumbnails[v!.tiktokId!]}
                />
              )
            )}
          </div>
          <p style={{ margin: 'var(--space-4) 0 0', fontSize: 14 }}>
            <Link href="/videos?topic=testdrive">ดูวิดีโอ Test Drive เพิ่มเติม →</Link>
          </p>
        </section>
      ) : null}

      <section style={{ paddingBottom: 'var(--space-8)' }}>
        <CTASection
          heading="อยู่ในพื้นที่ให้บริการไหม?"
          body={`โทรสอบถามหรือนัดทดลองขับได้เลย ทีมงานพร้อมให้บริการทั้งชลบุรี ระยอง และฉะเชิงเทรา`}
        />
      </section>
    </div>
  );
}
