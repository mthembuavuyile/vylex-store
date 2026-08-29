import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/success'],
      },
    ],
    sitemap: 'https://store.vylex.co.za/sitemap.xml',
    host: 'https://store.vylex.co.za',
  };
}
