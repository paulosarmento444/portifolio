"use client";

import { useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { CheckCircle2, CreditCard, QrCode, Shield } from "lucide-react";
import { OverlaySection, StatusBadge, cn } from "@site/shared";
import type { CheckoutPaymentMethodCode } from "../data/checkout.types";
import type { CheckoutPaymentOption } from "../data/payment-methods";

interface PaymentMethodSelectorProps {
  options: CheckoutPaymentOption[];
  selected: CheckoutPaymentMethodCode;
  onChange: (method: CheckoutPaymentMethodCode) => void;
  showIntro?: boolean;
}

const ICONS = {
  pix: QrCode,
  card: CreditCard,
} as const;

export function PaymentMethodSelector({
  options,
  selected,
  onChange,
  showIntro = true,
}: PaymentMethodSelectorProps) {
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const labelId = "checkout-payment-methods-title";
  const descriptionId = "checkout-payment-methods-description";

  const handleOptionKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    if (
      event.key !== "ArrowRight" &&
      event.key !== "ArrowDown" &&
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowUp" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }

    event.preventDefault();

    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? options.length - 1
          : event.key === "ArrowRight" || event.key === "ArrowDown"
            ? (currentIndex + 1) % options.length
            : (currentIndex - 1 + options.length) % options.length;

    onChange(options[nextIndex].id);
    optionRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      className="site-stack-panel"
      role="radiogroup"
      aria-labelledby={labelId}
      aria-describedby={showIntro ? descriptionId : undefined}
    >
      {showIntro ? (
        <div>
          <h4
            id={labelId}
            className="site-text-card-title text-[color:var(--site-color-foreground-strong)]"
          >
            Método de pagamento
          </h4>
          <p id={descriptionId} className="site-text-body text-sm">
            Escolha como deseja concluir a compra. Você ainda poderá revisar os detalhes antes de pagar.
          </p>
        </div>
      ) : (
        <span id={labelId} className="sr-only">
          Método de pagamento
        </span>
      )}

      <div className={cn("grid gap-3", options.length > 1 && "md:grid-cols-2")}>
        {options.map((option, index) => {
          const Icon = ICONS[option.visualKind];
          const isSelected = option.id === selected;
          const optionDescriptionId = option.description ? `${option.id}-description` : undefined;
          const optionHelperId = `${option.id}-helper`;

          return (
            <button
              key={option.id}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              onClick={() => onChange(option.id)}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
              role="radio"
              aria-checked={isSelected}
              aria-describedby={[optionHelperId, optionDescriptionId].filter(Boolean).join(" ")}
              tabIndex={isSelected ? 0 : -1}
              className={cn(
                "site-focus-ring site-touch-target w-full rounded-[var(--site-radius-lg)] border px-4 py-4 text-left transition-all duration-200",
                isSelected
                  ? "border-[color:var(--site-color-primary)] bg-[color:var(--site-color-primary-soft)] shadow-[var(--site-shadow-sm)]"
                  : "border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] hover:border-[color:var(--site-color-border-strong)] hover:bg-[color:var(--site-color-surface-inset)]",
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-full",
                    option.visualKind === "pix"
                      ? "bg-[color:var(--site-color-success-soft)] text-[color:var(--site-color-success)]"
                      : "bg-[color:var(--site-color-info-soft)] text-[color:var(--site-color-info)]",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1 site-stack-panel">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="site-stack-panel">
                      <span className="text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                        {option.title}
                      </span>
                      <p id={optionHelperId} className="site-text-meta">{option.helperLabel}</p>
                    </div>
                    <StatusBadge tone={isSelected ? "accent" : "neutral"}>
                      {isSelected ? <Shield className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      {isSelected ? "Selecionado" : "Disponível"}
                    </StatusBadge>
                  </div>
                  {option.description ? (
                    <p id={optionDescriptionId} className="site-text-meta">{option.description}</p>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {showIntro ? (
        <OverlaySection
          title="Pagamento protegido"
          description="PIX e cartão continuam vinculados ao mesmo pedido e ao histórico da conta."
        />
      ) : null}
    </div>
  );
}
