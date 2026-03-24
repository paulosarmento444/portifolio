# integrations/payments

Server-side helpers for checkout payment method discovery.

Rules:

1. treat WooCommerce as the source of truth for active gateways;
2. keep payment-gateway discovery isolated from feature packages;
3. do not reintroduce manual client-side Mercado Pago or Stripe checkout flows here.
