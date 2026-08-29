'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, X, Minus, Plus, Trash2, 
  ArrowRight, ShieldCheck, Truck, Lock, PackageCheck 
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { ProductIcon } from '@/lib/products';

interface CartDrawerProps {
  onCheckoutClick?: () => void;
}

export function CartDrawer({ onCheckoutClick }: CartDrawerProps) {
  const {
    cart,
    updateQuantity,
    removeItem,
    getSubtotal,
    getShippingCost,
    getTotal,
    isCartOpen,
    setIsCartOpen,
  } = useCart();
  const router = useRouter();

  // Close cart on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const total = getTotal();
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Free delivery progress calculations (R1,000 threshold)
  const FREE_SHIPPING_THRESHOLD = 1000;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (onCheckoutClick) {
      onCheckoutClick();
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div 
      className="cart-drawer-overlay" 
      onClick={() => setIsCartOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Drawer"
    >
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div className="cart-title-group">
            <ShoppingCart size={20} className="cart-header-icon" />
            <h2>Shopping Cart</h2>
            {cart.length > 0 && (
              <span className="cart-item-count-badge">
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button 
            className="cart-close-btn" 
            onClick={() => setIsCartOpen(false)} 
            aria-label="Close Shopping Cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Strip */}
        {cart.length > 0 && (
          <div className="cart-shipping-banner">
            {isFreeShipping ? (
              <div className="shipping-progress-text qualifies">
                <span>🎉 You qualify for <strong>FREE Nationwide Delivery</strong>!</span>
                <Truck size={15} />
              </div>
            ) : (
              <div className="shipping-progress-text">
                <span>Add <strong>R{amountToFreeShipping.toFixed(2)}</strong> more for <strong>FREE Delivery</strong></span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
            )}
            <div className="shipping-progress-track">
              <div 
                className={`shipping-progress-bar ${isFreeShipping ? 'unlocked' : ''}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items Scroll Area */}
        <div className="cart-items-scroll">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon-wrap">
                <ShoppingCart size={36} />
              </div>
              <h3>Your cart is empty</h3>
              <p>Discover high-quality lifestyle essentials, skincare, and everyday goods with nationwide delivery.</p>
              <Link 
                href="/shop"
                className="btn btn-primary" 
                onClick={() => setIsCartOpen(false)}
              >
                Browse Shop Catalog <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            cart.map(item => (
              <div key={`${item.id}-${item.variant || ''}`} className="cart-item-card">
                {/* Product Thumbnail */}
                <div className="cart-item-img-box">
                  <ProductIcon name={item.image} className="cart-icon-medium" alt={item.title} />
                </div>
                
                {/* Product Info & Controls */}
                <div className="cart-item-info">
                  <div className="cart-item-header-row">
                    <Link
                      href={`/product/${item.slug || item.id}`}
                      className="cart-item-title"
                      onClick={() => setIsCartOpen(false)}
                    >
                      {item.title}
                    </Link>
                    <button 
                      className="cart-remove-btn" 
                      onClick={() => removeItem(item.id, item.variant)}
                      aria-label={`Remove ${item.title} from cart`}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {item.variant && (
                    <span className="cart-item-variant">
                      {item.variant}
                    </span>
                  )}

                  <div className="cart-item-bottom-row">
                    {/* Quantity Pill */}
                    <div className="cart-qty-pill">
                      <button 
                        className="cart-qty-btn" 
                        onClick={() => updateQuantity(item.id, item.variant, -1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="cart-qty-val">
                        {item.quantity}
                      </span>
                      <button 
                        className="cart-qty-btn" 
                        onClick={() => updateQuantity(item.id, item.variant, 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="cart-item-price">
                      R{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-table">
              <div className="summary-item">
                <span>Subtotal</span>
                <strong>R{subtotal.toFixed(2)}</strong>
              </div>
              <div className="summary-item">
                <span>Nationwide Courier Delivery</span>
                {shippingCost === 0 ? (
                  <span className="free-shipping-tag">FREE</span>
                ) : (
                  <strong>R{shippingCost.toFixed(2)}</strong>
                )}
              </div>
              
              <div className="summary-total">
                <div>
                  <span className="total-label">Total Amount</span>
                  <span className="total-vat-hint">Includes VAT & door-to-door tracking</span>
                </div>
                <span className="total-amount">R{total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              className="btn btn-primary cart-checkout-btn" 
              onClick={handleCheckout}
            >
              <Lock size={16} /> Proceed to Secure Checkout <ArrowRight size={16} />
            </button>

            {/* Trust Badges Strip */}
            <div className="cart-trust-pills">
              <div className="cart-trust-item">
                <ShieldCheck size={14} /> 256-Bit SSL
              </div>
              <div className="cart-trust-item">
                <Truck size={14} /> The Courier Guy
              </div>
              <div className="cart-trust-item">
                <PackageCheck size={14} /> 7-Day Returns
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
