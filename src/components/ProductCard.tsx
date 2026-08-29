'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Star, ChevronRight, Check } from 'lucide-react';
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
  const imageName = Array.isArray(product.images) ? product.images[0] : (product.images || 'powerbank');

  return (
    <div className="product-card-wrapper">
      {/* Badge */}
      <div className="product-card-badge">
        Express Delivery
      </div>

      <Link
        href={productUrl}
        className="product-card product-card-link"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <div className="product-image-wrapper">
          <ProductIcon name={imageName} />
        </div>

        <div className="product-details">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span className="product-category">{product.category}</span>
            <div className="product-rating-stars">
              <Star size={12} fill="#FBA919" stroke="none" /> 4.9 (48)
            </div>
          </div>

          <h3 className="product-title">{product.title}</h3>
          
          <p className="product-description">
            {product.description}
          </p>

          <div className="product-price-row">
            <span className="product-price">R{Number(product.price).toFixed(2)}</span>
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
