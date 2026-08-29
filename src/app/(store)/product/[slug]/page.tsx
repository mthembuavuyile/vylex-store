import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MOCK_PRODUCTS, Product } from '@/lib/products';
import { ProductDetailClient } from './product-detail-client';

type Props = {
  params: Promise<{ slug: string }>;
};

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      return data as Product;
    }
  } catch (err) {
    console.warn('Error fetching product by slug from Supabase:', err);
  }

  // Fallback to mock data by slug or id
  const fallback = MOCK_PRODUCTS.find(p => p.slug === slug || p.id === slug);
  return fallback || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Product Not Found | Vybetek Store' };
  }

  const metaTitle = product.seo_title || `${product.title} | Vybetek Store`;
  const metaDescription = product.seo_description || product.description || 'Shop premium products online at Vybetek Store South Africa.';

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'website',
      siteName: 'Vybetek Store',
      url: `https://store.vylex.co.za/product/${slug}`,
      images: Array.isArray(product.images) && product.images.length > 0 ? [product.images[0]] : []
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products in the same category (active only)
  let relatedProducts: Product[] = [];
  try {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('category', product.category)
      .neq('slug', slug)
      .neq('status', 'draft')
      .limit(3);
    if (data && data.length > 0) {
      relatedProducts = data as Product[];
    }
  } catch {
    // Ignore error
  }

  if (relatedProducts.length === 0) {
    relatedProducts = MOCK_PRODUCTS.filter(
      p => p.category === product.category && p.slug !== slug && p.status !== 'draft'
    ).slice(0, 3);
  }

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
