'use client';

import React from 'react';
import { ShoppingCart, X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
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

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const total = getTotal();

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (onCheckoutClick) {
      onCheckoutClick();
    } else {
      window.location.href = '/?checkout=1';
    }
  };

  return (
    <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--slate)', paddingBottom: '16px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 700 }}>
            <ShoppingCart size={22} /> Shopping Cart
          </h2>
          <button className="modal-close" onClick={() => setIsCartOpen(false)} aria-label="Close Cart"><X size={20} /></button>
        </div>

        {/* Cart Items List */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ShoppingCart size={48} style={{ color: 'var(--slate)', marginBottom: '16px' }} />
              <p style={{ color: 'var(--sdark)' }}>Your cart is empty.</p>
              <button className="btn btn-outline" style={{ marginTop: '20px' }} onClick={() => setIsCartOpen(false)}>
                Browse Products
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={`${item.id}-${item.variant || ''}`} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--slate)', paddingBottom: '20px' }}>
                <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ProductIcon name={item.image} className="cart-icon-medium" />
                </div>
                
                <div style={{ flexGrow: 1 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px', lineHeight: 1.2 }}>{item.title}</h3>
                  {item.variant && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--sdark)', marginBottom: '6px' }}>
                      Option: {item.variant}
                    </div>
                  )}
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px' }}>
                    R{item.price.toFixed(2)}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--slate)', borderRadius: '30px', padding: '2px 4px' }}>
                      <button className="btn-icon" style={{ width: '28px', height: '28px', border: 'none' }} onClick={() => updateQuantity(item.id, item.variant, -1)}>
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button className="btn-icon" style={{ width: '28px', height: '28px', border: 'none' }} onClick={() => updateQuantity(item.id, item.variant, 1)}>
                        <Plus size={12} />
                      </button>
                    </div>
                    
                    <button className="btn-icon" style={{ width: '32px', height: '32px', color: 'var(--red)', borderColor: 'transparent' }} onClick={() => removeItem(item.id, item.variant)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid var(--slate)', paddingTop: '20px', marginTop: 'auto' }}>
            <div className="summary-item" style={{ marginBottom: '8px' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600 }}>R{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-item" style={{ marginBottom: '16px' }}>
              <span>Delivery Cost</span>
              <span>{shippingCost === 0 ? 'FREE' : `R${shippingCost.toFixed(2)}`}</span>
            </div>
            
            <div className="summary-total" style={{ borderTop: '1px solid var(--slate)', paddingTop: '16px', marginBottom: '24px' }}>
              <span>Total Amount</span>
              <span>R{total.toFixed(2)}</span>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '16px', gap: '10px' }}
              onClick={handleCheckout}
            >
              Proceed to Secure Checkout <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
