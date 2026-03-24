# CoCart-First Operating Model

This storefront is now CoCart-first for ecommerce ownership.

## Primary ownership

1. `packages/integrations/cocart`
   - catalog products and categories
   - product detail and variations
   - cart state and session ownership
   - coupons, shipping rates, fees, taxes, totals
   - checkout/customer/account capabilities that the current plugin setup supports

2. `packages/integrations/payments`
   - Mercado Pago provider-only boundary
   - provider payload shaping from normalized order context

3. `packages/integrations/wordpress`
   - editorial/blog GraphQL
   - narrow temporary compatibility bridge for unsupported CoCart capabilities only

## What no longer exists as a storefront strategy

The old mixed ownership model is fully replaced.

Feature packages no longer choose between Woo REST, Faust, local cart cookies, and ad hoc services as parallel ecommerce paths.

If WordPress/Woo/Faust are still touched, that usage is now:

1. isolated behind `packages/integrations/wordpress/server`;
2. capability-gated;
3. temporary compatibility, not feature-level ownership.

## Final env contract

Required:

1. `NEXT_PUBLIC_APP_URL`
2. `WORDPRESS_URL`
3. `NEXT_PUBLIC_WORDPRESS_PUBLIC_URL`
4. `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL`
5. `MERCADO_PAGO_ACCESS_TOKEN`
6. `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY`
7. `WEBHOOK_URL`

Optional:

1. `MERCADO_PAGO_PAYER_EMAIL`
2. `MERCADO_PAGO_PAYER_FIRST_NAME`
3. `COCART_API_URL` only as an explicit server-side override; by default the CoCart server adapter derives its base URL from `WORDPRESS_URL`
4. `COCART_JWT_AUTH_SECRET_KEY` only if the current plugin stack proves it is required

Temporary compatibility only:

1. `WOOCOMMERCE_CONSUMER_KEY`
2. `WOOCOMMERCE_CONSUMER_SECRET`
3. `FAUST_SECRET_KEY`

## Local topology

Default local URLs:

1. Next app: `http://localhost:3000`
2. WordPress public site: `http://localhost:8080`
3. WordPress GraphQL: `http://localhost:8080/graphql`
4. WordPress internal host (server-side / Docker): `http://wordpress:80`
5. CoCart API (server-side / Docker): `http://wordpress:80/wp-json/cocart/v2`

## Rule for new code

1. Ecommerce flows must go to `@site/integrations/cocart`.
2. Payment-provider logic must stay in `@site/integrations/payments`.
3. Editorial content stays in `@site/integrations/wordpress`.
4. New feature code must not add app-level services, server actions, or parallel ecommerce adapters.
5. Server-side WordPress/CoCart calls must use the internal Docker host via `WORDPRESS_URL`, never public `NEXT_PUBLIC_*` WordPress variables.
