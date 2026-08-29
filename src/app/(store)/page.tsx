import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MOCK_PRODUCTS, Product, ProductIcon, CATEGORIES } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';

export const revalidate = 300; // Cache at edge & revalidate every 5 minutes

async function getActiveProducts(): Promise<Product[]> {
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
    console.warn('Supabase product query error:', err);
  }
  return MOCK_PRODUCTS.filter(p => p.status !== 'draft');
}

export default async function HomePage() {
  const products = await getActiveProducts();
  const activeProducts = products.filter(p => p.status !== 'draft');
  const featuredProduct = activeProducts.find(p => p.is_featured) || activeProducts[0] || MOCK_PRODUCTS[0];
  const bestSellers = activeProducts.slice(0, 4);

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
              Reliable tech accessories, fast GaN power delivery, wireless audio, and lifestyle essentials. Handled locally and dispatched nationwide across South Africa.
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

      {/* Category Navigation */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header-clean">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Browse curated collections designed for daily utility</p>
          </div>

          <div className="category-grid-clean">
            {CATEGORIES.filter(c => c !== 'All').map(cat => (
              <Link 
                key={cat} 
                href={`/shop?category=${encodeURIComponent(cat)}`}
                className="category-pill-card"
                prefetch={true}
              >
                <div className="category-pill-icon">
                  <ProductIcon name={cat.toLowerCase()} />
                </div>
                <div className="category-pill-text">
                  <h3>{cat}</h3>
                  <span>Browse &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Catalog Preview */}
      <section className="catalog-preview-section">
        <div className="container">
          <div className="catalog-header-row">
            <div>
              <h2 className="section-title">Popular Items</h2>
              <p className="section-subtitle">Our most demanded tech and everyday accessories</p>
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
