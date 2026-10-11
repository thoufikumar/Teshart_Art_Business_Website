# Teshart — Database Blueprint
Version: 0.1 — Initiation Phase

This is the logical blueprint. Exact column types and indexes should be finalized during implementation planning.

## Users
```text
users
- id
- name
- email
- phone
- role
- created_at
- updated_at
```

Roles:
```text
CUSTOMER
ARTIST
ADMIN
```

## Customers
```text
customers
- id
- user_id
- created_at
- updated_at
```

## Products
```text
products
- id
- name
- slug
- description
- category
- base_price
- seo_title
- seo_description
- active
- created_at
- updated_at
```

## Product variants
```text
product_variants
- id
- product_id
- size
- finish
- price
- active
- created_at
- updated_at
```

## Orders
```text
orders
- id
- order_number
- customer_id
- status
- subtotal
- delivery_fee
- discount
- total
- currency
- payment_status
- created_at
- updated_at
```

## Order items
```text
order_items
- id
- order_id
- product_id
- variant_id
- quantity
- unit_price
```

## Addresses
```text
addresses
- id
- customer_id
- name
- phone
- email
- address_line_1
- address_line_2
- city
- state
- pincode
- landmark
```

## Payments
```text
payments
- id
- order_id
- gateway
- gateway_order_id
- gateway_payment_id
- amount
- currency
- status
- verification_reference
- created_at
- updated_at
```

## Artworks
```text
artworks
- id
- order_id
- artist_id
- source_photo_reference
- preview_reference
- final_reference
- status
- notes
- created_at
- updated_at
```

## Shipments
```text
shipments
- id
- order_id
- courier
- tracking_number
- tracking_url
- status
- shipped_at
- delivered_at
```

## Gallery
```text
gallery_items
- id
- artwork_id
- image_reference
- title
- caption
- category
- permission_confirmed
- featured
- published
- display_order
- created_at
```

## Reviews
```text
reviews
- id
- order_id
- customer_id
- rating
- review_text
- image_reference
- status
- featured
- created_at
```

## Audit log
```text
audit_logs
- id
- actor_user_id
- entity_type
- entity_id
- action
- metadata
- created_at
```

## Important relationships

```text
User 1──1 Customer
Customer 1──N Orders
Order 1──N OrderItems
Product 1──N ProductVariants
Order 1──N Payments
Order 1──1 Artwork
Order 1──1 Shipment
Order 1──N? Reviews (business decision; normally one published review per order)
```

## Data principles
- Preserve historical order pricing.
- Use stable internal IDs.
- Use human-readable order numbers separately.
- Do not store raw payment card data.
- Do not store passwords in plaintext.
- Keep private image references separate from public gallery references.
