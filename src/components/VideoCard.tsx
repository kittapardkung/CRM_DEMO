import Link from 'next/link';
import VideoEmbed from '@/components/VideoEmbed';
import TikTokEmbed from '@/components/TikTokEmbed';
import FacebookEmbed from '@/components/FacebookEmbed';
import { vehicles } from '@/lib/data/vehicles';
import { videoTopicLabels, type Video } from '@/lib/data/videos';
import { getArticle } from '@/lib/data/articles';

/**
 * One video card: embed + the info block underneath (model · topic tag,
 * title, description, related-article link). Shared by /videos (VideoHub)
 * and any other page that teases a curated set of clips (e.g. the homepage),
 * so that info block stays identical wherever a video is shown.
 */
export default function VideoCard({
  video,
  tiktokThumbnail,
}: {
  video: Video;
  /** Resolved server-side via `getTiktokThumbnail()`. */
  tiktokThumbnail?: string | null;
}) {
  const vehicle = vehicles.find((v) => v.slug === video.relatedVehicleSlug);
  const relatedArticle = video.relatedArticleSlug ? getArticle(video.relatedArticleSlug) : undefined;
  const produced = video.status === 'produced' && !!(video.youtubeId || video.tiktokId || video.facebookUrl);

  return (
    <article style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {produced ? (
        video.youtubeId ? (
          <VideoEmbed title={video.title} youtubeId={video.youtubeId} />
        ) : video.tiktokId ? (
          <TikTokEmbed title={video.title} tiktokId={video.tiktokId} thumbnailUrl={tiktokThumbnail} />
        ) : (
          <FacebookEmbed title={video.title} facebookUrl={video.facebookUrl!} />
        )
      ) : (
        <div
          style={{
            position: 'relative',
            aspectRatio: '9 / 16',
            background: 'var(--color-neutral-200)',
            border: '1px solid var(--color-neutral-300)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="pill-btn" style={{ background: 'var(--color-neutral-300)', color: 'var(--color-neutral-800)', border: 'none' }}>
            เร็ว ๆ นี้
          </span>
        </div>
      )}

      <p style={{ margin: 'var(--space-1) 0 0', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>
        {vehicle?.shortName ?? video.relatedVehicleSlug} · {videoTopicLabels[video.topic]}
      </p>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 19, margin: 0, lineHeight: 1.3 }}>{video.title}</h3>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-800)' }}>{video.description}</p>

      {relatedArticle ? (
        <Link href={`/articles/${relatedArticle.slug}`} style={{ fontSize: 14, marginTop: 'var(--space-1)' }}>
          อ่านบทความที่เกี่ยวข้อง →
        </Link>
      ) : null}
    </article>
  );
}
