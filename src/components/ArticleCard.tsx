import Link from 'next/link';
import ImageSlot from './ImageSlot';
import { Article } from '@/lib/data/types';

export default function ArticleCard({ article, size = 'md' }: { article: Article; size?: 'md' | 'lg' }) {
  const Heading = size === 'lg' ? 'h2' : 'h3';
  return (
    <article style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <ImageSlot aspectRatio="16 / 10" caption="ARTICLE" filename={`article-${article.slug}.webp`} />
      <p style={{ margin: 'var(--space-2) 0 0', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>
        {article.category}
      </p>
      <Heading style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: size === 'lg' ? 23 : 21, margin: 0, lineHeight: 1.3 }}>
        <Link href={`/articles/${article.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {article.title}
        </Link>
      </Heading>
      <p style={{ margin: 0, fontSize: size === 'lg' ? 16 : 15, color: 'var(--color-neutral-800)' }}>{article.excerpt}</p>
      <p className="tnum" style={{ margin: 'var(--space-1) 0 0', fontSize: 13, color: 'var(--color-neutral-600)' }}>
        {article.publishedAt} · อ่าน {article.readingTime}
      </p>
      {size === 'lg' ? (
        <Link href={`/articles/${article.slug}`} style={{ fontSize: 15, marginTop: 'var(--space-2)' }}>
          อ่านต่อ →
        </Link>
      ) : null}
    </article>
  );
}
