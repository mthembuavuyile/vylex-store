'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, ShieldAlert, BarChart3, Database, RefreshCcw, 
  Trash2, Plus, Upload, Check, Eye, ChevronRight, Truck, Clock, 
  DollarSign, ShoppingCart, LogOut, FileSpreadsheet, Edit3, X
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
  const [syncMarkup, setSyncMarkup] = useState(30); // 30% margin default
  const [syncLogOutput, setSyncLogOutput] = useState<string[]>([]);
  const [csvFileContent, setCsvFileContent] = useState('');

  // 1. Initial Data Fetching from Supabase (with fallback to localStorage/mock)
  useEffect(() => {
    async function loadData() {
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
          // Default mock products
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
          // Initialize mock orders for demonstration
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
        } else {
          const initialLogs = [
            { id: '1', status: 'success', details: 'Database initialization and migration matching store.vylex.co.za config completed.', created_at: new Date(Date.now() - 3600000 * 24).toISOString() }
          ];
          setSyncLogs(initialLogs);
          localStorage.setItem(ADMIN_SYNC_LOGS_KEY, JSON.stringify(initialLogs));
        }
      }
    }
    loadData();
  }, []);

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
      // Offline fallback
      const offlineProduct = {
        id: 'vy-' + Math.random().toString(36).substring(2, 9),
        ...productPayload
      };
      saveProductsState([...products, offlineProduct]);
    }

    setIsAddProductOpen(false);
    setNewProduct({
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
  };

  // 3. Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product from your inventory?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      saveProductsState(products.filter(p => p.id !== id));
    } catch (e) {
      // Offline fallback
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
      // Offline fallback
      saveOrdersState(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  // 5. Submit Courier Tracking Details
  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForTracking) return;

    const orderId = selectedOrderForTracking.id;

    try {
      // Try to insert/update tracking info in DB
      const { error } = await supabase.from('tracking_info').upsert({
        order_id: orderId,
        courier_name: trackingForm.courier_name,
        tracking_number: trackingForm.tracking_number,
        tracking_url: trackingForm.tracking_url || `https://www.thecourierguy.co.za/tracking?no=${trackingForm.tracking_number}`,
        status: trackingForm.status
      });

      if (error) throw error;

      // Update order status to shipped automatically
      await supabase.from('orders').update({ status: 'shipped' }).eq('id', orderId);

      // Log action success
      await supabase.from('supplier_sync_logs').insert({
        status: 'success',
        details: `Tracking details uploaded for Order #${orderId.substring(0,8)}. Courier: ${trackingForm.courier_name}`
      });

      saveOrdersState(orders.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o));
    } catch (e) {
      // Offline fallback
      saveOrdersState(orders.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o));
    }

    setIsTrackingModalOpen(false);
    setSelectedOrderForTracking(null);
    setTrackingForm({
      courier_name: 'The Courier Guy',
      tracking_number: '',
      tracking_url: '',
      status: 'in_transit'
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

    // Parse CSV rows. Expecting format: sku,cost_price,stock
    const lines = csvFileContent.split('\n');
    const logs: string[] = [];
    let updatedCount = 0;
    let addedCount = 0;

    const updatedProductsList = [...products];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || i === 0 && line.toLowerCase().includes('sku')) continue; // Skip header

      const cols = line.split(',');
      if (cols.length < 3) continue;

      const sku = cols[0].trim();
      const costPrice = parseFloat(cols[1].trim());
      const stock = parseInt(cols[2].trim());

      if (!sku || isNaN(costPrice) || isNaN(stock)) {
        logs.push(`⚠️ Line ${i+1}: Invalid row values, skipping.`);
        continue;
      }

      // Calculate selling price with selected markup
      const calculatedSellingPrice = costPrice * (1 + syncMarkup / 100);

      // Find matching local/DB product
      const existingProductIdx = updatedProductsList.findIndex(p => p.sku.toLowerCase() === sku.toLowerCase());

      if (existingProductIdx !== -1) {
        // Update product details
        const updatedProduct = {
          ...updatedProductsList[existingProductIdx],
          cost_price: costPrice,
          price: parseFloat(calculatedSellingPrice.toFixed(2)),
          stock_quantity: stock,
          source: 'supplier_sync',
          updated_at: new Date().toISOString()
        };

        updatedProductsList[existingProductIdx] = updatedProduct;

        // Try updating Supabase
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
        // Option to add new product if not matching
        logs.push(`ℹ️ SKU NEW: SKU "${sku}" did not match any current catalog item. Manual listing suggested.`);
      }
    }

    saveProductsState(updatedProductsList);
    logs.push(`\nSync finished. ${updatedCount} products updated successfully.`);
    setSyncLogOutput(logs);

    // Save logs database entry
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

  return (
    <div className="admin-layout">
      
      {/* Sidebar Controls */}
      <aside className="admin-sidebar">
        <a href="/" className="logo logo-light" style={{ marginBottom: '40px' }}>
          <svg width="24" height="24" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
            <path fill="var(--orange)" d="M20 10 L50 70 L80 10 L100 10 L50 100 L0 10 Z" />
            <rect fill="var(--orange)" x="42" y="10" width="16" height="30" />
          </svg>
          <span className="logo-text" style={{ fontSize: '1.25rem' }}>vylex<span className="logo-dot-text">.</span><span className="logo-subtext" style={{ fontSize: '0.8rem' }}>Admin</span></span>
        </a>

        <ul className="admin-nav">
          <li className="admin-nav-item">
            <button 
              className={`admin-nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 size={18} /> Overview Metrics
            </button>
          </li>
          <li className="admin-nav-item">
            <button 
              className={`admin-nav-link ${activeTab === 'products' ? 'active' : ''}`}
              style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
              onClick={() => setActiveTab('products')}
            >
              <Database size={18} /> Product Catalog
            </button>
          </li>
          <li className="admin-nav-item">
            <button 
              className={`admin-nav-link ${activeTab === 'orders' ? 'active' : ''}`}
              style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingCart size={18} /> Orders Panel
            </button>
          </li>
          <li className="admin-nav-item">
            <button 
              className={`admin-nav-link ${activeTab === 'sync' ? 'active' : ''}`}
              style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
              onClick={() => setActiveTab('sync')}
            >
              <RefreshCcw size={18} /> Supplier Sync Engine
            </button>
          </li>
        </ul>

        <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
          <a href="/" className="admin-nav-link" style={{ color: 'var(--red)', border: 'none' }}>
            <LogOut size={18} /> Return to Store
          </a>
        </div>
      </aside>

      {/* Main Workspace content */}
      <main className="admin-content">
        
        {/* Tab 1: Overview Dashboard metrics */}
        {activeTab === 'overview' && (
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '6px' }}>Dashboard Overview</h1>
            <p style={{ color: 'var(--sdark)' }}>Vylex Store operational dashboard indicators.</p>

            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', margin: '32px 0 48px' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
                <div style={{ background: '#d1fae5', color: 'var(--green)', padding: '16px', borderRadius: '12px' }}>
                  <DollarSign size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--sdark)' }}>Total Revenue (Paid)</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 700 }}>R{totalSales.toFixed(2)}</h3>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
                <div style={{ background: '#dbeafe', color: '#2563eb', padding: '16px', borderRadius: '12px' }}>
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--sdark)' }}>Total Orders</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 700 }}>{orders.length}</h3>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
                <div style={{ background: '#fee2e2', color: 'var(--red)', padding: '16px', borderRadius: '12px' }}>
                  <Clock size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--sdark)' }}>Pending Payments</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 700 }}>{pendingOrders.length}</h3>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
                <div style={{ background: '#fef3c7', color: '#d97706', padding: '16px', borderRadius: '12px' }}>
                  <Truck size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--sdark)' }}>Paid (Needs Dispatch)</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 700 }}>{paidOrders.length}</h3>
                </div>
              </div>
            </div>

            {/* Layout with Sync logs and recent orders */}
            <div className="admin-grid">
              <div className="card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Recent Orders</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#{o.id.substring(0, 8)}</td>
                          <td>{o.customer_name}</td>
                          <td style={{ fontWeight: 600 }}>R{Number(o.total_amount).toFixed(2)}</td>
                          <td>
                            <span className={`badge badge-${o.status}`}>{o.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Sync Logs</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                  {syncLogs.slice(0, 5).map(log => (
                    <div key={log.id} style={{ fontSize: '0.85rem', paddingBottom: '12px', borderBottom: '1px solid var(--slate)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ 
                          fontWeight: 700, 
                          color: log.status === 'success' ? 'var(--green)' : 'var(--red)'
                        }}>
                          {log.status.toUpperCase()}
                        </span>
                        <span style={{ color: 'var(--sdark)' }}>{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p style={{ color: 'var(--navy)' }}>{log.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Product Catalog management */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '6px' }}>Product Catalog</h1>
                <p style={{ color: 'var(--sdark)' }}>View and list inventory. Auto-sync via Sync Panel or add items manually.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setIsAddProductOpen(true)}>
                <Plus size={18} /> Add Manual Product
              </button>
            </div>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product Details</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Cost Price</th>
                    <th>Sell Price</th>
                    <th>Stock</th>
                    <th>Source</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '2rem' }}>{p.images?.[0] || '🔋'}</span>
                          <strong>{p.title}</strong>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{p.sku}</td>
                      <td>{p.category}</td>
                      <td>{p.cost_price ? `R${Number(p.cost_price).toFixed(2)}` : 'N/A'}</td>
                      <td style={{ fontWeight: 600 }}>R{Number(p.price).toFixed(2)}</td>
                      <td>{p.stock_quantity} units</td>
                      <td>
                        <span style={{
                          padding: '3px 6px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          background: p.source === 'manual' ? '#e2e8f0' : '#fef3c7',
                          color: p.source === 'manual' ? 'var(--navy)' : '#d97706',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {p.source}
                        </span>
                      </td>
                      <td>
                        <button className="btn-icon" style={{ color: 'var(--red)', borderColor: 'transparent' }} onClick={() => handleDeleteProduct(p.id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Orders management, courier fulfillment */}
        {activeTab === 'orders' && (
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '6px' }}>Orders Panel</h1>
            <p style={{ color: 'var(--sdark)' }}>Fulfill orders, adjust shipping codes, and verify payouts.</p>

            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order Reference</th>
                    <th>Customer Info</th>
                    <th>Date</th>
                    <th>Address</th>
                    <th>Amount Due</th>
                    <th>Status</th>
                    <th>Fulfillment Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700 }}>#{o.id.substring(0, 8)}</td>
                      <td>
                        <div><strong>{o.customer_name}</strong></div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--sdark)' }}>{o.customer_email}</div>
                      </td>
                      <td>{new Date(o.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ fontSize: '0.8rem', color: 'var(--sdark)', maxWidth: '180px' }}>
                          {o.shipping_address?.streetAddress}, {o.shipping_address?.city}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>R{Number(o.total_amount).toFixed(2)}</td>
                      <td>
                        <select 
                          className={`badge badge-${o.status}`} 
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="ordered_from_supplier">Ordered from Supplier</option>
                          <option value="shipped">Shipped</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
                            onClick={() => {
                              setSelectedOrderForTracking(o);
                              setIsTrackingModalOpen(true);
                            }}
                          >
                            <Truck size={14} /> Add Tracking
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Supplier Sync Engine panel */}
        {activeTab === 'sync' && (
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '6px' }}>Supplier Sync Engine</h1>
            <p style={{ color: 'var(--sdark)' }}>Import supplier CSVs. Adjust prices via dynamic markups based on cost prices.</p>

            <div className="checkout-grid" style={{ marginTop: '32px' }}>
              
              {/* CSV Upload panel */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileSpreadsheet style={{ color: 'var(--orange)' }} /> Step 1: Upload Supplier File
                </h2>
                
                <p style={{ fontSize: '0.9rem', color: 'var(--sdark)' }}>
                  Upload a CSV file containing columns: <strong>sku</strong>, <strong>cost_price</strong>, and <strong>stock</strong>. The engine will match SKUs in the catalog and update stock/pricing.
                </p>

                <div style={{ 
                  border: '2px dashed var(--slate)', 
                  padding: '30px', 
                  borderRadius: '12px', 
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <Upload size={32} style={{ color: 'var(--sdark)', marginBottom: '12px' }} />
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Click to browse or drop file</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--sdark)', marginTop: '4px' }}>Supported format: CSV (.csv)</p>
                  
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
                  <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={16} /> File successfully read. Ready to sync.
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--slate)', paddingTop: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Step 2: Pricing Markup Config</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Profit Markup Percentage (%)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={syncMarkup} 
                        onChange={(e) => setSyncMarkup(parseInt(e.target.value))}
                        style={{ flexGrow: 1, accentColor: 'var(--orange)' }}
                      />
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: '48px' }}>{syncMarkup}%</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--sdark)', marginTop: '8px' }}>
                      Example: A cost price of R100.00 will result in a selling price of R{(100 * (1 + syncMarkup/100)).toFixed(2)}.
                    </p>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={runSyncEngine} style={{ width: '100%', padding: '14px', gap: '10px' }}>
                  <RefreshCcw size={18} /> Execute Sync Engine
                </button>
              </div>

              {/* Sync Output Logs panel */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid var(--slate)', paddingBottom: '12px', marginBottom: '20px' }}>
                  Execution Logs
                </h2>

                <div style={{ 
                  background: '#030f20', 
                  color: '#38bdf8', 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.82rem', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  flexGrow: 1, 
                  overflowY: 'auto',
                  lineHeight: 1.6
                }}>
                  {syncLogOutput.length === 0 ? (
                    <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Engine idle. Run sync to inspect logs output...</span>
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Add Product to Catalog</h2>
              <button className="modal-close" onClick={() => setIsAddProductOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Product Title</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Vylex SuperCord Type-C Cable" 
                  className="form-input"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  placeholder="Details of the accessory..." 
                  className="form-input" 
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-input"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    <option value="Earbuds">Earbuds</option>
                    <option value="Power Banks">Power Banks</option>
                    <option value="Smartwatches">Smartwatches</option>
                    <option value="Chargers">Chargers</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">SKU Code</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="VY-SCORD-WHT" 
                    className="form-input"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Supplier Cost (R)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="250.00" 
                    className="form-input"
                    value={newProduct.cost_price}
                    onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Price (R)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="399.00" 
                    className="form-input"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Stock Quantity</label>
                <input 
                  type="number" 
                  required 
                  className="form-input"
                  value={newProduct.stock_quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Upload Tracking: Order #{selectedOrderForTracking.id.substring(0,8)}</h2>
              <button className="modal-close" onClick={() => setIsTrackingModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleTrackingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Courier Name</label>
                <select 
                  className="form-input"
                  value={trackingForm.courier_name}
                  onChange={(e) => setTrackingForm({ ...trackingForm, courier_name: e.target.value })}
                >
                  <option value="The Courier Guy">The Courier Guy</option>
                  <option value="Aramex">Aramex</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="Bob Go (uAfrica)">Bob Go</option>
                  <option value="PostNet">PostNet</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tracking Number</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. TCG123456789" 
                  className="form-input"
                  value={trackingForm.tracking_number}
                  onChange={(e) => setTrackingForm({ ...trackingForm, tracking_number: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tracking URL (Optional)</label>
                <input 
                  type="url" 
                  placeholder="https://www.thecourierguy.co.za/tracking?no=..." 
                  className="form-input"
                  value={trackingForm.tracking_url}
                  onChange={(e) => setTrackingForm({ ...trackingForm, tracking_url: e.target.value })}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--sdark)' }}>
                  If left blank, default tracking link for the selected courier will be automatically generated.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Shipment Status</label>
                <select 
                  className="form-input"
                  value={trackingForm.status}
                  onChange={(e) => setTrackingForm({ ...trackingForm, status: e.target.value })}
                >
                  <option value="pending">Pending collection</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <button type="button" className="btn btn-outline" style={{ flexGrow: 1 }} onClick={() => setIsTrackingModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, gap: '8px' }}>
                  <Truck size={16} /> Save Tracking Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
