"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Minus, Package, Plus, Trash2 } from "lucide-react";
import type { CoCartCartItemView } from "@site/integrations/cocart";
import { IconButton, StatusBadge, SurfaceCard } from "@site/shared";
import {
  removeCartItemAction,
  updateCartItemQuantityAction,
} from "../data/actions/checkout.actions";

interface CartItemProps {
  item: CoCartCartItemView;
}

const resolveMinQuantity = (item: CoCartCartItemView) =>
  Math.max(1, item.quantityLimits?.min ?? 1);

const resolveMaxQuantity = (item: CoCartCartItemView) => {
  const max = item.quantityLimits?.max;
  return typeof max === "number" ? max : null;
};

const getIncrementLimitMessage = (item: CoCartCartItemView) => {
  const maxQuantity = resolveMaxQuantity(item);

  if (maxQuantity === null || item.quantity < maxQuantity) {
    return null;
  }

  if (maxQuantity <= 0) {
    return "Item indisponível no momento.";
  }

  if (maxQuantity === 1) {
    return "A última unidade disponível já está no carrinho.";
  }

  return "Estoque máximo disponível já foi atingido para este item.";
};

const normalizeQuantityError = (
  errorMessage: string | undefined,
  item: CoCartCartItemView,
  requestedQuantity: number,
) => {
  const fallbackMessage = "Não foi possível atualizar a quantidade deste item.";
  const normalizedMessage = errorMessage?.trim();
  const loweredMessage = normalizedMessage?.toLowerCase() || "";
  const incrementLimitMessage = getIncrementLimitMessage({
    ...item,
    quantity: requestedQuantity,
  });

  if (loweredMessage.includes("stock") || loweredMessage.includes("estoque")) {
    if (requestedQuantity > item.quantity) {
      if (resolveMaxQuantity(item) === 1) {
        return "A última unidade disponível já está no carrinho.";
      }

      return "Estoque insuficiente para aumentar a quantidade.";
    }

    return normalizedMessage || fallbackMessage;
  }

  if (
    loweredMessage.includes("limit") ||
    loweredMessage.includes("purchase") ||
    loweredMessage.includes("quant")
  ) {
    return incrementLimitMessage || normalizedMessage || fallbackMessage;
  }

  return normalizedMessage || incrementLimitMessage || fallbackMessage;
};

export function CartItem({ item }: CartItemProps) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdatingQty, setIsUpdatingQty] = useState(false);
  const [quantityFeedback, setQuantityFeedback] = useState<string | null>(null);
  const quantityFeedbackId = useId();
  const displayedUnitPrice = item.unitPrice ?? item.subtotal ?? item.total;
  const displayedSubtotal = item.subtotal ?? item.total;
  const minQuantity = resolveMinQuantity(item);
  const maxQuantity = resolveMaxQuantity(item);
  const incrementLimitMessage = getIncrementLimitMessage(item);
  const [imgSrc, setImgSrc] = useState(
    item.image?.url || "/placeholder.svg?height=96&width=96",
  );

  const handleRemove = async () => {
    setIsRemoving(true);
    const formData = new FormData();
    formData.append("itemKey", item.itemKey);

    try {
      await removeCartItemAction(formData);
      router.refresh();
    } finally {
      setIsRemoving(false);
    }
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (isUpdatingQty || isRemoving) {
      return;
    }

    if (newQuantity < minQuantity) {
      setQuantityFeedback(
        minQuantity === 1
          ? "A quantidade mínima deste item já está no carrinho."
          : `A quantidade mínima permitida para este item é ${minQuantity}.`,
      );
      return;
    }

    if (maxQuantity !== null && newQuantity > maxQuantity) {
      setQuantityFeedback(getIncrementLimitMessage(item) || "Estoque insuficiente para aumentar a quantidade.");
      return;
    }

    setIsUpdatingQty(true);
    setQuantityFeedback(null);
    const formData = new FormData();
    formData.append("itemKey", item.itemKey);
    formData.append("quantity", newQuantity.toString());

    try {
      const result = await updateCartItemQuantityAction(formData);

      if (!result.success) {
        setQuantityFeedback(normalizeQuantityError(result.error, item, newQuantity));
        return;
      }

      router.refresh();
    } finally {
      setIsUpdatingQty(false);
    }
  };

  const quantityHelperMessage = quantityFeedback || incrementLimitMessage;
  const decrementDisabled = item.quantity <= minQuantity || isUpdatingQty || isRemoving;
  const incrementDisabled = Boolean(incrementLimitMessage) || isUpdatingQty || isRemoving;

  return (
    <SurfaceCard interactive className="overflow-hidden">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
        <div className="relative h-24 w-24 overflow-hidden rounded-[var(--site-radius-lg)] bg-[color:var(--site-color-surface-inset)]">
          <Image
            src={imgSrc}
            alt={item.name}
            fill
            sizes="96px"
            unoptimized
            className="object-cover"
            onError={() => setImgSrc("/placeholder.svg?height=96&width=96")}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="site-stack-panel min-w-0">
              <StatusBadge tone="neutral">
                <Package className="h-3.5 w-3.5" />
                Item do pedido
              </StatusBadge>
              <div className="site-stack-panel min-w-0">
                <h3 className="site-text-card-title truncate text-[color:var(--site-color-foreground-strong)]">
                  {item.name}
                </h3>
                <p className="site-text-meta">Preço unitário: {displayedUnitPrice.formatted}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-end">
              <div className="site-stack-panel items-end">
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] px-2 py-1">
                  <IconButton
                    icon={<Minus className="h-4 w-4" />}
                    label="Diminuir quantidade"
                    size="sm"
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    disabled={decrementDisabled}
                    aria-describedby={quantityHelperMessage ? quantityFeedbackId : undefined}
                  />
                  <span className="min-w-10 text-center text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                    {item.quantity}
                  </span>
                  <IconButton
                    icon={<Plus className="h-4 w-4" />}
                    label="Aumentar quantidade"
                    size="sm"
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                    disabled={incrementDisabled}
                    aria-describedby={quantityHelperMessage ? quantityFeedbackId : undefined}
                  />
                </div>
                {quantityHelperMessage ? (
                  <p
                    id={quantityFeedbackId}
                    role={quantityFeedback ? "alert" : "status"}
                    aria-live="polite"
                    className={`inline-flex max-w-[22rem] items-center gap-2 text-right text-xs ${
                      quantityFeedback
                        ? "text-[color:var(--site-color-danger-text)]"
                        : "text-[color:var(--site-color-foreground-muted)]"
                    }`}
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{quantityHelperMessage}</span>
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="site-text-meta">Subtotal do item</p>
                  <p className="text-xl font-semibold text-[color:var(--site-color-foreground-strong)]">
                    {displayedSubtotal.formatted}
                  </p>
                </div>
                <IconButton
                  icon={<Trash2 className="h-4 w-4" />}
                  label="Remover item"
                  variant="secondary"
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="border-[color:var(--site-color-danger-soft)] text-[color:var(--site-color-danger-text)] hover:border-[color:var(--site-color-danger)] hover:text-[color:var(--site-color-danger)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
