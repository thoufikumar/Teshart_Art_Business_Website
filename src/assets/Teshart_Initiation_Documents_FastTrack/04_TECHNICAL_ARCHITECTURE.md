# Teshart — Technical Architecture
Version: 0.1 — Initiation Phase

## 1. Proposed stack

### Frontend/application
- Next.js
- React
- TypeScript

### Styling
- Tailwind CSS or an equivalent token-based styling system

### Database
- PostgreSQL
- Prisma ORM

### File storage
- Private object storage with signed uploads/downloads

### Payment
- Razorpay for initial India-focused implementation

### Deployment
- Vercel or equivalent Next.js-compatible platform

### Source control
- Git + GitHub

## 2. High-level architecture

```text
Browser
   │
   ▼
Next.js application
   │
   ├── Public pages / SEO
   ├── Customer order wizard
   ├── Customer tracking
   ├── Admin UI
   └── Server/API layer
          │
          ├── PostgreSQL
          ├── Object storage
          ├── Razorpay
          └── Notification provider
```

## 3. Domain modules

```text
auth
customers
catalogue
orders
payments
artworks
shipments
gallery
reviews
notifications
analytics
seo
admin
```

Keep business logic in domain/service modules rather than putting everything into UI components.

## 4. Proposed entities

```text
User
Customer
Product
ProductVariant
Order
OrderItem
Address
Payment
Artwork
Shipment
GalleryItem
Review
Notification
AuditLog
```

## 5. Security boundaries

Public:
- public catalogue;
- public gallery;
- public FAQ/content.

Authenticated/customer:
- own order;
- own uploaded photo;
- own delivery information.

Admin/artist:
- operational data according to role.

Private infrastructure:
- payment secrets;
- database credentials;
- storage credentials;
- webhook secrets.

## 6. Image upload architecture

Preferred flow:

```text
Client
  ↓
request signed upload
  ↓
server authorizes request
  ↓
storage upload
  ↓
store private object reference
```

Avoid routing large original images through the application server unless required.

## 7. Payment architecture

```text
Customer
  ↓
Server creates gateway order
  ↓
Gateway checkout
  ↓
Payment
  ↓
Gateway response
  ↓
Server-side verification
  ↓
Webhook verification
  ↓
Payment record
  ↓
Order state transition
```

## 8. Idempotency
Payment callbacks, webhooks and order creation operations must be safe to retry.

## 9. Environment separation

```text
local
staging
production
```

Never use production payment credentials during development.

## 10. Logging
Log operational events without logging:
- passwords;
- payment secrets;
- private image contents;
- unnecessary personal data.

## 11. Backups
Database backups must exist before production launch. Recovery procedures should be documented and periodically tested.

## 12. Architectural constraint
Do not introduce microservices in V1. A modular monolith is sufficient.

## 13. Future-proofing
The architecture should allow:
- additional payment methods;
- additional products;
- multiple artists;
- additional notification providers;
- coupon/discount logic;
- additional countries later.

Do not implement those future systems until required.
