'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart, ShieldCheck, Truck, CheckCircle2,
  ChevronRight, Package, Tag, AlertCircle, Check
} from 'lucide-react';
import { ProductIcon } from '@/lib/products';
import { useCart } from '@/lib/cart-context';
import type { Product, ProductSpecification } from '@/lib/products';

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: Props) {
  const { addToCart, setIsCartOpen } = useCart();
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Multi-image gallery state
  const rawImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [typeof product.images === 'string' ? product.images : 'powerbank'];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = rawImages[activeImageIndex] || rawImages[0] || 'powerbank';

  // Define dynamic variant choices based on product category
  const colors = 
    product.category === 'Smartwatches' ? ['Titanium Gray', 'Midnight Black', 'Sport Orange'] :
    product.category === 'Power Banks' ? ['Matte Black', 'Space Gray', 'Navy Blue'] :
    product.category === 'Earbuds' ? ['Glossy White', 'Matte Black'] : [];

  const sizes = 
    product.category === 'Smartwatches' ? ['41mm', '45mm'] :
    product.category === 'Chargers' ? ['Standard 2-Pin', '3-Pin Heavy Duty'] : [];

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    if (colors.length > 0) setSelectedColor(colors[0]);
    if (sizes.length > 0) setSelectedSize(sizes[0]);
  }, [product.category]);

  const price = Number(product.price) || 0;
  const compareAtPrice = product.compare_at_price ? Number(product.compare_at_price) : null;
  const hasDiscount = compareAtPrice !== null && compareAtPrice > price;
  const savingsAmount = hasDiscount ? compareAtPrice - price : 0;
  const savingsPercent = hasDiscount ? Math.round((savingsAmount / compareAtPrice) * 100) : 0;

  const stockQty = product.stock_quantity !== undefined ? product.stock_quantity : 25;
  const isOutOfStock = stockQty <= 0 && !product.allow_backorder;
  const isLowStock = stockQty > 0 && stockQty <= (product.low_stock_threshold || 10);

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    const variantParts = [];
    if (sizes.length > 0 && selectedSize) variantParts.push(selectedSize);
    if (colors.length > 0 && selectedColor) variantParts.push(selectedColor);
    const variantStr = variantParts.join(' / ');

    addToCart({
      id: product.id,
      title: product.title,
      price: price,
      image: activeImage,
      slug: product.slug,
      variant: variantStr || undefined,
    });
    
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
    setIsCartOpen(true);
  };

  // Helper to extract clean key-value specs
  const parsedSpecs: { key: string; value: string }[] = [];
  if (Array.isArray(product.specifications)) {
    product.specifications.forEach((spec: ProductSpecification, idx: number) => {
      if (typeof spec === 'object' && spec !== null && 'key' in spec) {
        parsedSpecs.push({ key: spec.key, value: spec.value });
      } else if (typeof spec === 'string') {
        if (spec.includes(':')) {
          const [k, ...v] = spec.split(':');
          parsedSpecs.push({ key: k.trim(), value: v.join(':').trim() });
        } else {
          parsedSpecs.push({ key: `Feature ${idx + 1}`, value: spec });
        }
      }
    });
  }

  // Highlights for the bullet points section (up to 4 key highlights)
  const topHighlights = parsedSpecs.slice(0, 4);

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div className="container" style={{ padding: '24px 24px 0' }}>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/" className="breadcrumb-link">Home</Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <Link href="/shop" className="breadcrumb-link">Shop</Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="breadcrumb-link">
            {product.category}
          </Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{product.title}</span>
        </nav>
      </div>

      {/* Product Detail Main */}
      <div className="container" style={{ padding: '24px 24px 60px' }}>

        {/* Product Hero Grid */}
        <div className="product-detail-grid">

          {/* Left: Product Images Gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="product-detail-image" style={{ position: 'relative', overflow: 'hidden' }}>
              {hasDiscount && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'var(--red, #ef4444)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  zIndex: 2,
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)'
                }}>
                  SAVE {savingsPercent}%
                </div>
              )}
              <ProductIcon name={activeImage} className="detail-icon-hero" alt={product.title} />
            </div>

            {/* Multiple Thumbnails if available */}
            {rawImages.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                {rawImages.map((imgUrl, idx) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '10px',
                        border: isActive ? '2px solid var(--orange, #fba919)' : '1px solid var(--slate, #e2e8f0)',
                        background: 'var(--white, #fff)',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        padding: '4px',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? '0 0 0 2px rgba(251, 169, 25, 0.2)' : 'none'
                      }}
                    >
                      <ProductIcon name={imgUrl} alt={`${product.title} view ${idx + 1}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Product Info & Editorial Details */}
          <div className="product-detail-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {product.vendor && (
                <Link
                  href={`/shop?q=${encodeURIComponent(product.vendor)}`}
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--orange, #fba919)',
                    textDecoration: 'none'
                  }}
                >
                  {product.vendor}
                </Link>
              )}
              {product.vendor && <span style={{ color: 'var(--sdark)' }}>•</span>}
              <span className="product-category" style={{ margin: 0 }}>{product.category}</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '12px', color: 'var(--navy)' }}>
              {product.title}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--sdark)',
                background: 'var(--slate)', padding: '4px 8px', borderRadius: '4px',
                display: 'inline-block'
              }}>
                SKU: {product.sku}
              </span>

              {/* Stock Status Badge */}
              {isOutOfStock ? (
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--red, #ef4444)', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={13} /> Out of Stock
                </span>
              ) : isLowStock ? (
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#d97706', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={13} /> Only {stockQty} left in stock
                </span>
              ) : (
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--green, #10b981)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={13} /> In Stock ({stockQty} units)
                </span>
              )}
            </div>

            {/* Price section with Compare-at */}
            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, color: 'var(--navy)' }}>
                R{price.toFixed(2)}
              </div>
              {hasDiscount && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem', color: 'var(--sdark)', textDecoration: 'line-through' }}>
                    R{compareAtPrice.toFixed(2)}
                  </span>
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--red, #ef4444)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    Save R{savingsAmount.toFixed(2)} ({savingsPercent}%)
                  </span>
                </div>
              )}
            </div>

            {/* Minimal Editorial Overview & Bullet Points (Ref Image 2) */}
            <div className="product-highlights-box">
              <p className="product-editorial-lead">
                {product.description}
              </p>

              <ul className="product-bullet-list">
                <li className="product-bullet-item">
                  <span className="product-bullet-dot">•</span>
                  <span><strong className="product-bullet-key">Category:</strong> <span className="product-bullet-val">{product.category}</span></span>
                </li>

                {topHighlights.map((hl, i) => (
                  <li key={i} className="product-bullet-item">
                    <span className="product-bullet-dot">•</span>
                    <span><strong className="product-bullet-key">{hl.key}:</strong> <span className="product-bullet-val">{hl.value}</span></span>
                  </li>
                ))}

                <li className="product-bullet-item">
                  <span className="product-bullet-dot">•</span>
                  <span><strong className="product-bullet-key">Stock & Dispatch:</strong> <span className="product-bullet-val">Locally stocked in Johannesburg, ready for delivery</span></span>
                </li>
              </ul>

              <p className="product-editorial-closing">
                Dispatched nationwide across South Africa with door-to-door tracking and a 7-day hassle-free exchange guarantee.
              </p>
            </div>

            {/* Product Tags */}
            {product.tags && product.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {product.tags.map((tag, i) => (
                  <Link
                    key={i}
                    href={`/shop?q=${encodeURIComponent(tag)}`}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--navy)',
                      background: 'rgba(5, 27, 56, 0.05)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid var(--slate)'
                    }}
                  >
                    <Tag size={11} style={{ color: 'var(--orange)' }} /> {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Sizing/Variant Selection UI */}
            {(colors.length > 0 || sizes.length > 0) && (
              <div className="variant-picker-container" style={{ margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {colors.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: '8px' }}>
                      Select Color: <span style={{ fontWeight: 400, color: 'var(--sdark)' }}>{selectedColor}</span>
                    </span>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {colors.map(color => {
                        const colorMap: Record<string, string> = {
                          'Titanium Gray': '#4b5563',
                          'Midnight Black': '#0f172a',
                          'Sport Orange': '#ea580c',
                          'Matte Black': '#1e293b',
                          'Space Gray': '#64748b',
                          'Navy Blue': '#1e3a8a',
                          'Glossy White': '#f8fafc',
                        };
                        const bgColor = colorMap[color] || '#cbd5e1';
                        const isSelected = selectedColor === color;
                        const isWhite = color === 'Glossy White';
                        return (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            title={color}
                            className={`color-swatch ${isSelected ? 'active' : ''}`}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: bgColor,
                              border: isWhite ? '1px solid var(--slate)' : 'none',
                              cursor: 'pointer',
                              position: 'relative',
                              outline: 'none',
                              boxShadow: isSelected ? '0 0 0 2px var(--white), 0 0 0 4px var(--navy)' : 'none',
                              transition: 'all 0.2s ease',
                            }}
                            aria-label={`Select color ${color}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: '8px' }}>
                      Select Option: <span style={{ fontWeight: 400, color: 'var(--sdark)' }}>{selectedSize}</span>
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {sizes.map(size => {
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`size-pill ${isSelected ? 'active' : ''}`}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '30px',
                              border: '1px solid var(--slate)',
                              backgroundColor: isSelected ? 'var(--navy)' : 'var(--white)',
                              color: isSelected ? 'var(--white)' : 'var(--navy)',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Trust Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--sdark)' }}>
                <ShieldCheck size={16} style={{ color: 'var(--green)' }} /> 12-Month Guarantee
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--sdark)' }}>
                <Truck size={16} style={{ color: 'var(--orange)' }} /> The Courier Guy Delivery (1–3 Days)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--sdark)' }}>
                <Package size={16} style={{ color: '#2563eb' }} /> Securely Packaged
              </div>
            </div>

            {/* Add to Cart */}
            <button
              className="btn btn-primary product-detail-atc"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{
                width: '100%',
                padding: '16px',
                gap: '10px',
                fontSize: '1rem',
                opacity: isOutOfStock ? 0.6 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer'
              }}
            >
              {isOutOfStock ? (
                <>Out of Stock</>
              ) : addedFeedback ? (
                <><CheckCircle2 size={20} /> Added to Cart!</>
              ) : (
                <><ShoppingCart size={20} /> Add to Shopping Cart</>
              )}
            </button>
          </div>
        </div>

        {/* Minimalist Specifications Section (Ref Image 1 & AGENTS.md clean layout) */}
        <section className="product-specs-wrapper">
          <h2 className="specs-heading">Product Specifications</h2>

          <div className="table-responsive-container">
            <table className="specs-minimal-table">
              <tbody>
                {/* Standard Base Specs */}
                {product.vendor && (
                  <tr>
                    <th>Brand / Vendor</th>
                    <td>{product.vendor}</td>
                  </tr>
                )}

                <tr>
                  <th>Category</th>
                  <td>{product.category}</td>
                </tr>

                <tr>
                  <th>Model / SKU</th>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{product.sku}</td>
                </tr>

                {/* Dynamic Product Specifications */}
                {parsedSpecs.map((spec, idx) => (
                  <tr key={idx}>
                    <th>{spec.key}</th>
                    <td>{spec.value}</td>
                  </tr>
                ))}

                {/* Logistics & Availability */}
                <tr>
                  <th>Dispatch Location</th>
                  <td>Johannesburg Warehouse, South Africa</td>
                </tr>

                <tr>
                  <th>Delivery Courier</th>
                  <td>The Courier Guy (1–3 business days nationwide)</td>
                </tr>

                <tr>
                  <th>Warranty</th>
                  <td>12-Month Quality & Safety Guarantee</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '60px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px', color: 'var(--navy)' }}>You May Also Like</h2>
            <div className="product-grid">
              {relatedProducts.map((rp: Product) => (
                <Link
                  key={rp.id}
                  href={`/product/${rp.slug || rp.id}`}
                  className="product-card product-card-link"
                >
                  <div className="product-image-wrapper" style={{ aspectRatio: '4/3' }}>
                    <ProductIcon name={Array.isArray(rp.images) ? rp.images[0] : (rp.images || 'powerbank')} alt={rp.title} />
                  </div>
                  <div className="product-details">
                    <span className="product-category">
                      {rp.vendor ? `${rp.vendor} • ` : ''}{rp.category}
                    </span>
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
      </div>

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="mobile-sticky-atc">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--sdark)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.title}
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>R{price.toFixed(2)}</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          style={{ padding: '12px 20px', gap: '8px', whiteSpace: 'nowrap', opacity: isOutOfStock ? 0.6 : 1 }}
        >
          {isOutOfStock ? 'Out of Stock' : addedFeedback ? <><CheckCircle2 size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
}
