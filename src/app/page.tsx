'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, 
  Sparkles, Filter, X, CreditCard, ChevronRight, CheckCircle2,
  Lock, RefreshCw, Smartphone, Laptop
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Seed / Mock products for tech accessories dropshipping store
const MOCK_PRODUCTS = [
  {
    id: 'vy-nc20-blk',
    title: 'Vylex NeoCharge 20K Power Bank',
    category: 'Power Banks',
    price: 799.00,
    sku: 'VY-NC20-BLK',
    description: 'High-capacity 20,000mAh power bank with 22.5W Power Delivery. Features dual USB-A and USB-C inputs/outputs, and an LED battery percentage indicator. Charges smartphones 4-5 times.',
    specifications: ['20,000mAh Lithium Polymer battery', '22.5W Fast Charging PD 3.0', '1x USB-C Input/Output, 2x USB-A Output', 'Digital LED Battery Display', 'Flight approved safety multi-protect'],
    images: ['🔌'],
  },
  {
    id: 'vy-wpp-wht',
    title: 'Vylex WavePods Pro Earbuds',
    category: 'Earbuds',
    price: 1299.00,
    sku: 'VY-WPP-WHT',
    description: 'Active Noise Cancelling (ANC) wireless earbuds with bluetooth 5.3. Up to 36 hours of playtime with the wireless charging case. Smart touch controls and water-resistant rating IPX7.',
    specifications: ['Active Noise Cancellation up to 30dB', 'Bluetooth 5.3 low-latency connection', '36 hours total battery life with case', 'IPX7 Water & Sweat Resistant', 'Smart touch controls with voice assistant support'],
    images: ['🎧'],
  },
  {
    id: 'vy-tfv4-gry',
    title: 'Vylex TitanFit Smartwatch V4',
    category: 'Smartwatches',
    price: 1899.00,
    sku: 'VY-TFV4-GRY',
    description: 'Premium smartwatch featuring 1.9" AMOLED display, blood oxygen monitoring, heart rate sensor, GPS tracking, and sleep analysis. Compatible with Android & iOS. 10-day battery life.',
    specifications: ['1.9" Always-on AMOLED Display', 'Heart rate, SpO2, and Sleep tracking', '100+ Sports tracking modes', 'GPS route tracing via app connectivity', '10-day battery life on a single charge'],
    images: ['⌚'],
  },
  {
    id: 'vy-sp65-gan',
    title: 'Vylex SuperPort 65W GaN Charger',
    category: 'Chargers',
    price: 549.00,
    sku: 'VY-SP65-GAN',
    description: 'Ultra-compact Gallium Nitride (GaN) wall charger. Features 2x USB-C PD ports and 1x USB-A port. Safely fast-charge your MacBook, tablet, smartwatch, and smartphone simultaneously.',
    specifications: ['65W Total Power output via GaN Technology', '2x USB-C Power Delivery ports, 1x USB-A port', 'Intelligent power allocation control', 'Advanced over-temperature & short-circuit protection', 'Extremely compact foldable plug design'],
    images: ['⚡'],
  }
];

const CATEGORIES = ['All', 'Earbuds', 'Power Banks', 'Smartwatches', 'Chargers'];

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export default function Home() {
  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'browse' | 'details' | 'form' | 'redirecting'>('browse');
  
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
          .select('*');
        if (error) {
          console.warn('Could not load products from Supabase, using mock local products.');
        } else if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (e) {
        console.warn('Supabase not connected. Displaying local offline preview products.');
      }
    }
    fetchProducts();
  }, []);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('vylex_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart');
      }
    }
  }, []);

  // Save cart to LocalStorage when changed
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('vylex_cart', JSON.stringify(newCart));
  };

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    let newCart: CartItem[] = [];
    if (existingItem) {
      newCart = cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, {
        id: product.id,
        title: product.title,
        price: Number(product.price),
        quantity: 1,
        image: product.images?.[0] || '🔌'
      }];
    }
    saveCart(newCart);
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[];
    saveCart(newCart);
  };

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    saveCart(newCart);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShippingCost = (subtotal: number) => {
    if (subtotal === 0) return 0;
    return subtotal >= 1000 ? 0 : 99; // Free shipping over R1000, otherwise R99
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCheckout(true);
    setCheckoutStep('redirecting');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: cart,
          shippingDetails,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Checkout process failed.');
        setCheckoutStep('form');
        setLoadingCheckout(false);
        return;
      }

      // Create a hidden form and submit it to redirect the user to PayFast sandbox/live portal
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
      
      // Clear the local cart before redirecting
      saveCart([]);
      
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Premium Navigation Header */}
      <header className="navbar">
        <div className="container navbar-inner">
          <a href="#" className="logo" onClick={() => setCheckoutStep('browse')}>
            <div className="logo-dot"></div>
            Vylex<span>Store</span>
          </a>
          
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {checkoutStep === 'browse' && (
              <div style={{ display: 'flex', gap: '20px' }}>
                <a href="#catalog" className="nav-link">Shop Gadgets</a>
                <a href="/admin" className="nav-link" style={{ color: 'var(--orange)', fontWeight: 'bold' }}>Admin Console</a>
              </div>
            )}
            
            <button className="btn-icon" onClick={() => setIsCartOpen(true)} style={{ position: 'relative' }}>
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--orange)',
                  color: 'var(--navy)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

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
          <div className="container" style={{ padding: '60px 0' }}>
            <button className="btn btn-outline" onClick={() => setCheckoutStep('browse')} style={{ marginBottom: '32px' }}>
              Back to Catalog
            </button>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '12px' }}>Secure Checkout</h1>
            <p style={{ color: 'var(--sdark)', marginBottom: '40px' }}>Provide your contact details and shipping address to place order. Integrated with PayFast.</p>

            <div className="checkout-grid">
              
              {/* Form Input fields */}
              <form onSubmit={handleCheckoutSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--slate)', paddingBottom: '12px' }}>
                  Shipping & Customer Info
                </h2>
                
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="John Doe" 
                    className="form-input" 
                    value={shippingDetails.fullName}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="john@example.co.za" 
                      className="form-input" 
                      value={shippingDetails.email}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="082 123 4567" 
                      className="form-input" 
                      value={shippingDetails.phone}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="123 Brandvlei Ave" 
                    className="form-input" 
                    value={shippingDetails.streetAddress}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, streetAddress: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Suburb (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="Sandton" 
                      className="form-input" 
                      value={shippingDetails.suburb}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, suburb: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Johannesburg" 
                      className="form-input" 
                      value={shippingDetails.city}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Province</label>
                    <select 
                      required 
                      className="form-input"
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
                      type="text" 
                      required 
                      placeholder="2196" 
                      className="form-input" 
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
                  {loadingCheckout ? 'Preparing gateway connection...' : `Pay R${(getSubtotal() + getShippingCost(getSubtotal())).toFixed(2)} via PayFast`}
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
                      <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        {item.image}
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
                  <span>R{getSubtotal().toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Delivery Cost</span>
                  <span>{getShippingCost(getSubtotal()) === 0 ? 'FREE' : `R${getShippingCost(getSubtotal()).toFixed(2)}`}</span>
                </div>

                <div className="summary-total">
                  <span>Total Due</span>
                  <span>R{(getSubtotal() + getShippingCost(getSubtotal())).toFixed(2)}</span>
                </div>

                {getSubtotal() < 1000 && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--orange)', marginTop: '16px', fontStyle: 'italic' }}>
                    💡 Tip: Add R{(1000 - getSubtotal()).toFixed(2)} more to qualify for FREE delivery!
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
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <a href="#catalog" className="btn btn-primary">Browse Catalog</a>
                    <button className="btn btn-secondary" onClick={() => {
                      // Demo direct checkout
                      if(cart.length > 0) {
                        setCheckoutStep('form');
                      } else {
                        alert('Add some items to your cart first!');
                      }
                    }}>Quick Checkout</button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                  <div style={{
                    width: '320px',
                    height: '320px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--orange) 0%, transparent 70%)',
                    position: 'absolute',
                    opacity: 0.15,
                    filter: 'blur(30px)'
                  }}></div>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '40px',
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-lg)',
                    textAlign: 'center',
                    maxWidth: '300px',
                    animation: 'pulseGlow 4s infinite ease-in-out'
                  }}>
                    <div style={{ fontSize: '5rem', marginBottom: '16px' }}>⚡</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Direct Dropshipping</h3>
                    <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)' }}>Order placement triggers dispatch directly from premium suppliers. No stock overheads.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Catalog Grid Section */}
            <section id="catalog" className="container" style={{ padding: '60px 0 100px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--slate)', paddingBottom: '24px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <div className="sec-lbl">Tech Accessories</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Curated Electronics</h2>
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

              {/* Product Listing */}
              <div className="product-grid" style={{ marginTop: '40px' }}>
                {filteredProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image-wrapper">
                      <div className="product-image-fallback">
                        {product.images?.[0] || '🔋'}
                      </div>
                    </div>
                    <div className="product-details">
                      <span className="product-category">{product.category}</span>
                      <h3 className="product-title">{product.title}</h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--sdark)', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.description}
                      </p>
                      <div className="product-price-row">
                        <span className="product-price">R{Number(product.price).toFixed(2)}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.85rem' }} onClick={() => {
                            setSelectedProduct(product);
                            setCheckoutStep('details');
                          }}>
                            Specs
                          </button>
                          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => addToCart(product)}>
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </section>
          </div>
        )}
      </main>

      {/* Product Detail Spec Modal View */}
      {checkoutStep === 'details' && selectedProduct && (
        <div className="modal-overlay" onClick={() => setCheckoutStep('browse')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="product-category">{selectedProduct.category}</span>
              <button className="modal-close" onClick={() => setCheckoutStep('browse')}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <div style={{ width: '120px', height: '120px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                {selectedProduct.images?.[0] || '🔌'}
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>{selectedProduct.title}</h2>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--sdark)', background: 'var(--slate)', padding: '4px 8px', borderRadius: '4px' }}>
                  SKU: {selectedProduct.sku}
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--navy)', marginTop: '16px' }}>
                  R{Number(selectedProduct.price).toFixed(2)}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>Overview</h3>
              <p style={{ color: 'var(--sdark)', fontSize: '0.92rem' }}>{selectedProduct.description}</p>
            </div>

            {selectedProduct.specifications && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>Specifications</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedProduct.specifications.map((spec: string, idx: number) => (
                    <li key={idx} style={{ fontSize: '0.88rem', color: 'var(--sdark)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--orange)', marginTop: '2px' }}>•</span> {spec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn btn-outline" style={{ flexGrow: 1 }} onClick={() => setCheckoutStep('browse')}>
                Close Specifications
              </button>
              <button className="btn btn-primary" style={{ flexGrow: 1 }} onClick={() => {
                addToCart(selectedProduct);
                setCheckoutStep('browse');
              }}>
                Add to Shopping Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Slider Drawer */}
      {isCartOpen && (
        <div className="modal-overlay" onClick={() => setIsCartOpen(false)} style={{ justifyContent: 'flex-end', alignItems: 'stretch' }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            width: '100%',
            maxWidth: '460px',
            borderRadius: '18px 0 0 18px',
            height: '100%',
            maxHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.2s ease-out'
          }}>
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
                    <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                      {item.image}
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
                  <span style={{ fontWeight: 600 }}>R{getSubtotal().toFixed(2)}</span>
                </div>
                <div className="summary-item" style={{ marginBottom: '16px' }}>
                  <span>Delivery Cost</span>
                  <span>{getShippingCost(getSubtotal()) === 0 ? 'FREE' : `R${getShippingCost(getSubtotal()).toFixed(2)}`}</span>
                </div>
                
                <div className="summary-total" style={{ borderTop: '1px solid var(--slate)', paddingTop: '16px', marginBottom: '24px' }}>
                  <span>Total Amount</span>
                  <span>R{(getSubtotal() + getShippingCost(getSubtotal())).toFixed(2)}</span>
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
              <a href="#" className="logo" style={{ color: 'white', marginBottom: '16px' }}>
                <div className="logo-dot"></div>
                Vylex<span style={{ color: 'var(--orange)' }}>Store</span>
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
                <li><a href="/admin">Admin Console</a></li>
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
