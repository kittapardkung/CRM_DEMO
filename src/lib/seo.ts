import type { Video } from '@/lib/data/videos';
import { toISODate } from '@/lib/format';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wulingjtgroup.com';

/** GA4 Measurement ID — the property created for wulingjtgroup.com (2026-09). */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-GLVEQ27YG3';

/**
 * schema.org VideoObject JSON-LD for one video. Callers must only pass
 * videos with `status === 'produced'` and a real `youtubeId` — a
 * VideoObject for a video that isn't shot yet (no thumbnail, no upload
 * date) reads as invalid structured data to Google, so this function
 * returns null for anything else rather than emitting a broken block.
 */
export function videoJsonLd(video: Video) {
  if (video.status !== 'produced' || !video.youtubeId || !video.publishedAt) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: [`https://i.ytimg.com/vi/${video.youtubeId}/hq720.jpg`],
    uploadDate: toISODate(video.publishedAt),
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.youtubeId}`,
    ...(video.durationSec ? { duration: `PT${video.durationSec}S` } : {}),
  };
}
