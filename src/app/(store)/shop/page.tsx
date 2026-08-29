import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/products';
import { PageHeader } from '@/components/PageHeader';
import { ShopClient } from './shop-client';

export const revalidate = 300; // Edge cached, revalidates every 5 minutes

export const metadata: Metadata = {
  title: 'Shop All Products | CartMate South Africa',
  description: 'Explore our full catalog of high-quality everyday essentials with nationwide delivery across South Africa.',
  alternates: {
    canonical: 'https://store.vylex.co.za/shop',
  },
  openGraph: {
    title: 'Shop All Products | CartMate South Africa',
    description: 'Browse our collection of everyday essentials delivered nationwide.',
    url: 'https://store.vylex.co.za/shop',
    siteName: 'CartMate',
  },
};

async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, slug, category, vendor, price, compare_at_price, sku, stock_quantity, low_stock_threshold, allow_backorder, description, specifications, images, tags, status, is_featured, weight_kg, seo_title, seo_description, created_at, updated_at')
      .neq('status', 'draft')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as Product[];
    }
  } catch (err) {
    console.warn('Error fetching shop products on server:', err);
  }
  return [];
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div>
      <PageHeader 
        title="Shop All Products"
        subtitle="Explore our curated collection of high-quality everyday essentials designed for your lifestyle."
        breadcrumbs={[{ label: 'Shop Catalog' }]}
      />

      <div className="container shop-catalog-container">
        <Suspense fallback={
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--sdark)' }}>
            Loading catalog...
          </div>
        }>
          <ShopClient initialProducts={products} />
        </Suspense>
      </div>
    </div>
  );
}
