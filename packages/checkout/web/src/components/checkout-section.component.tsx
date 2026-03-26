"use client";

import { useMemo, useState } from "react";
import { CreditCard, MapPin, Plus, Truck } from "lucide-react";
import type {
  AccountCustomerView,
  AddressView,
} from "@site/shared";
import type { CoCartCartStateView } from "@site/integrations/cocart";
import {
  GhostButton,
  OverlaySection,
  StatusBadge,
  SurfaceCard,
} from "@site/shared";
import type { CheckoutPaymentMethodCode } from "../data/checkout.types";
import type { CheckoutPaymentOption } from "../data/payment-methods";
import { AddressModal } from "./address-modal.component";
import { CheckoutShippingSection } from "./checkout-shipping-section.component";
import { PaymentMethodSelector } from "./payment-method-selector.component";

interface CheckoutSectionProps {
  cart: CoCartCartStateView;
  userId: string;
  customer: AccountCustomerView;
  paymentOptions: CheckoutPaymentOption[];
  selectedPaymentMethod: CheckoutPaymentMethodCode;
  onSelectedPaymentMethodChange: (method: CheckoutPaymentMethodCode) => void;
  onCustomerChange: (customer: AccountCustomerView) => void;
  onCartChange: (cart: CoCartCartStateView) => void;
}

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

export function CheckoutSection({
  cart,
  userId,
  customer,
  paymentOptions,
  selectedPaymentMethod,
  onSelectedPaymentMethodChange,
  onCustomerChange,
  onCartChange,
}: CheckoutSectionProps) {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const currentAddress = customer.shippingAddress || customer.billingAddress || null;
  const deliverySectionTitleId = "checkout-delivery-section-title";
  const paymentSectionTitleId = "checkout-payment-section-title";
  const initialAddress = useMemo(
    () => toCheckoutAddress(currentAddress, customer.email || undefined),
    [currentAddress, customer.email],
  );
  const hasAddress = Boolean(
    currentAddress?.addressLine1 && currentAddress.city && currentAddress.postcode,
  );

  return (
    <>
      <div data-testid="checkout-flow-section" className="site-stack-section">
        <SurfaceCard
          tone="strong"
          className="site-stack-section"
          as="section"
          data-testid="checkout-delivery-section"
          aria-labelledby={deliverySectionTitleId}
        >
          <div className="site-stack-panel">
            <StatusBadge tone="accent">
              <Truck className="h-3.5 w-3.5" />
              Entrega
            </StatusBadge>
            <div>
              <h2
                id={deliverySectionTitleId}
                className="site-text-card-title text-[color:var(--site-color-foreground-strong)]"
              >
                Entrega e frete do pedido
              </h2>
              <p className="site-text-body text-sm">
                Confirme o endereço, calcule o frete real e selecione a modalidade de envio antes de
                seguir para o pagamento.
              </p>
            </div>
          </div>

          <OverlaySection
            title="Endereço de entrega"
            description={
              hasAddress && currentAddress
                ? [
                    currentAddress.addressLine1,
                    currentAddress.addressLine2,
                    `${currentAddress.city} - ${currentAddress.state}`,
                  ]
                    .filter(Boolean)
                    .join(" • ")
                : "Adicione um endereço para continuar com segurança."
            }
            actions={
              <GhostButton
                onClick={() => setShowAddressModal(true)}
                className="w-full justify-center sm:min-w-40 sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                {hasAddress ? "Editar endereço" : "Adicionar endereço"}
              </GhostButton>
            }
          >
            <div className="flex items-start gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="site-stack-panel">
                <StatusBadge tone={hasAddress ? "success" : "warning"}>
                  {hasAddress ? "Confirmado" : "Pendente"}
                </StatusBadge>
                <p className="site-text-meta">
                  {hasAddress
                    ? "Esse endereço será usado na entrega e no acompanhamento do pedido."
                    : "Sem endereço confirmado, o checkout não pode seguir para a geração do pagamento."}
                </p>
              </div>
            </div>
          </OverlaySection>
        </SurfaceCard>

        <CheckoutShippingSection
          cart={cart}
          customer={customer}
          onCartChange={onCartChange}
          onEditAddress={() => setShowAddressModal(true)}
        />

        <SurfaceCard
          tone="strong"
          className="site-stack-section"
          as="section"
          data-testid="checkout-payment-section"
          aria-labelledby={paymentSectionTitleId}
        >
          <div className="site-stack-panel">
            <StatusBadge tone="accent">
              <CreditCard className="h-3.5 w-3.5" />
              Pagamento
            </StatusBadge>
            <div>
              <h2
                id={paymentSectionTitleId}
                className="site-text-card-title text-[color:var(--site-color-foreground-strong)]"
              >
                Escolha como deseja pagar
              </h2>
              <p className="site-text-body text-sm">
                O pagamento continua integrado ao WooCommerce e ao Mercado Pago, usando o carrinho já
                atualizado com o frete selecionado.
              </p>
            </div>
          </div>

          {paymentOptions.length ? (
            <PaymentMethodSelector
              options={paymentOptions}
              selected={selectedPaymentMethod}
              onChange={onSelectedPaymentMethodChange}
              showIntro={false}
            />
          ) : (
            <OverlaySection
              title="Nenhum meio de pagamento disponível"
              description="Ative os métodos oficiais do Mercado Pago no WooCommerce para liberar esta etapa do checkout."
              className="border-[color:var(--site-color-danger-soft)] bg-[color:var(--site-color-danger-soft)]/70"
            />
          )}
        </SurfaceCard>
      </div>

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        customerId={userId}
        initialAddress={initialAddress}
        onAddressSaved={({ customer: nextCustomer, cart: nextCart }) => {
          onCustomerChange(nextCustomer);
          if (nextCart) {
            onCartChange(nextCart);
          }
        }}
      />
    </>
  );
}
