# Teshart — Backend Architecture

Version: 1.0  
Status: Authoritative  
Last updated: 2026-11-20

---

## 1. Overview

Teshart is a **modular monolith** built as a Vite + React 19 SPA with a
Supabase backend (PostgreSQL, Storage, Auth, Edge Functions). The frontend and
backend are **in one repository** but are separated by clear dependency
boundaries enforced by folder conventions and TypeScript module isolation.

There is no Next.js, no microservices, no separate API server in V1.

---

## 2. Dependency Direction

```
UI Components
    │  (uses)
    ▼
Features / State
    │  (calls)
    ▼
Application Layer (use-cases, services)
    │  (implements via)
    ▼
Infrastructure (Supabase, Storage, adapters)
    │
    ▼
Supabase (PostgreSQL · Storage · Edge Functions)

Domain Layer ─── no dependencies on any of the above
```

### Rules enforced by convention

| Layer | May import from | Must NOT import from |
|---|---|---|
| `domain/` | Nothing outside `domain/` | React, Supabase, Razorpay, any infrastructure |
| `application/` | `domain/`, `shared/` | Supabase SDK directly, React |
| `infrastructure/` | `domain/`, `application/`, `shared/` | React UI components |
| `features/` | `application/`, `domain/`, `shared/`, `components/` | Infrastructure directly |
| `components/` | `shared/`, `domain/` (types only), `components/` | Supabase SDK, database queries, pricing logic |
| `state/` | `domain/`, `application/`, `shared/` | Supabase SDK directly |
| Edge Functions | Nothing in `src/` (self-contained) | Browser APIs |

---

## 3. Folder Map (Current → Target)

### Existing folders — preserved as-is

```
src/
  domain/           ← KEEP. Existing catalogue, pricing, order, validation, artworkRegistry
  state/            ← KEEP. OrderContext.tsx stays; SupabaseOrderContext added alongside
  config/           ← KEEP. routes.ts stays
  components/       ← KEEP. All UI components untouched
  assets/           ← KEEP. All artwork images
```

### New folders added in this implementation

```
src/
  infrastructure/
    supabase/
      client.ts         ← Supabase browser client (anon key only)
      types.ts          ← Generated/hand-written database types
      repositories/
        OrderRepository.ts
        PhotoRepository.ts
      storage/
        PhotoStorageService.ts

  shared/
    errors/
      AppError.ts       ← Base error class hierarchy
    types/
      result.ts         ← Result<T,E> type for explicit error handling
    utils/
      generateOrderNumber.ts
      generateTrackingToken.ts
    validation/
      (re-exports from domain/validation.ts — no duplication)

  app/
    providers/
      SupabaseProvider.tsx   ← Supabase client context
    config/
      env.ts                 ← Validated env-var loader (throws at startup if missing)

supabase/
  migrations/
    20261120000001_initial_schema.sql
    20261120000002_rls_policies.sql
    20261120000003_storage_buckets.sql
  functions/
    (Edge Functions added in Phase 2+)

docs/
  architecture/
    ARCHITECTURE.md   ← this file
  backend/
    PHASE_LOG.md      ← implementation log
```

---

## 4. Module Responsibilities

| Module | Single Responsibility |
|---|---|
| `domain/catalogue.ts` | Authoritative product catalogue (types, sizes, finishes, prices) |
| `domain/pricing.ts` | Price calculation engine — pure functions, no I/O |
| `domain/order.ts` | Order entity types, lifecycle states, tracking milestones |
| `domain/validation.ts` | Input validation rules — pure functions |
| `infrastructure/supabase/client.ts` | Create and export a single typed Supabase browser client |
| `infrastructure/supabase/types.ts` | TypeScript types matching the Supabase database schema |
| `infrastructure/supabase/repositories/OrderRepository.ts` | CRUD for orders table via Supabase |
| `infrastructure/supabase/repositories/PhotoRepository.ts` | Signed URL generation for photo storage |
| `infrastructure/supabase/storage/PhotoStorageService.ts` | Upload customer photos to private Supabase Storage |
| `app/providers/SupabaseProvider.tsx` | React context providing the Supabase client instance |
| `app/config/env.ts` | Load and validate environment variables at startup |
| `shared/errors/AppError.ts` | Structured error types used across the application |
| `shared/types/result.ts` | `Result<T, E>` discriminated union for explicit error handling |
| `shared/utils/generateOrderNumber.ts` | Deterministic human-readable order number (TSH-XXXXXX) |
| `shared/utils/generateTrackingToken.ts` | Cryptographically secure tracking token + hash pair |
| `supabase/migrations/` | Version-controlled database migrations (never modified in place) |

---

## 5. Database Schema Summary

See migration files for exact DDL. Logical summary:

```
customers
  id                    UUID PK
  full_name             TEXT
  mobile                TEXT (normalized index)
  email                 TEXT
  created_at / updated_at TIMESTAMPTZ

orders
  id                    UUID PK
  order_number          TEXT UNIQUE (TSH-XXXXXX, generated via PG sequence)
  customer_id           UUID FK → customers.id
  portrait_type         TEXT CHECK ('single', 'duo', 'family')
  size                  TEXT CHECK ('A5', 'A4', 'A3')
  finish                TEXT CHECK ('unframed', 'framed')
  pricing_snapshot      JSONB (immutable line-item breakdown)
  subtotal_amount_paise BIGINT
  delivery_fee_paise    BIGINT
  total_amount_paise    BIGINT
  advance_amount_paise  BIGINT
  remaining_amount_paise BIGINT
  currency              TEXT ('INR')
  customer_name_snapshot TEXT
  customer_mobile_snapshot TEXT
  customer_email_snapshot TEXT
  delivery_address_line TEXT
  delivery_city         TEXT
  delivery_state        TEXT
  delivery_pincode      TEXT
  instructions          TEXT
  order_status          TEXT (validated enum)
  payment_status        TEXT (validated enum)
  payment_method        TEXT ('upi', 'card', 'netbanking')
  tracking_token_hash   TEXT UNIQUE (SHA-256)
  idempotency_key       TEXT UNIQUE
  created_at / updated_at TIMESTAMPTZ

order_photos
  id                    UUID PK
  order_id              UUID FK → orders.id (ON DELETE CASCADE)
  storage_path          TEXT
  original_filename     TEXT
  mime_type             TEXT ('image/jpeg', 'image/png')
  file_size_bytes       BIGINT
  is_primary            BOOLEAN
  created_at            TIMESTAMPTZ

payments
  id                    UUID PK
  order_id              UUID FK → orders.id
  gateway               TEXT ('razorpay')
  gateway_order_id      TEXT
  gateway_payment_id    TEXT
  amount_paise          BIGINT
  currency              TEXT ('INR')
  payment_stage         TEXT ('advance', 'balance', 'full', 'refund')
  status                TEXT (validated enum)
  idempotency_key       TEXT UNIQUE
  verified_at           TIMESTAMPTZ
  created_at / updated_at TIMESTAMPTZ

order_status_history
  id                    UUID PK
  order_id              UUID FK → orders.id
  from_status           TEXT
  to_status             TEXT
  changed_by            TEXT
  notes                 TEXT
  created_at            TIMESTAMPTZ

shipments
  id                    UUID PK
  order_id              UUID FK → orders.id
  courier_name          TEXT
  tracking_number       TEXT
  tracking_url          TEXT
  dispatched_at / delivered_at TIMESTAMPTZ
  created_at / updated_at TIMESTAMPTZ

admin_profiles
  id                    UUID PK REFERENCES auth.users.id
  role                  TEXT ('super_admin', 'artist', 'support')
  full_name             TEXT
  is_active             BOOLEAN
  created_at / updated_at TIMESTAMPTZ
```

---

## 6. Security Model (Zero Trust)

| Concern | Mechanism |
|---|---|
| Anon key exposure | Supabase anon key has ZERO direct SELECT, INSERT, UPDATE, DELETE permissions on database tables |
| Order creation | Orchestrated strictly via server-side `create-order` Edge Function |
| Price manipulation | Server recalculates price from catalogue using `pricing.ts`; client price is ignored |
| Customer PII protection | Zero anonymous SELECT permissions. Sensitive tables cannot be queried by browser |
| Order tracking | `track-order` Edge Function verifies SHA-256 token hash & returns only customer-safe milestone data |
| Service role key | Exclusively server-side in Edge Functions; never bundled into frontend |
| Customer photo privacy | Storage bucket is private; anonymous read/write is completely denied |
| Photo uploads | Authorized server-side via `authorize-photo-upload` returning short-lived signed URLs |
| Admin authentication | Server-controlled RBAC in `admin_profiles` verified via `public.is_admin()` Security Definer |
| Tracking token | Cryptographically random 32 bytes (256-bit entropy); only SHA-256 hash stored in DB |

---

## 7. RLS Policy Summary

```
All tables (orders, customers, order_photos, payments, history, shipments, admin_profiles):
  ANON:
    ALL operations DENIED (USING false). Direct browser queries return empty/error.
  AUTHENTICATED STAFF:
    SELECT, UPDATE, INSERT allowed if public.is_admin() evaluates to true.
    Destructive operations restricted to public.is_super_admin().

photos bucket (customer-photos):
  ANON:
    Direct upload & read DENIED.
  AUTHENTICATED STAFF:
    Read/manage allowed if public.is_admin() evaluates to true.
  UPLOAD:
    Server-generated signed upload URLs only (no client upsert).
```

---

## 8. Testing Strategy

| Layer | Method | Location |
|---|---|---|
| Domain / pricing | Custom test runner (existing) | `src/domain/pricing.test.ts` |
| Validation rules | Same runner, extended | `src/domain/validation.test.ts` (Phase 2) |
| Repository | Supabase local dev or mock | `src/infrastructure/supabase/repositories/*.test.ts` (Phase 3) |
| Order lifecycle | Pure unit tests on domain types | `src/domain/order.test.ts` (Phase 2) |
| Edge Functions | Deno test runner | `supabase/functions/*/index.test.ts` (Phase 3) |
| Build verification | `npm run build` after every phase | CI step |
| Type checking | `npx tsc --noEmit` | CI step |

---

## 9. Implementation Sequence

| Phase | Scope |
|---|---|
| **Phase 1** ✅ | Supabase client · env config · database schema · RLS · private storage · infrastructure types |
| Phase 2 | Photo upload (replace blob URL with Supabase Storage) · Order creation API |
| Phase 3 | Razorpay payment integration · Edge Functions · webhook handler |
| Phase 4 | Order tracking by token · confirmation page wired to real order |
| Phase 5 | Admin dashboard · order status update · photo access |
| Phase 6 | Notifications (WhatsApp/email) · draft persistence |
| Phase 7 | SEO · Analytics · Legal pages |

---

## 10. Architectural Risks

| Risk | Mitigation |
|---|---|
| Single App.tsx monolith (2352 lines) | Do not refactor aggressively; add backend wiring incrementally alongside existing UI |
| `src/.env.local` path is non-standard | Vite resolves `.env.local` at root; file moved to root in Phase 1 |
| No test runner installed | pricing.test.ts uses a custom runner; Vitest added in Phase 2 |
| Supabase anon key in `VITE_` prefix | Intentional — anon key is public; service role key must never use `VITE_` prefix |
| Figma Make deployment environment | Env vars must be set in Figma Make project settings for production |
| Tracking token security | Token generated client-side before Phase 3 is a placeholder; must move to Edge Function |
