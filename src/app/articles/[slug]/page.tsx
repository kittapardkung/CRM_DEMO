import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import ImageSlot from '@/components/ImageSlot';
import PhoneLink from '@/components/PhoneLink';
import VideoEmbed from '@/components/VideoEmbed';
import { allArticles, getArticle } from '@/lib/data/articles';
import { getVehicle } from '@/lib/data/vehicles';
import { videos } from '@/lib/data/videos';
import { dealer } from '@/lib/data/dealer';
import { renderInline } from '@/lib/inline';
import { ctaHref } from '@/lib/nav';
import { SITE_URL } from '@/lib/seo';
import { resolveAsset } from '@/lib/assets';
import { toISODate } from '@/lib/format';

export function generateStaticParams() {
  return allArticles.map((a) => ({ slug: a.slug }));
}

/**
 * Links a "produced" article video back to the Video Hub, filtered to the
 * same model and (when the youtubeId matches a Video Hub entry) topic.
 */
function videosHubHref(vehicleSlug: string, youtubeId: string): string {
  const topic = videos.find((v) => v.youtubeId === youtubeId)?.topic;
  const params = new URLSearchParams({ model: vehicleSlug });
  if (topic) params.set('topic', topic);
  return `/videos?${params.toString()}`;
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
  const related = (article.readNext?.length
    ? article.readNext.map((s) => getArticle(s)).filter(Boolean)
    : allArticles.filter((a) => a.slug !== article.slug).slice(0, 3)) as typeof allArticles;

  const social = article.social ?? {
    label: 'Facebook WULING CHONBURI',
    url: 'https://www.facebook.com/profile.php?id=61583789612737',
  };

  const articleImage = resolveAsset(article.image);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      datePublished: toISODate(article.publishedAt),
      url: `${SITE_URL}/articles/${article.slug}`,
      ...(articleImage ? { image: `${SITE_URL}${articleImage}` } : {}),
      author: { '@type': 'Organization', name: dealer.name, url: SITE_URL },
      publisher: {
        '@type': 'Organization',
        name: dealer.name,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/wuling-chonburi-logo.jpg` },
      },
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
          <h1 style={{ fontSize: 'clamp(28px,3.8vw,44px)', lineHeight: 1.15, margin: '0 0 var(--space-4)', maxWidth: '34ch' }}>{article.title}</h1>
          <p style={{ margin: '0 0 var(--space-3)', fontSize: 19, color: 'var(--color-neutral-800)', maxWidth: '72ch' }}>{article.excerpt}</p>
          <p className="tnum" style={{ margin: 0, fontSize: 13, color: 'var(--color-neutral-600)' }}>เผยแพร่ {article.publishedAt} · อ่าน {article.readingTime}</p>
        </header>

        <ImageSlot
          aspectRatio="16 / 9"
          caption={article.title}
          filename={article.image ?? `article-${article.slug}.webp`}
          sizes="(max-width: 1100px) 100vw, 1100px"
          priority
        />

        <div className="om-art-grid">
          <aside style={{ order: 2, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', minWidth: 0 }}>
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
                  <Link href="/models/porta" className="btn btn-secondary btn-block" style={{ marginTop: 'var(--space-2)' }}>
                    ออกแบบ PORTA สำหรับธุรกิจของคุณ
                  </Link>
                ) : null}
              </div>
            ) : null}
          </aside>

          <div style={{ order: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {article.sections.map((s) => (
              <section key={s.id} id={s.id}>
                <h2 style={{ fontSize: 'clamp(21px,2.6vw,28px)', margin: '0 0 var(--space-3)', scrollMarginTop: 96 }}>{s.heading}</h2>

                {s.answer ? (
                  <p
                    style={{
                      margin: '0 0 var(--space-4)',
                      fontSize: 18,
                      lineHeight: 1.7,
                      borderLeft: '3px solid var(--color-accent)',
                      paddingLeft: 'var(--space-4)',
                      color: 'var(--color-neutral-900)',
                    }}
                  >
                    {renderInline(s.answer)}
                  </p>
                ) : null}

                {s.body ? (
                  <p style={{ margin: 0, textAlign: 'justify', hyphens: 'auto', color: 'var(--color-neutral-900)' }}>{renderInline(s.body)}</p>
                ) : null}

                {s.bullets?.length ? (
                  <ul style={{ margin: 'var(--space-3) 0 0', paddingLeft: '1.3em', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {s.bullets.map((b, i) => (
                      <li key={i} style={{ color: 'var(--color-neutral-900)', lineHeight: 1.7 }}>{renderInline(b)}</li>
                    ))}
                  </ul>
                ) : null}

                {s.table ? (
                  <div style={{ overflowX: 'auto', margin: 'var(--space-4) 0 0' }}>
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
                              <td key={j}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {s.note ? (
                  <p style={{ margin: 'var(--space-3) 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>{renderInline(s.note)}</p>
                ) : null}

                {s.link ? (
                  <p style={{ margin: 'var(--space-3) 0 0', fontSize: 15, color: 'var(--color-neutral-800)' }}>
                    {s.link.lead}{' '}
                    <Link href={`/articles/${s.link.toSlug}`}>{getArticle(s.link.toSlug)?.title ?? s.link.toSlug}</Link>
                  </p>
                ) : null}

                {s.cta ? (
                  <div style={{ margin: 'var(--space-4) 0 0', background: 'var(--color-accent-100)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                    <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 19 }}>{s.cta.heading}</p>
                    <p style={{ margin: '0 0 var(--space-3)', fontSize: 14, color: 'var(--color-neutral-800)' }}>{s.cta.body}</p>
                    <Link href={ctaHref(s.cta.goRoute)} className="btn btn-primary">{s.cta.label}</Link>
                  </div>
                ) : null}

                {/* "planned" videos (no file shot yet) are skipped silently — LEO's draft
                    articles carry [VIDEO PLACEHOLDER] sections before production finishes. */}
                {s.video?.status === 'produced' && s.video.youtubeId ? (
                  <div style={{ margin: 'var(--space-4) 0 0', background: 'var(--color-accent-100)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                    <p style={{ margin: '0 0 var(--space-3)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 23, textAlign: 'center' }}>
                      วิดีโอ: {s.video.title}
                    </p>
                    <div style={{ maxWidth: 360, margin: '0 auto' }}>
                      <VideoEmbed title={s.video.title} youtubeId={s.video.youtubeId} />
                    </div>
                    <p style={{ margin: 'var(--space-3) 0 0', fontSize: 13, textAlign: 'center' }}>
                      <Link href={videosHubHref(article.relatedVehicleSlug, s.video.youtubeId)}>ดูวิดีโอเพิ่มเติมที่วิดีโอสาระน่ารู้ →</Link>
                    </p>
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
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span>{r.title}</span>
                      <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>{r.excerpt}</span>
                    </span>
                    <span style={{ color: 'var(--color-accent-700)' }}>→</span>
                  </Link>
                ))}
              </div>
            </section>

            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-neutral-700)' }}>
              ดูภาพและคลิปการใช้งานจริงเพิ่มเติมได้ที่{' '}
              <a href={social.url} target="_blank" rel="noopener noreferrer">{social.label}</a>
            </p>

            <section
              style={{
                background: 'var(--wl-ink)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                display: 'flex',
                gap: 'var(--space-4)',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 23, color: '#fff' }}>
                  {article.endCta?.heading ?? 'พร้อมลองขับจริงแล้วหรือยัง?'}
                </p>
                <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.72)', maxWidth: '52ch' }}>
                  {article.endCta?.body ?? 'ทีมงานพร้อมนำรถไปให้ทดลองขับที่บ้านหรือบริษัทของคุณ ตามพื้นที่ให้บริการและเงื่อนไขของบริษัท'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Link href={ctaHref(article.endCta?.goRoute ?? 'testdrive')} className="btn btn-primary">
                  {article.endCta?.label ?? 'นัดทดลองขับ'}
                </Link>
                <PhoneLink className="btn" style={{ color: 'var(--wl-lime)' }}>โทร {dealer.phoneDisplay}</PhoneLink>
              </div>
            </section>
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
