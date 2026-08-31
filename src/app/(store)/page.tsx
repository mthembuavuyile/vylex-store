import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product, ProductIcon } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';

export const revalidate = 300; // Cache at edge & revalidate every 5 minutes

async function getActiveProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, slug, category, vendor, price, compare_at_price, sku, stock_quantity, low_stock_threshold, allow_backorder, description, specifications, images, icon_key, tags, status, is_featured, weight_kg, seo_title, seo_description, created_at, updated_at')
      .neq('status', 'draft')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as Product[];
    }
  } catch (err) {
    console.warn('Supabase product query error:', err);
  }
  return [];
}

export default async function HomePage() {
  const products = await getActiveProducts();
  const activeProducts = products.filter(p => p.status !== 'draft');
  const featuredProduct = activeProducts.find(p => p.is_featured) || activeProducts[0];
  const bestSellers = activeProducts.slice(0, 4);

  // Group active products by category and calculate stats for intelligent ranking
  const categoryStatsMap = activeProducts.reduce((acc, p) => {
    if (!p.category) return acc;
    const cat = p.category.trim();
    if (!cat) return acc;

    if (!acc[cat]) {
      acc[cat] = {
        name: cat,
        count: 0,
        firstCreatedAt: p.created_at || new Date().toISOString(),
        hasFeatured: false,
      };
    }
    acc[cat].count += 1;
    if (p.is_featured) {
      acc[cat].hasFeatured = true;
    }
    if (p.created_at && new Date(p.created_at) < new Date(acc[cat].firstCreatedAt)) {
      acc[cat].firstCreatedAt = p.created_at;
    }
    return acc;
  }, {} as Record<string, { name: string; count: number; firstCreatedAt: string; hasFeatured: boolean }>);

  // Deterministic 3-tier sort:
  // 1. Categories containing featured products
  // 2. Highest product count (deepest inventory first)
  // 3. Earliest established category (firstCreatedAt ASC)
  const sortedCategories = Object.values(categoryStatsMap).sort((a, b) => {
    if (a.hasFeatured !== b.hasFeatured) {
      return a.hasFeatured ? -1 : 1;
    }
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return new Date(a.firstCreatedAt).getTime() - new Date(b.firstCreatedAt).getTime();
  });

  const featuredCategories = sortedCategories.slice(0, 6);
  const totalCategoriesCount = sortedCategories.length;

  return (
    <div className="home-wrapper">
      {/* Hero Section - Clean & Viewport-Balanced */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-text-col">
            <h1 className="hero-title">
              Premium Everyday Essentials, <span>Delivered Fast</span>.
            </h1>
            <p className="hero-description">
              High-quality lifestyle essentials, skincare, and everyday goods. Handled locally and dispatched nationwide across South Africa.
            </p>
            <div className="hero-cta-group">
              <Link href="/shop" className="btn btn-primary" prefetch={true}>
                Shop Catalog <ArrowRight size={17} />
              </Link>
              <Link href="/about" className="btn btn-secondary">
                About Our Store
              </Link>
            </div>
          </div>

          {/* Featured Hero Product Showcase */}
          {featuredProduct && (
            <div className="hero-product-col">
              <div className="hero-product-preview">
                <div className="hero-preview-image-box">
                  <ProductIcon
                    name={Array.isArray(featuredProduct.images) ? featuredProduct.images[0] : (featuredProduct.images || 'powerbank')}
                    iconKey={featuredProduct.icon_key}
                    className="hero-preview-icon"
                    alt={featuredProduct.title}
                  />
                </div>
                <div className="hero-preview-info">
                  <span className="hero-preview-category">
                    {featuredProduct.vendor ? `${featuredProduct.vendor} • ` : ''}{featuredProduct.category}
                  </span>
                  <h3 className="hero-preview-title">
                    {featuredProduct.title}
                  </h3>
                  <div className="hero-preview-bottom">
                    <div className="hero-preview-price">
                      <span className="current-price">R{Number(featuredProduct.price).toFixed(2)}</span>
                      {featuredProduct.compare_at_price && Number(featuredProduct.compare_at_price) > Number(featuredProduct.price) && (
                        <span className="original-price">R{Number(featuredProduct.compare_at_price).toFixed(2)}</span>
                      )}
                    </div>
                    <Link
                      href={`/product/${featuredProduct.slug || featuredProduct.id}`}
                      className="btn btn-primary btn-sm"
                      prefetch={true}
                    >
                      View <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Category Navigation - Capped to Top 6 with Direct Full Catalog Link */}
      {featuredCategories.length > 0 && (
        <section className="categories-section">
          <div className="container">
            <div className="catalog-header-row categories-header-row">
              <div>
                <h2 className="section-title">Shop by Category</h2>
                <p className="section-subtitle">Browse curated collections designed for daily utility</p>
              </div>
              <Link href="/shop" className="btn btn-outline btn-sm" prefetch={true}>
                View All Categories {totalCategoriesCount > 0 ? `(${totalCategoriesCount})` : ''} <ArrowRight size={15} />
              </Link>
            </div>

            <div className="category-grid-clean">
              {featuredCategories.map(cat => (
                <Link
                  key={cat.name}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="category-pill-card"
                  prefetch={true}
                >
                  <div className="category-pill-icon">
                    <ProductIcon name={cat.name.toLowerCase()} />
                  </div>
                  <div className="category-pill-text">
                    <h3>{cat.name}</h3>
                    <div className="category-pill-meta">
                      <span className="category-pill-count">{cat.count} {cat.count === 1 ? 'item' : 'items'}</span>
                      <span className="category-pill-arrow">Browse &rarr;</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Catalog Preview */}
      <section className="catalog-preview-section">
        <div className="container">
          <div className="catalog-header-row">
            <div>
              <h2 className="section-title">Popular Items</h2>
              <p className="section-subtitle">Our most demanded everyday essentials</p>
            </div>
            <Link href="/shop" className="btn btn-outline btn-sm" prefetch={true}>
              View All Products <ArrowRight size={15} />
            </Link>
          </div>

          <div className="product-grid">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
