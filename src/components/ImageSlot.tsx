import { CSSProperties } from 'react';
import Image from 'next/image';
import { resolveAsset } from '@/lib/assets';

/**
 * Image slot (master prompt §39). Renders the real photograph when the file
 * exists under public/images/ (or public/assets/), and otherwise a labelled
 * box naming exactly which shot belongs there and the filename to save it as —
 * never a broken image.
 *
 * Because the lookup is by filename at build time, adding a photo to
 * public/images/ turns its placeholder into the real image with no code change.
 */
export default function ImageSlot({
  caption,
  filename,
  aspectRatio = '4 / 3',
  style,
  className,
  dashed,
  fit = 'cover',
  sizes = '(max-width: 820px) 100vw, 50vw',
  priority,
}: {
  caption: string;
  filename?: string;
  aspectRatio?: string;
  style?: CSSProperties;
  className?: string;
  dashed?: boolean;
  /** 'contain' suits diagrams that must not be cropped. */
  fit?: 'cover' | 'contain';
  sizes?: string;
  priority?: boolean;
}) {
  const src = resolveAsset(filename);

  if (src) {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          aspectRatio,
          overflow: 'hidden',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-neutral-200)',
          ...style,
        }}
      >
        <Image
          src={src}
          alt={caption}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectFit: fit }}
        />
      </div>
    );
  }

  return (
    <div
      className={`image-slot${className ? ` ${className}` : ''}`}
      style={{
        aspectRatio,
        borderStyle: dashed ? 'dashed' : 'solid',
        ...style,
      }}
    >
      <span className="image-slot-caption">
        {caption}
        {filename ? (
          <>
            <br />
            <span className="image-slot-file">{filename}</span>
          </>
        ) : null}
      </span>
    </div>
  );
}
