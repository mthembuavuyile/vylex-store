-- Vylex Store Database Schema for Supabase / PostgreSQL

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Uncategorized',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  cost_price NUMERIC(10, 2) DEFAULT 0.00,
  sku TEXT UNIQUE NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  description TEXT,
  specifications JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE (CRM)
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  street_address TEXT,
  suburb TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  status TEXT DEFAULT 'Lead', -- 'Lead', 'Active', 'VIP'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  payment_method TEXT NOT NULL DEFAULT 'payfast', -- 'payfast', 'whatsapp_inquiry'
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  order_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  courier_name TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products for storefront
CREATE POLICY "Public products view" ON public.products FOR SELECT USING (true);

-- Allow authenticated users (admin) full access
CREATE POLICY "Admin products full" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin customers full" ON public.customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin orders full" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin order_items full" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');

-- Allow anon checkout inserts
CREATE POLICY "Anon customer insert" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon orders insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon order items insert" ON public.order_items FOR INSERT WITH CHECK (true);
