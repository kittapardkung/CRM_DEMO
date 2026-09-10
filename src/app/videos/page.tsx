import type { Metadata } from 'next';
import VideoHub from '@/components/VideoHub';
import { videos, videoTopics, type VideoTopic } from '@/lib/data/videos';
import { videoJsonLd, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'วิดีโอสาระน่ารู้',
  description: 'คลิปวิดีโอแนะนำการชาร์จ การบรรทุก ค่าใช้จ่าย และการใช้งานจริงของรถยนต์ไฟฟ้า WULING',
  alternates: { canonical: '/videos' },
};

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string; topic?: string }>;
}) {
  const { model, topic } = await searchParams;
  const initialTopic = topic && (videoTopics as readonly string[]).includes(topic) ? (topic as VideoTopic) : undefined;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'วิดีโอสาระน่ารู้',
      url: `${SITE_URL}/videos`,
    },
    ...videos.map(videoJsonLd).filter(Boolean),
  ];

  return (
    <div className="wrap">
      <section style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        <p className="kicker">Videos</p>
        <h1 style={{ fontSize: 'clamp(29px,4vw,45px)', margin: '0 0 var(--space-3)' }}>วิดีโอสาระน่ารู้</h1>
        <p style={{ margin: 0, color: 'var(--color-neutral-800)', maxWidth: '60ch' }}>
          คลิปสั้น ๆ เกี่ยวกับการชาร์จ การบรรทุก ค่าใช้จ่าย และการใช้งานจริงของรถยนต์ไฟฟ้า WULING แต่ละรุ่น
        </p>
      </section>

      <section style={{ paddingBottom: 'var(--space-8)' }}>
        <VideoHub videos={videos} initialModel={model} initialTopic={initialTopic} />
      </section>

      {jsonLd.map((obj, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
      ))}
    </div>
  );
}
