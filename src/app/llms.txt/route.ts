import { vehicles } from '@/lib/data/vehicles';
import { allArticles } from '@/lib/data/articles';
import { videos } from '@/lib/data/videos';
import { dealer } from '@/lib/data/dealer';
import { money } from '@/lib/format';
import { SITE_URL } from '@/lib/seo';

/**
 * llms.txt (see llmstxt.org) — a plain-text index for AI answer engines and
 * agents that don't render JavaScript. Generated from the same data the
 * rest of the site uses, so it can't drift out of sync with what's real.
 */
export function GET() {
  const modelLines = vehicles
    .map((v) => `- [${v.shortName}](${SITE_URL}/models/${v.slug}): ${v.tagline} เริ่มต้น ${money(v.startingPrice)}`)
    .join('\n');

  const articleLines = allArticles
    .map((a) => `- [${a.title}](${SITE_URL}/articles/${a.slug})`)
    .join('\n');

  const producedVideos = videos.filter((v) => v.status === 'produced' && v.youtubeId);
  const videoLines = producedVideos.length
    ? producedVideos.map((v) => `- [${v.title}](https://www.youtube.com/watch?v=${v.youtubeId})`).join('\n')
    : '(อยู่ระหว่างผลิตวิดีโอ — ยังไม่มีคลิปเผยแพร่)';

  const body = `# WULING CHONBURI

> ตัวแทนจำหน่ายวู่หลิง (WULING) อย่างเป็นทางการ ประจำจังหวัดชลบุรีและภาคตะวันออก ประเทศไทย จำหน่ายรถยนต์นั่งและรถเพื่อการพาณิชย์ไฟฟ้า พร้อมบริการทดลองขับ ขายเช่าแบบ Operating Lease และบริการหลังการขาย

## ข้อมูลติดต่อ (NAP)

- ชื่อ: ${dealer.name} (${dealer.alternateName})
- พื้นที่ให้บริการ: ${dealer.serviceAreas.join(', ')}
- ที่อยู่: ${dealer.address}
- โทรศัพท์: ${dealer.phoneDisplay}
- อีเมล: ${dealer.email}
- เวลาทำการ: ${dealer.hours}
- Google Maps: ${dealer.mapsUrl}
- Google Business Profile: ${dealer.gbpUrl}
- Facebook: ${dealer.facebookUrl}
- LINE: ${dealer.lineUrl}

## รถยนต์ WULING ทุกรุ่น

${modelLines}

ดูรุ่นทั้งหมดพร้อมสเปกและราคา: ${SITE_URL}/models
เปรียบเทียบรุ่น: ${SITE_URL}/compare
คำนวณค่างวด: ${SITE_URL}/calculator

## บริการองค์กร

- Operating Lease สำหรับบริษัทและองค์กร: ${SITE_URL}/lease
- บริการหลังการขาย: ${SITE_URL}/service
- พื้นที่ให้บริการ (${dealer.serviceAreas.slice(0, 3).join(', ')}): ${SITE_URL}/areas

## บทความ

${articleLines}

## วิดีโอสาระน่ารู้

${videoLines}

ดูวิดีโอทั้งหมดพร้อมตัวกรองตามรุ่นรถและหัวข้อ: ${SITE_URL}/videos

## ติดต่อ / ทดลองขับ

- ติดต่อโชว์รูม: ${SITE_URL}/contact
- นัดทดลองขับ: ${SITE_URL}/test-drive
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
