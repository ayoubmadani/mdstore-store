import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mdstore.top';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/about', '/contact', '/plan', '/privacy', '/terms', '/cookies'];
  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));
}
