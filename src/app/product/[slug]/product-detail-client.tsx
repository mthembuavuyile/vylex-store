'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart, ArrowLeft, ShieldCheck, Truck, CheckCircle2,
  ChevronRight, Star, Package
} from 'lucide-react';
import { ProductIcon } from '@/lib/products';
import { useCart } from '@/lib/cart-context';
import type { Product } from '@/lib/products';

interface Props {
  product: Product;
  relatedProducts: any[];
}

export function ProductDetailClient({ product, relatedProducts }: Props) {
  const { addToCart, cartCount } = useCart();
  const [addedFeedback, setAddedFeedback] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image: product.images?.[0] || 'powerbank',
      slug: product.slug,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Compact Navigation */}
      <header className="navbar">
        <div className="container navbar-inner" style={{ height: '64px' }}>
          <Link href="/" className="logo">
            <img src="/logo.png" alt="Vylex Logo" width="28" height="28" style={{ flexShrink: 0, objectFit: 'contain' }} />
            <span className="logo-text">vylex<span className="logo-dot-text">.</span><span className="logo-subtext">Store</span></span>
          </Link>

          <Link href="/" className="btn-icon" style={{ position: 'relative' }}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: 'var(--orange)', color: 'var(--navy)',
                fontSize: '0.72rem', fontWeight: 700,
                width: '20px', height: '20px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="container" style={{ padding: '16px 24px 0' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--sdark)' }}>
          <Link href="/" style={{ color: 'var(--sdark)', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={14} />
          <Link href={`/#catalog`} style={{ color: 'var(--sdark)', textDecoration: 'none' }}>{product.category}</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{product.title}</span>
        </nav>
      </div>

      {/* Product Detail */}
      <main className="container" style={{ flexGrow: 1, padding: '24px 24px 60px' }}>

        {/* Product Hero — stacks vertically on mobile */}
        <div className="product-detail-grid">

          {/* Product Image */}
          <div className="product-detail-image">
            <ProductIcon name={product.images?.[0] || 'powerbank'} className="detail-icon-hero" />
          </div>

          {/* Product Info */}
          <div className="product-detail-info">
            <span className="product-category">{product.category}</span>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '8px' }}>
              {product.title}
            </h1>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--sdark)',
              background: 'var(--slate)', padding: '4px 8px', borderRadius: '4px',
              display: 'inline-block', marginBottom: '20px'
            }}>
              SKU: {product.sku}
            </span>

            <div style={{ fontSize: 'clamp(1.6rem, 4vw, 2rem)', fontWeight: 700, color: 'var(--navy)', marginBottom: '24px' }}>
              R{Number(product.price).toFixed(2)}
            </div>

            <p style={{ color: 'var(--sdark)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '28px' }}>
              {product.description}
            </p>

            {/* Trust Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--sdark)' }}>
                <ShieldCheck size={16} style={{ color: 'var(--green)' }} /> Warranty Included
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--sdark)' }}>
                <Truck size={16} style={{ color: 'var(--orange)' }} /> Free shipping over R1000
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--sdark)' }}>
                <Package size={16} style={{ color: '#2563eb' }} /> Fast Dispatch
              </div>
            </div>

            {/* Add to Cart */}
            <button
              className="btn btn-primary product-detail-atc"
              onClick={handleAddToCart}
              style={{ width: '100%', padding: '16px', gap: '10px', fontSize: '1rem' }}
            >
              {addedFeedback ? (
                <><CheckCircle2 size={20} /> Added to Cart!</>
              ) : (
                <><ShoppingCart size={20} /> Add to Shopping Cart</>
              )}
            </button>
          </div>
        </div>

        {/* Specifications Section */}
        {product.specifications && product.specifications.length > 0 && (
          <section className="product-specs-section">
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>Specifications</h2>
            <div className="product-specs-grid">
              {product.specifications.map((spec: string, idx: number) => (
                <div key={idx} className="product-spec-item">
                  <CheckCircle2 size={16} style={{ color: 'var(--orange)', flexShrink: 0, marginTop: '2px' }} />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '60px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px' }}>You May Also Like</h2>
            <div className="product-grid">
              {relatedProducts.map((rp: any) => (
                <Link
                  key={rp.id}
                  href={`/product/${rp.slug}`}
                  className="product-card product-card-link"
                >
                  <div className="product-image-wrapper" style={{ aspectRatio: '4/3' }}>
                    <ProductIcon name={rp.images?.[0] || 'powerbank'} />
                  </div>
                  <div className="product-details">
                    <span className="product-category">{rp.category}</span>
                    <h3 className="product-title">{rp.title}</h3>
                    <div className="product-price-row">
                      <span className="product-price">R{Number(rp.price).toFixed(2)}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--orange)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        View <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom" style={{ borderTop: 'none', paddingTop: '0' }}>
            <p>&copy; {new Date().getFullYear()} Vylex Store. All rights reserved.</p>
            <p style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} style={{ color: 'var(--green)' }} /> Genuine Stock Warranty</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="mobile-sticky-atc">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--sdark)' }}>{product.title}</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>R{Number(product.price).toFixed(2)}</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAddToCart}
          style={{ padding: '12px 24px', gap: '8px', whiteSpace: 'nowrap' }}
        >
          {addedFeedback ? <><CheckCircle2 size={18} /> Added!</> : <><ShoppingCart size={18} /> Add</>}
        </button>
      </div>
    </div>
  );
}
