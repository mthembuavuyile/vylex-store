'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, 
  X, CreditCard, ChevronRight,
  Lock, RefreshCw, Menu
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MOCK_PRODUCTS, CATEGORIES, ProductIcon } from '@/lib/products';
import { useCart } from '@/lib/cart-context';

export default function Home() {
  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'browse' | 'form' | 'redirecting'>('browse');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const {
    cart, addToCart, updateQuantity, removeItem, clearCart,
    getSubtotal, getShippingCost, getTotal, cartCount
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

  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Load products from Supabase, or fall back to mock seed
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, title, description, price, sku, category, images, stock_quantity, slug');
        if (error) {
          console.warn('Could not load products from Supabase, using mock local products.');
        } else if (data && data.length > 0) {
          setProducts(data);
        }
      } catch {
        console.warn('Supabase not connected. Displaying local offline preview products.');
      }
    }
    fetchProducts();
  }, []);

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image: product.images?.[0] || 'powerbank',
      slug: product.slug || '',
    });
    setIsCartOpen(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCheckout(true);
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
        setLoadingCheckout(false);
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
      console.error('Checkout submit error:', error);
      alert('An unexpected error occurred. Please try again.');
      setCheckoutStep('form');
      setLoadingCheckout(false);
    }
  };

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const total = getTotal();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Premium Navigation Header */}
      <header className="navbar">
        <div className="container navbar-inner">
          <a href="#" className="logo" onClick={() => { setCheckoutStep('browse'); setIsMobileMenuOpen(false); }}>
            <img src="/logo.png" alt="Vylex Logo" width="32" height="32" style={{ flexShrink: 0, objectFit: 'contain' }} />
            <span className="logo-text">vylex<span className="logo-dot-text">.</span><span className="logo-subtext">Store</span></span>
          </a>
          
          {/* Desktop Navigation Links */}
          <nav className="desktop-nav">
            {checkoutStep === 'browse' && (
              <a href="#catalog" className="nav-link">Shop Gadgets</a>
            )}
            <Link href="/admin" className="nav-link" style={{ color: 'var(--orange)', fontWeight: 'bold' }}>Admin Console</Link>
          </nav>

          {/* Action Buttons */}
          <div className="nav-actions">
            <button className="btn-icon" onClick={() => setIsCartOpen(true)} style={{ position: 'relative' }}>
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  background: 'var(--orange)', color: 'var(--navy)',
                  fontSize: '0.72rem', fontWeight: 700,
                  width: '20px', height: '20px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger Trigger for Mobile */}
            <button 
              className="btn-icon mobile-menu-trigger" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

      </header>

      {/* Mobile Navigation Drawer Menu */}
      <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
        <div className="mobile-nav-content" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-nav-header">
            <a href="#" className="logo" onClick={() => { setCheckoutStep('browse'); setIsMobileMenuOpen(false); }}>
              <img src="/logo.png" alt="Vylex Logo" width="32" height="32" style={{ flexShrink: 0, objectFit: 'contain' }} />
              <span className="logo-text">vylex<span className="logo-dot-text">.</span><span className="logo-subtext">Store</span></span>
            </a>
            <button className="btn-icon" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          <nav className="mobile-nav-links">
            {checkoutStep === 'browse' && (
              <a href="#catalog" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Shop Gadgets
              </a>
            )}
            <Link href="/admin" className="mobile-nav-link mobile-nav-admin" onClick={() => setIsMobileMenuOpen(false)}>
              Admin Console
            </Link>
          </nav>

          <div className="mobile-nav-footer">
            <p>Premium online tech store. Built for store.vylex.co.za.</p>
          </div>
        </div>
      </div>

      {/* Main App Workspace */}
      <main style={{ flexGrow: 1 }}>
        {checkoutStep === 'redirecting' ? (
          <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 24px', textAlign: 'center' }}>
            <RefreshCw size={60} className="animate-spin" style={{ color: 'var(--orange)', marginBottom: '24px', animation: 'spin 1.5s linear infinite' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px' }}>Connecting to Secure Payment Gateway</h2>
            <p style={{ color: 'var(--sdark)', maxWidth: '480px' }}>Please wait while we set up your secure transaction. You will be redirected to PayFast to complete payment. Do not refresh this page.</p>
          </div>
        ) : checkoutStep === 'form' ? (
          /* Checkout View */
          <div className="container" style={{ padding: '40px 0 60px' }}>
            <button className="btn btn-outline" onClick={() => setCheckoutStep('browse')} style={{ marginBottom: '24px' }}>
              Back to Catalog
            </button>

            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, marginBottom: '12px' }}>Secure Checkout</h1>
            <p style={{ color: 'var(--sdark)', marginBottom: '32px' }}>Provide your contact details and shipping address to place order. Integrated with PayFast.</p>

            <div className="checkout-grid">
              
              {/* Form Input fields */}
              <form onSubmit={handleCheckoutSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--slate)', paddingBottom: '12px' }}>
                  Shipping & Customer Info
                </h2>
                
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" required placeholder="John Doe" className="form-input" 
                    value={shippingDetails.fullName}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" required placeholder="john@example.co.za" className="form-input" 
                      value={shippingDetails.email}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="tel" placeholder="082 123 4567" className="form-input" 
                      value={shippingDetails.phone}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input 
                    type="text" required placeholder="123 Brandvlei Ave" className="form-input" 
                    value={shippingDetails.streetAddress}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, streetAddress: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Suburb (Optional)</label>
                    <input 
                      type="text" placeholder="Sandton" className="form-input" 
                      value={shippingDetails.suburb}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, suburb: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input 
                      type="text" required placeholder="Johannesburg" className="form-input" 
                      value={shippingDetails.city}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Province</label>
                    <select 
                      required className="form-input"
                      value={shippingDetails.state}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                    >
                      <option value="">Select Province</option>
                      <option value="Gauteng">Gauteng</option>
                      <option value="Western Cape">Western Cape</option>
                      <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                      <option value="Eastern Cape">Eastern Cape</option>
                      <option value="Free State">Free State</option>
                      <option value="Limpopo">Limpopo</option>
                      <option value="Mpumalanga">Mpumalanga</option>
                      <option value="North West">North West</option>
                      <option value="Northern Cape">Northern Cape</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input 
                      type="text" required placeholder="2196" className="form-input" 
                      value={shippingDetails.postalCode}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, postalCode: e.target.value })}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loadingCheckout}
                  className="btn btn-primary" 
                  style={{ width: '100%', gap: '12px', padding: '16px' }}
                >
                  <CreditCard size={20} />
                  {loadingCheckout ? 'Preparing gateway connection...' : `Pay R${total.toFixed(2)} via PayFast`}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--sdark)', fontSize: '0.8rem' }}>
                  <Lock size={14} /> Secured and processed via PayFast South Africa
                </div>
              </form>

              {/* Shopping Cart Summary column */}
              <div className="card" style={{ height: 'fit-content' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--slate)', paddingBottom: '12px', marginBottom: '20px' }}>
                  Order Summary
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ProductIcon name={item.image} className="cart-icon-small" />
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.2 }}>{item.title}</h4>
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
            
            {/* Hero Section — Compact on mobile */}
            <section className="hero">
              <div className="hero-grid"></div>
              <div className="hero-glow"></div>
              <div className="container hero-inner">
                <div className="hero-content" style={{ animation: 'fadeIn 0.8s ease-out' }}>
                  <h1>Vylex Premium <span>Consumer Tech</span></h1>
                  <p>Elevate your digital life. Fast dispatch and secure delivery on premium power banks, audio, smart wearables, and chargers.</p>
                  <div className="hero-buttons">
                    <a href="#catalog" className="btn btn-primary" onClick={() => setSelectedCategory('All')}>Shop Now</a>
                  </div>
                </div>
                
                {/* Featured Product Card — hidden on small mobile */}
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
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase' }}>Featured Product</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy)' }}>R1299.00</span>
                    </div>
                    <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
                      <ProductIcon name="earbuds" className="detail-icon-large" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Vylex WavePods Pro</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--sdark)', marginBottom: '16px' }}>Active Noise Cancelling (ANC) wireless earbuds with bluetooth 5.3.</p>
                      <Link
                        href="/product/vylex-wavepods-pro-earbuds"
                        className="btn btn-primary"
                        style={{ width: '100%', textAlign: 'center' }}
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
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
                  {CATEGORIES.map(cat => (
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

              {/* Product Listing — Cards are fully tappable links */}
              <div className="product-grid" style={{ marginTop: '32px' }}>
                {filteredProducts.map(product => (
                  <div key={product.id} className="product-card-wrapper">
                    <Link
                      href={`/product/${product.slug || product.id}`}
                      className="product-card product-card-link"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div className="product-image-wrapper">
                        <ProductIcon name={product.images?.[0] || 'powerbank'} />
                      </div>
                      <div className="product-details">
                        <span className="product-category">{product.category}</span>
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

            </section>
          </div>
        )}
      </main>

      {/* Cart Slider Drawer */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--slate)', paddingBottom: '16px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 700 }}>
                <ShoppingCart size={22} /> Shopping Cart
              </h2>
              <button className="modal-close" onClick={() => setIsCartOpen(false)}><X size={20} /></button>
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
                  <div key={item.id} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--slate)', paddingBottom: '20px' }}>
                    <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ProductIcon name={item.image} className="cart-icon-medium" />
                    </div>
                    
                    <div style={{ flexGrow: 1 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px', lineHeight: 1.2 }}>{item.title}</h3>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px' }}>
                        R{item.price.toFixed(2)}
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--slate)', borderRadius: '30px', padding: '2px 4px' }}>
                          <button className="btn-icon" style={{ width: '28px', height: '28px', border: 'none' }} onClick={() => updateQuantity(item.id, -1)}>
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button className="btn-icon" style={{ width: '28px', height: '28px', border: 'none' }} onClick={() => updateQuantity(item.id, 1)}>
                            <Plus size={12} />
                          </button>
                        </div>
                        
                        <button className="btn-icon" style={{ width: '32px', height: '32px', color: 'var(--red)', borderColor: 'transparent' }} onClick={() => removeItem(item.id)}>
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
                  onClick={() => {
                    setIsCartOpen(false);
                    setCheckoutStep('form');
                  }}
                >
                  Proceed to Secure Checkout <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Core Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <a href="#" className="logo logo-light" style={{ marginBottom: '16px' }}>
                <img src="/logo.png" alt="Vylex Logo" width="32" height="32" style={{ flexShrink: 0, objectFit: 'contain' }} />
                <span className="logo-text">vylex<span className="logo-dot-text">.</span><span className="logo-subtext">Store</span></span>
              </a>
              <p>Premium online tech store. Dropshipping high-quality, supplier-warranted consumer electronics across South Africa.</p>
            </div>
            <div className="footer-col">
              <h3>Shop Categories</h3>
              <ul className="footer-links">
                {CATEGORIES.slice(1).map(cat => (
                  <li key={cat}>
                    <a href="#catalog" onClick={() => setSelectedCategory(cat)}>{cat}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="footer-col">
              <h3>Company Policy</h3>
              <ul className="footer-links">
                <li><a href="#">Shipping & Deliveries</a></li>
                <li><a href="#">Refund Policy</a></li>
                <li><Link href="/admin">Admin Console</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Vylex Store. Built for store.vylex.co.za. All rights reserved.</p>
            <p style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} style={{ color: 'var(--green)' }} /> Genuine Stock Warranty</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Cart Bar — shown when items in cart and browsing */}
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

      {/* Global CSS classes styling helpers */}
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
