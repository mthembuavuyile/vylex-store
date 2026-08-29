import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { MOCK_PRODUCTS } from '@/lib/products';

export const revalidate = 3600; // Refresh sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://store.vylex.co.za';

  // Fetch active products from Supabase with fallback to mock data
  let products = MOCK_PRODUCTS.filter(p => p.status !== 'draft');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('slug, id, updated_at')
      .neq('status', 'draft');

    if (!error && data && data.length > 0) {
      products = data as any;
    }
  } catch {
    // Keep mock products on failure
  }

  // Core static & editorial routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/refund`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Dynamic product routes
  const productRoutes: MetadataRoute.Sitemap = products.map(product => ({
    url: `${baseUrl}/product/${product.slug || product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
