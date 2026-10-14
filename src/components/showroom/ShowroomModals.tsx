'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { ShowroomArticle, ShowroomVideo } from '@/lib/showroom/data';

/** Native <dialog>: focus trap, Esc and backdrop come for free; the 3D scene stays visible behind it. */
function Modal({ label, onClose, children }: { label: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (!d.open) d.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="sr-modal"
      aria-label={label}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sr-modal-card">
        <button type="button" className="sr-modal-close" onClick={onClose} aria-label="ปิด">×</button>
        {children}
      </div>
    </dialog>
  );
}

export function ArticleModal({ article, onClose }: { article: ShowroomArticle; onClose: () => void }) {
  return (
    <Modal label={article.title} onClose={onClose}>
      {article.image ? (
        <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
          <Image src={article.image} alt="" fill sizes="(max-width: 700px) 90vw, 560px" style={{ objectFit: 'cover' }} />
        </div>
      ) : null}
      <p className="kicker" style={{ margin: '0 0 var(--space-2)' }}>{article.category}</p>
      <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'clamp(20px,3vw,26px)' }}>{article.title}</h3>
      <p style={{ margin: '0 0 var(--space-4)', color: 'var(--color-neutral-800)' }}>{article.excerpt}</p>
      <Link href={`/articles/${article.slug}`} className="btn btn-primary">อ่านบทความเต็ม</Link>
    </Modal>
  );
}

export function VideoModal({ videos, activeId, onSelect, onClose }: { videos: ShowroomVideo[]; activeId: string; onSelect: (id: string) => void; onClose: () => void }) {
  const v = videos.find((x) => x.id === activeId) ?? videos[0];
  if (!v) return null;
  return (
    <Modal label={v.title} onClose={onClose}>
      <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', marginBottom: 'var(--space-4)' }}>
        {/* Only mounted after the visitor opens the modal, so nothing is preloaded. */}
        <iframe
          key={v.youtubeId}
          src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?rel=0&autoplay=1`}
          title={v.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
        />
      </div>
      <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'clamp(18px,2.6vw,24px)' }}>{v.title}</h3>
      <p style={{ margin: '0 0 var(--space-4)', color: 'var(--color-neutral-800)' }}>{v.description}</p>
      {videos.length > 1 ? (
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {videos.map((x) => (
            <button key={x.id} type="button" className="btn btn-secondary" aria-pressed={x.id === v.id} onClick={() => onSelect(x.id)} style={{ fontSize: 13, padding: '8px 14px', opacity: x.id === v.id ? 1 : 0.7 }}>
              {x.title.length > 26 ? x.title.slice(0, 26) + '…' : x.title}
            </button>
          ))}
        </div>
      ) : null}
    </Modal>
  );
}
