import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/products';
import { ProductDetailClient } from './product-detail-client';

export const revalidate = 300; // Edge cached, revalidates every 5 minutes

type Props = {
  params: Promise<{ slug: string }>;
};

async function getProduct(slug: string): Promise<Product | null> {
  const decoded = decodeURIComponent(slug).trim();

  // 1. Try fetching from Supabase by slug
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, slug, category, vendor, price, compare_at_price, sku, stock_quantity, low_stock_threshold, allow_backorder, description, specifications, images, tags, status, is_featured, weight_kg, seo_title, seo_description, created_at, updated_at')
      .eq('slug', decoded)
      .maybeSingle();

    if (!error && data) {
      return data as Product;
    }
  } catch (err) {
    console.warn('Error querying product by slug:', err);
  }

  // 2. Try fetching from Supabase by id
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, slug, category, vendor, price, compare_at_price, sku, stock_quantity, low_stock_threshold, allow_backorder, description, specifications, images, tags, status, is_featured, weight_kg, seo_title, seo_description, created_at, updated_at')
      .eq('id', decoded)
      .maybeSingle();

    if (!error && data) {
      return data as Product;
    }
  } catch (err) {
    console.warn('Error querying product by id:', err);
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Product Not Found | CartMate' };
  }

  const metaTitle = product.seo_title || `${product.title} | CartMate`;
  const metaDescription = product.seo_description || product.description || 'Shop premium everyday essentials, skincare, and lifestyle products online at CartMate South Africa with fast nationwide delivery.';
  const canonicalUrl = `https://store.vylex.co.za/product/${slug}`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'website',
      siteName: 'CartMate',
      url: canonicalUrl,
      images: Array.isArray(product.images) && product.images.length > 0 ? [product.images[0]] : []
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
    }
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
    relatedProducts = [];
  }

  const inStock = (product.stock_quantity ?? 10) > 0 || product.allow_backorder;
  const price = Number(product.price) || 0;
  const productUrl = `https://store.vylex.co.za/product/${slug}`;

  // Structured Data (JSON-LD) for Google Shopping & Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        name: product.title,
        description: product.description,
        sku: product.sku || product.id,
        image: Array.isArray(product.images) && product.images.length > 0 ? product.images : undefined,
        brand: {
          '@type': 'Brand',
          name: product.vendor || 'CartMate',
        },
        category: product.category,
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'ZAR',
          price: price.toFixed(2),
          itemCondition: 'https://schema.org/NewCondition',
          availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'CartMate',
            url: 'https://store.vylex.co.za',
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://store.vylex.co.za',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Shop',
            item: 'https://store.vylex.co.za/shop',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.category || 'Products',
            item: `https://store.vylex.co.za/shop?category=${encodeURIComponent(product.category || 'All')}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: product.title,
            item: productUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
