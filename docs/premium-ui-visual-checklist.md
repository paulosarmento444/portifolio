# Premium UI Visual Checklist

This checklist records the final release-quality visual checks for the premium polish pass.

## Validation status

1. Shell responsiveness: validated
2. Dark/light theme parity: validated
3. Catalog and product media: validated
4. Cart, checkout, and payment trust: validated
5. Account, blog, auth, and support polish: validated

## Breakpoint checklist

### Desktop

- [x] Header navigation, utility actions, and footer spacing align without overlap.
- [x] Catalog toolbar, result meta, and filters maintain one visual hierarchy.
- [x] Product detail keeps media and buy area clearly separated.
- [x] Checkout summary and payment surfaces read as one system.
- [x] Account and blog containers do not over-expand beyond their intended content width.

### Tablet

- [x] Header utility area does not crowd navigation before mobile drawer takeover.
- [x] Store filter/search actions wrap without breaking CTA rhythm.
- [x] Product detail sticky buy surface only activates where space is sufficient.
- [x] Account dashboard and order cards remain readable in two-column transitions.
- [x] Blog hero, cards, and article header keep balanced spacing.

### Mobile

- [x] Shell entry spacing remains consistent across home, store, checkout, account, blog, auth, and support.
- [x] Store category chips and blog category chips scroll horizontally instead of collapsing into noisy wraps.
- [x] Pagination stays usable without overloading narrow screens.
- [x] Auth and support CTAs stack cleanly and preserve tap targets.
- [x] Payment modal headers and overlay actions stack correctly on small screens.

## Theme parity checklist

### Light theme

- [x] Page surfaces stay bright without washing out borders and actions.
- [x] Text contrast remains readable in cards, forms, and badges.
- [x] Overlay scrims and modals remain distinct from the page background.
- [x] Product media, editorial surfaces, and order panels keep depth without dark-only styling assumptions.

### Dark theme

- [x] Heavy surfaces are reduced enough to avoid oppressive sections.
- [x] Foreground text and semantic badges remain legible across commerce and utility pages.
- [x] Overlays, drawers, and toast feedback remain separated from the page shell.
- [x] Catalog, checkout, and blog content keep consistent accent restraint.

## Product media checklist

- [x] Catalog cards render valid product images in both grid and list modes.
- [x] Product detail gallery renders the base product image reliably.
- [x] Variation selection swaps media without losing the active frame.
- [x] Missing media falls back gracefully without breaking layout.
- [x] Product media framing remains correct in both themes.

## Checkout and payment checklist

- [x] Cart summary, coupon area, and checkout progression remain aligned.
- [x] Address confirmation and payment method selection stay readable on mobile.
- [x] PIX modal clearly separates order creation, QR state, copy-and-paste code, and approval state.
- [x] Card payment framing remains integrated with the order context.
- [x] Order confirmation keeps payment retry and summary areas visually distinct.

## Business-critical smoke coverage

- [x] Home shell smoke test
- [x] Store catalog/product smoke tests
- [x] Auth action smoke test
- [x] Account dashboard smoke test
- [x] Blog list/detail smoke test
- [x] Checkout action + PIX + order confirmation smoke tests
- [x] WooCommerce mapper/adapter media tests
- [x] Mercado Pago server adapter tests
- [x] Theme provider test
