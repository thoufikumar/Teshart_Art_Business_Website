-- ============================================================
-- Migration: 20261120000003_storage_buckets.sql
-- Teshart — Private Customer Photo Storage
-- ============================================================

INSERT INTO storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
VALUES (
    'customer-photos',
    'customer-photos',
    false,
    10485760,
    ARRAY['image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE
SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png'];