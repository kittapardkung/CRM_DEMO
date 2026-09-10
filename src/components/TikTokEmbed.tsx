'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';
import { dealer } from '@/lib/data/dealer';

/** TikTok "music note" mark — identifies the clip link as going out to TikTok. */
function TikTokLogo() {
  return (
    <svg viewBox="0 0 28 20" width="20" height="14" aria-hidden="true" style={{ flex: '0 0 auto' }}>
      <rect width="28" height="20" rx="6" fill="#000" />
      <path
        d="M16.6 4h2.1c.2 1.4 1.1 2.5 2.5 2.9v2.1a5 5 0 0 1-2.5-.8v4a3.8 3.8 0 1 1-3.5-3.8v2.1a1.7 1.7 0 1 0 1.4 1.7V4z"
        fill="#fff"
      />
    </svg>
  );
}

/**
 * Click-to-load TikTok embed. Same lazy-load shape as VideoEmbed
 * (YouTube) — no iframe cost until the visitor clicks — used when a clip
 * has shipped to TikTok but not (yet) to YouTube. See
 * `ArticleSectionVideo.tiktokId` / `Video.tiktokId`: YouTube stays the
 * preferred, schema-eligible source (MILESTONE §5); this exists because
 * some clips reach TikTok first.
 */
export default function TikTokEmbed({ title, tiktokId }: { title: string; tiktokId: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <figure style={{ margin: 0 }}>
      <div
        style={{
          position: 'relative',
          aspectRatio: '9 / 16',
          background: '#111',
          border: '1px solid var(--color-neutral-300)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        {playing ? (
          <iframe
            src={`https://www.tiktok.com/embed/v2/${tiktokId}`}
            title={title}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, display: 'block' }}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              track('view_article', { video: tiktokId });
              setPlaying(true);
            }}
            aria-label={`เล่นคลิป ${title}`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              padding: 0,
              border: 0,
              cursor: 'pointer',
              background: '#111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5z" fill="#fff" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <figcaption style={{ margin: 'var(--space-2) 0 0', fontSize: 14, color: 'var(--color-neutral-800)', display: 'flex', justifyContent: 'center' }}>
        <a
          href={`${dealer.tiktokUrl}/video/${tiktokId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, textAlign: 'center' }}
        >
          <TikTokLogo />
          {title}
        </a>
      </figcaption>
    </figure>
  );
}
