# store/web

Storefront feature package for catalog listing/filtering/sorting and product detail.

Current contents:

1. server page composition for catalog and product detail;
2. client components for catalog filters/grid and product presentation;
3. store-local types and view helpers based only on internal shared contracts.

Dependency rules:

1. `@site/shared` for internal contracts;
2. `@site/integrations/cocart/server` for server-side ecommerce data reads;
3. no imports from legacy `src/app/service` or raw CoCart/Woo/GraphQL payload shapes.

Route composition rule:

1. `src/app/store` keeps URLs and layout wrappers;
2. this package owns store-specific rendering and view-model logic.
