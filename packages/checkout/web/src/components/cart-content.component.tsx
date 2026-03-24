"use client";

import { Package } from "lucide-react";
import type { CoCartCartStateView } from "@site/integrations/cocart";
import { StatusBadge, SurfaceCard } from "@site/shared";
import type { CheckoutAppliedCoupon } from "../lib/checkout.types";
import { CartItem } from "./cart-item.component";
import { CouponSection } from "./coupon-section.component";

interface CartContentProps {
  cart: CoCartCartStateView;
  appliedCoupon?: CheckoutAppliedCoupon | null;
  onCartChange?: (cart: CoCartCartStateView) => void;
  onCouponChange?: (coupon: CheckoutAppliedCoupon | null) => void;
}

export function CartContent({
  cart,
  appliedCoupon,
  onCartChange,
  onCouponChange,
}: CartContentProps) {
  const itemLabel = cart.items.length === 1 ? "1 item selecionado" : `${cart.items.length} itens selecionados`;

  return (
    <section data-testid="checkout-items-section" className="site-stack-section">
      <SurfaceCard tone="strong" className="site-stack-section">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="site-stack-panel">
            <StatusBadge tone="accent">
              <Package className="h-3.5 w-3.5" />
              Itens do pedido
            </StatusBadge>
            <div>
              <h2 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
                Revise os produtos antes de seguir
              </h2>
              <p className="site-text-body text-sm">
                Ajuste quantidades, remova itens quando precisar e valide o carrinho antes de
                calcular frete e concluir o pagamento.
              </p>
            </div>
          </div>

          <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] px-4 py-3 text-sm text-[color:var(--site-color-foreground-muted)]">
            <p className="site-text-meta">Status do carrinho</p>
            <p className="font-semibold text-[color:var(--site-color-foreground-strong)]">
              {itemLabel}
            </p>
            <p className="site-text-meta">Subtotal atual: {cart.subtotal.formatted}</p>
          </div>
        </div>

        <div className="site-stack-section">
          {cart.items.map((item, index) => (
            <CartItem
              key={item.itemKey ?? `${item.productId}-${index}`}
              item={item}
            />
          ))}
        </div>
      </SurfaceCard>

      <CouponSection
        initialCoupon={appliedCoupon}
        onCartChange={onCartChange}
        onCouponChange={onCouponChange}
      />
    </section>
  );
}
