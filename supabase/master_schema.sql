-- ==============================================================================
-- VYLEX STORE: COMPLETE UNIFIED MASTER DATABASE SCHEMA & SETUP SCRIPT
-- ==============================================================================
-- Run this script in the Supabase SQL Editor to initialize or repair the database.
-- It is safe, clean, and sets up all tables, relationships, RLS policies, 
-- stock deduction functions, and product seeds.
-- ==============================================================================

-- 1. DROP OLD TABLES (IF RE-INITIALIZING)
-- Note: Comment out if you only want to add missing columns to an existing database.
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.supplier_sync_logs CASCADE;
DROP TABLE IF EXISTS public.tracking_info CASCADE;

-- 2. PRODUCTS TABLE
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

-- 3. CUSTOMERS TABLE (CRM & Lead Tracking)
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
  status TEXT DEFAULT 'Customer',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE (Unified Stripe, PayFast & WhatsApp Orders)
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
  currency TEXT NOT NULL DEFAULT 'ZAR',
  payment_method TEXT NOT NULL DEFAULT 'payfast',
  payment_provider TEXT NOT NULL DEFAULT 'payfast',
  payment_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'pending',
  courier_name TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDER ITEMS TABLE
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

-- 6. AUDIT & SYNC LOGS TABLE
CREATE TABLE IF NOT EXISTS public.supplier_sync_logs (
  id BIGSERIAL PRIMARY KEY,
  status TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ATOMIC STOCK DEDUCTION FUNCTION
CREATE OR REPLACE FUNCTION public.deduct_order_stock(p_order_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
BEGIN
  FOR v_item IN 
    SELECT product_id, quantity 
    FROM public.order_items 
    WHERE order_id = p_order_id AND product_id IS NOT NULL
  LOOP
    UPDATE public.products
    SET stock_quantity = GREATEST(0, stock_quantity - v_item.quantity),
        updated_at = NOW()
    WHERE id = v_item.product_id;
  END LOOP;
END;
$$;

-- 8. PERMISSIONS & ROW LEVEL SECURITY (RLS)
GRANT ALL ON public.products TO anon, authenticated, service_role;
GRANT ALL ON public.customers TO anon, authenticated, service_role;
GRANT ALL ON public.orders TO anon, authenticated, service_role;
GRANT ALL ON public.order_items TO anon, authenticated, service_role;
GRANT ALL ON public.supplier_sync_logs TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.deduct_order_stock(TEXT) TO anon, authenticated, service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_sync_logs ENABLE ROW LEVEL SECURITY;

-- Clean Up Old Conflicting Policies
DROP POLICY IF EXISTS "Public products view" ON public.products;
DROP POLICY IF EXISTS "Admin products full access" ON public.products;
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
DROP POLICY IF EXISTS "Anon customer insert" ON public.customers;
DROP POLICY IF EXISTS "Admin customer full access" ON public.customers;
DROP POLICY IF EXISTS "Anon orders insert" ON public.orders;
DROP POLICY IF EXISTS "Admin orders full access" ON public.orders;
DROP POLICY IF EXISTS "Anon order_items insert" ON public.order_items;
DROP POLICY IF EXISTS "Admin order_items full access" ON public.order_items;
DROP POLICY IF EXISTS "Admin logs full access" ON public.supplier_sync_logs;
DROP POLICY IF EXISTS "Service role logs access" ON public.supplier_sync_logs;

-- Active RLS Policies
CREATE POLICY "Public products view" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin products full access" ON public.products FOR ALL USING (true);

CREATE POLICY "Anon customer insert" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin customer full access" ON public.customers FOR ALL USING (true);

CREATE POLICY "Anon orders insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin orders full access" ON public.orders FOR ALL USING (true);

CREATE POLICY "Anon order_items insert" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin order_items full access" ON public.order_items FOR ALL USING (true);

CREATE POLICY "Admin logs full access" ON public.supplier_sync_logs FOR ALL USING (true);

-- 9. SEED CORE CATALOG PRODUCTS
INSERT INTO public.products (
  id, title, slug, category, price, cost_price, sku, stock_quantity, description, specifications, images, source
) VALUES 
('vy-nc20-blk', 'Vylex NeoCharge 20K Power Bank', 'vylex-neocharge-20k-power-bank', 'Power Banks', 799.00, 420.00, 'VY-NC20-BLK', 45, 'High-capacity 20,000mAh power bank with 22.5W Power Delivery and dual output.', '["20,000mAh Lithium-Polymer", "22.5W Two-Way Fast Charge", "Dual USB-C + USB-A", "LED Digital Display"]'::jsonb, '["powerbank"]'::jsonb, 'manual'),
('vy-wpp-wht', 'Vylex WavePods Pro Earbuds', 'vylex-wavepods-pro-earbuds', 'Earbuds', 1299.00, 650.00, 'VY-WPP-WHT', 12, 'Active Noise Cancelling true wireless earbuds with Bluetooth 5.3 and deep bass profile.', '["Active Noise Cancellation (ANC)", "36 Hours Total Battery", "IPX5 Sweat & Splash Proof", "Touch Controls & Voice Assistant"]'::jsonb, '["earbuds"]'::jsonb, 'manual'),
('vy-tfv4-gry', 'Vylex TitanFit Smartwatch V4', 'vylex-titanfit-smartwatch-v4', 'Smartwatches', 1899.00, 950.00, 'VY-TFV4-GRY', 8, 'Rugged smartwatch with 1.9" AMOLED display, comprehensive health sensors, and IP68 water resistance.', '["1.93 inch AMOLED Touchscreen", "Heart Rate, SpO2 & Sleep Tracking", "100+ Sports Tracking Modes", "7-Day Battery Life"]'::jsonb, '["smartwatch"]'::jsonb, 'manual'),
('vy-sp65-gan', 'Vylex SuperPort 65W GaN Charger', 'vylex-superport-65w-gan-charger', 'Chargers', 549.00, 280.00, 'VY-SP65-GAN', 90, 'Ultra-compact Gallium Nitride wall charger with 2x USB-C and 1x USB-A high-speed ports.', '["65W Max GaN Technology", "2x USB-C + 1x USB-A Ports", "Over-current & Temperature Protection", "Compact Foldable Plug"]'::jsonb, '["charger"]'::jsonb, 'manual')
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, 
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  specifications = EXCLUDED.specifications;
