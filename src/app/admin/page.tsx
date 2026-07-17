'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, ShieldAlert, BarChart3, Database, RefreshCcw, 
  Trash2, Plus, Upload, Check, Truck, Clock, 
  DollarSign, ShoppingCart, LogOut, FileSpreadsheet, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Local storage keys for state persistence if Supabase database is not loaded
const ADMIN_PRODUCTS_KEY = 'vylex_admin_products';
const ADMIN_ORDERS_KEY = 'vylex_admin_orders';
const ADMIN_SYNC_LOGS_KEY = 'vylex_admin_sync_logs';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'sync'>('overview');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  
  // Authentication State
  const [session, setSession] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Modals / Form toggles
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<any | null>(null);

  // New Product Form
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    category: 'Earbuds',
    price: '',
    cost_price: '',
    sku: '',
    stock_quantity: '50',
    source: 'manual',
    images: ['🔌']
  });

  // Tracking Info Form
  const [trackingForm, setTrackingForm] = useState({
    courier_name: 'The Courier Guy',
    tracking_number: '',
    tracking_url: '',
    status: 'in_transit'
  });

  // Supplier Sync Markup Config
  const [syncMarkup, setSyncMarkup] = useState(30);
  const [syncLogOutput, setSyncLogOutput] = useState<string[]>([]);
  const [csvFileContent, setCsvFileContent] = useState('');

  // 1. Initial Authentication State setup
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Data Fetching from Supabase when session changes (with fallback to localStorage/mock)
  useEffect(() => {
    async function loadData() {
      if (!session) return;
      
      // Load Products
      try {
        const { data: dbProducts, error: prodErr } = await supabase.from('products').select('*');
        if (prodErr || !dbProducts || dbProducts.length === 0) {
          throw new Error('Supabase fail or empty');
        }
        setProducts(dbProducts);
        localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(dbProducts));
      } catch (e) {
        const local = localStorage.getItem(ADMIN_PRODUCTS_KEY);
        if (local) {
          setProducts(JSON.parse(local));
        } else {
          const initial = [
            { id: 'vy-nc20-blk', title: 'Vylex NeoCharge 20K Power Bank', category: 'Power Banks', price: 799.00, cost_price: 420.00, sku: 'VY-NC20-BLK', stock_quantity: 45, source: 'manual', images: ['🔌'] },
            { id: 'vy-wpp-wht', title: 'Vylex WavePods Pro Earbuds', category: 'Earbuds', price: 1299.00, cost_price: 650.00, sku: 'VY-WPP-WHT', stock_quantity: 12, source: 'manual', images: ['🎧'] },
            { id: 'vy-tfv4-gry', title: 'Vylex TitanFit Smartwatch V4', category: 'Smartwatches', price: 1899.00, cost_price: 950.00, sku: 'VY-TFV4-GRY', stock_quantity: 8, source: 'manual', images: ['⌚'] },
            { id: 'vy-sp65-gan', title: 'Vylex SuperPort 65W GaN Charger', category: 'Chargers', price: 549.00, cost_price: 280.00, sku: 'VY-SP65-GAN', stock_quantity: 90, source: 'manual', images: ['⚡'] }
          ];
          setProducts(initial);
          localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(initial));
        }
      }

      // Load Orders
      try {
        const { data: dbOrders, error: orderErr } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (orderErr || !dbOrders) {
          throw new Error('Supabase fail');
        }
        setOrders(dbOrders);
        localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(dbOrders));
      } catch (e) {
        const local = localStorage.getItem(ADMIN_ORDERS_KEY);
        if (local) {
          setOrders(JSON.parse(local));
        } else {
          const initialOrders = [
            { id: 'ord-81f14890', customer_name: 'Avuyile Mthembu', customer_email: 'avuyile@vylex.co.za', total_amount: 1899.00, status: 'paid', created_at: new Date(Date.now() - 3600000 * 2).toISOString(), shipping_address: { streetAddress: '12 Rivonia Blvd', city: 'Sandton', state: 'Gauteng', postalCode: '2196' } },
            { id: 'ord-94b802a4', customer_name: 'Lerato Molefe', customer_email: 'lerato@example.co.za', total_amount: 898.00, status: 'pending', created_at: new Date(Date.now() - 3600000 * 8).toISOString(), shipping_address: { streetAddress: '45 Long St', city: 'Cape Town', state: 'Western Cape', postalCode: '8001' } },
            { id: 'ord-21d96b13', customer_name: 'John Smith', customer_email: 'john@example.co.za', total_amount: 1398.00, status: 'shipped', created_at: new Date(Date.now() - 3600000 * 24).toISOString(), shipping_address: { streetAddress: '88 Musgrave Rd', city: 'Durban', state: 'KwaZulu-Natal', postalCode: '4001' } }
          ];
          setOrders(initialOrders);
          localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(initialOrders));
        }
      }

      // Load Sync Logs
      try {
        const { data: dbLogs, error: logErr } = await supabase.from('supplier_sync_logs').select('*').order('created_at', { ascending: false });
        if (logErr || !dbLogs) {
          throw new Error('Supabase fail');
        }
        setSyncLogs(dbLogs);
        localStorage.setItem(ADMIN_SYNC_LOGS_KEY, JSON.stringify(dbLogs));
      } catch (e) {
        const local = localStorage.getItem(ADMIN_SYNC_LOGS_KEY);
        if (local) {
          setSyncLogs(JSON.parse(local));
        }
      }
    }
    loadData();
  }, [session]);

  const saveProductsState = (newProducts: any[]) => {
    setProducts(newProducts);
    localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(newProducts));
  };

  const saveOrdersState = (newOrders: any[]) => {
    setOrders(newOrders);
    localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(newOrders));
  };

  const saveSyncLogsState = (newLogs: any[]) => {
    setSyncLogs(newLogs);
    localStorage.setItem(ADMIN_SYNC_LOGS_KEY, JSON.stringify(newLogs));
  };

  // 2. Add Manual Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const productPayload = {
      title: newProduct.title,
      description: newProduct.description,
      category: newProduct.category,
      price: parseFloat(newProduct.price),
      cost_price: parseFloat(newProduct.cost_price),
      sku: newProduct.sku,
      stock_quantity: parseInt(newProduct.stock_quantity),
      source: 'manual',
      images: [newProduct.category === 'Earbuds' ? '🎧' : newProduct.category === 'Smartwatches' ? '⌚' : newProduct.category === 'Chargers' ? '⚡' : '🔌']
    };

    try {
      const { data, error } = await supabase.from('products').insert(productPayload).select().single();
      if (error) throw error;
      
      saveProductsState([...products, data]);
    } catch (e) {
      const offlineProduct = {
        id: 'vy-' + Math.random().toString(36).substring(2, 9),
        ...productPayload
      };
      saveProductsState([...products, offlineProduct]);
    }

    setIsAddProductOpen(false);
    setNewProduct({
      title: '', description: '', category: 'Earbuds',
      price: '', cost_price: '', sku: '',
      stock_quantity: '50', source: 'manual', images: ['🔌']
    });
  };

  // 3. Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product from your inventory?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      saveProductsState(products.filter(p => p.id !== id));
    } catch (e) {
      saveProductsState(products.filter(p => p.id !== id));
    }
  };

  // 4. Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      
      saveOrdersState(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) {
      saveOrdersState(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  // 5. Submit Courier Tracking Details
  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForTracking) return;

    const orderId = selectedOrderForTracking.id;

    try {
      const { error } = await supabase.from('tracking_info').upsert({
        order_id: orderId,
        courier_name: trackingForm.courier_name,
        tracking_number: trackingForm.tracking_number,
        tracking_url: trackingForm.tracking_url || `https://www.thecourierguy.co.za/tracking?no=${trackingForm.tracking_number}`,
        status: trackingForm.status
      });

      if (error) throw error;

      await supabase.from('orders').update({ status: 'shipped' }).eq('id', orderId);

      await supabase.from('supplier_sync_logs').insert({
        status: 'success',
        details: `Tracking details uploaded for Order #${orderId.substring(0,8)}. Courier: ${trackingForm.courier_name}`
      });

      saveOrdersState(orders.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o));
    } catch (e) {
      saveOrdersState(orders.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o));
    }

    setIsTrackingModalOpen(false);
    setSelectedOrderForTracking(null);
    setTrackingForm({
      courier_name: 'The Courier Guy',
      tracking_number: '', tracking_url: '', status: 'in_transit'
    });
  };

  // 6. CSV Parse & Supplier Sync Engine
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      setCsvFileContent(text);
    };
    reader.readAsText(file);
  };

  const runSyncEngine = async () => {
    if (!csvFileContent) {
      alert('Please upload a valid supplier CSV file first.');
      return;
    }

    setSyncLogOutput(['Initializing Supplier Sync Engine...', 'Target: store.vylex.co.za database']);

    const lines = csvFileContent.split('\n');
    const logs: string[] = [];
    let updatedCount = 0;

    const updatedProductsList = [...products];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || i === 0 && line.toLowerCase().includes('sku')) continue;

      const cols = line.split(',');
      if (cols.length < 3) continue;

      const sku = cols[0].trim();
      const costPrice = parseFloat(cols[1].trim());
      const stock = parseInt(cols[2].trim());

      if (!sku || isNaN(costPrice) || isNaN(stock)) {
        logs.push(`⚠️ Line ${i+1}: Invalid row values, skipping.`);
        continue;
      }

      const calculatedSellingPrice = costPrice * (1 + syncMarkup / 100);

      const existingProductIdx = updatedProductsList.findIndex(p => p.sku.toLowerCase() === sku.toLowerCase());

      if (existingProductIdx !== -1) {
        const updatedProduct = {
          ...updatedProductsList[existingProductIdx],
          cost_price: costPrice,
          price: parseFloat(calculatedSellingPrice.toFixed(2)),
          stock_quantity: stock,
          source: 'supplier_sync',
          updated_at: new Date().toISOString()
        };

        updatedProductsList[existingProductIdx] = updatedProduct;

        try {
          await supabase.from('products').update({
            cost_price: costPrice,
            price: parseFloat(calculatedSellingPrice.toFixed(2)),
            stock_quantity: stock,
            source: 'supplier_sync'
          }).eq('id', updatedProduct.id);
        } catch(e) {}

        logs.push(`✅ SKU MATCH: Updated pricing/stock for ${sku}. Cost: R${costPrice} -> Sell: R${calculatedSellingPrice.toFixed(2)}. Stock: ${stock}`);
        updatedCount++;
      } else {
        logs.push(`ℹ️ SKU NEW: SKU "${sku}" did not match any current catalog item. Manual listing suggested.`);
      }
    }

    saveProductsState(updatedProductsList);
    logs.push(`\nSync finished. ${updatedCount} products updated successfully.`);
    setSyncLogOutput(logs);

    const logDetails = `Supplier Sync completed. Markup: ${syncMarkup}%. Items updated: ${updatedCount}.`;
    const newLog = {
      id: Math.random().toString(),
      status: 'success' as const,
      details: logDetails,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('supplier_sync_logs').insert({
        status: 'success',
        details: logDetails
      });
    } catch(e) {}

    saveSyncLogsState([newLog, ...syncLogs]);
  };

  // Helper selectors for metrics
  const totalSales = orders.filter(o => o.status !== 'pending' && o.status !== 'cancelled')
                          .reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
  
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const paidOrders = orders.filter(o => o.status === 'paid');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    if (error) setAuthError(error.message);
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="logo logo-light" style={{ justifyContent: 'center', marginBottom: '16px' }}>
              <img src="/logo.png" alt="Vylex Logo" width="32" height="32" style={{ flexShrink: 0, objectFit: 'contain' }} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Admin Login</h1>
            <p style={{ color: 'var(--sdark)', fontSize: '0.9rem', marginTop: '8px' }}>Restricted access for store owners.</p>
          </div>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" className="form-input" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
            </div>
            
            {authError && <div style={{ color: '#ef4444', fontSize: '0.85rem', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>{authError}</div>}
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', width: '100%' }} disabled={isLoggingIn}>
              {isLoggingIn ? 'Authenticating...' : 'Sign In securely'} <ShieldAlert size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      
      {/* Sidebar Controls */}
      <aside className="admin-sidebar">
        <Link href="/" className="logo logo-light" style={{ marginBottom: '20px' }}>
          <img src="/logo.png" alt="Vylex Logo" width="24" height="24" style={{ flexShrink: 0, objectFit: 'contain' }} />
          <span className="logo-text" style={{ fontSize: '1.25rem' }}>vylex<span className="logo-dot-text">.</span><span className="logo-subtext" style={{ fontSize: '0.8rem' }}>Admin</span></span>
        </Link>

        <ul className="admin-nav">
          {[
            { key: 'overview' as const, icon: <BarChart3 size={18} />, label: 'Overview' },
            { key: 'products' as const, icon: <Database size={18} />, label: 'Products' },
            { key: 'orders' as const, icon: <ShoppingCart size={18} />, label: 'Orders' },
            { key: 'sync' as const, icon: <RefreshCcw size={18} />, label: 'Sync' },
          ].map(tab => (
            <li key={tab.key} className="admin-nav-item">
              <button 
                className={`admin-nav-link ${activeTab === tab.key ? 'active' : ''}`}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon} {tab.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Mobile logout (inline with nav) */}
        <button
          className="btn btn-outline"
          style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white', marginTop: '12px', width: '100%', fontSize: '0.85rem' }}
          onClick={handleLogout}
        >
          <LogOut size={14} /> Logout
        </button>

        {/* Desktop logout (bottom) */}
        <div className="admin-sidebar-logout">
          <button className="btn btn-outline" style={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Workspace content */}
      <main className="admin-content">
        
        {/* Tab 1: Overview Dashboard metrics */}
        {activeTab === 'overview' && (
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, marginBottom: '6px' }}>Dashboard Overview</h1>
            <p style={{ color: 'var(--sdark)', fontSize: '0.9rem' }}>Vylex Store operational dashboard indicators.</p>

            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', margin: '24px 0 32px' }}>
              {[
                { icon: <DollarSign size={20} />, bg: '#d1fae5', color: 'var(--green)', label: 'Revenue (Paid)', value: `R${totalSales.toFixed(2)}` },
                { icon: <ShoppingBag size={20} />, bg: '#dbeafe', color: '#2563eb', label: 'Total Orders', value: orders.length },
                { icon: <Clock size={20} />, bg: '#fee2e2', color: 'var(--red)', label: 'Pending', value: pendingOrders.length },
                { icon: <Truck size={20} />, bg: '#fef3c7', color: '#d97706', label: 'Needs Dispatch', value: paidOrders.length },
              ].map((kpi, idx) => (
                <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px' }}>
                  <div style={{ background: kpi.bg, color: kpi.color, padding: '12px', borderRadius: '10px', flexShrink: 0 }}>
                    {kpi.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--sdark)', display: 'block' }}>{kpi.label}</span>
                    <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', fontWeight: 700 }}>{kpi.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Orders + Sync Logs */}
            <div className="admin-grid">
              <div className="card">
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Recent Orders</h2>
                {/* Mobile: card list, Desktop: table */}
                <div className="admin-card-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--slate)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{o.customer_name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--sdark)' }}>#{o.id.substring(0, 8)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>R{Number(o.total_amount).toFixed(2)}</div>
                        <span className={`badge badge-${o.status}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Sync Logs</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                  {syncLogs.length === 0 ? (
                    <p style={{ color: 'var(--sdark)', fontSize: '0.85rem' }}>No sync logs yet.</p>
                  ) : (
                    syncLogs.slice(0, 5).map(log => (
                      <div key={log.id} style={{ fontSize: '0.85rem', paddingBottom: '12px', borderBottom: '1px solid var(--slate)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ 
                            fontWeight: 700, 
                            color: log.status === 'success' ? 'var(--green)' : 'var(--red)'
                          }}>
                            {log.status.toUpperCase()}
                          </span>
                          <span style={{ color: 'var(--sdark)', fontSize: '0.78rem' }}>{new Date(log.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p style={{ color: 'var(--navy)', fontSize: '0.82rem' }}>{log.details}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Product Catalog management */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, marginBottom: '4px' }}>Product Catalog</h1>
                <p style={{ color: 'var(--sdark)', fontSize: '0.85rem' }}>View and list inventory.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setIsAddProductOpen(true)} style={{ gap: '6px' }}>
                <Plus size={18} /> Add Product
              </button>
            </div>

            {/* Mobile-friendly card list for products */}
            <div className="admin-card-list" style={{ marginTop: '20px' }}>
              {products.map(p => (
                <div key={p.id} className="admin-card-item">
                  <div className="admin-card-item-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{p.images?.[0] || '🔋'}</span>
                      <div>
                        <strong style={{ fontSize: '0.95rem', lineHeight: 1.2, display: 'block' }}>{p.title}</strong>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--sdark)' }}>{p.sku}</span>
                      </div>
                    </div>
                    <button className="btn-icon" style={{ width: '36px', height: '36px', color: 'var(--red)', borderColor: 'transparent', flexShrink: 0 }} onClick={() => handleDeleteProduct(p.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="admin-card-item-details">
                    <div className="admin-card-item-detail">
                      <span className="admin-card-item-detail-label">Category</span>
                      <span>{p.category}</span>
                    </div>
                    <div className="admin-card-item-detail">
                      <span className="admin-card-item-detail-label">Sell Price</span>
                      <span style={{ fontWeight: 600 }}>R{Number(p.price).toFixed(2)}</span>
                    </div>
                    <div className="admin-card-item-detail">
                      <span className="admin-card-item-detail-label">Cost</span>
                      <span>{p.cost_price ? `R${Number(p.cost_price).toFixed(2)}` : 'N/A'}</span>
                    </div>
                    <div className="admin-card-item-detail">
                      <span className="admin-card-item-detail-label">Stock</span>
                      <span>{p.stock_quantity} units</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem',
                      background: p.source === 'manual' ? '#e2e8f0' : '#fef3c7',
                      color: p.source === 'manual' ? 'var(--navy)' : '#d97706',
                      fontWeight: 700, textTransform: 'uppercase'
                    }}>
                      {p.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Orders management, courier fulfillment */}
        {activeTab === 'orders' && (
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, marginBottom: '4px' }}>Orders Panel</h1>
            <p style={{ color: 'var(--sdark)', fontSize: '0.85rem' }}>Fulfill orders, add tracking, and verify payouts.</p>

            {/* Mobile-friendly card list for orders */}
            <div className="admin-card-list" style={{ marginTop: '20px' }}>
              {orders.map(o => (
                <div key={o.id} className="admin-card-item">
                  <div className="admin-card-item-header">
                    <div>
                      <strong style={{ fontSize: '0.95rem', display: 'block' }}>{o.customer_name}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--sdark)' }}>{o.customer_email}</span>
                    </div>
                    <span className={`badge badge-${o.status}`}>{o.status}</span>
                  </div>
                  <div className="admin-card-item-details">
                    <div className="admin-card-item-detail">
                      <span className="admin-card-item-detail-label">Order ID</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#{o.id.substring(0, 8)}</span>
                    </div>
                    <div className="admin-card-item-detail">
                      <span className="admin-card-item-detail-label">Amount</span>
                      <span style={{ fontWeight: 600 }}>R{Number(o.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="admin-card-item-detail">
                      <span className="admin-card-item-detail-label">Date</span>
                      <span>{new Date(o.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="admin-card-item-detail">
                      <span className="admin-card-item-detail-label">City</span>
                      <span>{o.shipping_address?.city || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="admin-card-item-actions">
                    <select 
                      className="form-input"
                      value={o.status}
                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="ordered_from_supplier">Ordered from Supplier</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '8px 12px', fontSize: '0.8rem', gap: '4px', whiteSpace: 'nowrap' }}
                      onClick={() => {
                        setSelectedOrderForTracking(o);
                        setIsTrackingModalOpen(true);
                      }}
                    >
                      <Truck size={14} /> Tracking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Supplier Sync Engine panel */}
        {activeTab === 'sync' && (
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, marginBottom: '4px' }}>Supplier Sync</h1>
            <p style={{ color: 'var(--sdark)', fontSize: '0.85rem' }}>Import supplier CSVs. Adjust prices via dynamic markups.</p>

            <div className="checkout-grid" style={{ marginTop: '24px' }}>
              
              {/* CSV Upload panel */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSpreadsheet size={18} style={{ color: 'var(--orange)' }} /> Upload Supplier File
                </h2>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--sdark)' }}>
                  Upload CSV with columns: <strong>sku</strong>, <strong>cost_price</strong>, <strong>stock</strong>.
                </p>

                <div style={{ 
                  border: '2px dashed var(--slate)', 
                  padding: '24px', 
                  borderRadius: '12px', 
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <Upload size={28} style={{ color: 'var(--sdark)', marginBottom: '10px' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tap to browse or drop file</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--sdark)', marginTop: '4px' }}>Format: CSV (.csv)</p>
                  
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleCSVUpload}
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      opacity: 0, 
                      cursor: 'pointer' 
                    }} 
                  />
                </div>

                {csvFileContent && (
                  <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={16} /> File ready. Tap sync to execute.
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--slate)', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Markup Config</h3>
                  
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label">Profit Markup (%)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <input 
                        type="range" 
                        min="10" max="100" 
                        value={syncMarkup} 
                        onChange={(e) => setSyncMarkup(parseInt(e.target.value))}
                        style={{ flexGrow: 1, accentColor: 'var(--orange)' }}
                      />
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: '48px' }}>{syncMarkup}%</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--sdark)', marginTop: '6px' }}>
                      Example: R100.00 cost → R{(100 * (1 + syncMarkup/100)).toFixed(2)} sell.
                    </p>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={runSyncEngine} style={{ width: '100%', padding: '14px', gap: '8px' }}>
                  <RefreshCcw size={18} /> Execute Sync
                </button>
              </div>

              {/* Sync Output Logs panel */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--slate)', paddingBottom: '12px', marginBottom: '16px' }}>
                  Execution Logs
                </h2>

                <div style={{ 
                  background: '#030f20', 
                  color: '#38bdf8', 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.78rem', 
                  padding: '16px', 
                  borderRadius: '8px', 
                  flexGrow: 1, 
                  overflowY: 'auto',
                  overflowX: 'auto',
                  lineHeight: 1.6,
                  wordBreak: 'break-word'
                }}>
                  {syncLogOutput.length === 0 ? (
                    <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Engine idle. Run sync to inspect logs...</span>
                  ) : (
                    syncLogOutput.map((log, idx) => (
                      <div key={idx}>{log}</div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Modal: Add Manual Product Form */}
      {isAddProductOpen && (
        <div className="modal-overlay" onClick={() => setIsAddProductOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Add Product</h2>
              <button className="modal-close" onClick={() => setIsAddProductOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Product Title</label>
                <input 
                  type="text" required placeholder="e.g. Vylex SuperCord Type-C Cable" className="form-input"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <textarea 
                  placeholder="Details of the accessory..." className="form-input" 
                  style={{ minHeight: '70px', resize: 'vertical' }}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select className="form-input" value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>
                    <option value="Earbuds">Earbuds</option>
                    <option value="Power Banks">Power Banks</option>
                    <option value="Smartwatches">Smartwatches</option>
                    <option value="Chargers">Chargers</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">SKU Code</label>
                  <input type="text" required placeholder="VY-SCORD-WHT" className="form-input"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Supplier Cost (R)</label>
                  <input type="number" step="0.01" required placeholder="250.00" className="form-input"
                    value={newProduct.cost_price}
                    onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Selling Price (R)</label>
                  <input type="number" step="0.01" required placeholder="399.00" className="form-input"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Initial Stock</label>
                <input type="number" required className="form-input"
                  value={newProduct.stock_quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" style={{ flexGrow: 1 }} onClick={() => setIsAddProductOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Courier Tracking info */}
      {isTrackingModalOpen && selectedOrderForTracking && (
        <div className="modal-overlay" onClick={() => setIsTrackingModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Tracking: #{selectedOrderForTracking.id.substring(0,8)}</h2>
              <button className="modal-close" onClick={() => setIsTrackingModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleTrackingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Courier</label>
                <select className="form-input" value={trackingForm.courier_name}
                  onChange={(e) => setTrackingForm({ ...trackingForm, courier_name: e.target.value })}>
                  <option value="The Courier Guy">The Courier Guy</option>
                  <option value="Aramex">Aramex</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="Bob Go (uAfrica)">Bob Go</option>
                  <option value="PostNet">PostNet</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tracking Number</label>
                <input type="text" required placeholder="e.g. TCG123456789" className="form-input"
                  value={trackingForm.tracking_number}
                  onChange={(e) => setTrackingForm({ ...trackingForm, tracking_number: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tracking URL (Optional)</label>
                <input type="url" placeholder="https://..." className="form-input"
                  value={trackingForm.tracking_url}
                  onChange={(e) => setTrackingForm({ ...trackingForm, tracking_url: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status</label>
                <select className="form-input" value={trackingForm.status}
                  onChange={(e) => setTrackingForm({ ...trackingForm, status: e.target.value })}>
                  <option value="pending">Pending collection</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" style={{ flexGrow: 1 }} onClick={() => setIsTrackingModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, gap: '6px' }}>
                  <Truck size={16} /> Save Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
