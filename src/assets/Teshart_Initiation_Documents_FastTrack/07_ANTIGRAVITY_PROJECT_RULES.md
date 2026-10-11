# Teshart — Antigravity Project Rules
Version: 0.1 — Initiation Phase

## Mission
Build the Teshart website and commerce system according to the approved product/UX specification.

## Source-of-truth order
When information conflicts, use this order:

1. Explicit owner decision in the current task
2. Approved UX/product specification
3. Business rules
4. Technical architecture
5. Existing implementation
6. Agent assumptions

Never silently override a higher-priority source.

## Before changing code
The agent must:
1. inspect the relevant existing files;
2. identify dependencies;
3. explain the intended change briefly;
4. implement the smallest coherent change;
5. run relevant checks;
6. verify the affected browser flow.

## Do not
- redesign the UX without approval;
- introduce libraries without justification;
- rewrite working modules unnecessarily;
- hard-code secrets;
- trust client-side payment status;
- expose private customer photos;
- put business logic only in React components;
- create duplicate data models for the same concept;
- add speculative features;
- optimize for visual polish while leaving broken business logic.

## Do
- use TypeScript types;
- validate input;
- keep server-side authorization;
- make payment/webhook processing idempotent;
- preserve order history;
- keep mobile UX first-class;
- write reusable components;
- keep SEO requirements in the implementation;
- add useful loading, empty and error states;
- test the happy path and failure path.

## Definition of done
A feature is complete only when:
- implementation exists;
- relevant tests/checks pass;
- mobile layout is verified;
- error state is handled;
- authorization is considered;
- SEO is handled if the feature is public;
- analytics event is added when relevant;
- documentation is updated if architecture/business rules changed.

## Agent autonomy boundary
The agent may make implementation decisions inside the approved architecture.

The agent must ask for a product decision when:
- a new user flow is required;
- a business rule is ambiguous;
- pricing logic is unclear;
- cancellation/refund behavior is undefined;
- privacy/permission behavior is unclear;
- a major technology change is proposed;
- implementation would materially alter the approved UX.

## Commit discipline
Prefer small, meaningful changes:
- feat:
- fix:
- refactor:
- docs:
- test:
- chore:

Avoid giant unrelated commits.
