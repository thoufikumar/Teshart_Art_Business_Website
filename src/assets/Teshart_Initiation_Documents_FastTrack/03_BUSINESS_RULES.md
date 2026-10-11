# Teshart — Business Rules
Version: 0.1 — Initiation Phase

## 1. Order truth
The backend/database is the source of truth.

Frontend state must never independently declare an order as paid, shipped or delivered.

## 2. Order lifecycle

```text
DRAFT
→ CONFIGURED
→ PAYMENT_PENDING
→ PAYMENT_VERIFIED
→ ORDER_CONFIRMED
→ ARTWORK_QUEUED
→ IN_PROGRESS
→ QUALITY_CHECK
→ PACKED
→ SHIPPED
→ OUT_FOR_DELIVERY
→ DELIVERED
```

Exception states:
```text
PAYMENT_FAILED
CANCELLED
REFUND_REQUESTED
REFUNDED
```

Only authorized roles can perform state transitions.

## 3. Payment rules
- Every payment attempt belongs to an internal order/payment record.
- Gateway identifiers must be stored.
- Payment signatures/webhooks must be verified server-side.
- Never trust a client-side success message.
- Duplicate webhook delivery must be idempotent.
- A successful payment must not accidentally create duplicate orders.
- Failed payments should not destroy the customer's configured draft.

## 4. Pricing rules
- Product/variant price is stored server-side.
- Client-provided price is informational only.
- Final amount is recalculated on the server before payment creation.
- Delivery charges and discounts are calculated server-side.
- Currency: INR for the initial India-focused implementation.

## 5. Customer photo rules
- Source photos are private by default.
- Public portfolio use requires explicit permission.
- Access should be authorized.
- Public gallery images must not expose private storage URLs unnecessarily.
- Deleted/cancelled orders require a defined retention policy before launch.

## 6. Gallery rules
Only approved content can become public.
Each gallery item should have an internal record indicating whether customer permission exists.

## 7. Review rules
Reviews are moderated before appearing publicly.

## 8. Admin rules
Admin can:
- view orders;
- update operational status;
- manage catalogue;
- manage gallery;
- moderate reviews;
- manage shipment information.

Admin actions affecting payments/refunds should be auditable.

## 9. Customer rules
Customers can:
- create orders;
- view their own order information;
- access their own tracking information.

Customers must never be able to access another customer's order, image or delivery information.

## 10. Pricing/product changes
Changing a product price must not silently change the price of already-paid orders. Historical order data must retain the price used at purchase.

## 11. Cancellation/refund
Exact cancellation/refund policy is a business decision that must be documented before production launch. The system must support the policy rather than inventing one.

## 12. Notifications
Notifications should be triggered from meaningful backend state changes, not arbitrary frontend button clicks.

## 13. Auditability
Important administrative actions should record:
- who performed the action;
- what changed;
- when it changed.
