# integrations/cocart

CoCart-first ecommerce integration boundary for the storefront.

Exports are split by runtime:

1. `@site/integrations/cocart`
: client-safe contracts, mappers, runtime rules, and explicit browser client factories.

2. `@site/integrations/cocart/server`
: server-only CoCart adapter and runtime helpers.

Server runtime rule:

1. inside Docker, server-side CoCart requests must resolve from `WORDPRESS_URL`
2. the default derived base URL is `${WORDPRESS_URL}/wp-json/cocart/v2`
3. `COCART_API_URL` is only an explicit server override and must still use the internal Docker host when set

Rules:

1. keep raw CoCart payload handling inside this package;
2. expose typed internal contracts to feature packages;
3. do not import from feature packages or route components;
4. do not read browser globals or Next server APIs inside shared mappers/contracts;
5. treat endpoint capability differences as runtime concerns owned here, not in feature packages.
