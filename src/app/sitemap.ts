import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pharmnode.com';

  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/features', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/workflow', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/use-cases', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/technologies', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/regulatory', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/pricing', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/knowledge-base/compatibility-matrix', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/knowledge-base/excipients', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/api-reference', priority: 0.7, changeFrequency: 'weekly' as const },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
