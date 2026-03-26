"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Tag, X } from "lucide-react";
import {
  GhostButton,
  OverlaySection,
  PrimaryButton,
  StatusBadge,
  SurfaceCard,
  TextField,
} from "@site/shared";
import type { CoCartCartStateView } from "@site/integrations/cocart";
import { applyCouponAction, removeCouponAction } from "../data/actions/checkout.actions";
import type { CheckoutAppliedCoupon } from "../data/checkout.types";

interface CouponSectionProps {
  initialCoupon?: CheckoutAppliedCoupon | null;
  onCartChange?: (cart: CoCartCartStateView) => void;
  onCouponChange?: (coupon: CheckoutAppliedCoupon | null) => void;
}

export function CouponSection({
  initialCoupon = null,
  onCartChange,
  onCouponChange,
}: CouponSectionProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CheckoutAppliedCoupon | null>(initialCoupon);
  const hasMonetaryDiscount = Number(appliedCoupon?.discount || 0) > 0;

  useEffect(() => {
    setAppliedCoupon(initialCoupon);
  }, [initialCoupon]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      return;
    }

    setIsApplying(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("coupon_code", couponCode);
      const result = await applyCouponAction(formData);

      if (!("success" in result) || !result.success) {
        setError("error" in result ? result.error : "Erro ao aplicar cupom");
        return;
      }

      setCouponCode("");
      setAppliedCoupon(result.appliedCoupon ?? null);
      onCouponChange?.(result.appliedCoupon ?? null);
      if (result.cart) {
        onCartChange?.(result.cart);
      }
    } catch {
      setError("Erro ao aplicar cupom");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setIsRemoving(true);
    setError(null);

    try {
      const result = await removeCouponAction();

      if (result.success) {
        setAppliedCoupon(null);
        onCouponChange?.(null);
        if (result.cart) {
          onCartChange?.(result.cart);
        }
      } else {
        setError(result.error || "Erro ao remover cupom");
      }
    } catch {
      setError("Erro ao remover cupom");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <SurfaceCard tone="soft" className="site-stack-section">
      <div className="site-stack-panel">
        <StatusBadge tone="success">
          <Tag className="h-3.5 w-3.5" />
          Cupom
        </StatusBadge>
        <div>
          <h3 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
            Cupom de desconto
          </h3>
          <p className="site-text-body text-sm">
            Aplique um código promocional válido antes de concluir o pedido.
          </p>
        </div>
      </div>

      {appliedCoupon ? (
        <OverlaySection
          title="Cupom aplicado"
          description="O desconto já está refletido no resumo e no total estimado."
          actions={
            <GhostButton
              onClick={handleRemoveCoupon}
              disabled={isRemoving}
              className="justify-center text-[color:var(--site-color-danger-text)] hover:text-[color:var(--site-color-danger)]"
            >
              {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              {isRemoving ? "Removendo..." : "Remover cupom"}
            </GhostButton>
          }
          className="border-[color:var(--site-color-success-soft)] bg-[color:var(--site-color-success-soft)]/80"
        >
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--site-color-success)] text-white">
              <Check className="h-4 w-4" />
            </div>
            <div className="site-stack-panel">
              <p className="text-sm font-semibold text-[color:var(--site-color-success)]">
                {appliedCoupon.code}
              </p>
              <p className="site-text-meta">
                {hasMonetaryDiscount
                  ? `Desconto de R$ ${appliedCoupon.discount.toFixed(2)} aplicado ao pedido.`
                  : "Cupom aplicado ao carrinho. Revise as opções de frete e o total atualizados."}
              </p>
            </div>
          </div>
        </OverlaySection>
      ) : (
        <OverlaySection
          title="Aplicar promoção"
          description="Use um código válido para atualizar o total antes da confirmação final."
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <TextField
              label="Código do cupom"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
              placeholder="Digite o código promocional"
              containerClassName="flex-1"
              onKeyDown={(event) => event.key === "Enter" && handleApplyCoupon()}
              error={error ?? undefined}
            />
            <PrimaryButton
              onClick={handleApplyCoupon}
              disabled={isApplying || !couponCode.trim()}
              className="justify-center sm:min-w-40"
            >
              {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isApplying ? "Aplicando..." : "Aplicar"}
            </PrimaryButton>
          </div>
        </OverlaySection>
      )}
    </SurfaceCard>
  );
}
