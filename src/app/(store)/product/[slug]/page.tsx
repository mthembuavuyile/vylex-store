import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MOCK_PRODUCTS, Product } from '@/lib/products';
import { ProductDetailClient } from './product-detail-client';

export const revalidate = 300; // Edge cached, revalidates every 5 minutes

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
    return { title: 'Product Not Found | Vylex Store' };
  }

  const metaTitle = product.seo_title || `${product.title} | Vylex Store`;
  const metaDescription = product.seo_description || product.description || 'Shop premium tech accessories and electronics online at Vylex Store South Africa with fast nationwide delivery.';
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
      siteName: 'Vylex Store',
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
    relatedProducts = MOCK_PRODUCTS.filter(
      p => p.category === product.category && p.slug !== slug && p.status !== 'draft'
    ).slice(0, 3);
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
          name: product.vendor || 'Vylex',
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
            name: 'Vylex Store',
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
