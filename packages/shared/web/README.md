# shared/web

Shared frontend package for contracts, validation helpers, generic utilities, and shared design-system foundations.

Rules:

1. keep this package feature-agnostic;
2. do not import from feature packages;
3. do not import from integration packages.

Contents added in Phase 3:

1. shared DTO/view-model contracts under `src/contracts`;
2. reusable Zod field/schema helpers under `src/validation`;
3. mapper validation harness under `src/testing`.

Contents added in UI redesign Phase 1:

1. canonical visual audit and design tokens under `src/design-system/tokens.ts`;
2. shared Tailwind class contracts for text, surfaces, buttons, fields, and utilities under `src/design-system/primitives.ts`;
3. responsive page/container/section rules under `src/design-system/layout.ts`.

Contents added in UI redesign Phase 2:

1. visual primitives such as `PageHeader`, `SectionShell`, `SurfaceCard`, `StatusBadge`, and `EmptyState` under `src/ui/primitives.tsx`;
2. shared action primitives such as `Button`, `PrimaryButton`, `SecondaryButton`, `GhostButton`, `ChipFilter`, and `IconButton` under `src/ui/actions.tsx`;
3. shared field wrappers and overlay shells such as `FieldShell`, `TextField`, `SelectField`, `TextAreaField`, `ModalShell`, and `DrawerShell` under `src/ui/*`.

Contents refined in premium UI polish Phase 1:

1. final visual audit for keep/refine/deprecate decisions under `src/design-system/tokens.ts`;
2. dual-theme semantic token map for dark and light modes under `src/design-system/tokens.ts`;
3. stricter container, page-shell, section, and action-row rules under `src/design-system/layout.ts` and `src/app/globals.css`.

Contents added in premium UI polish Phase 2:

1. shared theme helpers under `src/theme`, including constants, bootstrap script, provider, and hook;
2. shell-level theme switching now consumes the shared theme layer instead of local page logic;
3. dual-theme gradients and shell variables are now applied through `src/app/globals.css`.

Contents refined in premium UI polish Phase 3:

1. shared primitives such as `PageHeader`, `SurfaceCard`, `StatusBadge`, fields, and overlays were visually tightened for the premium theme system;
2. toast styling now comes from the shared package through `src/ui/feedback.ts`;
3. minimal reusable helpers for media framing, editorial surfaces, trust strips, metrics, and progress steps were added under `src/ui/helpers.tsx`.
