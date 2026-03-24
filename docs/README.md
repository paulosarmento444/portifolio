# Ecommerce Architecture Docs

This folder documents the rebuilt ecommerce inside `refatorar/Site`.

## Current status

The storefront now runs on a CoCart-first package architecture:

1. `packages/store/web`: catalog and product detail.
2. `packages/blog/web`: blog list and blog detail.
3. `packages/auth/web`: login and register.
4. `packages/account/web`: account dashboard, profile, addresses, orders.
5. `packages/checkout/web`: cart, checkout, order confirmation, QR flow.
6. `packages/shared/web`: internal contracts, validation helpers, shared test harness.
7. `packages/integrations/cocart`: main ecommerce boundary.
8. `packages/integrations/wordpress`: editorial GraphQL plus narrow temporary compatibility for unsupported capabilities only.
9. `packages/integrations/payments`: Mercado Pago adapter.

`src/app` is now the route shell for the rebuilt feature set.

The old mixed storefront strategy is no longer the operating model.

The remaining route-local exceptions are UI composition concerns, not ecommerce ownership paths:

1. `src/app/page.tsx` home composition and its route-local sections.
2. `src/app/components/categories-showcase.tsx`.
3. `src/app/auth/forgot-password/*`.

No new ecommerce logic should expand those paths.

## Documents

1. [`cocart-first-operating-model.md`](./cocart-first-operating-model.md): final operating model, env contract, and ownership rules.
2. [`package-architecture.md`](./package-architecture.md): final package boundaries and dependency rules.
3. [`topology-local.md`](./topology-local.md): local runtime topology, env alignment, and ngrok guidance.
4. [`functional-parity-checklist.md`](./functional-parity-checklist.md): final CoCart-first parity checklist.
5. [`premium-ui-visual-checklist.md`](./premium-ui-visual-checklist.md): dark/light, responsive, media, and payment visual acceptance checklist.
