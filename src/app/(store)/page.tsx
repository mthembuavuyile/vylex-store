'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, ShieldCheck, Truck, MessageSquare, 
  RotateCcw, Store, Sparkles, Zap, ChevronRight, Star
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MOCK_PRODUCTS, Product, ProductIcon, CATEGORIES } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch live products from Supabase with fallback to mock data
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, title, description, price, sku, category, images, stock_quantity, slug, specifications')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          setProducts(MOCK_PRODUCTS);
        } else {
          setProducts(data);
        }
      } catch (err) {
        console.warn('Supabase product query error:', err);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const featuredProduct = products[0] || MOCK_PRODUCTS[0];
  const bestSellers = products.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-glow"></div>
        <div className="container hero-inner">
          <div className="hero-content" style={{ animation: 'fadeIn 0.8s ease-out' }}>
            <div className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <Sparkles size={14} style={{ color: 'var(--orange)' }} />
              <span>South Africa's Trusted Tech Store</span>
            </div>
            <h1>Vybetek Premium <span>Consumer Tech</span></h1>
            <p>Elevate your digital life. Fast dispatch and secure delivery on premium power banks, audio, smart wearables, and chargers.</p>
            <div className="hero-buttons">
              <Link href="/shop" className="btn btn-primary">
                Shop All Products <ArrowRight size={18} />
              </Link>
              <Link href="/about" className="btn btn-outline">
                About Our Store
              </Link>
            </div>
          </div>
          
          {/* Featured Hero Product Card */}
          {featuredProduct && (
            <div className="hero-featured-card">
              <div style={{
                background: 'var(--white)',
                padding: '28px',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                maxWidth: '320px',
                width: '100%',
                color: 'var(--navy)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase' }}>
                    Featured Item
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy)' }}>
                    R{Number(featuredProduct.price).toFixed(2)}
                  </span>
                </div>
                
                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
                  <ProductIcon 
                    name={Array.isArray(featuredProduct.images) ? featuredProduct.images[0] : (featuredProduct.images || 'powerbank')} 
                    className="detail-icon-large" 
                  />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                    {featuredProduct.title}
                  </h3>
                  <p style={{ 
                    fontSize: '0.82rem', 
                    color: 'var(--sdark)', 
                    marginBottom: '16px', 
                    display: '-webkit-box', 
                    WebkitLineClamp: 2, 
                    WebkitBoxOrient: 'vertical', 
                    overflow: 'hidden' 
                  }}>
                    {featuredProduct.description}
                  </p>
                  <Link
                    href={`/product/${featuredProduct.slug || featuredProduct.id}`}
                    className="btn btn-primary"
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    View Product
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust & Value Proposition Strip */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid var(--slate)', padding: '24px 0' }}>
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon-box">
                <Truck size={22} style={{ color: 'var(--orange)' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Courier Guy Express</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--sdark)' }}>Direct to door across South Africa</p>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon-box">
                <ShieldCheck size={22} style={{ color: 'var(--orange)' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Secure Payment</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--sdark)' }}>Stripe, PayFast, Apple Pay & EFT</p>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon-box">
                <RotateCcw size={22} style={{ color: 'var(--orange)' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>7-Day Returns</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--sdark)' }}>Hassle-free money-back guarantee</p>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon-box">
                <MessageSquare size={22} style={{ color: '#10B981' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>WhatsApp Support</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--sdark)' }}>Instant real-time human assistance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation Cards */}
      <section className="container" style={{ padding: '60px 0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="sec-lbl">Explore Categories</div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700 }}>Shop By Category</h2>
        </div>

        <div className="category-card-grid">
          {CATEGORIES.filter(c => c !== 'All').map(cat => (
            <Link 
              key={cat} 
              href={`/shop?category=${encodeURIComponent(cat)}`}
              className="category-card"
            >
              <div className="category-card-icon">
                <ProductIcon name={cat.toLowerCase()} className="category-icon-svg" />
              </div>
              <h3 className="category-card-title">{cat}</h3>
              <span className="category-card-cta">
                Browse <ChevronRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers / Curated Tech Catalog Preview */}
      <section className="container" style={{ padding: '40px 0 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="sec-lbl">Featured Inventory</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700 }}>Best Selling Tech</h2>
          </div>
          <Link href="/shop" className="btn btn-outline" style={{ gap: '8px' }}>
            View Full Shop Catalog <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="product-skeleton-card">
                <div style={{ width: '100%', aspectRatio: '4/3', background: '#e2e8f0', borderRadius: '10px', marginBottom: '12px' }} />
                <div style={{ width: '40%', height: '12px', background: '#cbd5e1', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ width: '85%', height: '16px', background: '#cbd5e1', borderRadius: '4px', marginBottom: '10px' }} />
                <div style={{ width: '60%', height: '16px', background: '#e2e8f0', borderRadius: '4px' }} />
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

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link href="/shop" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1rem' }}>
            Browse All Products in Shop <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Trust & Commitment Banner */}
      <section style={{ background: 'var(--navy)', color: '#ffffff', padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
            <div>
              <span style={{ color: 'var(--orange)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Vybetek Commitment
              </span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, marginTop: '8px', marginBottom: '16px', color: '#ffffff' }}>
                Direct Dispatch Across South Africa
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.7, marginBottom: '24px' }}>
                Every order is carefully inspected, packed, and handed over to The Courier Guy for rapid tracking and reliable door-to-door delivery in Gauteng, Western Cape, KwaZulu-Natal, and across all 9 provinces.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link href="/shipping" className="btn btn-primary">
                  Shipping Details
                </Link>
                <Link href="/contact" className="btn btn-outline" style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                  Contact Support
                </Link>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '32px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--orange)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} /> What Makes Us Different?
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '14px', listStyle: 'none', padding: 0, color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.92rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: 'var(--orange)', fontWeight: 'bold' }}>✓</span>
                  <span>100% Genuine, tested consumer electronics & safety-certified power accessories.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: 'var(--orange)', fontWeight: 'bold' }}>✓</span>
                  <span>Transparent South African pricing with <strong>NO hidden import customs or surprise fees</strong>.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: 'var(--orange)', fontWeight: 'bold' }}>✓</span>
                  <span>Real human support available via WhatsApp, phone, and email.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
