'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, MessageSquare, Lock, 
  ArrowLeft, ShoppingCart, RefreshCw, Truck, ArrowRight
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { ProductIcon } from '@/lib/products';
import { PageHeader } from '@/components/PageHeader';
import { PaymentBadges } from '@/components/PaymentBadges';

export default function CheckoutPage() {
  const {
    cart, clearCart, getSubtotal, getShippingCost, getTotal, cartCount
  } = useCart();

  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    streetAddress: '',
    suburb: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const [loadingPayFast, setLoadingPayFast] = useState(false);
  const [loadingWhatsApp, setLoadingWhatsApp] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const total = getTotal();

  // 1. PayFast Gateway (Cards, Instant EFT, Capitec Pay)
  const handlePayFastCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingDetails.fullName || !shippingDetails.email || !shippingDetails.phone || !shippingDetails.streetAddress) {
      alert('Please fill in your Full Name, Email, Mobile Phone, and Street Address first.');
      return;
    }
    setLoadingPayFast(true);
    setIsRedirecting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart, shippingDetails }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Checkout process failed.');
        setIsRedirecting(false);
        setLoadingPayFast(false);
        return;
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.payfastUrl;

      Object.keys(data.params).forEach((key) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = data.params[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      clearCart();
      form.submit();
    } catch (error) {
      console.error('PayFast checkout error:', error);
      alert('An unexpected error occurred. Please try again.');
      setIsRedirecting(false);
      setLoadingPayFast(false);
    }
  };

  // 2. WhatsApp Direct Order Inquiry
  const handleWhatsAppCheckout = async () => {
    if (!shippingDetails.fullName || !shippingDetails.phone || !shippingDetails.streetAddress) {
      alert('Please fill in your Full Name, Phone Number, and Street Address first.');
      return;
    }

    setLoadingWhatsApp(true);
    try {
      const response = await fetch('/api/whatsapp-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart,
          shippingDetails,
          totalAmount: getTotal()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Failed to submit order request.');
        setLoadingWhatsApp(false);
        return;
      }

      clearCart();
      window.open(data.whatsappUrl, '_blank');
    } catch (err) {
      console.error('WhatsApp checkout error:', err);
      alert('An unexpected error occurred while generating WhatsApp inquiry.');
    } finally {
      setLoadingWhatsApp(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '120px 24px' }}>
        <div style={{ display: 'inline-block', marginBottom: '24px' }}>
          <RefreshCw size={48} className="animate-spin" style={{ color: 'var(--orange)' }} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Connecting to PayFast Secure Gateway...</h2>
        <p style={{ color: 'var(--sdark)' }}>Please wait while we transfer you securely to complete payment.</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div>
        <PageHeader 
          title="Secure Checkout"
          breadcrumbs={[{ label: 'Shop', href: '/shop' }, { label: 'Checkout' }]}
        />
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '460px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ShoppingCart size={54} style={{ color: 'var(--sdark)', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Your Shopping Cart is Empty</h2>
            <p style={{ color: 'var(--sdark)', marginBottom: '24px' }}>
              Add items from our catalog to proceed with secure checkout and delivery.
            </p>
            <Link href="/shop" className="btn btn-primary" style={{ gap: '8px' }}>
              Browse Shop Catalog <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Secure Checkout"
        subtitle="Complete your delivery and payment details to dispatch your order."
        breadcrumbs={[{ label: 'Shop', href: '/shop' }, { label: 'Checkout' }]}
      />

      <div className="container" style={{ padding: '36px 24px 80px' }}>
        
        <div style={{ marginBottom: '24px' }}>
          <Link href="/shop" className="btn btn-outline" style={{ gap: '8px' }}>
            <ArrowLeft size={16} /> Return to Store
          </Link>
        </div>

        <div className="checkout-layout">
          {/* Form Column */}
          <form onSubmit={handlePayFastCheckout} className="info-box-card checkout-form-container">
            <div className="checkout-form-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy)' }}>Shipping & Contact Details</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--sdark)' }}>Courier delivery direct to your residential or business address.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Sipho Ndlovu" 
                className="form-input" 
                value={shippingDetails.fullName}
                onChange={e => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input 
                  type="email" 
                  required
                  placeholder="sipho@example.co.za" 
                  className="form-input" 
                  value={shippingDetails.email}
                  onChange={e => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile / WhatsApp Number *</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="e.g. 082 123 4567" 
                  className="form-input" 
                  value={shippingDetails.phone}
                  onChange={e => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. 123 Sandton Drive, Building 4" 
                className="form-input" 
                value={shippingDetails.streetAddress}
                onChange={e => setShippingDetails({ ...shippingDetails, streetAddress: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Suburb</label>
                <input 
                  type="text" 
                  placeholder="Sandton" 
                  className="form-input" 
                  value={shippingDetails.suburb}
                  onChange={e => setShippingDetails({ ...shippingDetails, suburb: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">City *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Johannesburg" 
                  className="form-input" 
                  value={shippingDetails.city}
                  onChange={e => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Province *</label>
                <select 
                  className="form-input"
                  required
                  value={shippingDetails.state}
                  onChange={e => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                >
                  <option value="">Select Province...</option>
                  <option value="Gauteng">Gauteng</option>
                  <option value="Western Cape">Western Cape</option>
                  <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                  <option value="Eastern Cape">Eastern Cape</option>
                  <option value="Free State">Free State</option>
                  <option value="Mpumalanga">Mpumalanga</option>
                  <option value="Limpopo">Limpopo</option>
                  <option value="North West">North West</option>
                  <option value="Northern Cape">Northern Cape</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input 
                  type="text" 
                  placeholder="2196" 
                  className="form-input" 
                  value={shippingDetails.postalCode}
                  onChange={e => setShippingDetails({ ...shippingDetails, postalCode: e.target.value })}
                />
              </div>
            </div>

            {/* PAYMENT OPTIONS */}
            <div className="payment-section-wrapper">
              <h3 className="payment-section-title">
                <Lock size={16} /> Secure Payment Gateway
              </h3>
              
              {/* PayFast Primary Payment Button */}
              <button 
                type="submit" 
                disabled={loadingPayFast || loadingWhatsApp}
                className="payment-btn-primary"
              >
                <div className="payment-btn-main-row">
                  <ShieldCheck size={20} />
                  <span>{loadingPayFast ? 'Connecting to PayFast...' : `Pay via PayFast • R${total.toFixed(2)}`}</span>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <PaymentBadges size="sm" />
                </div>
              </button>

              <div className="payment-divider">
                <span className="payment-divider-text">Or Order via WhatsApp</span>
              </div>

              {/* WhatsApp Direct Order / Inquiry */}
              <button 
                type="button" 
                disabled={loadingPayFast || loadingWhatsApp}
                onClick={handleWhatsAppCheckout}
                className="payment-btn-whatsapp"
              >
                <MessageSquare size={18} />
                <span>{loadingWhatsApp ? 'Generating WhatsApp request...' : 'Order Inquiry via WhatsApp'}</span>
              </button>

              <div className="checkout-security-footer">
                <Lock size={14} /> 256-bit PCI-DSS compliant encryption • Certified PayFast South Africa
              </div>
            </div>
          </form>

          {/* Order Summary Column */}
          <div className="info-box-card checkout-desktop-summary" style={{ height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--slate)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--navy)' }}>
              Order Summary ({cartCount})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {cart.map(item => (
                <div key={`${item.id}-${item.variant || ''}`} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ProductIcon name={item.image} className="cart-icon-small" />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--navy)' }}>{item.title}</h4>
                    {item.variant && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--sdark)', marginTop: '2px' }}>Option: {item.variant}</div>
                    )}
                    <span style={{ fontSize: '0.82rem', color: 'var(--sdark)' }}>Qty: {item.quantity} × R{item.price.toFixed(2)}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)' }}>
                    R{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-item">
              <span>Subtotal</span>
              <span>R{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span>Delivery Cost</span>
              <span>{shippingCost === 0 ? 'FREE' : `R${shippingCost.toFixed(2)}`}</span>
            </div>

            <div className="summary-total">
              <span>Total Due</span>
              <span>R{total.toFixed(2)}</span>
            </div>

            {subtotal < 1000 && subtotal > 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--orange)', marginTop: '16px', fontStyle: 'italic' }}>
                💡 Tip: Add R{(1000 - subtotal).toFixed(2)} more to qualify for FREE delivery!
              </p>
            )}

            <div style={{ marginTop: '24px', borderTop: '1px solid var(--slate)', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--sdark)', fontSize: '0.8rem' }}>
              <Truck size={16} style={{ color: 'var(--orange)' }} />
              <span>Direct Courier Guy dispatch from Johannesburg</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
