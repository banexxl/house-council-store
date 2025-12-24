import type { MetadataRoute } from 'next';

const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL!

const baseUrl = rawBaseUrl.replace(/\/$/, '');

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
