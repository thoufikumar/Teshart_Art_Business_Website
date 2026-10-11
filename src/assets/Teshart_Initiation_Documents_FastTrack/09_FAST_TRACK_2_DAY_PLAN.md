# Teshart — 2-Day Fast-Track Build Plan
Version: 0.2 — Fast MVP

## Operating constraint

This project is NOT a multi-week production build.

Target:
**A fine, working, adaptable business website within a couple of days.**

The goal is not perfection. The goal is:
- working customer flow;
- real order capture;
- real payment or payment-ready integration;
- usable admin/order handling;
- credible visual design;
- basic SEO;
- safe handling of customer data;
- architecture that can be improved later.

## Core rule

**Do not build infrastructure for problems Teshart does not have yet.**

If a feature can be handled manually by the business during the first few weeks, keep it manual.

---

# DAY 1 — Customer-facing MVP

## Block 1 — Project setup
- Initialize repository.
- Set up Next.js + TypeScript.
- Set up styling/design tokens.
- Set up deployment target.
- Create environment variable structure.
- Add project documentation.

## Block 2 — Homepage
Build only the approved sections:
1. Header
2. Hero
3. Trust/statistics strip
4. How it works
5. Real artworks
6. Testimonials
7. Trust/reassurance
8. FAQ
9. Final CTA
10. Footer

Priority:
**visual fidelity + responsive behavior + CTA clarity**

Do not spend hours perfecting tiny spacing differences.

## Block 3 — Product/order wizard
Implement:

```text
Upload photo
↓
Choose artwork
↓
Choose size
↓
Choose finish
↓
Delivery details
↓
Review
↓
Payment
↓
Confirmation
```

Use one shared order state.

## Block 4 — Backend/data
Use the simplest reliable backend available.

Minimum data:

```text
customers
products
orders
order_items
payments
```

If time is extremely constrained, artwork/shipment/review/gallery can initially be represented by fields or simple tables and expanded later.

## Block 5 — Image upload
Implement:
- upload;
- preview;
- validation;
- storage;
- reference attached to order.

Do not build image AI analysis.

## Block 6 — Payment
Integrate Razorpay if the account/configuration is ready.

Minimum:

```text
Create payment order
→ Checkout
→ Server verification
→ Order confirmed
```

If live payment credentials are not ready:
**build the complete payment integration boundary and use test mode.**

Do not delay the entire website waiting for production payment activation.

---

# DAY 2 — Business operations + launch

## Block 7 — Order/admin screen

Do NOT build a large enterprise dashboard.

Build one useful page:

```text
/admin/orders
```

With:
- order list;
- order details;
- customer details;
- uploaded photo;
- selected artwork;
- size;
- finish;
- payment status;
- order status;
- update status.

That is enough for V1.

## Block 8 — Customer tracking

Build:

```text
/order/[order-number]
```

Show:

```text
Order placed
Payment confirmed
Artwork being created
Packed
Shipped
Delivered
```

Admin status changes should update this automatically.

## Block 9 — Gallery/testimonials

For V1, these can be managed through:
- database records;
- or a simple configuration/content file if admin editing is not yet necessary.

Do not build a CMS.

## Block 10 — SEO essentials

Implement only:

```text
title/meta
canonical
Open Graph
robots.txt
sitemap.xml
semantic headings
alt text
basic Product structured data
```

Create the important indexable product pages.

Do NOT build a blog yet.

## Block 11 — Analytics

Track only the essential funnel:

```text
page_view
create_keepsake_clicked
order_started
photo_uploaded
configuration_completed
checkout_started
payment_success
payment_failed
order_confirmed
```

## Block 12 — QA

Test the complete path:

```text
Mobile visitor
→ homepage
→ create order
→ upload photo
→ configure
→ delivery
→ payment
→ confirmation
→ tracking
```

Then test:
- payment failure;
- refresh during checkout;
- invalid upload;
- mobile viewport;
- direct order URL;
- unauthorized admin access.

## Block 13 — Deploy

Before launch:

- production environment variables;
- database;
- storage;
- payment webhook;
- domain;
- HTTPS;
- sitemap;
- basic analytics;
- privacy/terms/refund/shipping pages.

---

# V1 Architecture Simplification

## Keep

```text
Next.js
TypeScript
PostgreSQL
Prisma
Object storage
Razorpay
GitHub
Vercel
```

## Defer

```text
Artist portal
advanced notifications
WhatsApp automation
coupon engine
customer accounts
advanced shipment integration
CMS
blog
AI image checking
complex analytics
multi-artist marketplace
loyalty
referrals
```

## Manual is acceptable

During V1, the business can manually:
- assign artists;
- communicate through WhatsApp;
- update shipment tracking;
- approve gallery images;
- moderate reviews;
- handle exceptional refunds;
- handle unusual custom requests.

The website only needs to make the normal path reliable.

---

# Fast MVP Definition of Done

The project is launchable when:

### Customer
- [ ] Homepage works
- [ ] Mobile layout works
- [ ] Customer can create an order
- [ ] Customer can upload a photo
- [ ] Customer can configure artwork
- [ ] Customer can enter delivery details
- [ ] Customer can review order
- [ ] Customer can pay/test payment
- [ ] Customer receives order number
- [ ] Customer can track order

### Business
- [ ] Order appears in admin
- [ ] Uploaded photo is accessible securely
- [ ] Payment status is visible
- [ ] Order status can be changed
- [ ] Customer tracking reflects status

### Search
- [ ] Metadata exists
- [ ] Sitemap exists
- [ ] Robots exists
- [ ] Important pages are indexable
- [ ] Product structured data exists where applicable

### Safety
- [ ] Secrets are server-side
- [ ] Payment is server-verified
- [ ] Customer cannot access another customer's order
- [ ] Customer photos are not publicly exposed by default

### Launch
- [ ] Production build succeeds
- [ ] Critical mobile flow tested
- [ ] Payment test completed
- [ ] Production environment configured
- [ ] Domain works

---

# Priority hierarchy

When time becomes tight:

## P0 — Must work
1. Homepage
2. Create order flow
3. Photo upload
4. Configuration
5. Delivery details
6. Payment
7. Order creation
8. Admin order view
9. Order status
10. Customer tracking

## P1 — Should exist
11. Gallery
12. Testimonials
13. FAQ
14. SEO metadata
15. Sitemap
16. Analytics
17. Legal pages

## P2 — Later
18. WhatsApp automation
19. advanced notifications
20. customer accounts
21. artist workspace
22. CMS
23. blog
24. coupons
25. advanced shipment integration
26. AI features

If P0 is working, **launch is acceptable even if P2 is completely absent.**

---

# Antigravity execution rule

Do not ask Antigravity to "build the whole project."

Use short sequential tasks:

```text
Task 01 — initialize project
Task 02 — implement design system
Task 03 — build homepage
Task 04 — build order wizard
Task 05 — connect database
Task 06 — implement upload
Task 07 — implement payment
Task 08 — build admin orders
Task 09 — build tracking
Task 10 — SEO + analytics
Task 11 — QA + fix
Task 12 — production deployment
```

After each task:
1. run the application;
2. inspect the result;
3. fix errors;
4. commit;
5. move to the next task.

## Critical rule

If a task is taking too long, reduce its scope rather than expanding the deadline.

**Working and adaptable > complete and unfinished.**
