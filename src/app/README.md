# App Shell Rules

`src/app` is the active Next.js router and the composition shell for the rebuilt ecommerce.

## Allowed responsibilities

1. own route structure and public URLs;
2. read `params` and `searchParams`;
3. define route metadata;
4. compose package pages/components;
5. perform minimal Next-specific control flow such as `redirect` and `notFound`.

## API route rule

Files under `src/app/api` are thin transport handlers.

They may:

1. parse the request;
2. call integration or package-layer code;
3. translate the result to `NextResponse`.

They must not become a new home for reusable business mapping or raw external payload handling.

## Rebuilt route scope

The following routes already follow the package-based architecture:

1. `/store`
2. `/store/[id]`
3. `/blog`
4. `/blog/[uri]`
5. `/auth/login`
6. `/auth/register`
7. `/my-account`
8. `/my-cart`
9. `/order-confirmation/[id]`

## Intentional app-shell exceptions

These remain in `src/app` as route-local composition exceptions and should not be expanded:

1. home composition under `page.tsx`;
2. `components/categories-showcase.tsx`;
3. `auth/forgot-password/*`.

New feature work should live in packages and use the `@site/*` aliases documented in [`../docs/package-architecture.md`](../docs/package-architecture.md).
