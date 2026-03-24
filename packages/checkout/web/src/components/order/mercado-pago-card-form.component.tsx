"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import type {
  MercadoPagoCardPaymentInput,
  MercadoPagoHeadlessConfig,
} from "@site/integrations/payments";
import {
  FieldShell,
  GhostButton,
  PrimaryButton,
  SelectField,
  StatusBadge,
  SurfaceCard,
  TextField,
  cn,
  ecommerceFieldStyles,
} from "@site/shared";
import {
  buildMercadoPagoFieldStyle,
  ensureMercadoPagoSdk,
  readMercadoPagoDeviceSessionId,
  type MercadoPagoCardFormController,
} from "./mercado-pago-sdk";

interface MercadoPagoCardFormProps {
  amount: number;
  config: MercadoPagoHeadlessConfig | null;
  isSubmitting: boolean;
  disabled?: boolean;
  externalError?: string | null;
  onSubmit: (input: MercadoPagoCardPaymentInput) => Promise<void>;
  onRefresh: () => void;
}

const FIXED_FORM_IDS = {
  form: "pharmacore-mp-card-form",
  cardNumber: "pharmacore-mp-card-number",
  cardholderName: "pharmacore-mp-cardholder-name",
  expirationDate: "pharmacore-mp-expiration-date",
  securityCode: "pharmacore-mp-security-code",
  identificationType: "pharmacore-mp-identification-type",
  identificationNumber: "pharmacore-mp-identification-number",
  issuer: "pharmacore-mp-issuer",
  installments: "pharmacore-mp-installments",
} as const;

const countMeaningfulOptions = (select: HTMLSelectElement | null) => {
  if (!select) {
    return 0;
  }

  return Array.from(select.options).filter(
    (option) => option.value.trim() || option.textContent?.trim(),
  ).length;
};

const SecureField = memo(function SecureField({
  id,
  label,
  hint,
}: {
  id: string;
  label: string;
  hint?: string;
}) {
  return (
    <FieldShell label={label} htmlFor={id} hint={hint}>
      <div
        id={id}
        className={cn(
          ecommerceFieldStyles.input,
          "flex min-h-[52px] items-center overflow-hidden px-0 py-0 [&>iframe]:min-h-[52px] [&>iframe]:w-full",
        )}
      />
    </FieldShell>
  );
});

const CardFieldLayout = memo(function CardFieldLayout() {
  return (
    <form className="site-stack-section min-w-0" id={FIXED_FORM_IDS.form} data-testid="mercado-pago-card-layout" onSubmit={(event) => event.preventDefault()}>
      <div className="grid gap-4">
        <SecureField
          id={FIXED_FORM_IDS.cardNumber}
          label="Número do cartão"
          hint="Os dados sensíveis são tokenizados pelo Mercado Pago."
        />
        <TextField
          id={FIXED_FORM_IDS.cardholderName}
          label="Nome impresso no cartão"
          autoComplete="cc-name"
          placeholder="Como aparece no cartão"
        />
      </div>

      <div className="grid gap-4">
        <SecureField id={FIXED_FORM_IDS.expirationDate} label="Validade" />
        <SecureField id={FIXED_FORM_IDS.securityCode} label="Código de segurança" />
        <SelectField id={FIXED_FORM_IDS.installments} label="Parcelamento" />
      </div>
    </form>
  );
});

const normalizeCardFormError = (error: unknown) => {
  if (Array.isArray(error)) {
    return error
      .map((entry) => {
        if (entry && typeof entry === "object") {
          return String(
            (entry as { message?: string; description?: string }).message ||
              (entry as { message?: string; description?: string }).description ||
              "",
          );
        }

        return String(entry || "");
      })
      .filter(Boolean)
      .join(" ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const casted = error as { message?: string; description?: string };
    return casted.message || casted.description || "Erro ao preparar o formulário do cartão.";
  }

  return "Erro ao preparar o formulário do cartão.";
};

export function MercadoPagoCardForm({
  amount,
  config,
  isSubmitting,
  disabled = false,
  externalError,
  onSubmit,
  onRefresh,
}: MercadoPagoCardFormProps) {
  const cardFormRef = useRef<MercadoPagoCardFormController | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [hasInstallmentOptions, setHasInstallmentOptions] = useState(false);
  const [requiresDocument, setRequiresDocument] = useState(false);
  const [requiresIssuer, setRequiresIssuer] = useState(false);
  const amountLabel = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount),
    [amount],
  );
  const configSdkUrl = config?.sdkUrl ?? "";
  const configPublicKey = config?.publicKey ?? "";
  const configLocale = config?.locale ?? "";
  const configSiteId = config?.siteId ?? "";
  const configTestMode = config?.testMode ?? false;
  const configGatewayIdentity = config?.enabledGatewayIds.join(",") ?? "";
  const stableEnabledGatewayIds = useMemo(
    () => (configGatewayIdentity ? configGatewayIdentity.split(",") : []),
    [configGatewayIdentity],
  );
  const stableConfig = useMemo(
    () =>
      configSdkUrl && configPublicKey
        ? {
            sdkUrl: configSdkUrl,
            publicKey: configPublicKey,
            locale: configLocale,
            siteId: configSiteId,
            testMode: configTestMode,
            enabledGatewayIds: stableEnabledGatewayIds,
          }
        : null,
    [
      configSdkUrl,
      configPublicKey,
      configLocale,
      configSiteId,
      configTestMode,
      stableEnabledGatewayIds,
    ],
  );
  const sdkIdentity = useMemo(
    () =>
      stableConfig
        ? `${stableConfig.sdkUrl}|${stableConfig.publicKey}|${stableConfig.locale}|${stableConfig.enabledGatewayIds.join(",")}`
        : "",
    [stableConfig],
  );

  useEffect(() => {
    let isCancelled = false;
    let fallbackTimeout: number | null = null;

    async function mountCardForm() {
      if (!stableConfig) {
        setIsInitializing(false);
        setInitializationError(
          "A configuração do Checkout Transparente do Mercado Pago não está disponível.",
        );
        return;
      }

      setIsInitializing(true);
      setInitializationError(null);
      setLocalError(null);
      setHasInstallmentOptions(false);
      setRequiresDocument(false);
      setRequiresIssuer(false);

      try {
        const sdk = await ensureMercadoPagoSdk(stableConfig);

        if (isCancelled) {
          return;
        }

        const style = buildMercadoPagoFieldStyle();

        fallbackTimeout = window.setTimeout(() => {
          if (!isCancelled) {
            setIsInitializing(false);
          }
        }, 4000);

        cardFormRef.current?.unmount?.();
        cardFormRef.current = sdk.cardForm({
          amount: amount.toFixed(2),
          iframe: true,
          form: {
            id: FIXED_FORM_IDS.form,
            cardNumber: {
              id: FIXED_FORM_IDS.cardNumber,
              placeholder: "1234 1234 1234 1234",
              style,
            },
            cardholderName: {
              id: FIXED_FORM_IDS.cardholderName,
              placeholder: "Como aparece no cartão",
            },
            cardExpirationDate: {
              id: FIXED_FORM_IDS.expirationDate,
              placeholder: "MM/AA",
              mode: "short",
              style,
            },
            securityCode: {
              id: FIXED_FORM_IDS.securityCode,
              placeholder: "CVV",
              style,
            },
            identificationType: {
              id: FIXED_FORM_IDS.identificationType,
            },
            identificationNumber: {
              id: FIXED_FORM_IDS.identificationNumber,
            },
            issuer: {
              id: FIXED_FORM_IDS.issuer,
              placeholder: "Selecionado automaticamente",
            },
            installments: {
              id: FIXED_FORM_IDS.installments,
              placeholder: "Escolha a parcela",
            },
          },
          callbacks: {
            onReady: () => {
              if (!isCancelled) {
                setIsInitializing(false);
              }
            },
            onFormMounted: (error?: unknown) => {
              if (error && !isCancelled) {
                setInitializationError(normalizeCardFormError(error));
              }

              if (!isCancelled) {
                setIsInitializing(false);
              }
            },
            onError: (errors: unknown) => {
              if (!isCancelled) {
                setLocalError(normalizeCardFormError(errors));
              }
            },
            onInstallmentsReceived: (error: unknown) => {
              if (error && !isCancelled) {
                setLocalError(normalizeCardFormError(error));
              }
            },
          },
        });
      } catch (error) {
        if (!isCancelled) {
          setInitializationError(normalizeCardFormError(error));
          setIsInitializing(false);
        }
      }
    }

    void mountCardForm();

    return () => {
      isCancelled = true;
      if (fallbackTimeout) {
        window.clearTimeout(fallbackTimeout);
      }
      cardFormRef.current?.unmount?.();
      cardFormRef.current = null;
    };
  }, [amount, sdkIdentity, stableConfig]);

  useEffect(() => {
    const installmentsSelect = document.getElementById(
      FIXED_FORM_IDS.installments,
    ) as HTMLSelectElement | null;
    const identificationTypeSelect = document.getElementById(
      FIXED_FORM_IDS.identificationType,
    ) as HTMLSelectElement | null;
    const issuerSelect = document.getElementById(
      FIXED_FORM_IDS.issuer,
    ) as HTMLSelectElement | null;

    if (!installmentsSelect && !identificationTypeSelect && !issuerSelect) {
      return;
    }

    const syncDynamicFields = () => {
      setHasInstallmentOptions(countMeaningfulOptions(installmentsSelect) > 0);
      setRequiresDocument(countMeaningfulOptions(identificationTypeSelect) > 0);
      setRequiresIssuer(countMeaningfulOptions(issuerSelect) > 1);
    };

    syncDynamicFields();

    const observer = new MutationObserver(() => {
      syncDynamicFields();
    });

    for (const element of [installmentsSelect, identificationTypeSelect, issuerSelect]) {
      if (!element) {
        continue;
      }

      observer.observe(element, {
        childList: true,
        subtree: true,
        attributes: true,
      });
      element.addEventListener("change", syncDynamicFields);
    }

    return () => {
      observer.disconnect();

      for (const element of [installmentsSelect, identificationTypeSelect, issuerSelect]) {
        element?.removeEventListener("change", syncDynamicFields);
      }
    };
  }, [sdkIdentity]);

  const handleSubmit = async () => {
    const cardForm = cardFormRef.current;

    if (!cardForm) {
      setLocalError("O formulário do cartão ainda não está pronto.");
      return;
    }

    setLocalError(null);

    try {
      const tokenResult = await cardForm.createCardToken();
      const formData = cardForm.getCardFormData();
      const token = String(tokenResult?.token || "").trim();
      const paymentMethodId = String(formData.paymentMethodId || "").trim();
      const installments = Number.parseInt(String(formData.installments || "0"), 10);

      if (!token || !paymentMethodId || !Number.isFinite(installments) || installments <= 0) {
        throw new Error("Preencha os dados do cartão e selecione a parcela para continuar.");
      }

      await onSubmit({
        token,
        paymentMethodId,
        installments,
        issuerId: String(formData.issuerId || "").trim() || undefined,
        identificationType: String(formData.identificationType || "").trim() || undefined,
        identificationNumber:
          String(formData.identificationNumber || "").trim() || undefined,
        paymentTypeId: String(formData.paymentTypeId || "").trim() || undefined,
        sessionId: readMercadoPagoDeviceSessionId(),
      });
    } catch (error) {
      setLocalError(normalizeCardFormError(error));
    }
  };

  return (
    <SurfaceCard tone="strong" className="site-stack-section min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="site-stack-panel">
          <StatusBadge tone="accent">
            <CreditCard className="h-3.5 w-3.5" />
            Checkout Transparente
          </StatusBadge>
          <div>
            <h3 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
              Pague com cartão sem sair da loja
            </h3>
            <p className="site-text-body text-sm">
              Os campos sensíveis são tokenizados pelo Mercado Pago. O pedido já existe e será atualizado automaticamente quando o pagamento for confirmado.
            </p>
          </div>
        </div>
        <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] px-4 py-3 text-right">
          <p className="site-text-meta">Valor do pedido</p>
          <p className="text-lg font-semibold text-[color:var(--site-color-foreground-strong)]">
            {amountLabel}
          </p>
        </div>
      </div>

      <CardFieldLayout />

      <div className="site-stack-section">
        <div
          className={cn(
            "grid gap-4",
            !requiresDocument && "hidden",
          )}
        >
          <div className="site-stack-section">
            <FieldShell label="Tipo de documento" htmlFor={FIXED_FORM_IDS.identificationType}>
              <select
                id={FIXED_FORM_IDS.identificationType}
                className={cn(ecommerceFieldStyles.select)}
                tabIndex={requiresDocument ? 0 : -1}
              />
            </FieldShell>
          </div>
          <TextField
            id={FIXED_FORM_IDS.identificationNumber}
            label="Número do documento"
            autoComplete="off"
            placeholder="Digite o documento do titular"
            containerClassName={cn(!requiresDocument && "hidden")}
            tabIndex={requiresDocument ? 0 : -1}
          />
        </div>

        <FieldShell
          label="Banco emissor"
          htmlFor={FIXED_FORM_IDS.issuer}
          className={cn(!requiresIssuer && "hidden")}
        >
          <select
            id={FIXED_FORM_IDS.issuer}
            className={cn(ecommerceFieldStyles.select)}
            tabIndex={requiresIssuer ? 0 : -1}
          />
        </FieldShell>
      </div>

      {(initializationError || localError || externalError) ? (
        <div className="flex items-start gap-3 rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-danger-soft)] bg-[color:var(--site-color-danger-soft)]/70 px-4 py-3 text-sm text-[color:var(--site-color-danger-text)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{externalError || localError || initializationError}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] px-4 py-3">
        <div className="site-stack-panel">
          <StatusBadge tone="neutral">
            <ShieldCheck className="h-3.5 w-3.5" />
            Tokenização oficial do Mercado Pago
          </StatusBadge>
          <p className="site-text-meta">
            {hasInstallmentOptions
              ? "As parcelas já foram carregadas para o cartão informado."
              : "As parcelas aparecem assim que o Mercado Pago reconhece os primeiros dígitos do cartão."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <GhostButton onClick={onRefresh} disabled={isSubmitting}>
            Atualizar status
          </GhostButton>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={disabled || isInitializing || isSubmitting || Boolean(initializationError)}
          >
            {isInitializing || isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Pagar com cartão
          </PrimaryButton>
        </div>
      </div>
    </SurfaceCard>
  );
}
