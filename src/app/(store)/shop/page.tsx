import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/products';
import { PageHeader } from '@/components/PageHeader';
import { ShopClient } from './shop-client';

export const revalidate = 300; // Edge cached, revalidates every 5 minutes

export const metadata: Metadata = {
  title: 'Shop All Products | Vylex Store South Africa',
  description: 'Explore the full catalog of safety-certified power banks, GaN fast chargers, wireless audio, and tech essentials with nationwide delivery across South Africa.',
  alternates: {
    canonical: 'https://store.vylex.co.za/shop',
  },
  openGraph: {
    title: 'Shop All Products | Vylex Store South Africa',
    description: 'Browse certified power banks, chargers, audio, and accessories delivered nationwide.',
    url: 'https://store.vylex.co.za/shop',
    siteName: 'Vylex Store',
  },
};

async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
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
        subtitle="Explore our full collection of power banks, wireless audio, smart wearables, chargers, and tech essentials."
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
