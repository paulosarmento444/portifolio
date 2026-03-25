"use client";

import type React from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";
import type { AddToCartAction } from "../../lib/store.types";

interface ProductQuantityFormProps {
  productId: string;
  variationId?: string | null;
  stockStatus: string;
  manageStock: boolean;
  stockQuantity: number | null;
  addToCartAction: AddToCartAction;
}

export function ProductQuantityForm({
  productId,
  variationId,
  stockStatus,
  manageStock,
  stockQuantity,
  addToCartAction,
}: ProductQuantityFormProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const isProcessingRef = useRef(false);

  const isOutOfStock =
    stockStatus === "outofstock" || (manageStock && (stockQuantity ?? 0) <= 0);

  const maxQuantity = isOutOfStock
    ? 1
    : manageStock && stockQuantity && stockQuantity > 0
      ? stockQuantity
      : 10;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity && !isLoading) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isProcessingRef.current || isLoading || isOutOfStock) {
      return;
    }

    isProcessingRef.current = true;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("product_id", productId);
      if (variationId) {
        formData.append("variation_id", variationId);
      }
      formData.append("quantity", quantity.toString());
      const result = await addToCartAction(formData);

      if (result && !result.success) {
        toast.error(result.message);
        setIsLoading(false);
        isProcessingRef.current = false;
        return;
      }

      router.push(result?.redirectTo ?? "/my-cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Não foi possível adicionar este produto ao carrinho. Tente novamente.");
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  };

  return (
    <form className="site-stack-section" onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="site-stack-panel">
          <span className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
            Quantidade
          </span>
          <span className="site-text-meta">Máximo disponível: {maxQuantity}</span>
        </div>

        <div className="inline-flex items-center rounded-[var(--site-radius-md)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)]">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center text-[color:var(--site-color-foreground)] disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || isLoading}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="inline-flex min-w-14 items-center justify-center px-3 text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
            {quantity}
          </span>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center text-[color:var(--site-color-foreground)] disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= maxQuantity || isLoading}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <input type="hidden" name="product_id" value={productId} />
      {variationId ? <input type="hidden" name="variation_id" value={variationId} /> : null}
      <input type="hidden" name="quantity" value={quantity} />

      <p className="site-text-meta">
        O item é enviado ao carrinho com a variação atualmente selecionada.
      </p>

      <button
        type="submit"
        disabled={isOutOfStock || isLoading || isProcessingRef.current}
        className="site-button-primary w-full justify-center py-4 text-base disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processando
          </>
        ) : isOutOfStock ? (
          "Produto indisponível"
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Adicionar ao carrinho
          </>
        )}
      </button>
    </form>
  );
}
