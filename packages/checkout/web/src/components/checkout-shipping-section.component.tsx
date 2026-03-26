"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  PackageCheck,
  RefreshCcw,
  Truck,
} from "lucide-react";
import type { AccountCustomerView } from "@site/shared";
import type { CoCartCartStateView } from "@site/integrations/cocart";
import {
  GhostButton,
  OverlaySection,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  SurfaceCard,
  TextField,
  cn,
} from "@site/shared";
import {
  calculateCheckoutShippingAction,
  reloadCheckoutShippingAction,
  selectCheckoutShippingRateAction,
} from "../data/actions/checkout.actions";
import type { CheckoutShippingDestinationFormData } from "../data/checkout.types";

interface CheckoutShippingSectionProps {
  cart: CoCartCartStateView;
  customer: AccountCustomerView;
  onCartChange: (cart: CoCartCartStateView) => void;
  onEditAddress: () => void;
}

const formatDeliveryForecast = (days?: number) => {
  if (!days || days <= 0) {
    return null;
  }

  return days === 1 ? "Entrega estimada em 1 dia útil" : `Entrega estimada em ${days} dias úteis`;
};

const toInitialDestination = (
  customer: AccountCustomerView,
): CheckoutShippingDestinationFormData => {
  const address = customer.shippingAddress || customer.billingAddress;

  return {
    postcode: address?.postcode || "",
    country: address?.country || "BR",
    state: address?.state || "",
    city: address?.city || "",
    addressLine1: address?.addressLine1 || "",
    addressLine2: address?.addressLine2 || "",
    firstName: address?.firstName || "",
    lastName: address?.lastName || "",
    company: address?.company || "",
    phone: address?.phone || "",
    email: address?.email || customer.email || undefined,
  };
};

const normalizePostcode = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};

const isDestinationReadyForShippingCalculation = (
  destination: CheckoutShippingDestinationFormData,
) => {
  const country = destination.country.trim().toUpperCase();
  const postcode = destination.postcode.trim();
  const state = destination.state?.trim().toUpperCase() || "";

  if (!country || !postcode) {
    return false;
  }

  if (country === "BR") {
    return state.length > 0;
  }

  return true;
};

const toDomId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "-");

export function CheckoutShippingSection({
  cart,
  customer,
  onCartChange,
  onEditAddress,
}: CheckoutShippingSectionProps) {
  const savedDestination = useMemo(() => toInitialDestination(customer), [customer]);
  const currentAddress = customer.shippingAddress || customer.billingAddress || null;
  const shippingStatusRef = useRef<HTMLDivElement | null>(null);
  const shippingErrorRef = useRef<HTMLDivElement | null>(null);
  const shippingRateRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const autoCalculationKeyRef = useRef<string | null>(null);
  const [destination, setDestination] = useState<CheckoutShippingDestinationFormData>(
    () => savedDestination,
  );
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSelectingRate, setIsSelectingRate] = useState(false);
  const [pendingRateId, setPendingRateId] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<"status" | "error" | "rates" | null>(null);
  const [hasAttemptedCalculation, setHasAttemptedCalculation] = useState(
    Boolean(cart.shippingPackages.length || cart.shippingRates.length || cart.shippingTotal),
  );

  useEffect(() => {
    setDestination(savedDestination);
    setError(null);
  }, [savedDestination]);

  useEffect(() => {
    if (cart.shippingPackages.length || cart.shippingRates.length || cart.shippingTotal) {
      setHasAttemptedCalculation(true);
    }
  }, [cart.shippingPackages.length, cart.shippingRates.length, cart.shippingTotal]);

  useEffect(() => {
    if (!focusTarget) {
      return;
    }

    if (focusTarget === "error") {
      shippingErrorRef.current?.focus();
      setFocusTarget(null);
      return;
    }

    if (focusTarget === "status") {
      shippingStatusRef.current?.focus();
      setFocusTarget(null);
      return;
    }

    const selectedRate =
      cart.shippingPackages.flatMap((shippingPackage) => shippingPackage.rates).find((rate) => rate.selected) ||
      cart.shippingPackages.flatMap((shippingPackage) => shippingPackage.rates)[0];

    if (selectedRate) {
      shippingRateRefs.current[selectedRate.rateId]?.focus();
    } else {
      shippingStatusRef.current?.focus();
    }

    setFocusTarget(null);
  }, [cart.shippingPackages, focusTarget]);

  const addressSummary = useMemo(() => {
    if (!currentAddress) {
      return "Use seu CEP para calcular as opções reais de entrega do carrinho atual.";
    }

    return [
      currentAddress.addressLine1,
      currentAddress.addressLine2,
      [currentAddress.city, currentAddress.state].filter(Boolean).join(" - "),
      currentAddress.postcode,
    ]
      .filter(Boolean)
      .join(" • ");
  }, [currentAddress]);

  const hasDestinationBase = Boolean(destination.postcode.trim());
  const isDestinationReady = isDestinationReadyForShippingCalculation(destination);
  const hasSavedDestinationReady = isDestinationReadyForShippingCalculation(savedDestination);
  const hasRates = cart.shippingPackages.some((shippingPackage) => shippingPackage.rates.length > 0);
  const isMutatingShipping = isCalculating || isSelectingRate;
  const shouldShowDestinationIncomplete =
    !hasRates &&
    (cart.shippingStatus === "destination_incomplete" || !isDestinationReady);
  const shouldShowNoServices =
    !hasRates &&
    cart.shippingStatus === "no_services" &&
    !shouldShowDestinationIncomplete;
  const autoCalculationKey = useMemo(
    () =>
      JSON.stringify({
        postcode: normalizePostcode(savedDestination.postcode),
        country: savedDestination.country.trim().toUpperCase(),
        state: savedDestination.state?.trim().toUpperCase() || "",
        city: savedDestination.city?.trim().toUpperCase() || "",
        addressLine1: savedDestination.addressLine1?.trim() || "",
        items: cart.items
          .map((item) => `${item.itemKey}:${item.quantity}:${item.variationId ?? item.productId}`)
          .join("|"),
        coupon: cart.coupons.map((coupon) => coupon.code).sort().join("|"),
      }),
    [cart.coupons, cart.items, savedDestination],
  );
  const isUsingSavedDestination = useMemo(
    () =>
      JSON.stringify({
        postcode: normalizePostcode(destination.postcode),
        country: destination.country.trim().toUpperCase(),
        state: destination.state?.trim().toUpperCase() || "",
        city: destination.city?.trim().toUpperCase() || "",
        addressLine1: destination.addressLine1?.trim() || "",
      }) ===
      JSON.stringify({
        postcode: normalizePostcode(savedDestination.postcode),
        country: savedDestination.country.trim().toUpperCase(),
        state: savedDestination.state?.trim().toUpperCase() || "",
        city: savedDestination.city?.trim().toUpperCase() || "",
        addressLine1: savedDestination.addressLine1?.trim() || "",
      }),
    [destination, savedDestination],
  );

  const runShippingCalculation = useCallback(
    async ({ focusOnCompletion }: { focusOnCompletion: boolean }) => {
      if (!destination.postcode.trim()) {
        setError({
          title: "Informe um CEP para calcular",
          message: "Use um CEP válido para consultar as opções reais de entrega.",
        });
        if (focusOnCompletion) {
          setFocusTarget("error");
        }
        return;
      }

      if (!isDestinationReady) {
        setError({
          title: "Complete o endereço antes de calcular",
          message:
            "Para calcular frete no Brasil, salve um endereço com estado e CEP válidos no fluxo de endereço.",
        });
        if (focusOnCompletion) {
          setFocusTarget("error");
        }
        return;
      }

      setError(null);
      setIsCalculating(true);
      setHasAttemptedCalculation(true);

      const result = await calculateCheckoutShippingAction({
        ...destination,
        postcode: normalizePostcode(destination.postcode),
        country: destination.country || "BR",
      });

      if (!result.success || !result.cart) {
        setError({
          title: "Não foi possível calcular o frete",
          message: result.error || "Não foi possível calcular o frete.",
        });
        setIsCalculating(false);
        if (focusOnCompletion) {
          setFocusTarget("error");
        }
        return;
      }

      onCartChange(result.cart);
      setIsCalculating(false);
      if (focusOnCompletion) {
        setFocusTarget(result.cart.shippingPackages.length ? "rates" : "status");
      }
    },
    [destination, isDestinationReady, onCartChange],
  );

  useEffect(() => {
    if (
      !hasSavedDestinationReady ||
      !isDestinationReady ||
      !isUsingSavedDestination ||
      hasRates ||
      isMutatingShipping
    ) {
      return;
    }

    if (autoCalculationKeyRef.current === autoCalculationKey) {
      return;
    }

    autoCalculationKeyRef.current = autoCalculationKey;
    void runShippingCalculation({ focusOnCompletion: false });
  }, [
    autoCalculationKey,
    hasRates,
    hasSavedDestinationReady,
    isDestinationReady,
    isMutatingShipping,
    isUsingSavedDestination,
    runShippingCalculation,
  ]);

  const handleCalculate = async () => {
    await runShippingCalculation({ focusOnCompletion: true });
  };

  const handleReload = async () => {
    setError(null);
    setIsCalculating(true);
    setHasAttemptedCalculation(true);

    const result = await reloadCheckoutShippingAction();

    if (!result.success || !result.cart) {
      setError({
        title: "Não foi possível atualizar o frete",
        message: result.error || "Não foi possível atualizar as opções de entrega.",
      });
      setIsCalculating(false);
      setFocusTarget("error");
      return;
    }

    onCartChange(result.cart);
    setIsCalculating(false);
    setFocusTarget(result.cart.shippingPackages.length ? "rates" : "status");
  };

  const handleSelectRate = async (packageId: string, rateId: string, selected: boolean) => {
    if (selected || isMutatingShipping) {
      return;
    }

    setError(null);
    setIsSelectingRate(true);
    setPendingRateId(rateId);

    const result = await selectCheckoutShippingRateAction({
      packageId,
      rateId,
    });

    if (!result.success || !result.cart) {
      setError({
        title: "Não foi possível salvar a opção de entrega",
        message: result.error || "Não foi possível salvar a opção de entrega.",
      });
      setIsSelectingRate(false);
      setPendingRateId(null);
      setFocusTarget("error");
      return;
    }

    onCartChange(result.cart);
    setIsSelectingRate(false);
    setPendingRateId(null);
    setFocusTarget("rates");
  };

  return (
    <OverlaySection
      title="Entrega e frete"
      description={addressSummary}
      aria-labelledby="checkout-shipping-title"
      aria-describedby="checkout-shipping-description"
      actions={
        <GhostButton
          onClick={onEditAddress}
          className="site-touch-target w-full justify-center sm:min-w-40 sm:w-auto"
        >
          <MapPin className="h-4 w-4" />
          Editar endereço
        </GhostButton>
      }
    >
      <div className="site-stack-section" aria-busy={isMutatingShipping}>
        <div className="sr-only">
          <h3 id="checkout-shipping-title">Entrega e frete</h3>
          <p id="checkout-shipping-description">
            Informe o CEP, consulte os métodos de entrega disponíveis e escolha uma opção para
            atualizar o total do pedido.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <TextField
            label="CEP para calcular frete"
            name="postcode"
            value={destination.postcode}
            onChange={(event) => {
              setDestination((current) => ({
                ...current,
                postcode: normalizePostcode(event.target.value),
              }));
            }}
            placeholder="00000-000"
            hint="Use o CEP do endereço de entrega atual. O cálculo vem do carrinho real no WooCommerce."
            autoComplete="shipping postal-code"
            inputMode="numeric"
            required
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <PrimaryButton
              onClick={handleCalculate}
              disabled={isMutatingShipping || !hasDestinationBase || !isDestinationReady}
              className="site-touch-target justify-center"
              aria-busy={isCalculating}
            >
              {isCalculating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Calculando
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  {hasRates ? "Atualizar frete" : "Calcular frete"}
                </>
              )}
            </PrimaryButton>

            <SecondaryButton
              onClick={handleReload}
              disabled={isMutatingShipping}
              className="site-touch-target justify-center"
              aria-busy={isCalculating}
            >
              <RefreshCcw className={isCalculating ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Recarregar
            </SecondaryButton>
          </div>
        </div>

        {shouldShowDestinationIncomplete && !error ? (
          <SurfaceCard tone="soft" role="status" aria-live="polite" aria-atomic="true">
            <div className="site-stack-panel">
              <StatusBadge tone="warning">Endereço incompleto para calcular</StatusBadge>
              <p className="site-text-body text-sm">
                Complete o endereço de entrega com estado e CEP válidos antes de calcular o frete.
              </p>
              <p className="site-text-meta">
                Use o botão &quot;Editar endereço&quot; para atualizar o destino pelo fluxo já
                existente do checkout.
              </p>
            </div>
          </SurfaceCard>
        ) : null}

        <div
          ref={shippingStatusRef}
          className="flex flex-wrap items-center gap-3 rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] px-4 py-3 text-sm text-[color:var(--site-color-foreground-muted)]"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          tabIndex={-1}
        >
          <span className="inline-flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-[color:var(--site-color-info)]" />
            {cart.shippingTotal
              ? `Frete atual: ${cart.shippingTotal.formatted}`
              : "Nenhuma tarifa aplicada ao carrinho ainda"}
          </span>
          <span className="inline-flex items-center gap-2">
            <Truck className="h-4 w-4 text-[color:var(--site-color-success)]" />
            {hasRates
              ? `${cart.shippingRates.length} método(s) retornado(s) pelo backend`
              : "As opções reais aparecem depois do cálculo"}
          </span>
        </div>

        {error ? (
          <div ref={shippingErrorRef} tabIndex={-1}>
            <SurfaceCard
              tone="soft"
              className="border-[color:var(--site-color-danger-soft)] bg-[color:var(--site-color-danger-soft)]/70"
              role="alert"
              aria-live="assertive"
            >
              <div className="site-stack-panel">
                <StatusBadge tone="danger">{error.title}</StatusBadge>
                <p className="site-text-body text-sm text-[color:var(--site-color-danger-text)]">
                  {error.message}
                </p>
              </div>
            </SurfaceCard>
          </div>
        ) : null}

        {isCalculating ? (
          <SurfaceCard tone="soft" role="status" aria-live="polite" aria-atomic="true">
            <div className="flex items-center gap-3 text-sm text-[color:var(--site-color-foreground-muted)]">
              <Loader2 className="h-4 w-4 animate-spin text-[color:var(--site-color-primary)]" />
              Consultando opções reais de entrega no carrinho atual.
            </div>
          </SurfaceCard>
        ) : null}

        {isSelectingRate ? (
          <SurfaceCard tone="soft" role="status" aria-live="polite" aria-atomic="true">
            <div className="flex items-center gap-3 text-sm text-[color:var(--site-color-foreground-muted)]">
              <Loader2 className="h-4 w-4 animate-spin text-[color:var(--site-color-primary)]" />
              Salvando a opção de entrega escolhida e atualizando os totais do checkout.
            </div>
          </SurfaceCard>
        ) : null}

        {!isCalculating && hasRates
          ? cart.shippingPackages.map((shippingPackage) => (
              <SurfaceCard key={shippingPackage.packageId} tone="soft" className="site-stack-section">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="site-stack-panel">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone="accent">
                        {shippingPackage.packageName || "Entrega"}
                      </StatusBadge>
                      {shippingPackage.formattedDestination ? (
                        <StatusBadge tone="neutral">Destino confirmado</StatusBadge>
                      ) : null}
                    </div>
                    {shippingPackage.packageDetails ? (
                      <p className="site-text-body text-sm">{shippingPackage.packageDetails}</p>
                    ) : null}
                    {shippingPackage.formattedDestination ? (
                      <p className="site-text-meta">{shippingPackage.formattedDestination}</p>
                    ) : null}
                  </div>
                </div>

                <fieldset
                  className="grid gap-3"
                  role="radiogroup"
                  aria-label={`Métodos de entrega para ${shippingPackage.packageName || "Entrega"}`}
                  aria-busy={isSelectingRate}
                >
                  <legend className="sr-only">
                    Escolha um método de entrega para {shippingPackage.packageName || "Entrega"}
                  </legend>
                  {shippingPackage.rates.map((rate) => {
                    const forecast = formatDeliveryForecast(rate.deliveryForecastDays);
                    const isPendingSelection = pendingRateId === rate.rateId;
                    const rateId = toDomId(`${shippingPackage.packageId}-${rate.rateId}`);
                    const descriptionId = rate.description ? `${rateId}-description` : undefined;
                    const forecastId = forecast ? `${rateId}-forecast` : undefined;
                    const metaId = `${rateId}-meta`;
                    const describedBy = [descriptionId, forecastId, metaId]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <label
                        key={`${shippingPackage.packageId}-${rate.rateId}`}
                        className={cn(
                          "block rounded-[var(--site-radius-lg)] border bg-[color:var(--site-color-page)] px-4 py-4 transition-all duration-200",
                          rate.selected
                            ? "border-[color:var(--site-color-primary)] bg-[color:var(--site-color-primary-soft)] shadow-[var(--site-shadow-sm)]"
                            : "border-[color:var(--site-color-border)] hover:border-[color:var(--site-color-border-strong)] hover:bg-[color:var(--site-color-surface)]",
                          isMutatingShipping && !rate.selected && "opacity-80",
                        )}
                      >
                        <input
                          ref={(element) => {
                            shippingRateRefs.current[rate.rateId] = element;
                          }}
                          type="radio"
                          name={`shipping-package-${shippingPackage.packageId}`}
                          checked={rate.selected}
                          onChange={() =>
                            void handleSelectRate(
                              shippingPackage.packageId,
                              rate.rateId,
                              rate.selected,
                            )
                          }
                          disabled={isMutatingShipping}
                          className="peer sr-only"
                          aria-label={`${rate.label} ${rate.cost.formatted}`}
                          aria-describedby={describedBy || undefined}
                        />

                        <div className="site-touch-target flex min-h-14 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--site-color-primary)]">
                          <div className="site-stack-panel">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                                {rate.label}
                              </p>
                              {isPendingSelection ? (
                                <StatusBadge tone="accent">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Salvando
                                </StatusBadge>
                              ) : rate.selected ? (
                                <StatusBadge tone="success">Selecionado</StatusBadge>
                              ) : (
                                <StatusBadge tone="neutral">Disponível</StatusBadge>
                              )}
                            </div>
                            {rate.description ? (
                              <p id={descriptionId} className="site-text-body text-sm">
                                {rate.description}
                              </p>
                            ) : null}
                            {forecast ? (
                              <p id={forecastId} className="site-text-meta">
                                {forecast}
                              </p>
                            ) : null}
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-lg font-semibold text-[color:var(--site-color-foreground-strong)]">
                              {rate.cost.formatted}
                            </p>
                            <div
                              id={metaId}
                              className="site-text-meta flex items-center gap-2 sm:justify-end"
                            >
                              {rate.selected ? (
                                <CheckCircle2 className="h-4 w-4 text-[color:var(--site-color-success)]" />
                              ) : null}
                              <span>{rate.methodId || rate.rateId}</span>
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </fieldset>
              </SurfaceCard>
            ))
          : null}

        {!isCalculating && hasAttemptedCalculation && shouldShowNoServices && !error ? (
          <SurfaceCard tone="soft" role="status" aria-live="polite" aria-atomic="true" tabIndex={-1}>
            <div className="site-stack-panel">
              <StatusBadge tone="warning">Nenhuma opção encontrada</StatusBadge>
              <p className="site-text-body text-sm">
                O carrinho não retornou serviços de entrega para o destino informado. Revise o
                CEP ou ajuste o endereço antes de tentar novamente.
              </p>
            </div>
          </SurfaceCard>
        ) : null}
      </div>
    </OverlaySection>
  );
}
