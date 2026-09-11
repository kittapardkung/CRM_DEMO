import { dealer } from '@/lib/data/dealer';

/**
 * Resolves a TikTok video's real thumbnail via TikTok's oEmbed endpoint, so
 * a TikTok-sourced clip can show a preview image before play the same way
 * a YouTube one does (`https://i.ytimg.com/vi/<id>/hq720.jpg`) — TikTok has
 * no equivalent predictable static URL, only this API.
 *
 * Defensive by design: a network failure, timeout, or shape change never
 * breaks the page — it just falls back to the plain placeholder box
 * TikTokEmbed already renders. Cached for an hour (`next.revalidate`) so a
 * dynamic route like /videos doesn't hit TikTok on every request.
 */
export async function getTiktokThumbnail(tiktokId: string): Promise<string | null> {
  try {
    const videoUrl = `${dealer.tiktokUrl}/video/${tiktokId}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const thumbnail = (data as { thumbnail_url?: unknown })?.thumbnail_url;
    return typeof thumbnail === 'string' && thumbnail ? thumbnail : null;
  } catch {
    return null;
  }
}
