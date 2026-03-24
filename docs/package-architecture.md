# Package Architecture

This document records the final CoCart-first package architecture for `refatorar/Site`.

## Final dependency flow

1. `src/app` owns routes, params, metadata, and minimal Next-specific control flow.
2. `packages/*/web` own feature UI, package-level orchestration, and feature-specific state.
3. `packages/shared/web` owns internal contracts and reusable validation helpers.
4. `packages/integrations/*` own external API concerns and mapping.
5. External systems stay behind adapters:
   - CoCart (primary ecommerce boundary)
   - WordPress GraphQL
   - Faust (temporary compatibility only)
   - WooCommerce REST (temporary compatibility only)
   - Mercado Pago

## Package boundaries

1. `packages/store/web`
   - catalog list/search/filter/sort
   - product detail
   - internal product/catalog view consumption only
2. `packages/blog/web`
   - blog listing
   - blog detail
   - client-side filtering and pagination composition
3. `packages/auth/web`
   - login
   - register
   - auth/session action boundary
4. `packages/account/web`
   - account dashboard
   - profile/address/order views
5. `packages/checkout/web`
   - cart
   - checkout
   - order confirmation
   - PIX/card payment UI orchestration
6. `packages/shared/web`
   - shared DTO/view-model contracts
   - shared validation helpers
   - shared mapper harness
7. `packages/integrations/wordpress`
   - editorial GraphQL adapter
   - temporary Faust/Woo compatibility adapters for unsupported capabilities only
8. `packages/integrations/cocart`
   - main ecommerce adapter
   - typed CoCart mappers/contracts
9. `packages/integrations/payments`
   - Mercado Pago server adapter
   - typed client/server payment contracts

## Allowed dependencies

`src/app`
: may import package entry points, app-shell utilities, and Next route APIs.

`packages/store/web`
: may import `@site/shared` and `@site/integrations/cocart`.

`packages/blog/web`
: may import `@site/shared` and `@site/integrations/wordpress`.

`packages/auth/web`
: may import `@site/shared`, `@site/integrations/cocart`, and temporary compatibility reads from `@site/integrations/wordpress/server`.

`packages/account/web`
: may import `@site/shared`, `@site/integrations/cocart`, and temporary compatibility reads from `@site/integrations/wordpress/server`.

`packages/checkout/web`
: may import `@site/shared`, `@site/integrations/cocart`, `@site/integrations/payments`, and temporary compatibility reads from `@site/integrations/wordpress/server`.

`packages/shared/web`
: may not import `src/app`, feature packages, or integration packages.

`packages/integrations/cocart`
: may import runtime/config helpers and shared contracts, but not feature packages or route components.

`packages/integrations/wordpress`
: may import runtime/config helpers and shared contracts, but not feature packages or route components.

`packages/integrations/payments`
: may import runtime/config helpers and shared contracts, but not feature packages or route components.

## Required rules for new code

1. `src/app` routes must stay thin.
2. Feature packages must not import one another directly.
3. Feature UI must consume internal contracts, not raw CoCart/WordPress/Mercado Pago payloads.
4. Integration packages must hide external payload shapes.
5. New code must not add dependencies on legacy folders such as `src/app/service` or `src/app/server-actions`.
6. New ecommerce work must not add feature-level fallback logic outside `packages/integrations/*`.

## Current route ownership

These routes are already on the new architecture:

1. `/store`
2. `/store/[id]`
3. `/blog`
4. `/blog/[uri]`
5. `/auth/login`
6. `/auth/register`
7. `/my-account`
8. `/my-cart`
9. `/order-confirmation/[id]`

## Intentional route-local exceptions

The rebuild preserves a small compatibility surface that is not yet package-migrated:

1. Home route sections under `src/app/page.tsx`.
2. `src/app/components/categories-showcase.tsx`.
3. `src/app/auth/forgot-password/*`.

These are route-shell exceptions, not extension points and not ecommerce ownership paths.
