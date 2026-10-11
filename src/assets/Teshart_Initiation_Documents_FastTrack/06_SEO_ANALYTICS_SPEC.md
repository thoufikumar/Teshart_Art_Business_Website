# Teshart — SEO & Analytics Initiation Specification
Version: 0.1 — Initiation Phase

## 1. SEO objective
Make Teshart discoverable for relevant custom-art and personalized-gift searches while keeping the website useful to real customers.

## 2. Public URL structure

```text
/
/couple-portrait
/family-portrait
/pencil-portrait
/pet-portrait
/custom-artwork
/gallery
/how-it-works
/faq
/about
/contact
/order/[order-number]
```

Private/admin routes must not be indexed.

## 3. Metadata requirements
Every indexable page should have:
- unique title;
- useful meta description;
- canonical URL;
- Open Graph metadata;
- appropriate social preview image;
- semantic heading structure.

## 4. Structured data
Where appropriate:
- Product
- Offer
- BreadcrumbList
- Organization/LocalBusiness where accurate
- FAQ structured data only when eligible and genuinely represented on-page.

Do not generate structured data that contradicts visible content.

## 5. Product SEO
Each product page should expose:
- product name;
- description;
- images;
- price;
- currency;
- availability;
- variants where applicable.

## 6. Technical SEO
Required:
- sitemap.xml;
- robots.txt;
- canonical URLs;
- clean URLs;
- 404 page;
- redirects where required;
- optimized images;
- alt text;
- mobile-friendly rendering;
- HTTPS;
- indexability controls.

## 7. Performance
Targets should prioritize:
- fast mobile first paint;
- optimized images;
- minimal unnecessary JavaScript;
- stable layout;
- sensible font loading;
- caching.

Do not treat a Lighthouse score as the only definition of performance.

## 8. Analytics events

### Acquisition
```text
page_view
landing_page_view
```

### Funnel
```text
create_keepsake_clicked
order_started
photo_upload_started
photo_uploaded
artwork_type_selected
size_selected
finish_selected
delivery_completed
review_viewed
checkout_started
payment_started
payment_success
payment_failed
order_confirmed
```

### Post-purchase
```text
tracking_viewed
gallery_clicked
review_submitted
```

## 9. Funnel analysis
The core funnel is:

```text
Landing
 ↓
Create Keepsake
 ↓
Order started
 ↓
Photo uploaded
 ↓
Configuration complete
 ↓
Checkout
 ↓
Payment
 ↓
Confirmed order
```

The goal is to identify where customers stop, not simply maximize page views.

## 10. Search Console
Before launch:
- verify domain;
- submit sitemap;
- inspect important URLs;
- monitor indexing;
- monitor search performance and page issues.

## 11. Privacy
Analytics must be implemented consistently with the site's privacy/legal requirements. Avoid collecting unnecessary personal information.
