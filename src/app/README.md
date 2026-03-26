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
10. `/auth/forgot-password`
11. `/auth/reset-password`

## Intentional app-shell exceptions

These remain in `src/app` because they are app-specific integration seams, not reusable feature UI:

1. `layout.tsx` and the Next router shell itself;
2. thin Next-specific runtime glue only when a feature cannot live inside `packages/*`;
3. `api/*` transport handlers;
4. app env/runtime glue in `lib/*`.

New feature work should live in packages and use the `@site/*` aliases documented in [`../docs/package-architecture.md`](../docs/package-architecture.md).
