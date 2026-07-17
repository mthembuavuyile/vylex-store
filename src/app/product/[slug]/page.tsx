import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MOCK_PRODUCTS } from '@/lib/products';
import { ProductDetailClient } from './product-detail-client';

type Props = {
  params: Promise<{ slug: string }>;
};

async function getProduct(slug: string) {
  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, description, price, sku, category, images, stock_quantity, slug')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      return data;
    }
  } catch {
    // Supabase not available
  }

  // Fall back to mock products
  const mock = MOCK_PRODUCTS.find(p => p.slug === slug);
  return mock || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Product Not Found | Vylex Store' };
  }

  return {
    title: `${product.title} | Vylex Store`,
    description: product.description,
    openGraph: {
      title: `${product.title} — R${Number(product.price).toFixed(2)}`,
      description: product.description,
      type: 'website',
      siteName: 'Vylex Store',
      url: `https://store.vylex.co.za/product/${slug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Get related products (same category, excluding current)
  let relatedProducts: any[] = [];
  try {
    const { data } = await supabase
      .from('products')
      .select('id, title, price, category, images, slug')
      .eq('category', product.category)
      .neq('slug', slug)
      .limit(3);
    if (data && data.length > 0) {
      relatedProducts = data;
    }
  } catch {
    // Fall back to mock
  }

  if (relatedProducts.length === 0) {
    relatedProducts = MOCK_PRODUCTS
      .filter(p => p.category === product.category && p.slug !== slug)
      .slice(0, 3);
  }

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
