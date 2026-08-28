import { CSSProperties } from 'react';

/**
 * Image Placeholder system (master prompt §39). Real vehicle photography
 * doesn't exist yet, so every image slot renders as a labeled box naming
 * exactly which shot goes there and the filename it should be saved as —
 * never a broken image, and easy to swap for the real asset later.
 */
export default function ImageSlot({
  caption,
  filename,
  aspectRatio = '4 / 3',
  style,
  className,
  dashed,
}: {
  caption: string;
  filename?: string;
  aspectRatio?: string;
  style?: CSSProperties;
  className?: string;
  dashed?: boolean;
}) {
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
