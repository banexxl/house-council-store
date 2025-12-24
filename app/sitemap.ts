import type { MetadataRoute } from 'next';
import { getBaseUrl } from './lib/seo';

const baseUrl = getBaseUrl();

type RouteConfig = {
  path: string;
  priority?: number;
  changeFrequency?: MetadataRoute.Sitemap[0]['changeFrequency'];
};

const routes: RouteConfig[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/docs' },
  { path: '/pricing' },
  { path: '/pricing/subscription-plan-purchase' },
  { path: '/pricing/subscription-plan-purchase/success' },
  { path: '/pricing/subscription-plan-purchase/error' },
  { path: '/contact' },
  { path: '/privacy-policy' },
  { path: '/terms-and-conditions' },
  { path: '/auth/register', priority: 0.7 },
  { path: '/auth/sign-in', priority: 0.7 },
  { path: '/auth/forgot-password', priority: 0.6 },
  { path: '/auth/forgot-password/result', priority: 0.6 },
  { path: '/auth/registration-confirmation', priority: 0.6 },
  { path: '/auth/registration-confirmed', priority: 0.6 },
  { path: '/auth/reset-password', priority: 0.6 },
  { path: '/auth/error', priority: 0.5 },
  { path: '/profile', priority: 0.6 },
];

const defaultChangeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'] = 'weekly';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map(({ path, priority = 0.8, changeFrequency = defaultChangeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
