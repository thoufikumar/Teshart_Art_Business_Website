# Teshart Website — Project Charter
Version: 0.1 — Initiation Phase
Status: Draft / UX-led

## 1. Product
Teshart is a direct-to-customer custom art business where customers submit a photograph, configure a commissioned artwork, pay online, and receive the finished physical artwork.

## 2. Product vision
Make ordering a personalized handmade artwork feel as simple, trustworthy and emotionally meaningful as ordering a normal product online.

## 3. Primary customer promise
**Your photograph becomes a keepsake, carefully made by hand.**

The experience should communicate:
- personal
- handmade
- trustworthy
- premium but approachable
- simple
- emotionally meaningful

## 4. Primary business goal
Create a production-ready web commerce system that can:
1. attract customers through the public website and search;
2. convert visitors into artwork orders;
3. collect photographs and customization details safely;
4. accept and verify online payments;
5. give the business a structured order workflow;
6. let customers track progress without depending entirely on manual WhatsApp updates.

## 5. V1 success definition
A customer must be able to:
Home → Create My Keepsake → Upload photo → Choose artwork → Choose size → Choose finish → Enter delivery details → Review → Pay → Receive confirmation → Track order.

The business must be able to:
Receive order → verify payment → access source photo → process artwork → update status → add shipment details → complete delivery.

## 6. Non-goals for V1
Do not build:
- AI artwork generation
- mobile application
- marketplace/multi-vendor system
- loyalty program
- referral system
- subscriptions
- complex coupon engine
- advanced inventory management
- public artist marketplace
- unnecessary customer-account features

## 7. Product principles
1. UX specification is the source of truth.
2. Do not redesign the core flow during implementation without an explicit decision.
3. Customer photos are private by default.
4. Payment state must be verified server-side.
5. The database is the source of truth for order state.
6. Mobile UX is a first-class requirement.
7. SEO is part of the product architecture, not a launch-afterthought.
8. Build the smallest reliable system first.
9. Prefer understandable architecture over clever architecture.
10. Every major workflow must be testable.

## 8. Key risks
- Payment success/failure synchronization
- Customer photo privacy
- Large image uploads
- Order status consistency
- Manual artwork workflow becoming difficult to manage
- Poor mobile performance
- SEO pages becoming overly dependent on client-side rendering
- Scope expansion during development

## 9. Initiation decision
Proceed to detailed specification and technical architecture before implementation.

## 10. Pending input
The after-evaluation PDF referenced by the project owner should be incorporated into the final specification when available. Until then, existing UX screenshots and documented business requirements are treated as provisional reference material.
