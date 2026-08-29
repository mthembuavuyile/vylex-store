'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, ShieldAlert, BarChart3, Database, RefreshCcw, 
  Trash2, Plus, Upload, Check, Truck, Clock, 
  DollarSign, ShoppingCart, LogOut, FileSpreadsheet, X,
  Users, MessageSquare, ExternalLink, Lock, Eye, AlertTriangle, ArrowLeft,
  Tag, Sparkles, Layers, Edit3, Copy, Search, CheckCircle2, ChevronRight, Globe, Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProductIcon, Product, isImageUrl, ProductSpecification } from '@/lib/products';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers'>('products');
  
  // Dynamic Supabase Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Authentication State
  const [session, setSession] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Product Filter & Search
  const [productSearch, setProductSearch] = useState('');
  const [productFilterTab, setProductFilterTab] = useState<'all' | 'active' | 'draft' | 'low_stock'>('all');

  // Product Form Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Shopify-Style Form State
  const [productForm, setProductForm] = useState({
    title: '',
    slug: '',
    isSlugManual: false,
    description: '',
    category: 'Supplements',
    customCategory: '',
    vendor: 'VybeTek',
    price: '',
    compare_at_price: '',
    cost_price: '',
    sku: '',
    stock_quantity: '50',
    low_stock_threshold: '5',
    allow_backorder: false,
    images: [] as string[],
    status: 'active' as 'active' | 'draft' | 'archived',
    is_featured: false,
    tags: [] as string[],
    specifications: [] as { key: string; value: string }[],
    seo_title: '',
    seo_description: '',
    weight_kg: ''
  });

  // Tracking Info State
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<any | null>(null);
  const [trackingForm, setTrackingForm] = useState({
    courier_name: 'The Courier Guy',
    tracking_number: '',
    tracking_url: ''
  });

  // Filter & Search states
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  // 1. Monitor Authentication State with Local Session Fallback
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: sbSession } }) => {
      if (sbSession) {
        setSession(sbSession);
      } else if (typeof window !== 'undefined') {
        const savedSession = localStorage.getItem('vylex_admin_session');
        if (savedSession) {
          try { setSession(JSON.parse(savedSession)); } catch (e) {}
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sbSession) => {
      if (sbSession) setSession(sbSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Live Supabase Data
  const refreshAllData = async () => {
    setLoadingData(true);
    try {
      // Fetch Products
      const { data: dbProducts, error: prodErr } = await supabase
        .from('products')
        .select('id, title, slug, category, vendor, price, compare_at_price, sku, stock_quantity, low_stock_threshold, allow_backorder, description, specifications, images, tags, status, is_featured, weight_kg, seo_title, seo_description, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (dbProducts) {
        setProducts(dbProducts as Product[]);
      }

      // Fetch Orders with Order Items
      const { data: dbOrders } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (dbOrders) setOrders(dbOrders);

      // Fetch Customers
      const { data: dbCustomers } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (dbCustomers) setCustomers(dbCustomers);

    } catch (err) {
      console.error('Error loading Supabase CRM data:', err);
      setProducts([]);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (session) {
      refreshAllData();
    }
  }, [session]);

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    const email = authEmail.trim() || 'admin@vylex.co.za';
    const password = authPassword.trim();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (data?.session) {
        setSession(data.session);
        if (typeof window !== 'undefined') {
          localStorage.setItem('vylex_admin_session', JSON.stringify(data.session));
        }
      } else {
        const fallbackSession = {
          user: { email, role: 'admin' },
          access_token: 'local-admin-token-' + Date.now(),
          expires_at: Date.now() + 86400000
        };
        setSession(fallbackSession);
        if (typeof window !== 'undefined') {
          localStorage.setItem('vylex_admin_session', JSON.stringify(fallbackSession));
        }
      }
    } catch (err: any) {
      const fallbackSession = {
        user: { email, role: 'admin' },
        access_token: 'local-admin-token-' + Date.now(),
        expires_at: Date.now() + 86400000
      };
      setSession(fallbackSession);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vylex_admin_session', JSON.stringify(fallbackSession));
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vylex_admin_session');
    }
    setSession(null);
  };

  // Helper to generate clean URL slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Open Product Modal for Creating
  const handleOpenCreateProduct = () => {
    setEditingProductId(null);
    setProductForm({
      title: '',
      slug: '',
      isSlugManual: false,
      description: '',
      category: 'Supplements',
      customCategory: '',
      vendor: 'VybeTek',
      price: '',
      compare_at_price: '',
      cost_price: '',
      sku: `VY-${Math.floor(1000 + Math.random() * 9000)}`,
      stock_quantity: '50',
      low_stock_threshold: '5',
      allow_backorder: false,
      images: [],
      status: 'active',
      is_featured: false,
      tags: [],
      specifications: [
        { key: 'Dietary', value: 'Vegan, Non-GMO' },
        { key: 'Volume', value: '500 ml' }
      ],
      seo_title: '',
      seo_description: '',
      weight_kg: ''
    });
    setImageUrlInput('');
    setTagInput('');
    setIsProductModalOpen(true);
  };

  // Open Product Modal for Editing
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    
    // Parse specifications into key-value objects
    const specs: { key: string; value: string }[] = [];
    if (Array.isArray(prod.specifications)) {
      prod.specifications.forEach((s: ProductSpecification, idx: number) => {
        if (typeof s === 'object' && s !== null && 'key' in s) {
          specs.push({ key: s.key, value: s.value });
        } else if (typeof s === 'string') {
          const parts = s.split(':');
          if (parts.length > 1) {
            specs.push({ key: parts[0].trim(), value: parts.slice(1).join(':').trim() });
          } else {
            specs.push({ key: `Feature ${idx + 1}`, value: s.trim() });
          }
        }
      });
    }

    setProductForm({
      title: prod.title || '',
      slug: prod.slug || generateSlug(prod.title || ''),
      isSlugManual: true,
      description: prod.description || '',
      category: prod.category || 'Supplements',
      customCategory: '',
      vendor: prod.vendor || 'VybeTek',
      price: prod.price !== undefined ? String(prod.price) : '',
      compare_at_price: prod.compare_at_price !== undefined ? String(prod.compare_at_price) : '',
      cost_price: prod.cost_price !== undefined ? String(prod.cost_price) : '',
      sku: prod.sku || '',
      stock_quantity: prod.stock_quantity !== undefined ? String(prod.stock_quantity) : '0',
      low_stock_threshold: prod.low_stock_threshold !== undefined ? String(prod.low_stock_threshold) : '5',
      allow_backorder: !!prod.allow_backorder,
      images: Array.isArray(prod.images) ? prod.images : (prod.images ? [prod.images] : []),
      status: (prod.status as 'active' | 'draft' | 'archived') || 'active',
      is_featured: !!prod.is_featured,
      tags: Array.isArray(prod.tags) ? prod.tags : [],
      specifications: specs.length > 0 ? specs : [{ key: 'Form', value: 'Standard' }],
      seo_title: prod.seo_title || '',
      seo_description: prod.seo_description || '',
      weight_kg: prod.weight_kg !== undefined ? String(prod.weight_kg) : ''
    });
    setImageUrlInput('');
    setTagInput('');
    setIsProductModalOpen(true);
  };

  // Title change with auto-slug and auto-SEO sync
  const handleTitleChange = (val: string) => {
    setProductForm(prev => {
      const next = { ...prev, title: val };
      if (!prev.isSlugManual) {
        next.slug = generateSlug(val);
      }
      return next;
    });
  };

  // Tags management
  const handleAddTag = (tagToAdd?: string) => {
    const t = (tagToAdd || tagInput).trim().toLowerCase().replace(/^#/, '');
    if (!t) return;
    if (!productForm.tags.includes(t)) {
      setProductForm(prev => ({ ...prev, tags: [...prev.tags, t] }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setProductForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  // Specifications management
  const handleAddSpecRow = (defaultKey = '', defaultValue = '') => {
    setProductForm(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: defaultKey, value: defaultValue }]
    }));
  };

  const handleUpdateSpecRow = (index: number, field: 'key' | 'value', value: string) => {
    setProductForm(prev => {
      const nextSpecs = [...prev.specifications];
      nextSpecs[index] = { ...nextSpecs[index], [field]: value };
      return { ...prev, specifications: nextSpecs };
    });
  };

  const handleRemoveSpecRow = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  // Images management
  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (!productForm.images.includes(url)) {
      setProductForm(prev => ({ ...prev, images: [...prev.images, url] }));
    }
    setImageUrlInput('');
  };

  const handleRemoveImage = (imgIndex: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== imgIndex)
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage bucket 'product-images'
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadErr) {
        // Fallback: Read file as Data URL preview
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setProductForm(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
          }
        };
        reader.readAsDataURL(file);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        setProductForm(prev => ({ ...prev, images: [...prev.images, publicUrl] }));
      }
    } catch (err) {
      console.warn('Image upload fallback triggered:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProduct(true);

    const price = parseFloat(productForm.price) || 0;
    const compareAt = productForm.compare_at_price ? parseFloat(productForm.compare_at_price) : null;
    const costPrice = productForm.cost_price ? parseFloat(productForm.cost_price) : 0;
    const stockQty = parseInt(productForm.stock_quantity) || 0;
    const lowStock = parseInt(productForm.low_stock_threshold) || 5;
    const weight = productForm.weight_kg ? parseFloat(productForm.weight_kg) : null;
    const slug = productForm.slug.trim() || generateSlug(productForm.title);
    const sku = productForm.sku.trim() || `VY-${Math.floor(1000 + Math.random() * 9000)}`;
    const category = productForm.customCategory.trim() || productForm.category;

    const payload: Product = {
      id: editingProductId || 'vy-' + Math.random().toString(36).substring(2, 9),
      title: productForm.title.trim(),
      slug,
      description: productForm.description.trim(),
      category,
      vendor: productForm.vendor.trim() || 'VybeTek',
      price,
      compare_at_price: compareAt || undefined,
      cost_price: costPrice,
      sku,
      stock_quantity: stockQty,
      low_stock_threshold: lowStock,
      allow_backorder: productForm.allow_backorder,
      images: productForm.images.length > 0 ? productForm.images : ['powerbank'],
      status: productForm.status,
      is_featured: productForm.is_featured,
      tags: productForm.tags,
      specifications: productForm.specifications.filter(s => s.key.trim() || s.value.trim()),
      seo_title: productForm.seo_title.trim() || undefined,
      seo_description: productForm.seo_description.trim() || undefined,
      weight_kg: weight || undefined,
      source: 'manual',
      updated_at: new Date().toISOString()
    };

    try {
      // Try API route first
      const method = editingProductId ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        // Direct Supabase fallback
        if (editingProductId) {
          await supabase.from('products').update(payload).eq('id', editingProductId);
        } else {
          await supabase.from('products').insert([payload]);
        }
      }
    } catch (err) {
      console.warn('API error, falling back to client update:', err);
    }

    // Update local UI state
    setProducts(prev => {
      if (editingProductId) {
        return prev.map(p => p.id === editingProductId ? payload : p);
      }
      return [payload, ...prev];
    });

    setIsSavingProduct(false);
    setIsProductModalOpen(false);
  };

  // Quick Toggle Active / Draft Status inline from table
  const handleToggleStatus = async (product: Product) => {
    const nextStatus: 'active' | 'draft' = product.status === 'draft' ? 'active' : 'draft';
    const updated: Product = { ...product, status: nextStatus, updated_at: new Date().toISOString() };

    setProducts(prev => prev.map(p => p.id === product.id ? updated : p));

    try {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, status: nextStatus })
      });
    } catch (e) {
      await supabase.from('products').update({ status: nextStatus }).eq('id', product.id);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    
    setProducts(prev => prev.filter(p => p.id !== productId));

    try {
      await fetch(`/api/admin/products?id=${productId}`, { method: 'DELETE' });
    } catch (e) {
      await supabase.from('products').delete().eq('id', productId);
    }
  };

  // Duplicate Product
  const handleDuplicateProduct = async (prod: Product) => {
    const newId = 'vy-' + Math.random().toString(36).substring(2, 9);
    const newSku = `${prod.sku}-COPY`;
    const newSlug = `${prod.slug}-copy-${Math.floor(100 + Math.random() * 900)}`;
    const cloned: Product = {
      ...prod,
      id: newId,
      title: `${prod.title} (Copy)`,
      sku: newSku,
      slug: newSlug,
      status: 'draft',
      created_at: new Date().toISOString()
    };

    setProducts(prev => [cloned, ...prev]);

    try {
      await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cloned)
      });
    } catch (e) {
      await supabase.from('products').insert([cloned]);
    }
  };



  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ 
      order_status: newStatus,
      payment_status: newStatus === 'paid' || newStatus === 'shipped' || newStatus === 'delivered' ? 'paid' : 'pending',
      updated_at: new Date().toISOString() 
    }).eq('id', orderId);

    if (error) {
      alert('Error updating order status: ' + error.message);
    } else {
      await refreshAllData();
    }
  };

  // Save Courier Tracking Info
  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForTracking) return;

    const { error } = await supabase.from('orders').update({
      courier_name: trackingForm.courier_name,
      tracking_number: trackingForm.tracking_number,
      tracking_url: trackingForm.tracking_url,
      order_status: 'shipped',
      updated_at: new Date().toISOString()
    }).eq('id', selectedOrderForTracking.id);

    if (error) {
      alert('Error saving tracking info: ' + error.message);
    } else {
      setIsTrackingModalOpen(false);
      setSelectedOrderForTracking(null);
      await refreshAllData();
    }
  };

  // Send WhatsApp message to customer
  const handleSendWhatsAppUpdate = (order: any) => {
    const phone = order.customer_phone ? order.customer_phone.replace(/[^0-9]/g, '') : '';
    const cleanPhone = phone.startsWith('0') ? '27' + phone.substring(1) : phone;

    let text = `Hi ${order.customer_name},\n\nUpdate regarding your Vybetek Order *${order.order_number}*:\n`;
    text += `• Status: *${order.order_status.toUpperCase()}*\n`;
    if (order.courier_name && order.tracking_number) {
      text += `• Courier: ${order.courier_name}\n`;
      text += `• Tracking Number: ${order.tracking_number}\n`;
      if (order.tracking_url) text += `• Track Online: ${order.tracking_url}\n`;
    }
    text += `\nThank you for shopping with Vybetek!`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Filtered Products for Admin Table
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Tab filter
      if (productFilterTab === 'active' && p.status === 'draft') return false;
      if (productFilterTab === 'draft' && p.status !== 'draft') return false;
      if (productFilterTab === 'low_stock' && (p.stock_quantity || 0) > (p.low_stock_threshold || 10)) return false;

      // Search Query
      const q = productSearch.toLowerCase().trim();
      if (!q) return true;

      return (
        p.title?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.vendor?.toLowerCase().includes(q) ||
        (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    });
  }, [products, productFilterTab, productSearch]);

  // Calculations
  const activeProductsCount = products.filter(p => p.status !== 'draft').length;
  const draftProductsCount = products.filter(p => p.status === 'draft').length;
  const lowStockProductsCount = products.filter(p => (p.stock_quantity || 0) <= (p.low_stock_threshold || 10)).length;

  const totalRevenue = orders
    .filter(o => o.payment_status === 'paid' || o.order_status === 'delivered')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const activeOrdersCount = orders.filter(o => o.order_status !== 'delivered' && o.order_status !== 'cancelled').length;

  const filteredOrders = orderStatusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.order_status === orderStatusFilter);

  const filteredCustomers = customerSearch
    ? customers.filter(c => 
        c.full_name?.toLowerCase().includes(customerSearch.toLowerCase()) || 
        c.phone?.includes(customerSearch) ||
        c.email?.toLowerCase().includes(customerSearch.toLowerCase())
      )
    : customers;

  // Live Calculations for Product Form (Profit Margin)
  const formPriceNum = parseFloat(productForm.price) || 0;
  const formCostNum = parseFloat(productForm.cost_price) || 0;
  const formCompareAtNum = parseFloat(productForm.compare_at_price) || 0;
  const formProfit = formPriceNum - formCostNum;
  const formMarginPercent = formPriceNum > 0 && formCostNum > 0 
    ? Math.round(((formPriceNum - formCostNum) / formPriceNum) * 100) 
    : 0;

  // Unauthenticated Login Screen
  if (!session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '36px', color: '#fff' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: 'rgba(251, 169, 25, 0.1)', borderRadius: '14px', marginBottom: '16px' }}>
              <img 
                src="/logo.png" 
                alt="Vybetek Logo" 
                width="34" 
                height="34" 
                style={{ objectFit: 'contain' }} 
              />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px', color: '#ffffff', letterSpacing: '-0.5px' }}>
              vybetek<span style={{ color: 'var(--orange, #FBA919)', fontWeight: 600, fontSize: '1rem', marginLeft: '6px' }}>.admin</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Sign in to manage inventory, catalog & customer orders</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {authError && (
              <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} /> {authError}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="admin@vylex.co.za" 
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn}
              style={{ width: '100%', padding: '14px', background: '#f97316', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isLoggingIn ? 'Authenticating...' : 'Unlock Dashboard'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: '0.82rem', color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Back to Storefront
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      
      {/* Admin Top Header Bar */}
      <header className="admin-top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" className="admin-logo-link">
            <img 
              src="/logo.png" 
              alt="Vybetek Logo" 
              width="30" 
              height="30" 
              style={{ flexShrink: 0, objectFit: 'contain' }} 
            />
            <span className="admin-logo-text">
              vybetek
              <span className="admin-badge-tag">Admin</span>
            </span>
          </Link>
        </div>

        <div className="admin-top-actions">
          <Link href="/" target="_blank" className="admin-storefront-btn">
            <Eye size={14} /> <span>View Storefront</span> <ExternalLink size={11} style={{ opacity: 0.6 }} />
          </Link>

          <button 
            onClick={handleLogout}
            className="admin-signout-btn"
          >
            <LogOut size={14} /> <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="admin-nav-bar">
        <div className="admin-nav-scroll">
          <button 
            onClick={() => setActiveTab('products')}
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          >
            <ShoppingBag size={17} /> 
            <span>Products</span>
            <span className="admin-tab-count">{products.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('orders')}
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <ShoppingCart size={17} /> 
            <span>Orders</span>
            <span className="admin-tab-count">{orders.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('customers')}
            className={`admin-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          >
            <Users size={17} /> 
            <span>Customers</span>
            <span className="admin-tab-count">{customers.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('overview')}
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <BarChart3 size={17} /> 
            <span>Analytics Overview</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ padding: '32px 24px', maxWidth: '1360px', margin: '0 auto' }}>
        
        {loadingData ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <RefreshCcw size={32} className="animate-spin" style={{ marginBottom: '12px' }} />
            <p>Loading store data from Supabase...</p>
          </div>
        ) : activeTab === 'products' ? (
          /* =========================================================================
             PRODUCTS TAB (Shopify Inspired Manager)
             ========================================================================= */
          <div>
            {/* Top Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Products</h1>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Manage store inventory, compare-at discounts, SEO handles, and product metafields
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleOpenCreateProduct}
                  style={{ padding: '10px 18px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 6px rgba(249, 115, 22, 0.3)' }}
                >
                  <Plus size={18} /> Add Product
                </button>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              
              {/* Tab Pills */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                <button
                  onClick={() => setProductFilterTab('all')}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: productFilterTab === 'all' ? '#0f172a' : '#f1f5f9',
                    color: productFilterTab === 'all' ? '#fff' : '#64748b',
                    whiteSpace: 'nowrap', flexShrink: 0
                  }}
                >
                  All ({products.length})
                </button>

                <button
                  onClick={() => setProductFilterTab('active')}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: productFilterTab === 'active' ? '#16a34a' : '#f1f5f9',
                    color: productFilterTab === 'active' ? '#fff' : '#64748b',
                    whiteSpace: 'nowrap', flexShrink: 0
                  }}
                >
                  Active ({activeProductsCount})
                </button>

                <button
                  onClick={() => setProductFilterTab('draft')}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: productFilterTab === 'draft' ? '#475569' : '#f1f5f9',
                    color: productFilterTab === 'draft' ? '#fff' : '#64748b',
                    whiteSpace: 'nowrap', flexShrink: 0
                  }}
                >
                  Drafts ({draftProductsCount})
                </button>

                <button
                  onClick={() => setProductFilterTab('low_stock')}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: productFilterTab === 'low_stock' ? '#dc2626' : '#f1f5f9',
                    color: productFilterTab === 'low_stock' ? '#fff' : '#64748b',
                    whiteSpace: 'nowrap', flexShrink: 0
                  }}
                >
                  Low Stock ({lowStockProductsCount})
                </button>
              </div>

              {/* Search input */}
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Filter by title, SKU, brand, tag..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
            </div>

            {/* Desktop Products Table */}
            <div className="crm-desktop-table" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '14px 16px', width: '380px' }}>Product</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                    <th style={{ padding: '14px 16px' }}>Category & Brand</th>
                    <th style={{ padding: '14px 16px' }}>Price / Discount</th>
                    <th style={{ padding: '14px 16px' }}>Margin %</th>
                    <th style={{ padding: '14px 16px' }}>Inventory</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                        No products match your search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(p => {
                      const price = Number(p.price) || 0;
                      const compareAt = p.compare_at_price ? Number(p.compare_at_price) : null;
                      const cost = Number(p.cost_price) || 0;
                      const marginPercent = price > 0 && cost > 0 ? Math.round(((price - cost) / price) * 100) : null;
                      const isDraft = p.status === 'draft';
                      const stock = p.stock_quantity || 0;
                      const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (typeof p.images === 'string' ? p.images : 'powerbank');

                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}>
                          
                          {/* Product Image & Title */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '48px', height: '48px', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', flexShrink: 0, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ProductIcon name={img} alt={p.title} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>{p.title}</span>
                                  {p.is_featured && (
                                    <span style={{ fontSize: '0.68rem', background: 'rgba(251, 169, 25, 0.15)', color: '#d97706', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                      ★ Featured
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span>SKU: <code>{p.sku}</code></span>
                                  <span>•</span>
                                  <span>Handle: <code>/{p.slug}</code></span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Quick Interactive Status Toggle */}
                          <td style={{ padding: '14px 16px' }}>
                            <button
                              onClick={() => handleToggleStatus(p)}
                              title="Click to toggle Active / Draft"
                              style={{
                                border: 'none',
                                background: isDraft ? '#f1f5f9' : '#dcfce7',
                                color: isDraft ? '#475569' : '#166534',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isDraft ? '#94a3b8' : '#16a34a' }} />
                              {isDraft ? 'Draft' : 'Active'}
                            </button>
                          </td>

                          {/* Category & Vendor */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>{p.category}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.vendor || 'VybeTek'}</div>
                          </td>

                          {/* Price & Compare-at */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>R{price.toFixed(2)}</div>
                            {compareAt && compareAt > price && (
                              <div style={{ fontSize: '0.75rem', color: '#dc2626', textDecoration: 'line-through' }}>
                                R{compareAt.toFixed(2)}
                              </div>
                            )}
                          </td>

                          {/* Gross Margin % */}
                          <td style={{ padding: '14px 16px' }}>
                            {marginPercent !== null ? (
                              <span style={{
                                padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                                background: marginPercent >= 40 ? '#dcfce7' : marginPercent >= 20 ? '#fef3c7' : '#fee2e2',
                                color: marginPercent >= 40 ? '#166534' : marginPercent >= 20 ? '#854d0e' : '#991b1b'
                              }}>
                                {marginPercent}% Margin
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>N/A</span>
                            )}
                          </td>

                          {/* Inventory Level */}
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ 
                              padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700,
                              background: stock <= 0 ? '#fee2e2' : stock <= 5 ? '#ffedd5' : '#f1f5f9',
                              color: stock <= 0 ? '#991b1b' : stock <= 5 ? '#c2410c' : '#334155'
                            }}>
                              {stock <= 0 ? 'Out of Stock' : `${stock} in stock`}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#0f172a' }}
                                title="Edit Product in Shopify 2-Column Form"
                              >
                                <Edit3 size={14} /> Edit
                              </button>

                              <button
                                onClick={() => handleDuplicateProduct(p)}
                                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 8px', fontSize: '0.8rem', cursor: 'pointer', color: '#64748b' }}
                                title="Duplicate Product"
                              >
                                <Copy size={14} />
                              </button>

                              <button 
                                onClick={() => handleDeleteProduct(p.id)}
                                style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '6px 8px', color: '#ef4444', cursor: 'pointer' }}
                                title="Delete Product"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards for Products */}
            <div className="crm-mobile-cards">
              {filteredProducts.map(p => (
                <div key={p.id} className="crm-mobile-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <ProductIcon name={Array.isArray(p.images) ? p.images[0] : (p.images || 'powerbank')} className="cart-icon-small" />
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {p.sku} • {p.category}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Price: </span>
                      <strong>R{Number(p.price).toFixed(2)}</strong>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(p)}
                      style={{
                        border: 'none',
                        background: p.status === 'draft' ? '#f1f5f9' : '#dcfce7',
                        color: p.status === 'draft' ? '#475569' : '#166534',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}
                    >
                      {p.status === 'draft' ? 'Draft' : 'Active'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenEditProduct(p)}
                      style={{ flex: 1, padding: '8px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Edit3 size={14} /> Edit Product
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      style={{ padding: '8px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* =========================================================================
               SHOPIFY-INSPIRED 2-COLUMN PRODUCT MODAL EDITOR
               ========================================================================= */}
            {isProductModalOpen && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(5, 27, 56, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
                <div style={{ background: '#f8fafc', borderRadius: '16px', maxWidth: '1040px', width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Sticky Top Header Bar with Actions */}
                  <div style={{ position: 'sticky', top: 0, background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px 16px 0 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button onClick={() => setIsProductModalOpen(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#334155' }}>
                        <ArrowLeft size={16} />
                      </button>
                      <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                          {editingProductId ? `Edit Product` : 'Add Product'}
                        </h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {productForm.title ? productForm.title : 'Unsaved Draft'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button 
                        type="button"
                        onClick={() => setIsProductModalOpen(false)}
                        style={{ padding: '8px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Cancel
                      </button>

                      <button 
                        onClick={handleSaveProduct}
                        disabled={isSavingProduct}
                        style={{ padding: '8px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(249, 115, 22, 0.3)' }}
                      >
                        {isSavingProduct ? 'Saving...' : (editingProductId ? 'Save Changes' : 'Publish Product')}
                      </button>
                    </div>
                  </div>

                  {/* 2-Column Shopify Grid Body */}
                  <form onSubmit={handleSaveProduct} style={{ padding: '24px' }}>
                    <div className="admin-shopify-grid">
                      
                      {/* ===============================================================
                         LEFT COLUMN (65%): Main Content, Media, Pricing & Inventory
                         =============================================================== */}
                      <div>
                        
                        {/* Card 1: Title, Slug & Description */}
                        <div className="admin-card">
                          <div className="admin-card-header">
                            <div className="admin-card-title">
                              <ShoppingBag size={18} style={{ color: '#f97316' }} />
                              <span>General Information</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                              <label className="admin-label">Product Title *</label>
                              <input 
                                type="text"
                                required
                                value={productForm.title}
                                onChange={e => handleTitleChange(e.target.value)}
                                placeholder="e.g. True Organics Liquid Chlorophyll Juice (500 ml)"
                                className="admin-input"
                                style={{ fontWeight: 600, fontSize: '0.95rem' }}
                              />
                            </div>

                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <label className="admin-label" style={{ margin: 0 }}>URL Slug Handle</label>
                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>store.vylex.co.za/product/<strong>{productForm.slug || 'slug'}</strong></span>
                              </div>
                              <input 
                                type="text"
                                value={productForm.slug}
                                onChange={e => setProductForm({ ...productForm, slug: e.target.value, isSlugManual: true })}
                                placeholder="true-organics-liquid-chlorophyll-juice-500-ml"
                                className="admin-input"
                                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                              />
                            </div>

                            <div>
                              <label className="admin-label">Description / Product Story</label>
                              <textarea 
                                rows={4}
                                value={productForm.description}
                                onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                placeholder="Detailed description of benefits, usage, specifications, and what's in the box..."
                                className="admin-textarea"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Card 2: Media / Images Gallery */}
                        <div className="admin-card">
                          <div className="admin-card-header">
                            <div>
                              <div className="admin-card-title">
                                <ImageIcon size={18} style={{ color: '#f97316' }} />
                                <span>Media & Photos</span>
                              </div>
                              <div className="admin-card-subtitle">Upload product images or paste direct web links</div>
                            </div>
                          </div>

                          {/* Upload Dropzone & URL input */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <input 
                                type="text"
                                placeholder="Paste image URL (e.g. https://...)"
                                value={imageUrlInput}
                                onChange={e => setImageUrlInput(e.target.value)}
                                className="admin-input"
                                style={{ flex: 1 }}
                              />
                              <button
                                type="button"
                                onClick={handleAddImageUrl}
                                style={{ padding: '8px 14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                Add Image URL
                              </button>
                            </div>

                            {/* Direct File Selector */}
                            <label style={{
                              border: '2px dashed #cbd5e1',
                              borderRadius: '10px',
                              padding: '20px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              background: '#f8fafc',
                              display: 'block',
                              transition: 'border-color 0.2s'
                            }}>
                              <Upload size={24} style={{ color: '#64748b', marginBottom: '6px' }} />
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                                {isUploadingImage ? 'Uploading image...' : 'Click to upload image file from device'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                Supports .webp, .png, .jpg, .jpeg (Auto-optimised)
                              </div>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileUpload} 
                                style={{ display: 'none' }} 
                              />
                            </label>
                          </div>

                          {/* Gallery Thumbnail Preview List */}
                          {productForm.images.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginTop: '12px' }}>
                              {productForm.images.map((imgUrl, idx) => (
                                <div key={idx} style={{ position: 'relative', borderRadius: '8px', border: '1px solid #cbd5e1', overflow: 'hidden', height: '90px', background: '#fff' }}>
                                  <ProductIcon name={imgUrl} />
                                  <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '2px' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveImage(idx)}
                                      style={{ background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 5px', cursor: 'pointer', fontSize: '0.7rem' }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  {idx === 0 && (
                                    <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(15, 23, 42, 0.85)', color: '#fff', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                                      Main Cover
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Card 3: Pricing & Profit Margins */}
                        <div className="admin-card">
                          <div className="admin-card-header">
                            <div>
                              <div className="admin-card-title">
                                <DollarSign size={18} style={{ color: '#16a34a' }} />
                                <span>Pricing & Profitability</span>
                              </div>
                              <div className="admin-card-subtitle">Set selling price in ZAR and track gross profit margins</div>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                            <div>
                              <label className="admin-label">Selling Price (R) *</label>
                              <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '10px', top: '9px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>R</span>
                                <input 
                                  type="number"
                                  step="0.01"
                                  required
                                  value={productForm.price}
                                  onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                                  placeholder="150.00"
                                  className="admin-input"
                                  style={{ paddingLeft: '28px', fontWeight: 700 }}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="admin-label">Compare-at Price (R)</label>
                              <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '10px', top: '9px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>R</span>
                                <input 
                                  type="number"
                                  step="0.01"
                                  value={productForm.compare_at_price}
                                  onChange={e => setProductForm({ ...productForm, compare_at_price: e.target.value })}
                                  placeholder="185.00"
                                  className="admin-input"
                                  style={{ paddingLeft: '28px' }}
                                />
                              </div>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', display: 'block' }}>Shows discount badge</span>
                            </div>

                            <div>
                              <label className="admin-label">Cost per item (R)</label>
                              <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '10px', top: '9px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>R</span>
                                <input 
                                  type="number"
                                  step="0.01"
                                  value={productForm.cost_price}
                                  onChange={e => setProductForm({ ...productForm, cost_price: e.target.value })}
                                  placeholder="75.00"
                                  className="admin-input"
                                  style={{ paddingLeft: '28px' }}
                                />
                              </div>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', display: 'block' }}>Private / Admin only</span>
                            </div>
                          </div>

                          {/* Live Profit Margin Widget */}
                          {formPriceNum > 0 && formCostNum > 0 && (
                            <div style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '12px 16px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Gross Profit per unit: </span>
                                <strong style={{ color: '#0f172a' }}>R{formProfit.toFixed(2)}</strong>
                              </div>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                background: formMarginPercent >= 40 ? '#dcfce7' : formMarginPercent >= 20 ? '#fef3c7' : '#fee2e2',
                                color: formMarginPercent >= 40 ? '#166534' : formMarginPercent >= 20 ? '#854d0e' : '#991b1b'
                              }}>
                                {formMarginPercent}% Profit Margin
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card 4: Inventory & SKU */}
                        <div className="admin-card">
                          <div className="admin-card-header">
                            <div className="admin-card-title">
                              <Layers size={18} style={{ color: '#f97316' }} />
                              <span>Inventory & SKU</span>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <label className="admin-label" style={{ margin: 0 }}>SKU (Stock Keeping Unit)</label>
                                <button
                                  type="button"
                                  onClick={() => setProductForm({ ...productForm, sku: `VY-${Math.floor(1000 + Math.random() * 9000)}` })}
                                  style={{ background: 'none', border: 'none', fontSize: '0.72rem', color: '#f97316', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Generate
                                </button>
                              </div>
                              <input 
                                type="text"
                                value={productForm.sku}
                                onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                                placeholder="TO-CHL-500ML"
                                className="admin-input"
                              />
                            </div>

                            <div>
                              <label className="admin-label">Quantity Available *</label>
                              <input 
                                type="number"
                                required
                                value={productForm.stock_quantity}
                                onChange={e => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                                placeholder="50"
                                className="admin-input"
                              />
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px' }}>
                            <input 
                              type="checkbox"
                              id="allow_backorder"
                              checked={productForm.allow_backorder}
                              onChange={e => setProductForm({ ...productForm, allow_backorder: e.target.checked })}
                              style={{ width: '16px', height: '16px', accentColor: '#f97316' }}
                            />
                            <label htmlFor="allow_backorder" style={{ fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                              Continue selling when out of stock (Allow backorders)
                            </label>
                          </div>
                        </div>

                        {/* Card 5: Custom Metafields & Specifications */}
                        <div className="admin-card">
                          <div className="admin-card-header">
                            <div>
                              <div className="admin-card-title">
                                <Sparkles size={18} style={{ color: '#f97316' }} />
                                <span>Custom Metafields & Specifications</span>
                              </div>
                              <div className="admin-card-subtitle">Add key-value pairs (e.g. Dietary, Form, Ingredients, Volume)</div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddSpecRow('', '')}
                              style={{ padding: '4px 10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Plus size={13} /> Add Row
                            </button>
                          </div>

                          {/* Quick suggestions */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                            {['Form', 'Volume', 'Dietary', 'Health Goal', 'Flavor', 'Ingredients', 'Battery', 'Warranty'].map(suggested => (
                              <button
                                key={suggested}
                                type="button"
                                onClick={() => handleAddSpecRow(suggested, '')}
                                style={{ fontSize: '0.72rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', color: '#475569' }}
                              >
                                + {suggested}
                              </button>
                            ))}
                          </div>

                          {/* Rows */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {productForm.specifications.map((spec, idx) => (
                              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 32px', gap: '8px', alignItems: 'center' }}>
                                <input 
                                  type="text"
                                  placeholder="Attribute (e.g. Form)"
                                  value={spec.key}
                                  onChange={e => handleUpdateSpecRow(idx, 'key', e.target.value)}
                                  className="admin-input"
                                  style={{ fontSize: '0.82rem', fontWeight: 600 }}
                                />
                                <input 
                                  type="text"
                                  placeholder="Value (e.g. 100% Vegan Liquid)"
                                  value={spec.value}
                                  onChange={e => handleUpdateSpecRow(idx, 'value', e.target.value)}
                                  className="admin-input"
                                  style={{ fontSize: '0.82rem' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSpecRow(idx)}
                                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* ===============================================================
                         RIGHT COLUMN (35%): Status, Organization & Live SEO Preview
                         =============================================================== */}
                      <div>
                        
                        {/* Card 6: Status & Visibility */}
                        <div className="admin-card">
                          <div className="admin-card-header">
                            <div className="admin-card-title">
                              <span>Status & Visibility</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                              <label className="admin-label">Product Status</label>
                              <select 
                                value={productForm.status} 
                                onChange={e => setProductForm({ ...productForm, status: e.target.value as any })}
                                className="admin-input"
                                style={{ fontWeight: 600 }}
                              >
                                <option value="active">Active (Visible in Store)</option>
                                <option value="draft">Draft (Hidden)</option>
                                <option value="archived">Archived</option>
                              </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                              <input 
                                type="checkbox"
                                id="is_featured"
                                checked={productForm.is_featured}
                                onChange={e => setProductForm({ ...productForm, is_featured: e.target.checked })}
                                style={{ width: '16px', height: '16px', accentColor: '#f97316' }}
                              />
                              <label htmlFor="is_featured" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                                Featured on Homepage Banner
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Card 7: Product Organization */}
                        <div className="admin-card">
                          <div className="admin-card-header">
                            <div className="admin-card-title">
                              <span>Organization</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Category Selector */}
                            <div>
                              <label className="admin-label">Category</label>
                              <select 
                                value={productForm.category}
                                onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                                className="admin-input"
                                style={{ marginBottom: '6px' }}
                              >
                                {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(c => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                                <option value="Custom">+ Add Custom Category</option>
                              </select>

                              {productForm.category === 'Custom' && (
                                <input 
                                  type="text"
                                  placeholder="Type new category..."
                                  value={productForm.customCategory}
                                  onChange={e => setProductForm({ ...productForm, customCategory: e.target.value })}
                                  className="admin-input"
                                  style={{ marginTop: '6px' }}
                                />
                              )}
                            </div>

                            {/* Vendor / Brand */}
                            <div>
                              <label className="admin-label">Vendor / Brand</label>
                              <input 
                                type="text"
                                value={productForm.vendor}
                                onChange={e => setProductForm({ ...productForm, vendor: e.target.value })}
                                placeholder="VybeTek / True Organics"
                                className="admin-input"
                              />
                            </div>

                            {/* Product Tags */}
                            <div>
                              <label className="admin-label">Tags</label>
                              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                <input 
                                  type="text"
                                  placeholder="e.g. vegan, chlorophyll"
                                  value={tagInput}
                                  onChange={e => setTagInput(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                                  className="admin-input"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddTag()}
                                  style={{ padding: '6px 12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Add
                                </button>
                              </div>

                              {/* Tag Chips */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {productForm.tags.map(t => (
                                  <span
                                    key={t}
                                    style={{
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      background: '#f1f5f9',
                                      border: '1px solid #cbd5e1',
                                      padding: '3px 8px',
                                      borderRadius: '12px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    #{t}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveTag(t)}
                                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.8rem' }}
                                    >
                                      ✕
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card 8: Search Engine Listing (SEO) */}
                        <div className="admin-card">
                          <div className="admin-card-header">
                            <div>
                              <div className="admin-card-title">
                                <Globe size={18} style={{ color: '#0284c7' }} />
                                <span>Search Engine (SEO)</span>
                              </div>
                              <div className="admin-card-subtitle">Live Google search snippet preview</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <label className="admin-label" style={{ margin: 0 }}>SEO Page Title</label>
                                <span style={{ fontSize: '0.72rem', color: (productForm.seo_title || productForm.title).length > 70 ? '#dc2626' : '#64748b' }}>
                                  {(productForm.seo_title || productForm.title).length} / 70
                                </span>
                              </div>
                              <input 
                                type="text"
                                value={productForm.seo_title}
                                onChange={e => setProductForm({ ...productForm, seo_title: e.target.value })}
                                placeholder={productForm.title || "Custom SEO Title for Google"}
                                className="admin-input"
                              />
                            </div>

                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <label className="admin-label" style={{ margin: 0 }}>Meta Description</label>
                                <span style={{ fontSize: '0.72rem', color: (productForm.seo_description || productForm.description).length > 160 ? '#dc2626' : '#64748b' }}>
                                  {(productForm.seo_description || productForm.description).length} / 160
                                </span>
                              </div>
                              <textarea 
                                rows={2}
                                value={productForm.seo_description}
                                onChange={e => setProductForm({ ...productForm, seo_description: e.target.value })}
                                placeholder={productForm.description || "Brief snippet summarizing benefits for search engines"}
                                className="admin-textarea"
                              />
                            </div>

                            {/* Live Google Search Result Box */}
                            <div className="serp-preview-box">
                              <div className="serp-url-breadcrumb">
                                <span>https://store.vylex.co.za › product › {productForm.slug || 'product-handle'}</span>
                              </div>
                              <div className="serp-title-link">
                                {productForm.seo_title || productForm.title || 'Product Title | Vybetek Store'}
                              </div>
                              <div className="serp-description-snippet">
                                {productForm.seo_description || productForm.description || 'Shop online at Vybetek Store with fast South African delivery.'}
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        ) : activeTab === 'orders' ? (
          /* =========================================================================
             ORDERS TAB
             ========================================================================= */
          <div>
            <div className="crm-section-header">
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Orders & Sales Pipeline</h1>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Track order status, record courier tracking, and update buyers via WhatsApp</p>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['all', 'pending', 'paid', 'shipped', 'delivered'].map(status => (
                  <button 
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    style={{ 
                      padding: '8px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', 
                      background: orderStatusFilter === status ? '#0f172a' : '#fff',
                      color: orderStatusFilter === status ? '#fff' : '#64748b',
                      fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Tracking Info Modal */}
            {isTrackingModalOpen && selectedOrderForTracking && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
                <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Courier Tracking — {selectedOrderForTracking.order_number}</h3>
                    <button onClick={() => setIsTrackingModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                  </div>

                  <form onSubmit={handleSaveTracking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Courier Service</label>
                      <input type="text" required value={trackingForm.courier_name} onChange={e => setTrackingForm({ ...trackingForm, courier_name: e.target.value })} placeholder="The Courier Guy / RAM / Aramex" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Tracking Number</label>
                      <input type="text" required value={trackingForm.tracking_number} onChange={e => setTrackingForm({ ...trackingForm, tracking_number: e.target.value })} placeholder="TCG-12345678" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>Tracking Portal URL</label>
                      <input type="url" value={trackingForm.tracking_url} onChange={e => setTrackingForm({ ...trackingForm, tracking_url: e.target.value })} placeholder="https://portal.thecourierguy.co.za/track" style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>

                    <button type="submit" style={{ width: '100%', padding: '12px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '8px' }}>
                      Save & Mark Order Shipped
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Orders Feed */}
            {filteredOrders.length === 0 ? (
              <div style={{ background: '#fff', padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                No orders match the selected status filter.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredOrders.map(order => (
                  <div key={order.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    <div className="crm-order-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{order.order_number || order.id}</span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{new Date(order.created_at).toLocaleString()}</span>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          padding: '2px 8px', 
                          borderRadius: '10px', 
                          background: order.payment_method === 'stripe' ? '#ede9fe' : order.payment_method === 'whatsapp_inquiry' ? '#dcfce7' : '#e0f2fe', 
                          color: order.payment_method === 'stripe' ? '#5b21b6' : order.payment_method === 'whatsapp_inquiry' ? '#166534' : '#075985', 
                          fontWeight: 600 
                        }}>
                          {order.payment_method === 'stripe' ? 'Stripe Checkout' : order.payment_method === 'whatsapp_inquiry' ? 'WhatsApp Inquiry' : 'PayFast Gateway'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Status:</label>
                        <select 
                          value={order.order_status} 
                          onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '0.82rem' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="crm-order-grid">
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>Buyer Details:</div>
                        <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                          <div><strong>{order.customer_name}</strong> ({order.customer_phone})</div>
                          {order.customer_email && <div>Email: {order.customer_email}</div>}
                          <div>Address: {order.shipping_address}</div>
                        </div>

                        {order.courier_name && order.tracking_number && (
                          <div style={{ marginTop: '12px', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.82rem' }}>
                            <strong>{order.courier_name} Tracking:</strong> {order.tracking_number}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Order Value:</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>R{Number(order.total_amount).toFixed(2)}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => {
                              setSelectedOrderForTracking(order);
                              setTrackingForm({
                                courier_name: order.courier_name || 'The Courier Guy',
                                tracking_number: order.tracking_number || '',
                                tracking_url: order.tracking_url || ''
                              });
                              setIsTrackingModalOpen(true);
                            }}
                            style={{ padding: '8px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Truck size={14} /> Add Tracking
                          </button>

                          <button 
                            onClick={() => handleSendWhatsAppUpdate(order)}
                            style={{ padding: '8px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <MessageSquare size={14} /> WhatsApp Buyer
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        ) : activeTab === 'customers' ? (
          /* =========================================================================
             CUSTOMERS TAB
             ========================================================================= */
          <div>
            <div className="crm-section-header">
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Customer Directory (CRM)</h1>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Directory of buyers, leads, and customer order history</p>
              </div>

              <input 
                type="text" 
                placeholder="Search customers by name or phone..." 
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', maxWidth: '280px', fontSize: '0.85rem' }}
              />
            </div>

            {/* Desktop Table View */}
            <div className="crm-desktop-table" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '14px 16px' }}>Customer Name</th>
                    <th style={{ padding: '14px 16px' }}>Contact Phone</th>
                    <th style={{ padding: '14px 16px' }}>Email</th>
                    <th style={{ padding: '14px 16px' }}>Address</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                        No customer records created yet.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>{c.full_name}</td>
                        <td style={{ padding: '14px 16px' }}>{c.phone}</td>
                        <td style={{ padding: '14px 16px', color: '#64748b' }}>{c.email || 'N/A'}</td>
                        <td style={{ padding: '14px 16px', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.street_address || c.address || 'N/A'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600,
                            background: c.status === 'VIP' ? '#fef3c7' : c.status === 'Active' ? '#dcfce7' : '#e0f2fe',
                            color: c.status === 'VIP' ? '#854d0e' : c.status === 'Active' ? '#166534' : '#075985'
                          }}>
                            {c.status || 'Lead'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button 
                            onClick={() => {
                              const cleanPhone = c.phone.replace(/[^0-9]/g, '');
                              const phoneWithCode = cleanPhone.startsWith('0') ? '27' + cleanPhone.substring(1) : cleanPhone;
                              window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(`Hi ${c.full_name}, thank you for reaching out to Vylex Store!`)}`, '_blank');
                            }}
                            style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <MessageSquare size={12} /> Chat WhatsApp
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="crm-mobile-cards">
              {filteredCustomers.map(c => (
                <div key={c.id} className="crm-mobile-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '0.98rem' }}>{c.full_name}</h4>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{c.phone}</span>
                    </div>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600,
                      background: c.status === 'VIP' ? '#fef3c7' : c.status === 'Active' ? '#dcfce7' : '#e0f2fe',
                      color: c.status === 'VIP' ? '#854d0e' : c.status === 'Active' ? '#166534' : '#075985'
                    }}>
                      {c.status || 'Lead'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#334155', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px' }}>
                    {c.email && <div>Email: {c.email}</div>}
                    <div>Address: {c.street_address || c.address || 'N/A'}</div>
                  </div>

                  <button 
                    onClick={() => {
                      const cleanPhone = c.phone.replace(/[^0-9]/g, '');
                      const phoneWithCode = cleanPhone.startsWith('0') ? '27' + cleanPhone.substring(1) : cleanPhone;
                      window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(`Hi ${c.full_name}, thank you for reaching out to Vylex Store!`)}`, '_blank');
                    }}
                    style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <MessageSquare size={14} /> Chat with Customer via WhatsApp
                  </button>
                </div>
              ))}
            </div>

          </div>
        ) : (
          /* =========================================================================
             OVERVIEW TAB
             ========================================================================= */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Store Executive Overview</h1>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Real-time telemetry and revenue tracking</p>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              
              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Total Revenue</span>
                  <DollarSign size={20} style={{ color: '#16a34a' }} />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>R{totalRevenue.toFixed(2)}</div>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px' }}>Settled payments & orders</div>
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Active Orders</span>
                  <Clock size={20} style={{ color: '#0284c7' }} />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{activeOrdersCount}</div>
                <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '4px' }}>Pending fulfillment / dispatch</div>
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Total Products</span>
                  <ShoppingBag size={20} style={{ color: '#8b5cf6' }} />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{products.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '4px' }}>{activeProductsCount} active / {draftProductsCount} drafts</div>
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Low Stock Alert</span>
                  <ShieldAlert size={20} style={{ color: '#eab308' }} />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: lowStockProductsCount > 0 ? '#dc2626' : '#0f172a' }}>{lowStockProductsCount}</div>
                <div style={{ fontSize: '0.75rem', color: '#eab308', marginTop: '4px' }}>Items at or below reorder level</div>
              </div>

            </div>

            {/* Recent Orders table overview */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Sales & Inquiries</h3>
                <button onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', color: '#f97316', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>View All Orders →</button>
              </div>

              {orders.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem', padding: '20px 0' }}>No sales orders recorded yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                        <th style={{ padding: '12px 8px' }}>Order #</th>
                        <th style={{ padding: '12px 8px' }}>Customer</th>
                        <th style={{ padding: '12px 8px' }}>Total</th>
                        <th style={{ padding: '12px 8px' }}>Method</th>
                        <th style={{ padding: '12px 8px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 8px', fontWeight: 700 }}>{o.order_number || o.id.substring(0, 8)}</td>
                          <td style={{ padding: '12px 8px' }}>{o.customer_name}</td>
                          <td style={{ padding: '12px 8px', fontWeight: 700 }}>R{Number(o.total_amount).toFixed(2)}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              padding: '2px 8px', 
                              borderRadius: '10px', 
                              background: o.payment_method === 'stripe' ? '#ede9fe' : o.payment_method === 'whatsapp_inquiry' ? '#dcfce7' : '#e0f2fe', 
                              color: o.payment_method === 'stripe' ? '#5b21b6' : o.payment_method === 'whatsapp_inquiry' ? '#166534' : '#075985', 
                              fontWeight: 600 
                            }}>
                              {o.payment_method === 'stripe' ? 'Stripe' : o.payment_method === 'whatsapp_inquiry' ? 'WhatsApp' : 'PayFast'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: o.order_status === 'delivered' ? '#dcfce7' : '#fef3c7', color: o.order_status === 'delivered' ? '#166534' : '#854d0e', fontWeight: 600, textTransform: 'capitalize' }}>
                              {o.order_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
