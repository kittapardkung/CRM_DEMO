/**
 * Video Hub registry — kept separate from `articles.ts` deliberately (see
 * `claude/MILESTONE-video-seo-ecosystem.md` item 8, the PORTA EV Pilot
 * Cluster). A video is its own content unit (its own YouTube asset, topic
 * and status) even when it links back to an article.
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
  /** Numeric TikTok video id, used only when no `youtubeId` exists yet (see ArticleSectionVideo.tiktokId). */
  tiktokId?: string;
  /** Full Facebook video/reel URL, used only when neither youtubeId nor tiktokId exists yet. */
  facebookUrl?: string;
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
 * PORTA EV Pilot Cluster (MILESTONE §8) — 9 short videos, one per topic in
 * that table, each paired with the article that already covers the same
 * search intent (all 9 of those articles already exist in `articles.ts`,
 * ahead of the milestone doc's own tracking). All still "planned": no
 * production has shot anything yet, so `youtubeId`/`publishedAt` stay
 * unset and the Video Hub renders these as "เร็ว ๆ นี้" cards.
 */
export const videos: Video[] = [
  {
    id: 'porta-payload',
    tiktokId: '7644893678129138965',
    title: 'PORTA EV แบกจริง 1.2 ตัน ไปไหวไหม !?',
    description: 'น้ำหนักบรรทุกสูงสุดประมาณ 1,249 กก. ครอบคลุมงานแบบไหนบ้าง',
    topic: 'load',
    relatedVehicleSlug: 'porta',
    relatedArticleSlug: 'porta-ev-payload',
    publishedAt: '10 ก.ย. 2569',
    status: 'produced',
  },
  {
    id: 'porta-business-use',
    youtubeId: 'ZnW460R0rw0',
    title: 'PORTA EV เหมาะกับธุรกิจอะไร?',
    description: '10 ธุรกิจที่ใช้รถตู้ไฟฟ้าได้คุ้ม ตั้งแต่ E-commerce, Last Mile Delivery ไปจนถึงทีมช่างและ Mobile Service',
    topic: 'biz',
    relatedVehicleSlug: 'porta',
    relatedArticleSlug: '10-businesses-electric-van-chonburi',
    publishedAt: '10 ก.ย. 2569',
    status: 'produced',
  },
  {
    id: 'ev-cargo-benefits',
    youtubeId: 'O1G30y4m99o',
    title: '3 ข้อดี ทำไมคนซื้อรถตู้ไฟฟ้า ??!',
    description: 'สามเหตุผลหลักที่ธุรกิจเปลี่ยนมาใช้รถตู้ไฟฟ้า — ต้นทุนต่อเที่ยว พื้นที่บรรทุก และความคุ้มค่าระยะยาว',
    topic: 'usage',
    relatedVehicleSlug: 'porta',
    relatedArticleSlug: 'ev-cargo',
    publishedAt: '10 ก.ย. 2569',
    status: 'produced',
  },
  {
    id: 'commercial-ev-cargo-van-cost',
    youtubeId: 'irS8FLJOyvk',
    title: 'รถตู้ EV คุ้มไหม ลดต้นทุน จริงหรือ ??',
    description: 'เทียบต้นทุนรถตู้ไฟฟ้ากับรถตู้น้ำมัน ลดต้นทุนค่าขนส่งได้จริงหรือไม่',
    topic: 'cost',
    relatedVehicleSlug: 'porta',
    relatedArticleSlug: 'commercial-ev-cargo-van',
    publishedAt: '10 ก.ย. 2569',
    status: 'produced',
  },
  {
    id: 'porta-cargo-space',
    tiktokId: '7627065268090752276',
    title: 'พื้นที่บรรทุก Wuling PORTA EV 6.5 ลูกบาศก์เมตร ใหญ่แค่ไหน?',
    description: 'ห้องบรรทุกทรงกล่อง 6.5 ลบ.ม. ใส่อะไรได้จริง และทำไมธุรกิจหลายแบบควรดูปริมาตรก่อนน้ำหนัก',
    topic: 'load',
    relatedVehicleSlug: 'porta',
    relatedArticleSlug: 'porta-ev-cargo-space',
    publishedAt: '10 ก.ย. 2569',
    status: 'produced',
  },
  {
    id: 'porta-agricultural-drone',
    youtubeId: '8KLSPPmaDCc',
    title: 'PORTA EV กับ โดรนการเกษตร ... จะรอดไหม ??',
    description: 'PORTA EV ตอบโจทย์ธุรกิจโดรนการเกษตรแค่ไหน เช็กระยะวิ่งต่อวัน น้ำหนักบรรทุก และพื้นที่เก็บโดรน',
    topic: 'biz',
    relatedVehicleSlug: 'porta',
    relatedArticleSlug: 'electric-van-agricultural-drone-business-chonburi',
    publishedAt: '10 ก.ย. 2569',
    status: 'produced',
  },
  {
    id: 'porta-one-month-review',
    tiktokId: '7683412670304865554',
    title: 'เป็นอย่างไรเมื่อใช้ PORTA EV ไปแล้ว 1 เดือน ??',
    description: 'รีวิวการใช้งานจริงหลังใช้ PORTA EV มาแล้ว 1 เดือน เหมาะกับธุรกิจแบบไหนบ้าง',
    topic: 'biz',
    relatedVehicleSlug: 'porta',
    relatedArticleSlug: 'porta-ev-business-use',
    publishedAt: '10 ก.ย. 2569',
    status: 'produced',
  },
  {
    id: 'porta-industrial-estate-delivery',
    youtubeId: '_0q5LvHvzTw',
    title: 'ส่งมอบ PORTA EV 3 คัน ซื้อแล้ว ซื้อจริง !!',
    description: 'ส่งมอบ Wuling PORTA EV ให้ลูกค้าธุรกิจในนิคมอุตสาหกรรม 3 คัน เคสจริงจากลูกค้าจริง',
    topic: 'biz',
    relatedVehicleSlug: 'porta',
    relatedArticleSlug: 'electric-van-industrial-estate-chonburi',
    publishedAt: '10 ก.ย. 2569',
    status: 'produced',
  },
];

export function getVideo(id: string): Video | undefined {
  return videos.find((v) => v.id === id);
}
