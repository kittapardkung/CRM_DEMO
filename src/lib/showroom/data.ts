import { resolveAsset } from '@/lib/assets';
import { articles } from '@/lib/data/articles';
import { dealer } from '@/lib/data/dealer';
import { getVehicle } from '@/lib/data/vehicles';
import { videos } from '@/lib/data/videos';
import { money } from '@/lib/format';
import { ARTICLE_HOTSPOTS, MANIFEST, VEHICLE_ORDER, VIDEO_IDS, type VehicleSlug } from './config';

export interface ShowroomVehicle {
  slug: VehicleSlug;
  /** Short label for the model selector — taken from approved site data, so spelling stays in one place. */
  label: string;
  name: string;
  tagline: string;
  price: string;
  photo: string | null;
  /** True when `photo` is a background-removed cut-out (transparent), so it can float in the room. */
  cutout: boolean;
  /** Only models with dealer-confirmed colours and a matching photo per colour. */
  colors: { name: string; code: string; photo: string }[];
  glb: string | null;
}
export interface ShowroomArticle { slug: string; title: string; excerpt: string; category: string; image: string | null }
export interface ShowroomVideo { id: string; youtubeId: string; title: string; description: string }

/** Everything the showroom shows, read from the existing site data (nothing invented). */
export function getShowroomData() {
  const vehicles: ShowroomVehicle[] = VEHICLE_ORDER.map((slug) => {
    const v = getVehicle(slug)!;
    const colors =
      slug === 'darion'
        ? v.colors.flatMap((c) => {
            // Haze Grey is the reference studio shot; the other colours have matching studio renders.
            const photo = c.slug === 'haze-grey' ? resolveAsset('cutout-darion-front-34.webp') : resolveAsset(`cutout-darion-front-34-${c.slug}.webp`);
            return photo ? [{ name: c.name, code: c.code, photo }] : [];
          })
        : [];
    const cut = resolveAsset(`cutout-${slug}-front-34.webp`);
    return {
      slug,
      label: v.shortName,
      name: v.name,
      tagline: v.tagline,
      price: v.startingPrice !== null ? `เริ่มต้น ${money(v.startingPrice)}` : 'ราคารอยืนยัน',
      photo: cut ?? resolveAsset(v.image),
      cutout: cut !== null,
      colors,
      glb: MANIFEST[slug].glb,
    };
  });

  const showroomArticles: ShowroomArticle[] = ARTICLE_HOTSPOTS.flatMap((h) => {
    const a = articles.find((x) => x.slug === h.slug);
    return a ? [{ slug: a.slug, title: a.title, excerpt: a.excerpt, category: a.category, image: resolveAsset(a.image) }] : [];
  });

  const showroomVideos: ShowroomVideo[] = VIDEO_IDS.flatMap((id) => {
    const v = videos.find((x) => x.id === id);
    return v?.status === 'produced' && v.youtubeId ? [{ id: v.id, youtubeId: v.youtubeId, title: v.title, description: v.description }] : [];
  });

  return { vehicles, articles: showroomArticles, videos: showroomVideos, dealer: { phoneDisplay: dealer.phoneDisplay, phoneHref: dealer.phoneHref, lineUrl: dealer.lineUrl }, logo: resolveAsset('wuling-chonburi-logo.jpg') };
}
export type ShowroomData = ReturnType<typeof getShowroomData>;
