# Teshart Website — Product Requirements
Version: 0.1 — Initiation Phase

## 1. Users

### Customer
A person purchasing a custom artwork.

Needs:
- understand what Teshart does quickly;
- see evidence of real work;
- understand price, process and delivery;
- upload a photograph;
- configure an artwork;
- pay safely;
- know what happens after payment;
- track the order.

### Admin
The business operator.

Needs:
- see incoming orders;
- verify payment;
- access customer details and source photo;
- manage artwork progress;
- manage gallery and testimonials;
- manage products/pricing;
- manage shipment information.

### Artist
A person creating the commissioned artwork.

V1 can use the admin system rather than a separate artist application.

## 2. Public website

Required pages:
- Home
- Product/detail pages
- Create My Keepsake
- Gallery
- How It Works
- FAQ
- About
- Contact
- Order tracking
- Legal/policy pages

## 3. Core order flow

1. Upload your photo
2. Choose what you want created
3. Choose artwork size
4. Choose finish
5. Enter delivery details
6. Review your order
7. Pay
8. Order confirmed
9. Track order

## 4. Homepage sections

The current UX direction contains:
- restrained premium header
- hero with primary CTA
- trust/statistics strip
- simple four-step process
- real artworks / customer gallery
- customer words/testimonials
- trust/reassurance section
- FAQ
- final emotional CTA
- footer

The page should sell the outcome and trust before asking the visitor to configure an order.

## 5. Functional requirements

### FR-01 — Product discovery
Visitors can understand available artwork types, approximate pricing and process.

### FR-02 — Photo upload
Customer can upload an image with validation for supported format and size.

### FR-03 — Configuration
Customer can choose available artwork type, size and finish.

### FR-04 — Dynamic price
Price updates according to selected configuration.

### FR-05 — Draft persistence
Customer selections should survive moving backward through the wizard. A reasonable recovery mechanism should exist if the browser refreshes.

### FR-06 — Delivery details
Customer can enter and validate delivery information.

### FR-07 — Review
Customer can review artwork, image, configuration, delivery and total price before payment.

### FR-08 — Payment
Customer can complete online payment through the selected gateway.

### FR-09 — Payment verification
Server verifies payment independently of the browser's success state.

### FR-10 — Order creation
A verified payment creates/activates the corresponding order.

### FR-11 — Order confirmation
Customer receives an order number and clear next steps.

### FR-12 — Order tracking
Customer can see the current order status.

### FR-13 — Admin order management
Admin can view, filter and update orders.

### FR-14 — Artwork management
Admin/artist can attach previews/final artwork and update production status.

### FR-15 — Gallery management
Admin can publish/unpublish portfolio items.

### FR-16 — Review management
Reviews require moderation before publication.

### FR-17 — Shipment management
Admin can add courier and tracking information.

### FR-18 — Notifications
Important order/payment/shipping events should be capable of triggering customer notifications.

## 6. Non-functional requirements

- responsive from small mobile screens upward;
- accessible keyboard/focus behavior;
- semantic HTML;
- strong contrast and readable typography;
- secure handling of uploaded images;
- server-side authorization;
- reliable payment webhooks;
- fast image loading;
- SEO-friendly public pages;
- meaningful error messages;
- recoverable checkout states.

## 7. Acceptance principle
A feature is not complete merely because the UI renders. It is complete when:
UI + validation + persistence + backend behavior + error state + security + mobile behavior + relevant analytics are working.
