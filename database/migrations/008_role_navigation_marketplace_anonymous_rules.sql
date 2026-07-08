-- Role-aware marketplace permissions and member-only anonymous posting rules.

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_regular_member()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(public.current_user_role() = 'user', FALSE);
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(public.current_user_role() = 'admin', FALSE);
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_vendor()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(public.current_user_role() = 'vendor', FALSE);
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_owns_order(order_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = order_id
      AND buyer_id = auth.uid()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.vendor_owns_product(product_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.products
    WHERE id = product_id
      AND vendor_id = auth.uid()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.vendor_can_access_order(order_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = order_id
      AND p.vendor_id = auth.uid()
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Products: vendors manage only their own rows, members/leaders/vendors can browse,
-- and admins have full access.
DROP POLICY IF EXISTS "Vendor manages products" ON products;
DROP POLICY IF EXISTS "View products" ON products;
DROP POLICY IF EXISTS "Users view own religion products" ON products;
DROP POLICY IF EXISTS "Products browse by authenticated users" ON products;
DROP POLICY IF EXISTS "Vendors create own products" ON products;
DROP POLICY IF EXISTS "Vendors update own products" ON products;
DROP POLICY IF EXISTS "Vendors delete own products" ON products;
DROP POLICY IF EXISTS "Admins manage all products" ON products;

CREATE POLICY "Products browse by authenticated users"
ON products FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    public.is_admin()
    OR religion = (SELECT religion FROM users WHERE id = auth.uid())
  )
);

CREATE POLICY "Vendors create own products"
ON products FOR INSERT
WITH CHECK (
  public.is_vendor() AND vendor_id = auth.uid()
);

CREATE POLICY "Vendors update own products"
ON products FOR UPDATE
USING (
  public.is_admin()
  OR (public.is_vendor() AND vendor_id = auth.uid())
)
WITH CHECK (
  public.is_admin()
  OR (public.is_vendor() AND vendor_id = auth.uid())
);

CREATE POLICY "Vendors delete own products"
ON products FOR DELETE
USING (
  public.is_admin()
  OR (public.is_vendor() AND vendor_id = auth.uid())
);

-- Orders: regular members purchase, vendors can see orders containing their
-- products, and admins can see/manage all.
DROP POLICY IF EXISTS "Buyer views own orders" ON orders;
DROP POLICY IF EXISTS "Members create own orders" ON orders;
DROP POLICY IF EXISTS "Buyers view own orders" ON orders;
DROP POLICY IF EXISTS "Vendors view product orders" ON orders;
DROP POLICY IF EXISTS "Vendors update product orders" ON orders;
DROP POLICY IF EXISTS "Admins manage all orders" ON orders;

CREATE POLICY "Members create own orders"
ON orders FOR INSERT
WITH CHECK (
  public.is_admin()
  OR (public.is_regular_member() AND buyer_id = auth.uid())
);

CREATE POLICY "Buyers view own orders"
ON orders FOR SELECT
USING (buyer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Vendors view product orders"
ON orders FOR SELECT
USING (public.is_vendor() AND public.vendor_can_access_order(id));

CREATE POLICY "Vendors update product orders"
ON orders FOR UPDATE
USING (
  public.is_admin()
  OR (public.is_vendor() AND public.vendor_can_access_order(id))
);

CREATE POLICY "Admins manage all orders"
ON orders FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Buyers and vendors view order items" ON order_items;
DROP POLICY IF EXISTS "Members create order items" ON order_items;
DROP POLICY IF EXISTS "Admins manage all order items" ON order_items;

CREATE POLICY "Buyers and vendors view order items"
ON order_items FOR SELECT
USING (
  public.is_admin()
  OR public.user_owns_order(order_id)
  OR public.vendor_owns_product(product_id)
);

CREATE POLICY "Members create order items"
ON order_items FOR INSERT
WITH CHECK (
  public.is_admin()
  OR (
    public.is_regular_member()
    AND public.user_owns_order(order_id)
  )
);

CREATE POLICY "Admins manage all order items"
ON order_items FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Anonymous posts/comments are only allowed for regular members.
CREATE OR REPLACE FUNCTION public.enforce_member_only_anonymous_post()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL
    AND COALESCE(NEW.is_anonymous, FALSE)
    AND NOT public.is_regular_member()
  THEN
    RAISE EXCEPTION 'Only regular members can post anonymously';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_member_only_anonymous_posts ON posts;
CREATE TRIGGER enforce_member_only_anonymous_posts
BEFORE INSERT OR UPDATE OF is_anonymous ON posts
FOR EACH ROW EXECUTE FUNCTION public.enforce_member_only_anonymous_post();

CREATE OR REPLACE FUNCTION public.enforce_member_only_anonymous_comment()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL
    AND COALESCE(NEW.is_anonymous, FALSE)
    AND NOT public.is_regular_member()
  THEN
    RAISE EXCEPTION 'Only regular members can post anonymously';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_member_only_anonymous_comments ON comments;
CREATE TRIGGER enforce_member_only_anonymous_comments
BEFORE INSERT OR UPDATE OF is_anonymous ON comments
FOR EACH ROW EXECUTE FUNCTION public.enforce_member_only_anonymous_comment();
