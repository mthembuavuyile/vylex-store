-- ====================================================================
-- VYLEX STORE: COMPLETE UNIFIED DATABASE REPAIR & INITIALIZATION SCRIPT
-- Features:
-- 1. Products, Customers, Orders, Order Items, and Sync Logs
-- 2. Stripe & PayFast payment support (session IDs, references, status)
-- 3. Atomic stock deduction stored procedures
-- 4. Row Level Security policies
-- ====================================================================

-- Drop conflicting legacy tables if needed
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.supplier_sync_logs CASCADE;

-- 1. PRODUCTS TABLE (Uses TEXT IDs e.g. 'vy-nc20-blk')
CREATE TABLE public.products (
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
CREATE TABLE public.customers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  street_address TEXT,
  suburb TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  status TEXT DEFAULT 'Customer',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE (Supports Stripe & PayFast)
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  payment_method TEXT NOT NULL DEFAULT 'stripe',
  payment_provider TEXT NOT NULL DEFAULT 'stripe',
  payment_reference TEXT,
  stripe_session_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'pending',
  courier_name TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AUDIT / SYNC LOGS TABLE
CREATE TABLE public.supplier_sync_logs (
  id BIGSERIAL PRIMARY KEY,
  status TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reset Table Permissions & RLS
GRANT ALL ON public.products TO anon, authenticated, service_role;
GRANT ALL ON public.customers TO anon, authenticated, service_role;
GRANT ALL ON public.orders TO anon, authenticated, service_role;
GRANT ALL ON public.order_items TO anon, authenticated, service_role;
GRANT ALL ON public.supplier_sync_logs TO anon, authenticated, service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_sync_logs ENABLE ROW LEVEL SECURITY;

-- Clean Up Old Policies
DROP POLICY IF EXISTS "Public products view" ON public.products;
DROP POLICY IF EXISTS "Admin products full access" ON public.products;
DROP POLICY IF EXISTS "Anon customer insert" ON public.customers;
DROP POLICY IF EXISTS "Admin customer full access" ON public.customers;
DROP POLICY IF EXISTS "Anon orders insert" ON public.orders;
DROP POLICY IF EXISTS "Admin orders full access" ON public.orders;
DROP POLICY IF EXISTS "Anon order items insert" ON public.order_items;
DROP POLICY IF EXISTS "Admin order items full access" ON public.order_items;
DROP POLICY IF EXISTS "Admin logs full access" ON public.supplier_sync_logs;

-- Active Unified Policies
CREATE POLICY "Public products view" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin products full access" ON public.products FOR ALL USING (true);

CREATE POLICY "Anon customer insert" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin customer full access" ON public.customers FOR ALL USING (true);

CREATE POLICY "Anon orders insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin orders full access" ON public.orders FOR ALL USING (true);

CREATE POLICY "Anon order_items insert" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin order_items full access" ON public.order_items FOR ALL USING (true);

CREATE POLICY "Admin logs full access" ON public.supplier_sync_logs FOR ALL USING (true);

-- Atomic Stock Deduction Stored Procedure
CREATE OR REPLACE FUNCTION public.deduct_order_stock(p_order_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN 
    SELECT product_id, quantity 
    FROM public.order_items 
    WHERE order_id = p_order_id AND product_id IS NOT NULL
  LOOP
    UPDATE public.products
    SET stock_quantity = GREATEST(0, stock_quantity - item.quantity),
        updated_at = NOW()
    WHERE id = item.product_id;
  END LOOP;
END;
$$;

-- Seed Initial Products
INSERT INTO public.products (
  id, title, slug, category, price, cost_price, sku, stock_quantity, description, specifications, images, source
) VALUES 
(
  'vy-nc20-blk',
  'Vylex NeoCharge 20K Power Bank',
  'vylex-neocharge-20k-power-bank',
  'Power Banks',
  799.00,
  420.00,
  'VY-NC20-BLK',
  45,
  'High-capacity 20,000mAh power bank with 22.5W Power Delivery. Features dual USB-A and USB-C inputs/outputs.',
  '["20,000mAh Lithium Polymer battery", "22.5W Fast Charging PD 3.0", "1x USB-C Input/Output, 2x USB-A Output"]'::jsonb,
  '["powerbank"]'::jsonb,
  'manual'
),
(
  'vy-wpp-wht',
  'Vylex WavePods Pro Earbuds',
  'vylex-wavepods-pro-earbuds',
  'Earbuds',
  1299.00,
  650.00,
  'VY-WPP-WHT',
  12,
  'Active Noise Cancelling (ANC) wireless earbuds with bluetooth 5.3. Up to 36 hours of total playtime.',
  '["Active Noise Cancellation up to 30dB", "Bluetooth 5.3 low-latency connection", "36 hours total battery life"]'::jsonb,
  '["earbuds"]'::jsonb,
  'manual'
),
(
  'vy-tfv4-gry',
  'Vylex TitanFit Smartwatch V4',
  'vylex-titanfit-smartwatch-v4',
  'Smartwatches',
  1899.00,
  950.00,
  'VY-TFV4-GRY',
  8,
  'Premium smartwatch featuring 1.9" AMOLED display, blood oxygen monitoring, heart rate sensor, and GPS.',
  '["1.9 inch Always-on AMOLED Display", "Heart rate, SpO2, and Sleep tracking", "10-day battery life"]'::jsonb,
  '["smartwatch"]'::jsonb,
  'manual'
),
(
  'vy-sp65-gan',
  'Vylex SuperPort 65W GaN Charger',
  'vylex-superport-65w-gan-charger',
  'Chargers',
  549.00,
  280.00,
  'VY-SP65-GAN',
  90,
  'Ultra-compact Gallium Nitride (GaN) wall charger with 2x USB-C PD ports and 1x USB-A port.',
  '["65W Total Power output via GaN Tech", "2x USB-C Power Delivery ports, 1x USB-A port"]'::jsonb,
  '["charger"]'::jsonb,
  'manual'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity;
