-- ============================================================
-- Migration: 20261120000002_rls_policies.sql
-- Teshart — Secure Row Level Security & SQL Grants
--
-- Security Model (Zero Trust / Principle of Least Privilege):
--   1. Anonymous users (public browser):
--      - ZERO direct SELECT access on orders, customers, payments, photos, shipments, history.
--      - ZERO direct INSERT / UPDATE / DELETE access on all tables.
--      - Order creation & tracking are handled EXCLUSIVELY via server-side Edge Functions.
--      - Global anonymous permissive SELECT is PERMANENTLY ERADICATED.
--   2. Authenticated Staff / Administrators:
--      - Role-Based Access Control verified via `admin_profiles` table.
--      - Authorized roles: 'super_admin', 'artist', 'support'.
--      - User-editable auth metadata is NEVER trusted; checks query the internal table.
--   3. Service Role:
--      - Bypasses RLS strictly in server-side Edge Functions.
-- ============================================================

-- ─── 1. Explicitly drop legacy/obsolete policies ────────────────────────────

DROP POLICY IF EXISTS "customers_can_create_orders" ON orders;
DROP POLICY IF EXISTS "customers_can_view_own_order" ON orders;
DROP POLICY IF EXISTS "deny_anon_update_orders" ON orders;
DROP POLICY IF EXISTS "deny_anon_delete_orders" ON orders;
DROP POLICY IF EXISTS "deny_anon_all_payments" ON payments;

-- ─── 2. Explicit SQL Table Grants (Defense in Depth) ────────────────────────

-- Revoke all public/anon access to sensitive business tables
REVOKE ALL ON TABLE customers FROM anon, public;
REVOKE ALL ON TABLE orders FROM anon, public;
REVOKE ALL ON TABLE order_photos FROM anon, public;
REVOKE ALL ON TABLE payments FROM anon, public;
REVOKE ALL ON TABLE order_status_history FROM anon, public;
REVOKE ALL ON TABLE shipments FROM anon, public;
REVOKE ALL ON TABLE admin_profiles FROM anon, public;

-- Grant operational permissions to authenticated users and service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE customers TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE orders TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE order_photos TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE payments TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE order_status_history TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE shipments TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE admin_profiles TO authenticated, service_role;

GRANT USAGE, SELECT ON SEQUENCE order_number_seq TO authenticated, service_role;

-- ─── 3. Enable RLS on every table ──────────────────────────────────────────

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- ─── 4. Trusted Authorization Helper Function ──────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('super_admin', 'artist', 'support')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND role = 'super_admin'
  );
$$;

-- ─── 5. Anonymous Policies (Zero Anonymous Access to Master Tables) ────────

-- Explicitly reject all anonymous direct queries
DROP POLICY IF EXISTS "deny_anon_customers" ON customers;
CREATE POLICY "deny_anon_customers" ON customers FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "deny_anon_orders" ON orders;
CREATE POLICY "deny_anon_orders" ON orders FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "deny_anon_photos" ON order_photos;
CREATE POLICY "deny_anon_photos" ON order_photos FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "deny_anon_payments" ON payments;
CREATE POLICY "deny_anon_payments" ON payments FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "deny_anon_history" ON order_status_history;
CREATE POLICY "deny_anon_history" ON order_status_history FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "deny_anon_shipments" ON shipments;
CREATE POLICY "deny_anon_shipments" ON shipments FOR ALL TO anon USING (false);

DROP POLICY IF EXISTS "deny_anon_profiles" ON admin_profiles;
CREATE POLICY "deny_anon_profiles" ON admin_profiles FOR ALL TO anon USING (false);

-- ─── 6. Authenticated Staff & Administrator Policies ───────────────────────

-- Admin Profiles
DROP POLICY IF EXISTS "admins_can_view_profiles" ON admin_profiles;
CREATE POLICY "admins_can_view_profiles"
  ON admin_profiles FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "super_admins_can_manage_profiles" ON admin_profiles;
CREATE POLICY "super_admins_can_manage_profiles"
  ON admin_profiles FOR ALL TO authenticated
  USING (public.is_super_admin());

-- Customers
DROP POLICY IF EXISTS "admins_can_view_customers" ON customers;
CREATE POLICY "admins_can_view_customers"
  ON customers FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admins_can_manage_customers" ON customers;
CREATE POLICY "admins_can_manage_customers"
  ON customers FOR ALL TO authenticated
  USING (public.is_super_admin());

-- Orders
DROP POLICY IF EXISTS "admins_can_view_orders" ON orders;
CREATE POLICY "admins_can_view_orders"
  ON orders FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admins_can_update_orders" ON orders;
CREATE POLICY "admins_can_update_orders"
  ON orders FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Order Photos
DROP POLICY IF EXISTS "admins_can_view_photos" ON order_photos;
CREATE POLICY "admins_can_view_photos"
  ON order_photos FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admins_can_manage_photos" ON order_photos;
CREATE POLICY "admins_can_manage_photos"
  ON order_photos FOR ALL TO authenticated
  USING (public.is_admin());

-- Payments
DROP POLICY IF EXISTS "admins_can_view_payments" ON payments;
CREATE POLICY "admins_can_view_payments"
  ON payments FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admins_can_manage_payments" ON payments;
CREATE POLICY "admins_can_manage_payments"
  ON payments FOR ALL TO authenticated
  USING (public.is_super_admin());

-- Order Status History
DROP POLICY IF EXISTS "admins_can_view_status_history" ON order_status_history;
CREATE POLICY "admins_can_view_status_history"
  ON order_status_history FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admins_can_insert_status_history" ON order_status_history;
CREATE POLICY "admins_can_insert_status_history"
  ON order_status_history FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Shipments
DROP POLICY IF EXISTS "admins_can_view_shipments" ON shipments;
CREATE POLICY "admins_can_view_shipments"
  ON shipments FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admins_can_manage_shipments" ON shipments;
CREATE POLICY "admins_can_manage_shipments"
  ON shipments FOR ALL TO authenticated
  USING (public.is_admin());

COMMENT ON FUNCTION public.is_admin() IS 'Security Definer check for authorized active staff in admin_profiles.';
COMMENT ON FUNCTION public.is_super_admin() IS 'Security Definer check for super_admin privileges.';
