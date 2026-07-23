import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ProductDetailClient } from './product-detail-client';

type Props = {
  params: Promise<{ slug: string }>;
};

async function getProduct(slug: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, description, price, sku, category, images, stock_quantity, slug, specifications')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn('Error fetching product by slug:', err);
  }
  return null;
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

  // Fetch related products in the same category
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
    // Ignore error
  }

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
