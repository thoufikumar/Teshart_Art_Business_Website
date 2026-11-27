# Teshart — Backend Implementation Log

## Phase 1 — Supabase Infrastructure Setup

**Date:** 2026-11-20  
**Status:** In Progress

### Goals
- [x] Supabase browser client (anon key, typed)
- [x] Environment variable loader with validation
- [x] Database types matching schema
- [x] Database migration: initial schema
- [x] Database migration: RLS policies
- [x] Database migration: storage bucket configuration
- [x] Infrastructure repository interfaces
- [x] Shared Result<T,E> type and AppError hierarchy
- [x] Architecture documentation
- [ ] Manual Supabase dashboard steps (see below)

### Manual Supabase Steps Required After Phase 1

1. **Apply migrations** in Supabase SQL Editor (or via Supabase CLI):
   ```
   supabase/migrations/20261120000001_initial_schema.sql
   supabase/migrations/20261120000002_rls_policies.sql
   supabase/migrations/20261120000003_storage_buckets.sql
   ```

2. **Confirm Storage bucket** named `customer-photos` is created as **private**.

3. **Verify RLS** is enabled on the `orders` table (Dashboard → Table Editor → orders → RLS).

4. **Service role key**: Store in Supabase Edge Function secrets (never in `src/`).
   - Key name: `SUPABASE_SERVICE_ROLE_KEY`
   - Set via: Supabase Dashboard → Edge Functions → Secrets

5. **Move `.env.local`** from `src/.env.local` to the project root (`.env.local`)
   so Vite picks it up automatically. The file in `src/` is non-standard.

### Files Created in Phase 1

```
src/app/config/env.ts
src/infrastructure/supabase/client.ts
src/infrastructure/supabase/types.ts
src/shared/errors/AppError.ts
src/shared/types/result.ts
src/shared/utils/generateOrderNumber.ts
src/shared/utils/generateTrackingToken.ts
supabase/migrations/20261120000001_initial_schema.sql
supabase/migrations/20261120000002_rls_policies.sql
supabase/migrations/20261120000003_storage_buckets.sql
docs/architecture/ARCHITECTURE.md
docs/backend/PHASE_LOG.md
```

### No Frontend Changes
Zero modifications to `src/App.tsx`, `src/domain/`, `src/state/`, or any
UI component. The existing checkout flow continues to function as a prototype.
