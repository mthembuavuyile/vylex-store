'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Star, ChevronRight, Check, Sparkles, Tag } from 'lucide-react';
import { ProductIcon, Product } from '@/lib/products';
import { useCart } from '@/lib/cart-context';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image: Array.isArray(product.images) ? product.images[0] : (product.images || 'powerbank'),
      slug: product.slug || product.id,
    });

    setIsAdded(true);
    setIsCartOpen(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const productUrl = `/product/${product.slug || product.id}`;
  const imageName = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] 
    : (typeof product.images === 'string' ? product.images : 'powerbank');

  const price = Number(product.price) || 0;
  const compareAtPrice = product.compare_at_price ? Number(product.compare_at_price) : null;
  const hasDiscount = compareAtPrice !== null && compareAtPrice > price;
  const discountPercent = hasDiscount ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  return (
    <div className="product-card-wrapper">
      {/* Badges container */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 3, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {hasDiscount && (
          <span style={{
            background: 'var(--red, #ef4444)',
            color: '#fff',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '6px',
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            SAVE {discountPercent}%
          </span>
        )}
        {product.is_featured && !hasDiscount && (
          <span style={{
            background: 'var(--orange, #fba919)',
            color: '#051b38',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <Sparkles size={11} /> FEATURED
          </span>
        )}
      </div>

      {/* Express Delivery Badge on Top Right */}
      <div className="product-card-badge">
        Express Delivery
      </div>

      <Link
        href={productUrl}
        className="product-card product-card-link"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div className="product-image-wrapper">
          <ProductIcon name={imageName} alt={product.title} />
        </div>

        <div className="product-details">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span className="product-category">
              {product.vendor ? `${product.vendor} • ` : ''}{product.category}
            </span>
            <div className="product-rating-stars">
              <Star size={12} fill="#FBA919" stroke="none" /> 4.9 (48)
            </div>
          </div>

          <h3 className="product-title">{product.title}</h3>
          
          <p className="product-description">
            {product.description}
          </p>

          <div className="product-price-row" style={{ alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span className="product-price">R{price.toFixed(2)}</span>
                {hasDiscount && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--sdark)', textDecoration: 'line-through' }}>
                    R{compareAtPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <span className="product-view-link">
              <span className="product-view-text">View Details</span> <ChevronRight size={14} />
            </span>
          </div>
        </div>
      </Link>

      {/* Quick Add Button */}
      <button
        className={`product-quick-add ${isAdded ? 'added' : ''}`}
        onClick={handleQuickAdd}
        aria-label={`Add ${product.title} to cart`}
        title="Add to cart"
      >
        {isAdded ? <Check size={18} /> : <Plus size={18} />}
      </button>
    </div>
  );
}
