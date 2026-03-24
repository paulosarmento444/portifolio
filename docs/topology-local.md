# Local Topology

The storefront no longer depends on ngrok as part of its core architecture and now treats CoCart as the main ecommerce backend boundary.

## Default local services

1. Next app: `http://localhost:3000`
2. WordPress public site: `http://localhost:8080`
3. WordPress internal host (server-side / Docker): `http://wordpress:80`
4. WordPress GraphQL (public/editorial): `http://localhost:8080/graphql`
5. CoCart API (server-side / Docker): `http://wordpress:80/wp-json/cocart/v2`

## Required environment alignment

Use `.env.example` as the source of truth.

Required for the CoCart-first storefront:

1. `NEXT_PUBLIC_APP_URL`
2. `WORDPRESS_URL`
3. `NEXT_PUBLIC_WORDPRESS_PUBLIC_URL`
4. `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL`
5. `MERCADO_PAGO_ACCESS_TOKEN`
6. `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY`
7. `WEBHOOK_URL`

Optional defaults still supported:

1. `MERCADO_PAGO_PAYER_EMAIL`
2. `MERCADO_PAGO_PAYER_FIRST_NAME`
3. `COCART_API_URL` only as an explicit server-side CoCart override; in Docker it must keep using the internal WordPress host, not `localhost`
4. `COCART_JWT_AUTH_SECRET_KEY` only if the current plugin setup proves it is required
5. `WOOCOMMERCE_CONSUMER_KEY`, `WOOCOMMERCE_CONSUMER_SECRET`, `FAUST_SECRET_KEY` only while temporary compatibility bridges remain active

## Runtime model

1. Browser-facing pages call thin `src/app` routes or compose package pages directly.
2. Feature packages treat `packages/integrations/cocart` as the only ecommerce backend boundary.
3. `packages/integrations/payments` stays provider-only.
4. `packages/integrations/wordpress` stays editorial-first, with thin server-only compatibility bridges where CoCart capability is still unavailable.
5. Server-only credentials stay inside integration/runtime boundaries.

## Server-side vs public URL rule

1. Server-side requests inside Docker must use `WORDPRESS_URL=http://wordpress:80`.
2. The CoCart server adapter derives its base URL from `WORDPRESS_URL` by default.
3. `COCART_API_URL` is only an optional override and must also point to the internal Docker host when used server-side.
4. Public/browser URLs remain separate:
   - `NEXT_PUBLIC_WORDPRESS_PUBLIC_URL=http://localhost:8080`
   - `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=http://localhost:8080/graphql`
5. Server-only code must not fall back to `NEXT_PUBLIC_WORDPRESS_URL` or other public WordPress variables.

## When ngrok is still useful

ngrok is optional and should only be used for cases that require a public callback URL, such as:

1. remote QA from outside the local network;
2. external callback or webhook testing against localhost.

Normal local catalog, account, checkout, and payment development must work without ngrok.
