"use client";

import { Lock, Package, ShieldCheck, ShoppingBag } from "lucide-react";
import type { CoCartCartStateView } from "@site/integrations/cocart";
import { MetricRow, StatusBadge, SurfaceCard } from "@site/shared";
import { deriveCheckoutAppliedCouponFromCart } from "../lib/checkout-coupon";

interface CartSummaryProps {
  cart: CoCartCartStateView;
  embedded?: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);

export function CartSummary({ cart, embedded = false }: CartSummaryProps) {
  const coupon = deriveCheckoutAppliedCouponFromCart(cart);
  const discount = Math.max(
    Number(coupon?.discount ?? cart.couponDiscount?.amount ?? 0),
    0,
  );
  const hasCouponBenefit = Boolean(coupon?.code);
  const itemCountLabel =
    cart.items.length === 1 ? "1 item no carrinho" : `${cart.items.length} itens no carrinho`;
  const metrics = [
    {
      label: "Subtotal",
      value: cart.subtotal.formatted,
      meta: itemCountLabel,
    },
    ...(hasCouponBenefit && coupon
      ? [
          {
            label: "Desconto",
            value: discount > 0 ? `- ${formatCurrency(discount)}` : "Frete grátis",
            meta:
              discount > 0
                ? `Cupom ${coupon.code} aplicado ao carrinho autoritativo.`
                : `Cupom ${coupon.code} liberou frete grátis no carrinho autoritativo.`,
          },
        ]
      : []),
    ...(cart.shippingTotal
      ? [
          {
            label: "Entrega",
            value: cart.shippingTotal.formatted || formatCurrency(cart.shippingTotal.amount),
            meta: "Calculada no estado atual da compra.",
          },
        ]
      : [
          {
            label: "Entrega",
            value: "A calcular",
            meta: "Cotações disponíveis aparecem ao longo do checkout.",
          },
        ]),
    {
      label: "Total",
      value: cart.total.formatted || formatCurrency(cart.total.amount),
      meta: "Valor consolidado pelo estado atual do carrinho.",
    },
  ];

  const content = (
    <div className="min-w-0 site-stack-section">
      <div className="grid gap-4">
        <div className="min-w-0 site-stack-panel">
          <StatusBadge tone="accent">
            <ShoppingBag className="h-3.5 w-3.5" />
            Resumo
          </StatusBadge>
          <div>
            <h3 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
              Resumo do pedido
            </h3>
            <p className="site-text-body text-sm">
              Confira totais e desconto aplicado antes de seguir para o pagamento.
            </p>
          </div>
        </div>

        <div
          className="min-w-0 w-full rounded-[var(--site-radius-xl)] border border-[color:var(--site-color-border-strong)] bg-[color:var(--site-color-surface-soft)] px-5 py-4 shadow-[var(--site-shadow-sm)]"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="cart-summary-highlight"
        >
          <p className="site-text-meta">Total estimado</p>
          <p className="text-2xl font-semibold tracking-tight text-[color:var(--site-color-foreground-strong)] sm:text-3xl">
            {cart.total.formatted || formatCurrency(cart.total.amount)}
          </p>
          <p className="site-text-meta">Valor atualizado conforme o carrinho atual.</p>
        </div>
      </div>

      <MetricRow
        items={metrics.map((metric) => ({
          label:
            metric.label === "Subtotal" ? (
              <span className="inline-flex items-center gap-2">
                <Package className="h-4 w-4" />
                {metric.label}
              </span>
            ) : (
              metric.label
            ),
          value: metric.value,
          meta: metric.meta,
        }))}
        className="sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1"
        data-testid="cart-summary-metrics"
      />

      <div className="flex flex-wrap items-center gap-3 rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] px-4 py-3 text-sm text-[color:var(--site-color-foreground-muted)]">
        <span className="inline-flex items-center gap-2">
          <Lock className="h-4 w-4 text-[color:var(--site-color-success)]" />
          Checkout protegido
        </span>
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[color:var(--site-color-info)]" />
          Pedido rastreável pela conta
        </span>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return <SurfaceCard tone="strong" className="site-stack-section">{content}</SurfaceCard>;
}
