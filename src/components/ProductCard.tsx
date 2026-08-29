'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Check, ChevronRight } from 'lucide-react';
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
      {hasDiscount && (
        <span className="product-discount-tag">
          -{discountPercent}%
        </span>
      )}

      <Link
        href={productUrl}
        className="product-card product-card-link"
      >
        <div className="product-image-wrapper">
          <ProductIcon name={imageName} alt={product.title} />
        </div>

        <div className="product-details">
          <span className="product-category">
            {product.vendor ? `${product.vendor} • ` : ''}{product.category}
          </span>

          <h3 className="product-title">{product.title}</h3>
          
          <p className="product-description">
            {product.description}
          </p>

          <div className="product-price-row">
            <div className="product-prices">
              <span className="product-price">R{price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="product-compare-price">
                  R{compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            <button
              type="button"
              className={`product-quick-add ${isAdded ? 'added' : ''}`}
              onClick={handleQuickAdd}
              aria-label={`Add ${product.title} to cart`}
              title="Add to cart"
            >
              {isAdded ? <Check size={16} /> : <Plus size={16} />}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

