import type { MetadataRoute } from 'next';
import { vehicles } from '@/lib/data/vehicles';
import { allArticles } from '@/lib/data/articles';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/models',
    '/lease',
    '/compare',
    '/calculator',
    '/savings',
    '/test-drive',
    '/articles',
    '/videos',
    '/service',
    '/areas',
    '/contact',
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  vehicles.forEach((v) => {
    entries.push({ url: `${SITE_URL}/models/${v.slug}`, lastModified: new Date() });
  });

  allArticles.forEach((a) => {
    entries.push({ url: `${SITE_URL}/articles/${a.slug}`, lastModified: new Date() });
  });

  return entries;
}
