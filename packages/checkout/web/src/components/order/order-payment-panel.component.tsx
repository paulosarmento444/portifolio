"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import type {
  MercadoPagoCardPaymentInput,
  MercadoPagoHeadlessConfig,
  MercadoPagoOrderPaymentState,
  MercadoPagoProcessOutcome,
} from "@site/integrations/payments";
import type { CheckoutOrderConfirmationView } from "@site/shared";
import {
  GhostButton,
  OverlaySection,
  StatusBadge,
  SurfaceCard,
} from "@site/shared";
import { resolveCheckoutOrderFlow } from "../../lib/payment-methods";
import { MercadoPagoCardForm } from "./mercado-pago-card-form.component";
import { MercadoPagoPixPanel } from "./mercado-pago-pix-panel.component";
import { MercadoPagoThreeDSPanel } from "./mercado-pago-three-ds-panel.component";

interface OrderPaymentPanelProps {
  order: CheckoutOrderConfirmationView;
  paymentConfig: MercadoPagoHeadlessConfig | null;
  initialPaymentState: MercadoPagoOrderPaymentState | null;
  onOrderChange: (order: CheckoutOrderConfirmationView) => void;
}

type PaymentContextResponse = {
  order: CheckoutOrderConfirmationView;
  paymentState: MercadoPagoOrderPaymentState;
  config: MercadoPagoHeadlessConfig | null;
};

type PaymentActionResponse = {
  order: CheckoutOrderConfirmationView;
  paymentState: MercadoPagoOrderPaymentState;
  outcome: MercadoPagoProcessOutcome;
};

const RESOLVED_ORDER_STATUSES = new Set(["processing", "completed"]);

const isSamePaymentConfig = (
  left: MercadoPagoHeadlessConfig | null,
  right: MercadoPagoHeadlessConfig | null,
) => {
  if (left === right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return (
    left.sdkUrl === right.sdkUrl &&
    left.publicKey === right.publicKey &&
    left.locale === right.locale &&
    left.siteId === right.siteId &&
    left.testMode === right.testMode &&
    left.enabledGatewayIds.length === right.enabledGatewayIds.length &&
    left.enabledGatewayIds.every((gatewayId, index) => gatewayId === right.enabledGatewayIds[index])
  );
};

export function OrderPaymentPanel({
  order,
  paymentConfig,
  initialPaymentState,
  onOrderChange,
}: OrderPaymentPanelProps) {
  const [currentPaymentState, setCurrentPaymentState] = useState(initialPaymentState);
  const [currentConfig, setCurrentConfig] = useState(paymentConfig);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingPix, setIsProcessingPix] = useState(false);
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [isFinalizingThreeDS, setIsFinalizingThreeDS] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const hasAutoStartedPixRef = useRef(false);
  const paymentFlow = resolveCheckoutOrderFlow(order);
  const isMercadoPagoMethod = order.paymentMethodId?.startsWith("woo-mercado-pago");
  const paymentResolved =
    currentPaymentState?.isPaid || RESOLVED_ORDER_STATUSES.has(order.status.code);
  const hasPixCode = Boolean(
    currentPaymentState?.pix?.qrCode || currentPaymentState?.pix?.qrCodeBase64,
  );
  const paymentAttemptCount = currentPaymentState?.paymentIds.length ?? 0;
  const hasCardPaymentStarted = paymentAttemptCount > 0;
  const threeDSState = currentPaymentState?.threeDS;
  const showCardForm =
    paymentFlow === "card" &&
    !paymentResolved &&
    !threeDSState?.required &&
    !hasCardPaymentStarted;
  const shouldPollPaymentStatus =
    Boolean(currentPaymentState) &&
    isMercadoPagoMethod &&
    !paymentResolved &&
    (paymentFlow === "pix"
      ? hasPixCode || paymentAttemptCount > 0
      : hasCardPaymentStarted || Boolean(threeDSState?.required));

  useEffect(() => {
    setCurrentPaymentState(initialPaymentState);
    setCurrentConfig(paymentConfig);
    setRefreshError(null);
    setActionError(null);
    hasAutoStartedPixRef.current = false;
  }, [initialPaymentState, order.orderId, paymentConfig]);

  const refreshPaymentContext = useCallback(
    async (options?: { silent?: boolean; sync?: boolean }) => {
      const silent = options?.silent ?? false;
      const sync = options?.sync ?? true;

      if (!silent) {
        setIsRefreshing(true);
        setRefreshError(null);
      }

      try {
        const response = await fetch(
          `/api/orders/${order.orderId}/payment?sync=${sync ? "true" : "false"}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const payload = (await response.json()) as
          | PaymentContextResponse
          | { error?: string };

        if (!response.ok) {
          const errorMessage = "error" in payload ? payload.error : undefined;
          throw new Error(errorMessage || "Não foi possível atualizar o pagamento.");
        }

        const parsedPayload = payload as PaymentContextResponse;
        onOrderChange(parsedPayload.order);
        setCurrentPaymentState(parsedPayload.paymentState);
        setCurrentConfig((current) => {
          const nextConfig = parsedPayload.config ?? current;
          return isSamePaymentConfig(current, nextConfig) ? current : nextConfig;
        });
        setActionError(null);
        setRefreshError(null);
      } catch (error) {
        if (!silent) {
          setRefreshError(
            error instanceof Error
              ? error.message
              : "Não foi possível atualizar o pagamento.",
          );
        }
      } finally {
        if (!silent) {
          setIsRefreshing(false);
        }
      }
    },
    [onOrderChange, order.orderId],
  );

  const processPaymentAction = useCallback(
    async (
      body:
        | { action: "pix" }
        | { action: "3ds_finalize" }
        | { action: "card"; payment: MercadoPagoCardPaymentInput },
    ) => {
      const response = await fetch(`/api/orders/${order.orderId}/payment`, {
        method: "POST",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as PaymentActionResponse | { error?: string };

      if (!response.ok) {
        const errorMessage = "error" in payload ? payload.error : undefined;
        throw new Error(errorMessage || "Não foi possível processar o pagamento.");
      }

      const parsedPayload = payload as PaymentActionResponse;
      onOrderChange(parsedPayload.order);
      setCurrentPaymentState(parsedPayload.paymentState);
      setActionError(null);
      return parsedPayload;
    },
    [onOrderChange, order.orderId],
  );

  const handleProcessPix = useCallback(async () => {
    setActionError(null);
    setIsProcessingPix(true);

    try {
      await processPaymentAction({ action: "pix" });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Não foi possível gerar o QR Code PIX.",
      );
    } finally {
      setIsProcessingPix(false);
    }
  }, [processPaymentAction]);

  const handleProcessCard = useCallback(
    async (payment: MercadoPagoCardPaymentInput) => {
      setActionError(null);
      setIsProcessingCard(true);

      try {
        await processPaymentAction({
          action: "card",
          payment,
        });
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : "Não foi possível processar o cartão.",
        );
        throw error;
      } finally {
        setIsProcessingCard(false);
      }
    },
    [processPaymentAction],
  );

  const handleFinalizeThreeDS = useCallback(async () => {
    setActionError(null);
    setIsFinalizingThreeDS(true);

    try {
      await processPaymentAction({ action: "3ds_finalize" });
      await refreshPaymentContext({ sync: true });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Não foi possível finalizar o 3DS.",
      );
    } finally {
      setIsFinalizingThreeDS(false);
    }
  }, [processPaymentAction, refreshPaymentContext]);

  useEffect(() => {
    if (!shouldPollPaymentStatus) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshPaymentContext({ silent: true, sync: true });
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshPaymentContext, shouldPollPaymentStatus]);

  useEffect(() => {
    if (
      paymentFlow !== "pix" ||
      paymentResolved ||
      hasPixCode ||
      isProcessingPix ||
      !currentPaymentState ||
      currentPaymentState.paymentIds.length > 0 ||
      hasAutoStartedPixRef.current
    ) {
      return;
    }

    hasAutoStartedPixRef.current = true;
    void handleProcessPix();
  }, [
    currentPaymentState,
    handleProcessPix,
    hasPixCode,
    isProcessingPix,
    paymentFlow,
    paymentResolved,
  ]);

  const paymentStatusLabel = currentPaymentState?.orderStatusLabel || order.status.label;

  if (!isMercadoPagoMethod) {
    return (
      <OverlaySection
        title="Método de pagamento incompatível"
        description="Este pedido não pertence a um gateway oficial do Mercado Pago configurado para o checkout headless atual."
        className="border-[color:var(--site-color-danger-soft)] bg-[color:var(--site-color-danger-soft)]/70"
      />
    );
  }

  if (paymentResolved) {
    return (
      <SurfaceCard tone="soft" className="site-stack-section">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--site-color-success-soft)] text-[color:var(--site-color-success)]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="site-stack-panel">
            <StatusBadge tone="success">
              <ShieldCheck className="h-3.5 w-3.5" />
              Pagamento confirmado
            </StatusBadge>
            <div>
              <h3 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
                Status sincronizado com o WooCommerce
              </h3>
              <p className="site-text-body text-sm">
                O Mercado Pago já confirmou este pagamento e o pedido foi atualizado automaticamente para {order.status.label.toLowerCase()}.
              </p>
            </div>
          </div>
        </div>
      </SurfaceCard>
    );
  }

  if (!currentPaymentState) {
    return (
      <OverlaySection
        title="Pagamento carregando"
        description="O pedido foi criado, mas ainda estamos preparando os dados do pagamento. Atualize o status para continuar."
        actions={
          <GhostButton onClick={() => void refreshPaymentContext()} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Atualizar status
          </GhostButton>
        }
      />
    );
  }

  return (
    <div className="site-stack-section min-w-0" id="payment" data-testid="order-payment-panel-root">
      <OverlaySection
        title={paymentFlow === "pix" ? "Pagamento PIX na página" : "Pagamento com cartão na página"}
        description={
          paymentFlow === "pix"
            ? "O pedido continua no WooCommerce, mas o QR Code e o acompanhamento agora ficam 100% dentro da experiência do storefront."
            : "O formulário abaixo tokeniza o cartão com a SDK oficial do Mercado Pago e processa o pagamento sem renderizar a página do WordPress."
        }
        actions={
          <GhostButton onClick={() => void refreshPaymentContext()} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Atualizar status
          </GhostButton>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone="warning">{paymentStatusLabel}</StatusBadge>
          {currentPaymentState.paymentIds.length ? (
            <p className="site-text-meta">
              Tentativa de pagamento registrada: {currentPaymentState.paymentIds.join(", ")}
            </p>
          ) : null}
          {refreshError ? (
            <p className="site-text-meta text-[color:var(--site-color-danger-text)]">{refreshError}</p>
          ) : null}
        </div>
      </OverlaySection>

      {paymentFlow === "pix" ? (
        <MercadoPagoPixPanel
          paymentState={currentPaymentState}
          isProcessing={isProcessingPix}
          error={actionError}
          onGenerate={() => void handleProcessPix()}
          onRefresh={() => void refreshPaymentContext()}
        />
      ) : null}

      {paymentFlow === "card" && threeDSState?.required ? (
        <MercadoPagoThreeDSPanel
          state={threeDSState}
          isFinalizing={isFinalizingThreeDS}
          error={actionError}
          onFinalize={handleFinalizeThreeDS}
        />
      ) : null}

      {showCardForm ? (
        <MercadoPagoCardForm
          amount={order.total.amount}
          config={currentConfig}
          isSubmitting={isProcessingCard}
          externalError={actionError}
          onRefresh={() => void refreshPaymentContext()}
          onSubmit={handleProcessCard}
        />
      ) : null}

      {paymentFlow === "card" && !showCardForm && !threeDSState?.required ? (
        <SurfaceCard tone="soft" className="site-stack-section">
          <div className="site-stack-panel">
            <StatusBadge tone="warning">Pagamento em análise</StatusBadge>
            <div>
              <h3 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
                O pagamento já foi iniciado
              </h3>
              <p className="site-text-body text-sm">
                Estamos aguardando a confirmação final do Mercado Pago. Enquanto isso, esta página continua sincronizando o status real do pedido com o WooCommerce.
              </p>
            </div>
            {actionError ? (
              <p className="site-text-meta text-[color:var(--site-color-danger-text)]">{actionError}</p>
            ) : null}
          </div>
        </SurfaceCard>
      ) : null}
    </div>
  );
}
