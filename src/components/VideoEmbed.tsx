'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';

/**
 * Click-to-load YouTube Shorts embed. Renders a static thumbnail + play
 * button until clicked, so the page doesn't pay iframe cost for videos the
 * visitor never plays.
 */
export default function VideoEmbed({ title, youtubeId }: { title: string; youtubeId: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div
        style={{
          position: 'relative',
          aspectRatio: '9 / 16',
          background: '#0b1730',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              track('view_article', { video: youtubeId });
              setPlaying(true);
            }}
            aria-label={`เล่นวิดีโอ ${title}`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              background: `url(https://i.ytimg.com/vi/${youtubeId}/hq720.jpg) center/cover`,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--wl-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                color: 'var(--wl-ink)',
              }}
            >
              ▶
            </span>
          </button>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-800)' }}>{title}</p>
    </div>
  );
}
