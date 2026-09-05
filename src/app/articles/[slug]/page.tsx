import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import ImageSlot from '@/components/ImageSlot';
import CTASection from '@/components/CTASection';
import { allArticles, getArticle } from '@/lib/data/articles';
import { getVehicle } from '@/lib/data/vehicles';
import { renderInline } from '@/lib/inline';
import { ctaHref } from '@/lib/nav';
import { SITE_URL } from '@/lib/seo';

export function generateStaticParams() {
  return allArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/articles/${article.slug}` },
  };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const relatedVehicle = getVehicle(article.relatedVehicleSlug);
  const related = (article.readNext?.length ? article.readNext.map((s) => getArticle(s)).filter(Boolean) : allArticles.filter((a) => a.slug !== article.slug).slice(0, 3)) as typeof allArticles;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      datePublished: article.publishedAt,
      url: `${SITE_URL}/articles/${article.slug}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: article.faq.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'บทความ', item: `${SITE_URL}/articles` },
        { '@type': 'ListItem', position: 3, name: article.title, item: `${SITE_URL}/articles/${article.slug}` },
      ],
    },
  ];

  return (
    <div className="wrap">
      <Breadcrumb items={[{ label: 'หน้าแรก', href: '/' }, { label: 'บทความ', href: '/articles' }, { label: article.category }]} />
      <article style={{ paddingBottom: 'var(--space-8)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 'var(--space-6)', maxWidth: 1100 }}>
        <header>
          <p style={{ margin: '0 0 var(--space-3)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>{article.category}</p>
          <h1 style={{ fontSize: 'clamp(28px,3.8vw,44px)', lineHeight: 1.1, margin: '0 0 var(--space-4)', maxWidth: '30ch' }}>{article.title}</h1>
          <p style={{ margin: '0 0 var(--space-3)', fontSize: 19, color: 'var(--color-neutral-800)', maxWidth: '60ch' }}>{article.excerpt}</p>
          <p className="tnum" style={{ margin: 0, fontSize: 13, color: 'var(--color-neutral-600)' }}>เผยแพร่ {article.publishedAt} · อ่าน {article.readingTime}</p>
        </header>

        <ImageSlot aspectRatio="16 / 9" caption="ARTICLE · Featured Image" filename={`article-${article.slug}.webp`} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 'var(--space-8)', alignItems: 'start' }}>
          <aside style={{ order: 2, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 340 }}>
            <div style={{ borderTop: '1px solid var(--color-text)', paddingTop: 'var(--space-3)' }}>
              <p style={{ margin: '0 0 var(--space-3)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>สารบัญ</p>
              <ol style={{ margin: 0, paddingLeft: '1.3em', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 15 }}>
                {article.sections.map((s) => (
                  <li key={s.id}><a href={`#${s.id}`}>{s.heading}</a></li>
                ))}
              </ol>
            </div>
            {relatedVehicle ? (
              <div style={{ border: '1px solid var(--color-accent)', padding: 'var(--space-4)' }}>
                <p style={{ margin: '0 0 var(--space-2)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>รุ่นที่เกี่ยวข้อง</p>
                <h3 style={{ fontSize: 26, margin: '0 0 var(--space-2)' }}>{relatedVehicle.name}</h3>
                <p style={{ margin: '0 0 var(--space-4)', fontSize: 14, color: 'var(--color-neutral-800)' }}>{relatedVehicle.tagline}</p>
                <Link href={`/models/${relatedVehicle.slug}`} className="btn btn-primary btn-block">ดู {relatedVehicle.shortName}</Link>
                {relatedVehicle.isConfigurable ? (
                  <Link href={`/models/${relatedVehicle.slug}`} className="btn btn-secondary btn-block" style={{ marginTop: 'var(--space-2)' }}>
                    ออกแบบ PORTA สำหรับธุรกิจของคุณ
                  </Link>
                ) : null}
              </div>
            ) : null}
            {article.social ? (
              <a
                href={article.social.url}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'block', border: '1px solid var(--color-divider)', padding: 'var(--space-4)', textDecoration: 'none', color: 'var(--color-text)' }}
              >
                <p style={{ margin: '0 0 var(--space-2)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>
                  ดูภาพและคลิปการใช้งานจริงเพิ่มเติมได้ที่
                </p>
                <p style={{ margin: 0, fontSize: 17 }}>{article.social.label} →</p>
              </a>
            ) : null}
          </aside>

          <div style={{ order: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
            {article.sections.map((s) => (
              <section key={s.id} id={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <h2 style={{ fontSize: 'clamp(21px,2.6vw,28px)', margin: 0, scrollMarginTop: 96 }}>{s.heading}</h2>

                {s.answer ? (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 18,
                      lineHeight: 1.6,
                      color: 'var(--color-text)',
                      background: 'var(--color-accent-100)',
                      borderLeft: '3px solid var(--color-accent)',
                      padding: 'var(--space-3) var(--space-4)',
                    }}
                  >
                    {renderInline(s.answer)}
                  </p>
                ) : null}

                {s.body ? (
                  <p style={{ margin: 0, textAlign: 'justify', hyphens: 'auto', color: 'var(--color-neutral-900)' }}>{renderInline(s.body)}</p>
                ) : null}

                {s.bullets?.length ? (
                  <ul style={{ margin: 0, paddingLeft: '1.3em', display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--color-neutral-900)' }}>
                    {s.bullets.map((b, i) => (
                      <li key={i}>{renderInline(b)}</li>
                    ))}
                  </ul>
                ) : null}

                {s.table ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ minWidth: 480 }}>
                      <thead>
                        <tr>
                          {s.table.head.map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.table.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j} className={j === 0 ? undefined : 'tnum'}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {s.image !== undefined || s.imageCaption ? (
                  <ImageSlot aspectRatio="16 / 9" caption={s.imageCaption || 'ARTICLE · Inline Image'} filename={s.image} />
                ) : null}

                {s.note ? (
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-700)', fontStyle: 'italic' }}>{renderInline(s.note)}</p>
                ) : null}

                {s.link ? (
                  <p style={{ margin: 0, fontSize: 15 }}>
                    {s.link.lead}{' '}
                    <Link href={`/articles/${s.link.toSlug}`}>
                      {getArticle(s.link.toSlug)?.title ?? s.link.toSlug}
                    </Link>
                  </p>
                ) : null}

                {s.cta ? (
                  <div
                    style={{
                      background: 'var(--wl-ink)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-5)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 'var(--space-4)',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <p style={{ margin: '0 0 6px', fontSize: 19, color: '#fff', fontFamily: 'var(--font-heading)' }}>{s.cta.heading}</p>
                      <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.78)', maxWidth: '48ch' }}>{s.cta.body}</p>
                    </div>
                    <Link href={ctaHref(s.cta.goRoute)} className="btn btn-primary" style={{ flex: '0 0 auto' }}>
                      {s.cta.label}
                    </Link>
                  </div>
                ) : null}
              </section>
            ))}

            <section>
              <h2 style={{ fontSize: 'clamp(21px,2.6vw,28px)', margin: '0 0 var(--space-4)' }}>คำถามที่พบบ่อย</h2>
              <div style={{ borderTop: '1px solid var(--color-divider)' }}>
                {article.faq.map((f) => (
                  <div key={f.question} style={{ borderBottom: '1px solid var(--color-divider)', padding: 'var(--space-4) 0' }}>
                    <h3 style={{ fontSize: 19, margin: '0 0 6px' }}>{f.question}</h3>
                    <p style={{ margin: 0, color: 'var(--color-neutral-800)' }}>{f.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: 'clamp(20px,2.4vw,25px)', margin: '0 0 var(--space-4)' }}>บทความที่เกี่ยวข้อง</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/articles/${r.slug}`}
                    style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-divider)', textDecoration: 'none', color: 'var(--color-text)' }}
                  >
                    <span>{r.title}</span>
                    <span style={{ color: 'var(--color-accent-700)' }}>→</span>
                  </Link>
                ))}
              </div>
            </section>

            <CTASection
              heading={article.endCta?.heading ?? 'พร้อมลองขับจริงแล้วหรือยัง?'}
              body={article.endCta?.body ?? 'ทีมงานพร้อมนำรถไปให้ทดลองขับที่บ้านหรือบริษัทของคุณ ตามพื้นที่ให้บริการและเงื่อนไขของบริษัท'}
              primaryLabel={article.endCta?.label ?? 'นัดทดลองขับ'}
              primaryHref={ctaHref(article.endCta?.goRoute ?? 'testdrive')}
              showPhone={false}
            />
          </div>
        </div>
      </article>

      {jsonLd.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"

          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </div>
  );
}
