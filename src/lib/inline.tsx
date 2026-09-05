import { Fragment, ReactNode } from 'react';

/**
 * Renders article body text that carries inline markdown-lite markers —
 * **bold**, __underline__, *italic* — as authored in the content data.
 * Kept as a tiny parser here rather than pre-tokenizing every article by
 * hand in `articles.ts`.
 */
export function renderInline(text: string | undefined): ReactNode {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*)/g).filter((p) => p !== '');
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return <u key={i}>{part.slice(2, -2)}</u>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
