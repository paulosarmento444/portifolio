# integrations/wordpress

WordPress integration boundary for editorial content plus a narrow temporary compatibility bridge.

Exports are split by runtime:

1. `@site/integrations/wordpress`
: client-safe GraphQL adapters for blog/editorial content only.

2. `@site/integrations/wordpress/server`
: server-only compatibility adapters for Faust session fallback and Woo customer/order/payment-method fallback while unsupported CoCart capabilities are still being phased out.

3. `@site/integrations/wordpress/register`
: isolated GraphQL registration compatibility entrypoint, kept separate so payment/order server routes do not pull Apollo into their runtime bundles.

Rules:

1. blog/editorial remains the primary responsibility of this package;
2. storefront ecommerce reads for catalog, PDP, cart, coupon, totals, and shipping must not be added back here;
3. compatibility server exports must stay thin, capability-gated, and temporary;
4. raw external response handling stays inside this package;
5. do not import from feature packages or route components.
