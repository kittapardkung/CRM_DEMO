'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';

/** YouTube "play button" mark — identifies the clip link as going out to YouTube. */
function YouTubeLogo() {
  return (
    <svg viewBox="0 0 28 20" width="20" height="14" aria-hidden="true" style={{ flex: '0 0 auto' }}>
      <rect width="28" height="20" rx="6" fill="#FF0000" />
      <path d="M11.5 5.7 19.5 10l-8 4.3z" fill="#fff" />
    </svg>
  );
}

/**
 * Click-to-load YouTube Shorts embed. Shows the video thumbnail with a play
 * button until clicked, so the page doesn't pay iframe cost for videos the
 * visitor never plays.
 */
export default function VideoEmbed({ title, youtubeId }: { title: string; youtubeId: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <figure style={{ margin: 0 }}>
      <div
        style={{
          position: 'relative',
          aspectRatio: '9 / 16',
          background: 'var(--color-neutral-200)',
          border: '1px solid var(--color-neutral-300)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
            title={title}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, display: 'block' }}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              track('view_article', { video: youtubeId });
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
              backgroundColor: 'var(--color-neutral-200)',
              backgroundImage: `url(https://i.ytimg.com/vi/${youtubeId}/hq720.jpg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
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
          href={`https://www.youtube.com/shorts/${youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, textAlign: 'center' }}
        >
          <YouTubeLogo />
          {title}
        </a>
      </figcaption>
    </figure>
  );
}
