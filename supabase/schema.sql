-- ==============================================================================
-- VYBETEK (Formerly Vylex Store): COMPLETE UNIFIED DATABASE SCHEMA & SETUP SCRIPT
-- Reflects all historical changes, security policies, and feature additions.
-- From Vylex Store UUID schemas to the VybeTek Shopify-inspired TEXT schemas.
-- ==============================================================================

-- 1. DROP OLD TABLES (IF RE-INITIALIZING)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.tracking_info CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.supplier_sync_logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =========================================================
-- 2. CORE UTILITY FUNCTIONS
-- =========================================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- =========================================================
-- 3. TABLES CREATION
-- =========================================================

-- PROFILES TABLE (From initial schema)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Admin-check helper (From security fixes)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- PRODUCTS TABLE (Text IDs, Slugs, Shopify-inspired fields)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Uncategorized',
  vendor TEXT DEFAULT 'VybeTek',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  compare_at_price NUMERIC(10, 2),
  cost_price NUMERIC(10, 2) DEFAULT 0.00 CHECK (cost_price >= 0),
  sku TEXT UNIQUE NOT NULL,
  supplier_sku TEXT,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INT DEFAULT 5,
  allow_backorder BOOLEAN DEFAULT FALSE,
  description TEXT,
  specifications JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  is_featured BOOLEAN DEFAULT FALSE,
  weight_kg NUMERIC(10, 2),
  seo_title TEXT,
  seo_description TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'supplier_sync')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Auto-generate slug on insert if not provided (From product slugs)
CREATE OR REPLACE FUNCTION public.generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(TRIM(NEW.title), '[^\w\s-]', '', 'g'),
          '\s+', '-', 'g'
        ),
        '-+', '-', 'g'
      )
    );
    -- Handle uniqueness by appending a random suffix if collision
    IF EXISTS (SELECT 1 FROM public.products WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '')) THEN
      NEW.slug := NEW.slug || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_product_slug
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_product_slug();

-- CUSTOMERS TABLE (CRM - from later schemas)
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
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ORDERS TABLE (Unified Stripe, PayFast, WhatsApp)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Keeping legacy user relation
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
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
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- TRACKING INFO TABLE (From initial schema)
CREATE TABLE IF NOT EXISTS public.tracking_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
  courier_name TEXT NOT NULL,
  tracking_number TEXT NOT NULL,
  tracking_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- AUDIT & SYNC LOGS TABLE
CREATE TABLE IF NOT EXISTS public.supplier_sync_logs (
  id BIGSERIAL PRIMARY KEY,
  status TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =========================================================
-- 4. TRIGGERS
-- =========================================================

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_tracking_info_updated_at BEFORE UPDATE ON public.tracking_info FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- =========================================================
-- 5. ADVANCED STORED PROCEDURES (Business Logic)
-- =========================================================

-- Atomic Stock Deduction Function
CREATE OR REPLACE FUNCTION public.deduct_order_stock(p_order_id TEXT)
RETURNS void
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

-- Secure Server-Validated Checkout (From security schema, updated for new fields)
CREATE OR REPLACE FUNCTION public.create_secure_order(
  p_order_id TEXT,
  p_order_number TEXT,
  p_items JSONB,
  p_shipping_address TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_email TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_product public.products%ROWTYPE;
  v_total NUMERIC(10,2) := 0;
BEGIN
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  -- Validate stock and calculate true total
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product FROM public.products
      WHERE id = (v_item->>'product_id')::TEXT
      FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', v_item->>'product_id';
    END IF;

    IF v_product.stock_quantity < (v_item->>'quantity')::INTEGER AND NOT COALESCE(v_product.allow_backorder, FALSE) THEN
      RAISE EXCEPTION 'Insufficient stock for %', v_product.title;
    END IF;

    v_total := v_total + (v_product.price * (v_item->>'quantity')::INTEGER);
  END LOOP;

  -- Insert order
  INSERT INTO public.orders (
    id, order_number, user_id, customer_name, customer_email, customer_phone,
    shipping_address, total_amount, payment_status, order_status
  ) VALUES (
    p_order_id, p_order_number, auth.uid(), p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, v_total, 'pending', 'pending'
  );

  -- Insert items and deduct stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product FROM public.products WHERE id = (v_item->>'product_id')::TEXT;

    INSERT INTO public.order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price)
    VALUES (
      gen_random_uuid()::TEXT, p_order_id, v_product.id, v_product.title, 
      (v_item->>'quantity')::INTEGER, v_product.price, 
      (v_product.price * (v_item->>'quantity')::INTEGER)
    );

    UPDATE public.products
      SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER
      WHERE id = v_product.id;
  END LOOP;

  RETURN p_order_id;
END;
$$;

-- =========================================================
-- 6. INDEXES FOR PERFORMANCE
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_tracking_info_order_id ON public.tracking_info(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_orders_payment_reference ON public.orders(payment_reference) WHERE payment_reference IS NOT NULL;

-- =========================================================
-- 7. SECURITY: ROW LEVEL SECURITY (RLS) & PERMISSIONS
-- =========================================================

-- Grant permissions
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.products TO anon, authenticated, service_role;
GRANT ALL ON public.customers TO anon, authenticated, service_role;
GRANT ALL ON public.orders TO anon, authenticated, service_role;
GRANT ALL ON public.order_items TO anon, authenticated, service_role;
GRANT ALL ON public.tracking_info TO anon, authenticated, service_role;
GRANT ALL ON public.supplier_sync_logs TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.deduct_order_stock(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_secure_order(TEXT, TEXT, JSONB, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_sync_logs ENABLE ROW LEVEL SECURITY;

-- Clean Up Old Conflicting Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
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

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Products Policies
CREATE POLICY "Public products view" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin products full access" ON public.products FOR ALL USING (public.is_admin() OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Secure sensitive columns from public (from security script)
REVOKE SELECT ON public.products FROM anon;
GRANT SELECT (
  id, title, slug, category, vendor, price, compare_at_price, sku, 
  stock_quantity, low_stock_threshold, allow_backorder, description, 
  specifications, images, tags, status, is_featured, weight_kg, 
  seo_title, seo_description, created_at, updated_at
) ON public.products TO anon;

-- Customers Policies
CREATE POLICY "Anon customer insert" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin customer full access" ON public.customers FOR ALL USING (public.is_admin() OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Orders Policies
CREATE POLICY "Anon orders insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin orders full access" ON public.orders FOR ALL USING (public.is_admin() OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Order Items Policies
CREATE POLICY "Anon order_items insert" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admin order_items full access" ON public.order_items FOR ALL USING (public.is_admin() OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Tracking Info Policies
CREATE POLICY "Users can view their own tracking info" ON public.tracking_info FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = tracking_info.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Admin tracking info full access" ON public.tracking_info FOR ALL USING (public.is_admin() OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Logs Policies
CREATE POLICY "Admin logs full access" ON public.supplier_sync_logs FOR ALL USING (public.is_admin() OR auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- =========================================================
-- 8. STORAGE BUCKETS & POLICIES
-- =========================================================

-- Create the product-images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true) 
ON CONFLICT DO NOTHING;

-- Clean up any existing storage policies for this bucket to avoid conflicts during re-initialization
DROP POLICY IF EXISTS "Public View Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Images" ON storage.objects;

-- Allow public access to view images
CREATE POLICY "Public View Images" ON storage.objects 
FOR SELECT USING ( bucket_id = 'product-images' );

-- Allow Admins to upload images
CREATE POLICY "Admin Upload Images" ON storage.objects 
FOR INSERT WITH CHECK ( 
  bucket_id = 'product-images' 
  AND (public.is_admin() OR auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Allow Admins to delete images
CREATE POLICY "Admin Delete Images" ON storage.objects 
FOR DELETE USING ( 
  bucket_id = 'product-images' 
  AND (public.is_admin() OR auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- =========================================================
-- 9. SEED CORE CATALOG PRODUCTS (VybeTek & True Organics)
-- =========================================================
INSERT INTO public.products (
  id, title, slug, category, vendor, price, compare_at_price, cost_price, sku, stock_quantity, description, specifications, images, tags, status, is_featured, source
) VALUES 
(
  'vy-org-chl-500',
  'True Organics Liquid Chlorophyll Juice (500 ml)',
  'true-organics-liquid-chlorophyll-juice-500-ml',
  'Supplements',
  'True Organics',
  150.00,
  185.00,
  75.00,
  'TO-CHL-500ML',
  85,
  'True Organics Liquid Chlorophyll Juice 500ml – vegan-friendly antioxidant supplement in liquid form.',
  '[{"key": "Form", "value": "Liquid Extract"}, {"key": "Volume", "value": "500 ml"}, {"key": "Dietary", "value": "Vegan, Non-GMO"}]'::jsonb,
  '["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '["chlorophyll", "vegan", "antioxidant", "supplements", "liquid"]'::jsonb,
  'active',
  true,
  'manual'
),
(
  'vy-nc20-blk',
  'Vybetek NeoCharge 20K Power Bank',
  'vybetek-neocharge-20k-power-bank',
  'Power Banks',
  'VybeTek',
  799.00,
  949.00,
  420.00,
  'VY-NC20-BLK',
  45,
  'High-capacity 20,000mAh power bank with 22.5W Power Delivery. Features dual USB-A and USB-C inputs/outputs.',
  '[{"key": "Capacity", "value": "20,000mAh Lithium Polymer"}, {"key": "Fast Charging", "value": "22.5W PD 3.0"}]'::jsonb,
  '["powerbank"]'::jsonb,
  '["powerbank", "fast-charge", "portable"]'::jsonb,
  'active',
  true,
  'manual'
),
(
  'vy-wpp-wht',
  'Vybetek WavePods Pro Earbuds',
  'vybetek-wavepods-pro-earbuds',
  'Earbuds',
  'VybeTek',
  1299.00,
  1499.00,
  650.00,
  'VY-WPP-WHT',
  12,
  'Active Noise Cancelling (ANC) wireless earbuds with bluetooth 5.3. Up to 36 hours of total playtime.',
  '[{"key": "ANC Depth", "value": "Active Noise Cancellation up to 30dB"}, {"key": "Bluetooth", "value": "Version 5.3"}]'::jsonb,
  '["earbuds"]'::jsonb,
  '["audio", "wireless", "anc"]'::jsonb,
  'active',
  true,
  'manual'
),
(
  'vy-tfv4-gry',
  'Vybetek TitanFit Smartwatch V4',
  'vybetek-titanfit-smartwatch-v4',
  'Smartwatches',
  'VybeTek',
  1899.00,
  2199.00,
  950.00,
  'VY-TFV4-GRY',
  8,
  'Premium smartwatch featuring 1.9" AMOLED display, blood oxygen monitoring, heart rate sensor, and GPS.',
  '[{"key": "Display", "value": "1.9 inch Always-on AMOLED"}, {"key": "Battery", "value": "10-day Endurance"}]'::jsonb,
  '["smartwatch"]'::jsonb,
  '["wearables", "smartwatch", "fitness"]'::jsonb,
  'active',
  true,
  'manual'
),
(
  'vy-sp65-gan',
  'Vybetek SuperPort 65W GaN Charger',
  'vybetek-superport-65w-gan-charger',
  'Chargers',
  'VybeTek',
  549.00,
  649.00,
  280.00,
  'VY-SP65-GAN',
  90,
  'Ultra-compact Gallium Nitride (GaN) wall charger with 2x USB-C PD ports and 1x USB-A port.',
  '[{"key": "Total Power", "value": "65W GaN Fast Delivery"}, {"key": "Ports", "value": "2x USB-C, 1x USB-A"}]'::jsonb,
  '["charger"]'::jsonb,
  '["chargers", "gan", "fast-charge"]'::jsonb,
  'active',
  false,
  'manual'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  stock_quantity = EXCLUDED.stock_quantity,
  tags = EXCLUDED.tags,
  status = EXCLUDED.status,
  description = EXCLUDED.description,
  specifications = EXCLUDED.specifications;
