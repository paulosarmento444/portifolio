"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PageHeader,
  ProgressStepper,
  SectionShell,
  StatusBadge,
} from "@site/shared";
import type { AccountCustomerView } from "@site/shared";
import type { CoCartCartStateView } from "@site/integrations/cocart";
import type { CheckoutPaymentMethodCode, CheckoutPageData } from "../lib/checkout.types";
import { deriveCheckoutAppliedCouponFromCart } from "../lib/checkout-coupon";
import { mapCheckoutPaymentMethodToOption } from "../lib/payment-methods";
import { CartContent } from "./cart-content.component";
import { CartSidebar } from "./cart-sidebar.component";
import { CheckoutSection } from "./checkout-section.component";
import { EmptyCart } from "./empty-cart.component";

interface CheckoutPageShellProps {
  data: CheckoutPageData;
}

const normalizeCouponCode = (value?: string | null) => value?.trim().toLowerCase() || null;

export function CheckoutPageShell({ data }: CheckoutPageShellProps) {
  const hasItems = data.cart.items.length > 0;
  const itemLabel = data.cart.items.length === 1 ? "item selecionado" : "itens selecionados";
  const [cart, setCart] = useState<CoCartCartStateView>(data.cart);
  const [customer, setCustomer] = useState<AccountCustomerView>(data.customer);
  const paymentOptions = useMemo(
    () => data.paymentMethods.map(mapCheckoutPaymentMethodToOption),
    [data.paymentMethods],
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<CheckoutPaymentMethodCode>(
    paymentOptions[0]?.id ?? "",
  );
  const pendingCouponSyncRef = useRef<string | null | undefined>(undefined);
  const appliedCoupon = useMemo(() => deriveCheckoutAppliedCouponFromCart(cart), [cart]);
  const currentAddress = customer.shippingAddress || customer.billingAddress || null;
  const hasAddress = Boolean(
    currentAddress?.addressLine1 && currentAddress.city && currentAddress.postcode,
  );

  useEffect(() => {
    const expectedCouponCode = pendingCouponSyncRef.current;

    if (expectedCouponCode !== undefined) {
      const incomingCartCouponCode = normalizeCouponCode(data.cart.coupons[0]?.code);

      if (incomingCartCouponCode !== expectedCouponCode) {
        return;
      }

      pendingCouponSyncRef.current = undefined;
    }

    setCart(data.cart);
  }, [data.cart]);

  useEffect(() => {
    setCustomer(data.customer);
  }, [data.customer]);

  useEffect(() => {
    if (!paymentOptions.some((option) => option.id === selectedPaymentMethod)) {
      setSelectedPaymentMethod(paymentOptions[0]?.id ?? "");
    }
  }, [paymentOptions, selectedPaymentMethod]);

  const handleCartChange = useCallback((nextCart: CoCartCartStateView) => {
    pendingCouponSyncRef.current = normalizeCouponCode(nextCart.coupons[0]?.code);
    setCart(nextCart);
  }, []);

  return (
    <div className="site-shell-background">
      <PageHeader
        container="commerce"
        className="pt-24 pb-2 sm:pt-28 sm:pb-3"
        eyebrow="Checkout"
        title="Seu carrinho"
        description={
          hasItems
            ? `Revise ${data.cart.items.length} ${itemLabel}, confirme os dados de entrega e conclua o pagamento com segurança.`
            : "Escolha os produtos que quer levar e volte aqui para concluir a compra."
        }
        actions={
          hasItems ? (
            <StatusBadge tone="info">
              {data.cart.items.length} {itemLabel}
            </StatusBadge>
          ) : undefined
        }
      />

      <SectionShell container="commerce" spacing="compact" stack="page" className="pb-16">
        {hasItems ? (
          <ProgressStepper
            steps={[
              {
                label: "Carrinho",
                description: `${data.cart.items.length} ${itemLabel}`,
                status: "complete",
              },
              {
                label: "Entrega",
                description: hasAddress ? "Endereço confirmado" : "Adicionar endereço",
                status: hasAddress ? "complete" : "current",
              },
              {
                label: "Pagamento",
                description: hasAddress ? "Checkout oficial do Mercado Pago" : "Disponível após entrega",
                status: hasAddress ? "current" : "upcoming",
              },
            ]}
          />
        ) : null}

        {hasItems ? (
          <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,20rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="site-stack-section">
              <CartContent
                cart={cart}
                appliedCoupon={appliedCoupon}
                onCartChange={handleCartChange}
              />

              <CheckoutSection
                cart={cart}
                userId={data.userId}
                customer={customer}
                paymentOptions={paymentOptions}
                selectedPaymentMethod={selectedPaymentMethod}
                onSelectedPaymentMethodChange={setSelectedPaymentMethod}
                onCustomerChange={setCustomer}
                onCartChange={handleCartChange}
              />
            </div>

            <CartSidebar
              cart={cart}
              cartState={data.cartState}
              userId={data.userId}
              customer={customer}
              paymentOptions={paymentOptions}
              selectedPaymentMethod={selectedPaymentMethod}
            />
          </div>
        ) : (
          <EmptyCart />
        )}
      </SectionShell>
    </div>
  );
}
