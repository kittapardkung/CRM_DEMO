'use client';

import { useState } from 'react';
import { track } from '@/lib/analytics';

/** Facebook "f" mark — identifies the clip link as going out to Facebook. */
function FacebookLogo() {
  return (
    <svg viewBox="0 0 28 20" width="20" height="14" aria-hidden="true" style={{ flex: '0 0 auto' }}>
      <rect width="28" height="20" rx="6" fill="#1877F2" />
      <path
        d="M16.2 15.5v-4.6h1.5l.2-1.8h-1.7V7.9c0-.5.2-.9 1-.9h.8V5.4a10 10 0 0 0-1.4-.1c-1.5 0-2.5.9-2.5 2.5v1.3h-1.6v1.8h1.6v4.6h1.9z"
        fill="#fff"
      />
    </svg>
  );
}

/**
 * Click-to-load Facebook embed. Same lazy-load shape as VideoEmbed
 * (YouTube) and TikTokEmbed — no iframe cost until the visitor clicks —
 * used when a clip has shipped to Facebook but not (yet) to YouTube. See
 * `ArticleSectionVideo.facebookUrl` / `Video.facebookUrl`: YouTube stays
 * the preferred, schema-eligible source (MILESTONE §5).
 */
export default function FacebookEmbed({ title, facebookUrl }: { title: string; facebookUrl: string }) {
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
            src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(facebookUrl)}&show_text=false&autoplay=true`}
            title={title}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, display: 'block' }}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              track('view_article', { video: facebookUrl });
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
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, textAlign: 'center' }}
        >
          <FacebookLogo />
          {title}
        </a>
      </figcaption>
    </figure>
  );
}
