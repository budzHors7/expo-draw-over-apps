import type { MetadataRoute } from 'next';
import { siteConfig } from '../lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: new Date('2026-04-11T00:00:00+02:00'),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
