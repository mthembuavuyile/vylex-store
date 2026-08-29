'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, ShieldCheck, Truck, MessageSquare, 
  RotateCcw, ChevronRight, Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MOCK_PRODUCTS, Product, ProductIcon, CATEGORIES } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch live active products from Supabase with fallback to mock data
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .neq('status', 'draft')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          setProducts(MOCK_PRODUCTS.filter(p => p.status !== 'draft'));
        } else {
          setProducts(data as Product[]);
        }
      } catch (err) {
        console.warn('Supabase product query error:', err);
        setProducts(MOCK_PRODUCTS.filter(p => p.status !== 'draft'));
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

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
              <Link href="/shop" className="btn btn-primary">
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
                <div className="hero-preview-badge">Featured Pick</div>
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

      {/* Trust & Guarantee Strip */}
      <section className="trust-strip">
        <div className="container">
          <div className="trust-strip-grid">
            <div className="trust-strip-item">
              <Truck size={20} className="trust-strip-icon" />
              <div>
                <h4>The Courier Guy</h4>
                <p>Tracked door-to-door delivery across SA</p>
              </div>
            </div>

            <div className="trust-strip-item">
              <ShieldCheck size={20} className="trust-strip-icon" />
              <div>
                <h4>Secure Payments</h4>
                <p>Card, Apple Pay & Instant EFT</p>
              </div>
            </div>

            <div className="trust-strip-item">
              <RotateCcw size={20} className="trust-strip-icon" />
              <div>
                <h4>7-Day Guarantee</h4>
                <p>Simple money-back and exchange policy</p>
              </div>
            </div>

            <div className="trust-strip-item">
              <MessageSquare size={20} className="trust-strip-icon" />
              <div>
                <h4>Direct Support</h4>
                <p>Human assistance via WhatsApp & email</p>
              </div>
            </div>
          </div>
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
            <Link href="/shop" className="btn btn-outline btn-sm">
              View All Products <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="product-grid">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="product-skeleton-card">
                  <div style={{ width: '100%', aspectRatio: '1', background: '#e2e8f0', borderRadius: '8px', marginBottom: '12px' }} />
                  <div style={{ width: '40%', height: '12px', background: '#cbd5e1', borderRadius: '4px', marginBottom: '8px' }} />
                  <div style={{ width: '80%', height: '16px', background: '#cbd5e1', borderRadius: '4px', marginBottom: '10px' }} />
                  <div style={{ width: '50%', height: '16px', background: '#e2e8f0', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {bestSellers.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Local Commitment Section */}
      <section className="store-commitment-section">
        <div className="container">
          <div className="commitment-inner">
            <div className="commitment-left">
              <span className="commitment-tag">Local South African Warehouse</span>
              <h2>Direct Dispatch from Johannesburg</h2>
              <p>
                We stock all listed items locally in Gauteng. Every order is inspected, securely packaged, and dispatched through The Courier Guy with live tracking from our warehouse to your door.
              </p>
              <div className="commitment-actions">
                <Link href="/shipping" className="btn btn-primary">
                  Shipping Rates & Times
                </Link>
                <Link href="/contact" className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                  Contact Support
                </Link>
              </div>
            </div>

            <div className="commitment-right">
              <ul className="commitment-points">
                <li>
                  <Check size={18} className="point-icon" />
                  <div>
                    <strong>Local SA Stock</strong>
                    <p>No unexpected import duties, customs delays, or overseas drop-shipping.</p>
                  </div>
                </li>
                <li>
                  <Check size={18} className="point-icon" />
                  <div>
                    <strong>Safety & Quality Tested</strong>
                    <p>Certified electronics with multi-stage surge and overheat protection.</p>
                  </div>
                </li>
                <li>
                  <Check size={18} className="point-icon" />
                  <div>
                    <strong>Fast Courier Guy Delivery</strong>
                    <p>1–3 business days to metropolitan areas across all 9 provinces.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

