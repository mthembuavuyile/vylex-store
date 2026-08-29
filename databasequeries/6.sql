-- ====================================================================
-- VYLEX STORE: COMPLETE UNIFIED DATABASE REPAIR & INITIALIZATION SCRIPT
-- ====================================================================

-- 1. Drop old mismatched tables
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.tracking_info CASCADE;

-- 2. PRODUCTS TABLE (TEXT IDs for 'vy-nc20-blk')
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

-- 3. CUSTOMERS TABLE (CRM)
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
  status TEXT DEFAULT 'Lead',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE
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
  payment_method TEXT NOT NULL DEFAULT 'payfast',
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

-- Grant full table permissions
GRANT ALL ON public.products TO anon, authenticated, service_role;
GRANT ALL ON public.customers TO anon, authenticated, service_role;
GRANT ALL ON public.orders TO anon, authenticated, service_role;
GRANT ALL ON public.order_items TO anon, authenticated, service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Clean Up Old Conflicting Policies
DROP POLICY IF EXISTS "Public products view" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;

-- Active Clean Policies
CREATE POLICY "Public products view" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin products full access" ON public.products FOR ALL USING (true);

CREATE POLICY "Anon customer insert" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin customer full access" ON public.customers FOR ALL USING (true);

CREATE POLICY "Anon orders insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin orders full access" ON public.orders FOR ALL USING (true);

CREATE POLICY "Anon order_items insert" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin order_items full access" ON public.order_items FOR ALL USING (true);

-- Seed Core Products
INSERT INTO public.products (
  id, title, slug, category, price, cost_price, sku, stock_quantity, description, specifications, images, source
) VALUES 
('vy-nc20-blk', 'Vylex NeoCharge 20K Power Bank', 'vylex-neocharge-20k-power-bank', 'Power Banks', 799.00, 420.00, 'VY-NC20-BLK', 45, 'High-capacity 20,000mAh power bank with 22.5W Power Delivery.', '["20,000mAh battery", "22.5W Fast Charging"]'::jsonb, '["powerbank"]'::jsonb, 'manual'),
('vy-wpp-wht', 'Vylex WavePods Pro Earbuds', 'vylex-wavepods-pro-earbuds', 'Earbuds', 1299.00, 650.00, 'VY-WPP-WHT', 12, 'Active Noise Cancelling wireless earbuds with bluetooth 5.3.', '["Active Noise Cancellation", "36 hours battery life"]'::jsonb, '["earbuds"]'::jsonb, 'manual'),
('vy-tfv4-gry', 'Vylex TitanFit Smartwatch V4', 'vylex-titanfit-smartwatch-v4', 'Smartwatches', 1899.00, 950.00, 'VY-TFV4-GRY', 8, 'Premium smartwatch with 1.9" AMOLED display and SpO2 tracking.', '["1.9 AMOLED Display", "Heart rate tracking"]'::jsonb, '["smartwatch"]'::jsonb, 'manual'),
('vy-sp65-gan', 'Vylex SuperPort 65W GaN Charger', 'vylex-superport-65w-gan-charger', 'Chargers', 549.00, 280.00, 'VY-SP65-GAN', 90, 'Ultra-compact Gallium Nitride wall charger with 2x USB-C ports.', '["65W Total Power", "GaN Technology"]'::jsonb, '["charger"]'::jsonb, 'manual')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, price = EXCLUDED.price;
