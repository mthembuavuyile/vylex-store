'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, 
  X, CreditCard, ChevronRight, MessageSquare, Package,
  Lock, RefreshCw, Menu, ArrowLeft, Store, Search, Star, UserCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProductIcon } from '@/lib/products';
import { useCart } from '@/lib/cart-context';
import { CartDrawer } from '@/components/CartDrawer';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'browse' | 'form' | 'redirecting'>('browse');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  
  const {
    cart, addToCart, updateQuantity, removeItem, clearCart,
    getSubtotal, getShippingCost, getTotal, cartCount,
    isCartOpen, setIsCartOpen
  } = useCart();

  // Shipping form fields
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

  const [scrolled, setScrolled] = useState(false);

  // Scroll listener to update header height on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch live products directly from Supabase
  useEffect(() => {
    async function fetchProducts() {
      setLoadingProducts(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, title, description, price, sku, category, images, stock_quantity, slug')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase product query error:', error.message);
          setProducts([]);
        } else if (data) {
          setProducts(data);
        }
      } catch (err) {
        console.warn('Supabase connection exception:', err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  // Listen for direct checkout parameter redirects from product detail pages
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('checkout') === '1') {
        setCheckoutStep('form');
        window.history.replaceState({}, '', '/');
      }
    }
  }, []);

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image: Array.isArray(product.images) ? product.images[0] : (product.images || 'powerbank'),
      slug: product.slug || '',
    });
    setIsCartOpen(true);
  };

  // 1. Online Payment via PayFast Gateway
  const handlePayFastCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPayFast(true);
    setCheckoutStep('redirecting');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart, shippingDetails }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Checkout process failed.');
        setCheckoutStep('form');
        setLoadingPayFast(false);
        return;
      }

      // Create a hidden form and submit it to redirect to PayFast
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
      setCheckoutStep('form');
      setLoadingPayFast(false);
    }
  };

  // 2. Direct Order Inquiry via WhatsApp
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
      setCheckoutStep('browse');
    } catch (err) {
      console.error('WhatsApp checkout error:', err);
      alert('An unexpected error occurred while generating WhatsApp inquiry.');
    } finally {
      setLoadingWhatsApp(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const total = getTotal();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Dynamic Announcement Bar */}
      <div className="announcement-bar">
        <span>🇿🇦 Fast Courier Delivery across South Africa | Free Delivery on Orders Over R1,000</span>
      </div>

      {/* Main Responsive Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <Link href="/" className="logo logo-light" onClick={() => setCheckoutStep('browse')}>
            <img src="/logo.png" alt="Vylex Logo" width="36" height="36" style={{ flexShrink: 0, objectFit: 'contain' }} />
            <span className="logo-text">vylex<span className="logo-dot-text">.</span><span className="logo-subtext">Store</span></span>
          </Link>

          {/* Desktop Live Search Bar */}
          <div className="header-search-desktop">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon-left" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
                style={{ padding: '8px 14px 8px 38px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="nav-desktop">
            <a href="#catalog" className="nav-link" onClick={() => { setCheckoutStep('browse'); setSelectedCategory('All'); }}>All Products</a>
            <Link href="/admin" className="nav-link" style={{ color: 'var(--orange)' }}>Admin & CRM</Link>
          </nav>

          {/* Cart Icon & Burger Actions */}
          <div className="header-actions">
            <button 
              className="cart-trigger" 
              onClick={() => setIsCartOpen(true)}
              aria-label="View Shopping Cart"
            >
              <ShoppingCart size={22} />
              <span className="cart-badge">{cartCount}</span>
            </button>

            <button 
              className="mobile-toggle" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Full Mobile Burger Drawer Overlay */}
        {isMobileMenuOpen && (
          <>
            <div className="mobile-nav-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="mobile-nav-drawer-side">
              <div className="mobile-drawer-header">
                <Link href="/" className="logo logo-light" onClick={() => { setIsMobileMenuOpen(false); setCheckoutStep('browse'); }}>
                  <img src="/logo.png" alt="Vylex Logo" width="28" height="28" style={{ flexShrink: 0, objectFit: 'contain' }} />
                  <span className="logo-text">vylex<span className="logo-dot-text">.</span><span className="logo-subtext">Store</span></span>
                </Link>
                <button className="mobile-drawer-close" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close Navigation Menu">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Drawer Live Search */}
              <div className="mobile-drawer-search">
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon-left" />
                  <input
                    type="text"
                    placeholder="Search power banks, audio..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="mobile-drawer-body">
                <div>
                  <div className="drawer-section-title">Shop Categories</div>
                  <ul className="drawer-nav-list">
                    {categories.map(cat => (
                      <li key={cat}>
                        <a
                          href="#catalog"
                          className={`drawer-nav-item ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsMobileMenuOpen(false);
                            setCheckoutStep('browse');
                          }}
                        >
                          <span>{cat}</span>
                          <ChevronRight size={14} style={{ color: 'var(--orange)' }} />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="drawer-section-title">Store Portals</div>
                  <ul className="drawer-nav-list">
                    <li>
                      <Link 
                        href="/admin" 
                        className="drawer-nav-item"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <UserCheck size={16} style={{ color: 'var(--orange)' }} /> Admin & CRM Hub
                        </span>
                        <ChevronRight size={14} />
                      </Link>
                    </li>
                    <li>
                      <a 
                        href="https://wa.me/27821234567?text=Hi%20Vylex%20Store%20Support" 
                        target="_blank" 
                        rel="noreferrer"
                        className="drawer-nav-item"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MessageSquare size={16} style={{ color: '#10B981' }} /> Instant WhatsApp Support
                        </span>
                        <ChevronRight size={14} />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mobile-drawer-footer">
                <div style={{ fontSize: '0.78rem', color: 'var(--sdark)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ color: 'var(--orange)', fontWeight: 600 }}>🇿🇦 Courier Guy Express Shipping</span>
                  <span>Authentic Stock & 1-Year Guarantee</span>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      <main style={{ flexGrow: 1 }}>
        {checkoutStep === 'redirecting' ? (
          <div style={{ textAlign: 'center', padding: '120px 24px' }}>
            <div style={{ display: 'inline-block', marginBottom: '24px' }}>
              <RefreshCw size={48} className="animate-spin" style={{ color: 'var(--orange)' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>Connecting to Payment Gateway...</h2>
            <p style={{ color: 'var(--sdark)' }}>Please wait while we transfer you securely to PayFast.</p>
          </div>
        ) : checkoutStep === 'form' ? (
          /* Checkout View */
          <div className="container" style={{ padding: '40px 0 80px' }}>
            
            <button 
              onClick={() => setCheckoutStep('browse')}
              className="btn btn-outline"
              style={{ marginBottom: '28px', gap: '8px' }}
            >
              <ArrowLeft size={16} /> Return to Storefront
            </button>

            <div className="checkout-layout">
              {/* Shipping & Payment details form */}
              <form onSubmit={handlePayFastCheckout} className="card checkout-form-container">
                <div className="checkout-form-header">
                  <h2>Shipping & Contact Details</h2>
                  <p>Enter your delivery details to complete your order.</p>
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
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
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
                    placeholder="123 Sandton Drive, Building 4" 
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

                {/* DUAL CHECKOUT OPTIONS */}
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* PayFast Primary Gateway */}
                  <button 
                    type="submit" 
                    disabled={loadingPayFast || loadingWhatsApp}
                    className="btn btn-primary" 
                    style={{ width: '100%', gap: '12px', padding: '16px' }}
                  >
                    <CreditCard size={20} />
                    {loadingPayFast ? 'Preparing gateway connection...' : `Pay R${total.toFixed(2)} via PayFast / Card / Instant EFT`}
                  </button>

                  <div style={{ textAlign: 'center', margin: '4px 0', fontSize: '0.8rem', color: 'var(--sdark)', fontWeight: 600 }}>
                    ── OR PREFER CHATTING WITH US? ──
                  </div>

                  {/* WhatsApp Secondary Order Inquiry */}
                  <button 
                    type="button" 
                    disabled={loadingPayFast || loadingWhatsApp}
                    onClick={handleWhatsAppCheckout}
                    className="btn" 
                    style={{ 
                      width: '100%', 
                      gap: '12px', 
                      padding: '16px',
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none'
                    }}
                  >
                    <MessageSquare size={20} />
                    {loadingWhatsApp ? 'Generating WhatsApp request...' : 'Instant Order Request via WhatsApp'}
                  </button>

                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--sdark)', fontSize: '0.8rem', marginTop: '16px' }}>
                  <Lock size={14} /> Orders registered & tracked securely in Vylex CRM
                </div>
              </form>

              {/* Shopping Cart Summary column */}
              <div className="card checkout-desktop-summary" style={{ height: 'fit-content' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--slate)', paddingBottom: '12px', marginBottom: '20px' }}>
                  Order Summary
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  {cart.map(item => (
                    <div key={`${item.id}-${item.variant || ''}`} style={{ display: 'flex', justifyItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ProductIcon name={item.image} className="cart-icon-small" />
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.2 }}>{item.title}</h4>
                        {item.variant && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--sdark)', marginTop: '2px' }}>Option: {item.variant}</div>
                        )}
                        <span style={{ fontSize: '0.82rem', color: 'var(--sdark)' }}>Qty: {item.quantity} × R{item.price.toFixed(2)}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
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
              </div>
            </div>
          </div>
        ) : (
          /* Store Front browsing catalog */
          <div>
            
            {/* Hero Section */}
            <section className="hero">
              <div className="hero-grid"></div>
              <div className="hero-glow"></div>
              <div className="container hero-inner">
                <div className="hero-content" style={{ animation: 'fadeIn 0.8s ease-out' }}>
                  <h1>Vylex Premium <span>Consumer Tech</span></h1>
                  <p>Elevate your digital life. Fast dispatch and secure delivery on premium power banks, audio, smart wearables, and chargers.</p>
                  <div className="hero-buttons">
                    <a href="#catalog" className="btn btn-primary" onClick={() => setSelectedCategory('All')}>Shop Catalog</a>
                  </div>
                </div>
                
                {/* Featured Card */}
                {products.length > 0 && (
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
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase' }}>Featured Stock</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy)' }}>R{Number(products[0].price).toFixed(2)}</span>
                      </div>
                      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
                        <ProductIcon name={products[0].images?.[0] || 'powerbank'} className="detail-icon-large" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>{products[0].title}</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--sdark)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {products[0].description}
                        </p>
                        <Link
                          href={`/product/${products[0].slug || products[0].id}`}
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

            {/* Catalog Grid Section */}
            <section id="catalog" className="container" style={{ padding: '40px 0 80px' }}>
              
              <div className="catalog-header">
                <div>
                  <div className="sec-lbl">Tech Accessories</div>
                  <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700 }}>Curated Electronics</h2>
                </div>
                
                {/* Categories Tab list */}
                <div className="categories-tabs" style={{ margin: 0 }}>
                  {categories.map(cat => (
                    <button 
                      key={cat} 
                      className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Listing */}
              {loadingProducts ? (
                <div className="product-grid" style={{ marginTop: '32px' }}>
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="card" style={{ padding: '24px', opacity: 0.6 }}>
                      <div style={{ width: '100%', height: '160px', background: '#e2e8f0', borderRadius: '12px', marginBottom: '16px' }} />
                      <div style={{ width: '40%', height: '14px', background: '#cbd5e1', borderRadius: '4px', marginBottom: '8px' }} />
                      <div style={{ width: '80%', height: '20px', background: '#cbd5e1', borderRadius: '4px', marginBottom: '12px' }} />
                      <div style={{ width: '100%', height: '14px', background: '#e2e8f0', borderRadius: '4px' }} />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', marginTop: '32px' }}>
                  <Store size={48} style={{ color: 'var(--sdark)', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>No inventory products found</h3>
                  <p style={{ color: 'var(--sdark)', maxWidth: '440px', margin: '0 auto 24px' }}>
                    {selectedCategory !== 'All' 
                      ? `There are currently no items listed under "${selectedCategory}".`
                      : 'Products are currently loading or unavailable. Please check back shortly.'}
                  </p>
                </div>
              ) : (
                <div className="product-grid" style={{ marginTop: '32px' }}>
                  {filteredProducts.map(product => (
                    <div key={product.id} className="product-card-wrapper">
                      {/* Realistic Storefront Badges */}
                      <div className="product-card-badge">
                        Express Delivery
                      </div>

                      <Link
                        href={`/product/${product.slug || product.id}`}
                        className="product-card product-card-link"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="product-image-wrapper">
                          <ProductIcon name={Array.isArray(product.images) ? product.images[0] : (product.images || 'powerbank')} />
                        </div>
                        <div className="product-details">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                      {/* Quick-add button overlay */}
                      <button
                        className="product-quick-add"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        aria-label={`Add ${product.title} to cart`}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </section>
          </div>
        )}
      </main>
 
      {/* Global Cart Drawer */}
      <CartDrawer onCheckoutClick={() => setCheckoutStep('form')} />

      {/* Core Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <a href="#" className="logo logo-light" style={{ marginBottom: '16px' }}>
                <img src="/logo.png" alt="Vylex Logo" width="32" height="32" style={{ flexShrink: 0, objectFit: 'contain' }} />
                <span className="logo-text">vylex<span className="logo-dot-text">.</span><span className="logo-subtext">Store</span></span>
              </a>
              <p>Premium online tech store. Direct dispatch and secure delivery across South Africa.</p>
            </div>
            <div className="footer-col">
              <h3>Shop Categories</h3>
              <ul className="footer-links">
                {categories.slice(1).map(cat => (
                  <li key={cat}>
                    <a href="#catalog" onClick={() => setSelectedCategory(cat)}>{cat}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="footer-col">
              <h3>Customer Care</h3>
              <ul className="footer-links">
                <li><a href="#">Shipping & Deliveries</a></li>
                <li><a href="#">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Vylex Store. All rights reserved.</p>
            <p style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} style={{ color: 'var(--green)' }} /> Authentic Stock Warranty</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Cart Bar */}
      {checkoutStep === 'browse' && cartCount > 0 && (
        <div className="mobile-sticky-cart" onClick={() => setIsCartOpen(true)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShoppingCart size={20} />
            <span style={{ fontWeight: 600 }}>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700 }}>R{subtotal.toFixed(2)}</span>
            <ArrowRight size={16} />
          </div>
        </div>
      )}

      {/* Global CSS animation helpers */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

    </div>
  );
}
