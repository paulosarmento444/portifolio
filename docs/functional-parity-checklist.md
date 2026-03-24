# Functional Parity Checklist

This checklist records the final CoCart-first storefront parity status.

## Status summary

1. Home: validated
2. Catalog/store: validated
3. Product detail: validated
4. Blog list/detail: validated
5. Login/register: validated
6. Account dashboard/orders/addresses: validated
7. Cart/checkout: validated
8. Order confirmation: validated
9. Mercado Pago QR/card boundary: validated
10. CoCart-first ecommerce ownership: validated

## Evidence by flow

### 1. Home

- Route shell: `src/app/page.tsx`
- Smoke test: `src/app/page.spec.tsx`
- Notes: still uses route-local home sections, but the showcase feed is already CoCart-backed.

### 2. Catalog / Store

- Route shell: `src/app/store/page.tsx`
- Package page: `packages/store/web/src/pages/store-catalog.page.tsx`
- Ecommerce boundary: `packages/integrations/cocart`
- Coverage: `packages/store/web/src/pages/store.pages.spec.tsx`

### 3. Product detail

- Route shell: `src/app/store/[id]/page.tsx`
- Package page: `packages/store/web/src/pages/store-product.page.tsx`
- Ecommerce boundary: `packages/integrations/cocart`
- Coverage: `packages/store/web/src/pages/store.pages.spec.tsx`

### 4. Blog

- Route shells: `src/app/blog/page.tsx`, `src/app/blog/[uri]/page.tsx`
- Package pages:
  - `packages/blog/web/src/pages/blog-listing.page.tsx`
  - `packages/blog/web/src/pages/blog-post.page.tsx`
- Coverage: `packages/blog/web/src/pages/blog.pages.spec.tsx`

### 5. Auth

- Route shells: `src/app/auth/login/page.tsx`, `src/app/auth/register/page.tsx`
- Package flow: `packages/auth/web`
- Coverage: `packages/auth/web/src/actions/auth.actions.spec.ts`

### 6. Account dashboard / orders / addresses

- Route shell: `src/app/my-account/page.tsx`
- Package page: `packages/account/web/src/pages/account-dashboard.page.tsx`
- Primary ecommerce boundary: `packages/integrations/cocart`
- Temporary compatibility bridge: `@site/integrations/wordpress/server`
- Coverage: `packages/account/web/src/pages/account-dashboard.page.spec.tsx`

### 7. Cart / Checkout

- Route shell: `src/app/my-cart/page.tsx`
- Package page: `packages/checkout/web/src/pages/cart.page.tsx`
- Primary ecommerce boundary: `packages/integrations/cocart`
- Payment boundary: `packages/integrations/payments`
- Coverage:
  - `packages/checkout/web/src/actions/checkout.actions.spec.ts`
  - `packages/checkout/web/src/components/pix-qrcode.component.spec.tsx`

### 8. Order confirmation

- Route shell: `src/app/order-confirmation/[id]/page.tsx`
- Package page: `packages/checkout/web/src/pages/order-confirmation.page.tsx`
- Primary ecommerce boundary: `packages/integrations/cocart`
- Temporary compatibility bridge: `@site/integrations/wordpress/server`
- Coverage: `packages/checkout/web/src/pages/order-confirmation.page.spec.tsx`

### 9. Payments

- Integration package: `packages/integrations/payments`
- Coverage:
  - `packages/integrations/payments/src/mercado-pago.server.spec.ts`
  - `packages/checkout/web/src/components/pix-qrcode.component.spec.tsx`

### 10. CoCart-first ecommerce ownership

- Catalog, PDP, cart, coupon, totals, and shipping are owned by `packages/integrations/cocart`.
- Feature packages no longer assemble cart/order state from app-level services or local cookies.
- Any remaining Woo/Faust reads are isolated compatibility bridges, not primary ecommerce ownership.

## Intentional route-local scope

These are preserved and validated as route-local exceptions, not as ecommerce ownership paths:

1. home route-local sections;
2. `src/app/auth/forgot-password/*`.
