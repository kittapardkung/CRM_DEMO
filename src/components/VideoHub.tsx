'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import VideoCard from '@/components/VideoCard';
import { vehicles } from '@/lib/data/vehicles';
import { videoTopics, videoTopicLabels, type Video, type VideoTopic } from '@/lib/data/videos';

/**
 * Client-side filtered grid for /videos — two dimensions (vehicle model,
 * topic), both optional and combinable. Accepts an initial filter so an
 * article can deep-link in via `/videos?model=porta&topic=cost`.
 */
export default function VideoHub({
  videos,
  initialModel,
  initialTopic,
  tiktokThumbnails = {},
}: {
  videos: Video[];
  initialModel?: string;
  initialTopic?: VideoTopic;
  /** Resolved server-side via `getTiktokThumbnail()`, keyed by tiktokId. */
  tiktokThumbnails?: Record<string, string | null>;
}) {
  const [model, setModel] = useState<string | null>(
    initialModel && vehicles.some((v) => v.slug === initialModel) ? initialModel : null
  );
  const [topic, setTopic] = useState<VideoTopic | null>(
    initialTopic && videoTopics.includes(initialTopic) ? initialTopic : null
  );

  const filtered = useMemo(
    () =>
      videos.filter((v) => (model ? v.relatedVehicleSlug === model : true) && (topic ? v.topic === topic : true)),
    [videos, model, topic]
  );

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>
            รุ่นรถ
          </span>
          <FilterPill active={model === null} onClick={() => setModel(null)} label="ทั้งหมด" />
          {vehicles.map((v) => (
            <FilterPill key={v.slug} active={model === v.slug} onClick={() => setModel(v.slug)} label={v.shortName} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>
            หัวข้อ
          </span>
          <FilterPill active={topic === null} onClick={() => setTopic(null)} label="ทั้งหมด" />
          {videoTopics.map((t) => (
            <FilterPill key={t} active={topic === t} onClick={() => setTopic(t)} label={videoTopicLabels[t]} />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            border: '1px dashed var(--color-neutral-400)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-8) var(--space-4)',
            textAlign: 'center',
            color: 'var(--color-neutral-700)',
          }}
        >
          <p style={{ margin: '0 0 6px', fontSize: 19, fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--color-text)' }}>
            กำลังทยอยผลิตวิดีโอ
          </p>
          <p style={{ margin: 0, fontSize: 15 }}>กลับมาดูใหม่เร็ว ๆ นี้ — ระหว่างนี้อ่านข้อมูลเดียวกันได้ที่หน้าบทความ</p>
          <Link href="/articles" className="btn btn-secondary" style={{ marginTop: 'var(--space-4)', display: 'inline-block' }}>
            ไปหน้าบทความ
          </Link>
        </div>
      ) : (
        <div className="om-video-grid">
          {filtered.map((v) => (
            <VideoCard key={v.id} video={v} tiktokThumbnail={v.tiktokId ? tiktokThumbnails[v.tiktokId] : undefined} />
          ))}
        </div>
      )}
    </>
  );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pill-btn"
      aria-pressed={active}
      style={{
        background: active ? 'var(--color-accent-100)' : 'transparent',
        color: active ? 'var(--color-accent-800)' : 'var(--color-text)',
        border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-neutral-400)'}`,
      }}
    >
      {label}
    </button>
  );
}
