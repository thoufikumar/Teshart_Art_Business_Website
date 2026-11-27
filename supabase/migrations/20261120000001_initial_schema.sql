-- ============================================================
-- Migration: 20261120000001_initial_schema.sql
-- Teshart — Secure Database Schema (Production-Grade Foundation)
--
-- Tables:
--   1. customers             - Customer CRM master & contact identity
--   2. orders                - Order master with immutable delivery snapshot & integer paise amounts
--   3. order_photos          - Multi-photo reference attachments per order
--   4. payments              - Multi-stage payment records (advance, balance, full, refund)
--   5. order_status_history  - Immutable lifecycle audit trail
--   6. shipments             - Courier & delivery logistics tracking
--   7. admin_profiles        - Server-controlled staff & administrator role mappings
--
-- Security & Data Integrity Principles:
--   - UUIDs for internal primary keys
--   - All monetary amounts stored as BIGINT in integer paise (1 INR = 100 paise)
--   - Immutable point-in-time snapshot of pricing and customer delivery contact on each order
--   - Tracking tokens are NEVER stored raw; only SHA-256 hex hashes are persisted
--   - Atomic order number generation via PostgreSQL sequence and dedicated generator
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. customers ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS customers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name             TEXT NOT NULL,
  mobile                TEXT NOT NULL,
  email                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Normalized mobile index: strip spaces, dashes, leading +91 for uniqueness matching
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_normalized_mobile
  ON customers (regexp_replace(mobile, '\D', '', 'g'));

CREATE INDEX IF NOT EXISTS idx_customers_email
  ON customers (lower(trim(email)))
  WHERE email IS NOT NULL;

-- ─── 2. orders ──────────────────────────────────────────────────────────────

-- Atomic order sequence for human-readable numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 10001 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS orders (
  -- Identity
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number              TEXT NOT NULL UNIQUE,  -- e.g. TSH-10001 or TSH-XXXXXX
  customer_id               UUID REFERENCES customers(id) ON DELETE RESTRICT,

  -- Product configuration
  portrait_type             TEXT NOT NULL CHECK (portrait_type IN ('single', 'duo', 'family')),
  size                      TEXT NOT NULL CHECK (size IN ('A5', 'A4', 'A3')),
  finish                    TEXT NOT NULL CHECK (finish IN ('unframed', 'framed')),

  -- Immutable pricing snapshot JSONB (audit record of line items)
  pricing_snapshot          JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Authoritative financial amounts (INTEGER PAISE: 1 INR = 100 paise)
  subtotal_amount_paise     BIGINT NOT NULL CHECK (subtotal_amount_paise >= 0),
  delivery_fee_paise        BIGINT NOT NULL DEFAULT 0 CHECK (delivery_fee_paise >= 0),
  total_amount_paise        BIGINT NOT NULL CHECK (total_amount_paise > 0),
  advance_amount_paise      BIGINT NOT NULL CHECK (advance_amount_paise >= 0 AND advance_amount_paise <= total_amount_paise),
  remaining_amount_paise    BIGINT NOT NULL CHECK (remaining_amount_paise >= 0),
  currency                  TEXT NOT NULL DEFAULT 'INR',

  -- Immutable customer & delivery snapshot at checkout time
  customer_name_snapshot    TEXT NOT NULL,
  customer_mobile_snapshot  TEXT NOT NULL,
  customer_email_snapshot   TEXT,
  delivery_address_line     TEXT NOT NULL,
  delivery_city             TEXT NOT NULL,
  delivery_state            TEXT NOT NULL,
  delivery_pincode          TEXT NOT NULL,
  instructions              TEXT NOT NULL DEFAULT '',

  -- Lifecycle states
  order_status              TEXT NOT NULL DEFAULT 'DRAFT'
                              CHECK (order_status IN (
                                'DRAFT', 'CONFIGURED', 'PAYMENT_PENDING', 'PAYMENT_VERIFIED',
                                'ORDER_CONFIRMED', 'ARTWORK_QUEUED', 'IN_PROGRESS',
                                'QUALITY_CHECK', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY',
                                'DELIVERED', 'PHOTO_CHANGE_REQUIRED', 'PAYMENT_FAILED',
                                'CUSTOMER_UNRESPONSIVE', 'ON_HOLD', 'CANCELLED',
                                'DELIVERY_FAILED', 'RETURNED', 'REFUND_REQUESTED', 'REFUNDED'
                              )),

  payment_status            TEXT NOT NULL DEFAULT 'UNPAID'
                              CHECK (payment_status IN (
                                'UNPAID', 'PENDING', 'ADVANCE_PAID', 'FULLY_PAID',
                                'FAILED', 'REFUNDED'
                              )),

  payment_method            TEXT NOT NULL DEFAULT 'upi'
                              CHECK (payment_method IN ('upi', 'card', 'netbanking')),

  -- Customer tracking: only the SHA-256 hash is stored
  tracking_token_hash       TEXT NOT NULL UNIQUE,

  -- Idempotency key for preventing duplicate orders on checkout retries
  idempotency_key           TEXT UNIQUE,

  -- Timestamps
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Integrity check: total = advance + remaining
DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT chk_orders_amounts_balance
    CHECK (total_amount_paise = advance_amount_paise + remaining_amount_paise);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Format constraints
DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT chk_orders_delivery_mobile
    CHECK (customer_mobile_snapshot ~ '^(91)?[6-9][0-9]{9}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT chk_orders_delivery_pincode
    CHECK (delivery_pincode ~ '^[1-9][0-9]{5}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT chk_orders_tracking_token_hash
    CHECK (tracking_token_hash ~ '^[0-9a-f]{64}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id
  ON orders (customer_id);

CREATE INDEX IF NOT EXISTS idx_orders_tracking_token_hash
  ON orders (tracking_token_hash);

CREATE INDEX IF NOT EXISTS idx_orders_status_created
  ON orders (order_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON orders (created_at DESC);

-- ─── 3. order_photos ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS order_photos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  storage_path          TEXT NOT NULL,
  original_filename     TEXT NOT NULL,
  mime_type             TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png')),
  file_size_bytes       BIGINT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 10485760),
  is_primary            BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_photos_order_id
  ON order_photos (order_id);

-- ─── 4. payments ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,

  -- Gateway
  gateway               TEXT NOT NULL DEFAULT 'razorpay',
  gateway_order_id      TEXT NOT NULL,
  gateway_payment_id    TEXT,

  -- Monetary amount
  amount_paise          BIGINT NOT NULL CHECK (amount_paise > 0),
  currency              TEXT NOT NULL DEFAULT 'INR',

  -- Payment stage (essential for 50% advance / 50% delivery balance)
  payment_stage         TEXT NOT NULL DEFAULT 'advance'
                          CHECK (payment_stage IN ('advance', 'balance', 'full', 'refund')),

  status                TEXT NOT NULL DEFAULT 'PENDING'
                          CHECK (status IN (
                            'UNPAID', 'PENDING', 'ADVANCE_PAID', 'FULLY_PAID',
                            'FAILED', 'REFUNDED'
                          )),

  -- Idempotency key for webhook retries
  idempotency_key       TEXT NOT NULL UNIQUE,

  verified_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id
  ON payments (order_id);

CREATE INDEX IF NOT EXISTS idx_payments_gateway_order_id
  ON payments (gateway_order_id);

-- ─── 5. order_status_history ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS order_status_history (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status           TEXT,
  to_status             TEXT NOT NULL,
  changed_by            TEXT NOT NULL DEFAULT 'system',
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id
  ON order_status_history (order_id, created_at DESC);

-- ─── 6. shipments ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shipments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  courier_name          TEXT NOT NULL,
  tracking_number       TEXT NOT NULL,
  tracking_url          TEXT,
  dispatched_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_order_id
  ON shipments (order_id);

-- ─── 7. admin_profiles ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role                  TEXT NOT NULL DEFAULT 'super_admin'
                          CHECK (role IN ('super_admin', 'artist', 'support')),
  full_name             TEXT NOT NULL,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Triggers & Helper Functions ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS payments_updated_at ON payments;
CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS shipments_updated_at ON shipments;
CREATE TRIGGER shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS admin_profiles_updated_at ON admin_profiles;
CREATE TRIGGER admin_profiles_updated_at
  BEFORE UPDATE ON admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Atomic order number generation function
CREATE OR REPLACE FUNCTION generate_next_order_number(prefix TEXT DEFAULT 'TSH')
RETURNS TEXT AS $$
DECLARE
  seq_val BIGINT;
BEGIN
  seq_val := nextval('order_number_seq');
  RETURN prefix || '-' || lpad(seq_val::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Table and column comments
COMMENT ON TABLE customers IS 'Customer CRM entity. Mobile is normalized for unique lookup.';
COMMENT ON TABLE orders IS 'Primary order master with immutable financial paise amounts and delivery snapshot.';
COMMENT ON TABLE order_photos IS 'Customer reference photographs attached to commissions (supports 1:N).';
COMMENT ON TABLE payments IS 'Multi-stage payment tracking (advance vs delivery balance).';
COMMENT ON TABLE order_status_history IS 'Immutable audit log of all order state transitions.';
COMMENT ON TABLE shipments IS 'Logistics tracking for dispatch and delivery.';
COMMENT ON TABLE admin_profiles IS 'Server-managed staff roles linked to auth.users.';
