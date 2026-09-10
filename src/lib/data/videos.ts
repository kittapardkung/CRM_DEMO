/**
 * Video Hub registry — kept separate from `articles.ts` deliberately (see
 * `claude/MILESTONE-video-seo-ecosystem.md` item 8; that doc was not found
 * in this checkout, so this registry starts empty rather than guessing at
 * a Pilot Cluster). A video is its own content unit (its own YouTube asset,
 * topic and status) even when it links back to an article.
 *
 * Every entry here is expected to reach "produced" status only once the
 * real file exists — until then `youtubeId`/`publishedAt` stay empty and
 * the Video Hub renders a "เร็ว ๆ นี้" (coming soon) card instead of a
 * broken player. Never ship a "produced" video without a
 * `relatedArticleSlug` — 1 search intent = 1 content set (same rule as
 * `categories` in `articles.ts`).
 */

export const videoTopics = ['charge', 'load', 'cost', 'usage', 'biz', 'accessories', 'testdrive'] as const;
export type VideoTopic = (typeof videoTopics)[number];

export const videoTopicLabels: Record<VideoTopic, string> = {
  charge: 'การชาร์จ',
  load: 'การบรรทุก',
  cost: 'ค่าใช้จ่าย',
  usage: 'การใช้งานจริง',
  biz: 'ธุรกิจ',
  accessories: 'Accessories',
  testdrive: 'Test Drive',
};

export interface Video {
  id: string;
  /** Empty while status is 'planned' — no file shot yet. */
  youtubeId?: string;
  title: string;
  description: string;
  durationSec?: number;
  topic: VideoTopic;
  /** Slug from `vehicles.ts` — must reference a real vehicle. */
  relatedVehicleSlug: string;
  /** Slug from `articles.ts`, if a matching article already exists. */
  relatedArticleSlug?: string;
  /** Thai Buddhist-era date, same format as `Article.publishedAt` — empty until published. */
  publishedAt?: string;
  status: 'planned' | 'produced';
}

/**
 * Pilot Cluster seed goes here once `claude/MILESTONE-video-seo-ecosystem.md`
 * item 8 is available in this repo. Empty for now — the Video Hub page is
 * built to render correctly (filters + empty state) with zero entries.
 */
export const videos: Video[] = [];

export function getVideo(id: string): Video | undefined {
  return videos.find((v) => v.id === id);
}
