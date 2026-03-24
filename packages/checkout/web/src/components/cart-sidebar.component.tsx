"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Loader2, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AccountCustomerView, AddressView } from "@site/shared";
import type { CoCartCartStateView } from "@site/integrations/cocart";
import {
  OverlaySection,
  PrimaryButton,
  StatusBadge,
  SurfaceCard,
  cn,
  ecommerceButtonStyles,
} from "@site/shared";
import { createCheckoutOrderAction } from "../actions/checkout.actions";
import type {
  CheckoutCreateOrderInput,
  CheckoutPaymentMethodCode,
  CheckoutSessionCart,
} from "../lib/checkout.types";
import { deriveCheckoutAppliedCouponFromCart } from "../lib/checkout-coupon";
import type { CheckoutPaymentOption } from "../lib/payment-methods";
import { CartSummary } from "./cart-summary.component";

interface CartSidebarProps {
  cart: CoCartCartStateView;
  cartState: CheckoutSessionCart;
  userId: string;
  customer: AccountCustomerView;
  paymentOptions: CheckoutPaymentOption[];
  selectedPaymentMethod: CheckoutPaymentMethodCode;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);

const toCheckoutAddress = (
  address: AddressView | null | undefined,
  fallbackEmail?: string,
) => ({
  first_name: address?.firstName || "",
  last_name: address?.lastName || "",
  address_1: address?.addressLine1 || "",
  address_2: address?.addressLine2 || "",
  city: address?.city || "",
  state: address?.state || "",
  postcode: address?.postcode || "",
  country: address?.country || "BR",
  phone: address?.phone || "",
  email: address?.email || fallbackEmail || "",
});

export function CartSidebar({
  cart,
  cartState,
  userId,
  customer,
  paymentOptions,
  selectedPaymentMethod,
}: CartSidebarProps) {
  const router = useRouter();
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const currentAddress = customer.shippingAddress || customer.billingAddress || null;
  const finalizationSectionTitleId = "checkout-finalization-section-title";
  const finalizationDescriptionId = "checkout-finalization-section-description";
  const finalCtaHelpId = "checkout-finalization-cta-help";
  const selectedOption = paymentOptions.find(
    (option) => option.id === selectedPaymentMethod,
  );
  const selectedShippingRate =
    cart.shippingRates.find((rate) => rate.selected) || cart.shippingRates[0] || null;
  const initialAddress = useMemo(
    () => toCheckoutAddress(currentAddress, customer.email || undefined),
    [currentAddress, customer.email],
  );
  const hasAddress = Boolean(
    currentAddress?.addressLine1 && currentAddress.city && currentAddress.postcode,
  );
  const resolvedCoupon = useMemo(
    () => deriveCheckoutAppliedCouponFromCart(cart),
    [cart],
  );
  const totalAmount = cart.total.amount;

  const checkoutInput = useMemo<CheckoutCreateOrderInput>(() => ({
    customerId: userId,
    billingAddress: initialAddress,
    shippingAddress: initialAddress,
    items: cartState.items.map((item) => ({
      productId: item.productId,
      variationId: item.variationId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      name: item.name,
    })),
    paymentMethod: selectedPaymentMethod,
    paymentMethodTitle: selectedOption?.title,
    paymentFlow: selectedOption?.flow ?? "card",
    coupon: resolvedCoupon,
    totalAmount,
  }), [cartState.items, initialAddress, resolvedCoupon, selectedOption, selectedPaymentMethod, totalAmount, userId]);

  const canCheckout =
    cart.items.length > 0 &&
    hasAddress &&
    paymentOptions.length > 0 &&
    Boolean(selectedPaymentMethod) &&
    !isSubmittingOrder;

  const handleFinalizePurchase = async () => {
    if (!canCheckout) {
      return;
    }

    setSubmitError(null);
    setIsSubmittingOrder(true);

    const result = await createCheckoutOrderAction(checkoutInput);

    if (!result.success || !result.order) {
      setSubmitError(result.error || "Erro ao criar o pedido");
      setIsSubmittingOrder(false);
      return;
    }

    router.push(`/order-confirmation/${result.order.orderId}#payment`);
  };

  return (
    <aside data-testid="checkout-sidebar-section" className="min-w-0 site-stack-section lg:sticky lg:top-28">
      <CartSummary cart={cart} />

      <SurfaceCard
        tone="strong"
        className="min-w-0 site-stack-section"
        as="section"
        data-testid="checkout-finalization-section"
        aria-labelledby={finalizationSectionTitleId}
        aria-describedby={finalizationDescriptionId}
        aria-busy={isSubmittingOrder}
      >
        <div className="site-stack-panel">
          <StatusBadge tone="accent">
            <ShieldCheck className="h-3.5 w-3.5" />
            Finalização
          </StatusBadge>
          <div>
            <h2
              id={finalizationSectionTitleId}
              className="site-text-card-title text-[color:var(--site-color-foreground-strong)]"
            >
              Revise o total e conclua a compra
            </h2>
            <p id={finalizationDescriptionId} className="site-text-body text-sm">
              O pedido será criado com base no carrinho autoritativo, incluindo frete, cupom e total
              final já sincronizados.
            </p>
          </div>
        </div>

        {submitError ? (
          <OverlaySection
            title="Não foi possível criar o pedido"
            description={submitError}
            className="border-[color:var(--site-color-danger-soft)] bg-[color:var(--site-color-danger-soft)]/70"
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-3 rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] px-4 py-3 text-sm text-[color:var(--site-color-foreground-muted)]">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[color:var(--site-color-success)]" />
            Pedido criado antes do pagamento
          </span>
          <span className="inline-flex items-center gap-2">
            <Truck className="h-4 w-4 text-[color:var(--site-color-info)]" />
            {selectedShippingRate
              ? `${selectedShippingRate.label} selecionado no carrinho`
              : "Selecione o frete na coluna principal para fechar o total"}
          </span>
        </div>

        <OverlaySection
          title="Pronto para concluir"
          description={
            canCheckout
              ? "O pedido será criado primeiro e, em seguida, a próxima etapa de pagamento será exibida dentro da própria experiência headless da loja."
              : "Confirme o endereço, o frete e a forma de pagamento para liberar a criação do pedido."
          }
        >
          <div className="grid gap-3 border-b border-[color:var(--site-color-border)] pb-4">
            <div className="site-stack-panel">
              <p className="site-text-meta">Forma escolhida</p>
              <p className="text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                {selectedOption?.flow === "pix"
                  ? "PIX oficial do Mercado Pago"
                  : selectedOption?.title || "Checkout transparente do Mercado Pago"}
              </p>
            </div>
            <div className="site-stack-panel">
              <p className="site-text-meta">Entrega</p>
              <p className="text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                {selectedShippingRate
                  ? `${selectedShippingRate.label} • ${selectedShippingRate.cost.formatted}`
                  : "Calcule o frete na coluna principal"}
              </p>
            </div>
            <div className="site-stack-panel">
              <p className="site-text-meta">Endereço</p>
              <p className="text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                {hasAddress && currentAddress
                  ? `${currentAddress.city} - ${currentAddress.state}, ${currentAddress.postcode}`
                  : "Adicionar endereço de entrega"}
              </p>
            </div>
          </div>

          <div className="grid gap-3" data-testid="checkout-finalization-total-row">
            <div className="site-stack-panel">
              <p className="site-text-meta">Total para pagar</p>
              <p className="text-2xl font-semibold text-[color:var(--site-color-foreground-strong)]">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <StatusBadge tone={canCheckout ? "success" : "warning"} className="w-fit">
              {canCheckout ? "Pronto para criar pedido" : "Etapas pendentes"}
            </StatusBadge>
          </div>

          <div className="grid gap-3 border-t border-[color:var(--site-color-border)] pt-2">
            <PrimaryButton
              onClick={handleFinalizePurchase}
              disabled={!canCheckout}
              fullWidth
              className="justify-center"
              aria-describedby={finalCtaHelpId}
            >
              {isSubmittingOrder ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando pedido
                </>
              ) : (
                <>
                  {selectedOption?.flow === "pix"
                    ? "Criar pedido e abrir PIX"
                    : "Criar pedido e abrir checkout"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </PrimaryButton>

            <Link
              href="/store"
              className={cn(
                ecommerceButtonStyles.secondary,
                "site-touch-target w-full justify-center",
              )}
            >
              Continuar comprando
            </Link>
          </div>
          <p id={finalCtaHelpId} className="site-text-meta">
            Revise frete, forma de pagamento e total final antes de criar o pedido.
          </p>
        </OverlaySection>
      </SurfaceCard>
    </aside>
  );
}
