import type { Metadata } from 'next';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import { articles, categories } from '@/lib/data/articles';

export const metadata: Metadata = {
  title: 'บทความรถยนต์ไฟฟ้า',
  description: 'บทความ รีวิว และคู่มือเลือกรถยนต์ไฟฟ้า WULING',
  alternates: { canonical: '/articles' },
};

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const activeCategory = cat && categories.includes(cat) ? cat : 'ทั้งหมด';
  const list = activeCategory === 'ทั้งหมด' ? articles : articles.filter((a) => a.category === activeCategory);

  return (
    <div className="wrap">
      <section style={{ padding: 'var(--space-8) 0 var(--space-6)' }}>
        <p className="kicker">Articles</p>
        <h1 style={{ fontSize: 'clamp(29px,4vw,45px)', margin: '0 0 var(--space-4)' }}>บทความ</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {categories.map((c) => {
            const active = c === activeCategory;
            return (
              <Link
                key={c}
                href={c === 'ทั้งหมด' ? '/articles' : `/articles?cat=${encodeURIComponent(c)}`}
                className="pill-btn"
                style={{
                  textDecoration: 'none',
                  display: 'inline-block',
                  background: active ? 'var(--color-accent-100)' : 'transparent',
                  color: active ? 'var(--color-accent-800)' : 'var(--color-text)',
                  border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-neutral-400)'}`,
                }}
              >
                {c}
              </Link>
            );
          })}
        </div>
      </section>
      <section style={{ paddingBottom: 'var(--space-8)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'var(--space-8)' }}>
        {list.map((a) => (
          <ArticleCard key={a.slug} article={a} size="lg" />
        ))}
      </section>
    </div>
  );
}
