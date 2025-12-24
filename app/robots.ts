import type { MetadataRoute } from 'next';
import { getBaseUrl } from './lib/seo';

const baseUrl = getBaseUrl();

export default function robot(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
