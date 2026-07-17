-- Vylex Store: Security & Correctness Fixes
-- Run this AFTER the original schema setup script.
--
-- Fixes:
--   1. Self-referencing RLS policy on profiles (recursion risk)
--   2. Customer phone numbers publicly readable
--   3. Product cost_price / supplier_sku publicly readable (margin leak)
--   4. Client-side price tampering on orders / order_items
--   5. No stock validation or decrement on checkout
--   6. Missing indexes on foreign keys
--   7. payment_reference not unique

-- =========================================================
-- 1. Admin-check helper
--    SECURITY DEFINER + owned by postgres = bypasses RLS internally,
--    so this can safely be called from inside other RLS policies
--    without re-triggering them.
-- =========================================================
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

-- =========================================================
-- 2. profiles: remove public SELECT (was leaking phone numbers),
--    replace self-referencing admin policy with the helper
-- =========================================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- =========================================================
-- 3. products: swap admin policy to helper, hide cost_price /
--    supplier_sku / source from anon + authenticated at column level.
-- =========================================================
DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;
CREATE POLICY "Admins have full access to products" ON public.products
  FOR ALL USING (public.is_admin());

REVOKE SELECT ON public.products FROM anon, authenticated;
GRANT SELECT (
  id, title, description, price, sku, category, images,
  stock_quantity, created_at, updated_at
) ON public.products TO anon, authenticated;

-- =========================================================
-- 4. orders / order_items: remove client-writable INSERT entirely.
-- =========================================================
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Admins have full access to orders" ON public.orders
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins have full access to order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;

CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Admins have full access to order items" ON public.order_items
  FOR ALL USING (public.is_admin());

-- Server-validated checkout.
CREATE OR REPLACE FUNCTION public.create_order(
  p_items JSONB,
  p_shipping_address JSONB,
  p_customer_email TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_product public.products%ROWTYPE;
  v_total NUMERIC(10,2) := 0;
BEGIN
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product FROM public.products
      WHERE id = (v_item->>'product_id')::UUID
      FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found', v_item->>'product_id';
    END IF;

    IF v_product.stock_quantity < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Insufficient stock for %', v_product.title;
    END IF;

    v_total := v_total + (v_product.price * (v_item->>'quantity')::INTEGER);
  END LOOP;

  INSERT INTO public.orders (
    customer_id, status, total_amount, shipping_address,
    customer_email, customer_name, customer_phone
  ) VALUES (
    auth.uid(), 'pending', v_total, p_shipping_address,
    p_customer_email, p_customer_name, p_customer_phone
  ) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product FROM public.products WHERE id = (v_item->>'product_id')::UUID;

    INSERT INTO public.order_items (order_id, product_id, quantity, price)
    VALUES (v_order_id, v_product.id, (v_item->>'quantity')::INTEGER, v_product.price);

    UPDATE public.products
      SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER
      WHERE id = v_product.id;
  END LOOP;

  RETURN v_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order(JSONB, JSONB, TEXT, TEXT, TEXT) TO anon, authenticated;

-- =========================================================
-- 5. tracking_info / supplier_sync_logs: swap to helper, add created_at
-- =========================================================
DROP POLICY IF EXISTS "Admins have full access to tracking info" ON public.tracking_info;
CREATE POLICY "Admins have full access to tracking info" ON public.tracking_info
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view their own tracking info" ON public.tracking_info;
CREATE POLICY "Users can view their own tracking info" ON public.tracking_info
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = tracking_info.order_id AND orders.customer_id = auth.uid()
    )
  );

ALTER TABLE public.tracking_info
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;

DROP POLICY IF EXISTS "Admins have full access to sync logs" ON public.supplier_sync_logs;
CREATE POLICY "Admins have full access to sync logs" ON public.supplier_sync_logs
  FOR ALL USING (public.is_admin());

-- =========================================================
-- 6. Indexes on foreign keys + payment_reference uniqueness
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_tracking_info_order_id ON public.tracking_info(order_id);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_orders_payment_reference
  ON public.orders(payment_reference) WHERE payment_reference IS NOT NULL;
