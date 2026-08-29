-- ====================================================================
-- VYLEX STORE: COMPLETE UNIFIED MASTER RECREATION SCRIPT
-- ====================================================================
-- This script combines the best features from all previous iterations:
-- 1. Comprehensive Products table (Shopify-inspired fields, Stripe integration)
-- 2. Auto-updated timestamps (updated_at triggers)
-- 3. Auto-generated SEO-friendly slugs
-- 4. Corrected Row Level Security (RLS) policies (preventing unauthorized edits)
-- 5. Atomic stock deduction
-- 6. Initial Seed Data
-- ====================================================================

-- 1. CLEANUP (DROP OLD TABLES)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.supplier_sync_logs CASCADE;
DROP TABLE IF EXISTS public.tracking_info CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. CREATE TABLES

-- PRODUCTS
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Uncategorized',
  vendor TEXT DEFAULT 'VybeTek',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  compare_at_price NUMERIC(10, 2),
  cost_price NUMERIC(10, 2) DEFAULT 0.00,
  sku TEXT UNIQUE NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
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
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMERS
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

-- ORDERS
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

-- ORDER ITEMS
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

-- SUPPLIER SYNC LOGS
CREATE TABLE public.supplier_sync_logs (
  id BIGSERIAL PRIMARY KEY,
  status TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRIGGERS & FUNCTIONS

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate product slug function
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

-- 4. SECURITY (RLS & PERMISSIONS)

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

-- Active Unified Policies
-- Products: Everyone can view. Only authenticated (admin) can modify.
CREATE POLICY "Public products view" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin products full access" ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- Customers: Anyone can insert (for checkout). Only authenticated can view/modify all.
CREATE POLICY "Anon customer insert" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin customer full access" ON public.customers FOR ALL USING (auth.role() = 'authenticated');

-- Orders: Anyone can insert (for checkout). Only authenticated can view/modify all.
CREATE POLICY "Anon orders insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin orders full access" ON public.orders FOR ALL USING (auth.role() = 'authenticated');

-- Order Items: Anyone can insert (for checkout). Only authenticated can view/modify all.
CREATE POLICY "Anon order_items insert" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin order_items full access" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');

-- Sync Logs: Only authenticated
CREATE POLICY "Admin logs full access" ON public.supplier_sync_logs FOR ALL USING (auth.role() = 'authenticated');

-- 5. SEED INITIAL DATA
INSERT INTO public.products (
  id, title, slug, category, vendor, price, compare_at_price, cost_price, sku, stock_quantity, description, specifications, images, tags, status, is_featured, source
) VALUES 
(
  'vy-org-chl-500', 'True Organics Liquid Chlorophyll Juice (500 ml)', 'true-organics-liquid-chlorophyll-juice-500-ml', 'Supplements', 'True Organics', 150.00, 185.00, 75.00, 'TO-CHL-500ML', 85, 'True Organics Liquid Chlorophyll Juice 500ml – vegan-friendly antioxidant supplement in liquid form.', '[{"key": "Form", "value": "Liquid Extract"}, {"key": "Volume", "value": "500 ml"}, {"key": "Dietary", "value": "Vegan, Non-GMO"}]'::jsonb, '["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"]'::jsonb, '["chlorophyll", "vegan", "antioxidant", "supplements", "liquid"]'::jsonb, 'active', true, 'manual'
),
(
  'vy-nc20-blk', 'Vybetek NeoCharge 20K Power Bank', 'vybetek-neocharge-20k-power-bank', 'Power Banks', 'VybeTek', 799.00, 949.00, 420.00, 'VY-NC20-BLK', 45, 'High-capacity 20,000mAh power bank with 22.5W Power Delivery. Features dual USB-A and USB-C inputs/outputs.', '[{"key": "Capacity", "value": "20,000mAh Lithium Polymer"}, {"key": "Fast Charging", "value": "22.5W PD 3.0"}]'::jsonb, '["powerbank"]'::jsonb, '["powerbank", "fast-charge", "portable"]'::jsonb, 'active', true, 'manual'
),
(
  'vy-wpp-wht', 'Vybetek WavePods Pro Earbuds', 'vybetek-wavepods-pro-earbuds', 'Earbuds', 'VybeTek', 1299.00, 1499.00, 650.00, 'VY-WPP-WHT', 12, 'Active Noise Cancelling (ANC) wireless earbuds with bluetooth 5.3. Up to 36 hours of total playtime.', '[{"key": "ANC Depth", "value": "Active Noise Cancellation up to 30dB"}, {"key": "Bluetooth", "value": "Version 5.3"}]'::jsonb, '["earbuds"]'::jsonb, '["audio", "wireless", "anc"]'::jsonb, 'active', true, 'manual'
),
(
  'vy-tfv4-gry', 'Vybetek TitanFit Smartwatch V4', 'vybetek-titanfit-smartwatch-v4', 'Smartwatches', 'VybeTek', 1899.00, 2199.00, 950.00, 'VY-TFV4-GRY', 8, 'Premium smartwatch featuring 1.9" AMOLED display, blood oxygen monitoring, heart rate sensor, and GPS.', '[{"key": "Display", "value": "1.9 inch Always-on AMOLED"}, {"key": "Battery", "value": "10-day Endurance"}]'::jsonb, '["smartwatch"]'::jsonb, '["wearables", "smartwatch", "fitness"]'::jsonb, 'active', true, 'manual'
),
(
  'vy-sp65-gan', 'Vybetek SuperPort 65W GaN Charger', 'vybetek-superport-65w-gan-charger', 'Chargers', 'VybeTek', 549.00, 649.00, 280.00, 'VY-SP65-GAN', 90, 'Ultra-compact Gallium Nitride (GaN) wall charger with 2x USB-C PD ports and 1x USB-A port.', '[{"key": "Total Power", "value": "65W GaN Fast Delivery"}, {"key": "Ports", "value": "2x USB-C, 1x USB-A"}]'::jsonb, '["charger"]'::jsonb, '["chargers", "gan", "fast-charge"]'::jsonb, 'active', false, 'manual'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  stock_quantity = EXCLUDED.stock_quantity,
  tags = EXCLUDED.tags,
  status = EXCLUDED.status;
