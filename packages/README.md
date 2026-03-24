# Ecommerce Packages

This directory hosts the package-oriented rebuild of the ecommerce frontend.

Current operating model:

1. feature UI lives in package boundaries;
2. `src/app` stays a thin route shell;
3. CoCart is the primary ecommerce backend boundary;
4. WordPress remains editorial-first plus thin temporary compatibility bridges.

Architecture reference:

1. [`../docs/package-architecture.md`](../docs/package-architecture.md)
2. [`../docs/cocart-first-operating-model.md`](../docs/cocart-first-operating-model.md)
3. [`../src/app/README.md`](../src/app/README.md)
