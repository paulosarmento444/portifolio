"use client";

import { useMemo } from "react";
import { Share2 } from "lucide-react";
import {
  ChipFilter,
  IconButton,
  MetricRow,
  StatusBadge,
  SurfaceCard,
} from "@site/shared";
import type {
  AddToCartAction,
  StoreProductDetail,
} from "../../data/store.types";
import { truncatePlainText } from "../../data/store.utils";
import { ProductMetaBadges } from "../shared/product-meta-badges.component";
import { ProductPriceBlock } from "../shared/product-price-block.component";
import { ProductQuantityForm } from "./product-quantity-form.component";

interface ProductInfoProps {
  product: StoreProductDetail;
  currentProduct: StoreProductDetail;
  selectedColor: string;
  selectedSize: string;
  colorOptions: Array<{ value: string; disabled: boolean }>;
  sizeOptions: Array<{ value: string; disabled: boolean }>;
  setSelectedColor: (color: string) => void;
  setSelectedSize: (size: string) => void;
  addToCartAction: AddToCartAction;
}

export function ProductInfo({
  product,
  currentProduct,
  selectedColor,
  selectedSize,
  colorOptions,
  sizeOptions,
  setSelectedColor,
  setSelectedSize,
  addToCartAction,
}: ProductInfoProps) {
  const shortDescription = useMemo(
    () => truncatePlainText(currentProduct.shortDescription ?? product.shortDescription, 220),
    [currentProduct.shortDescription, product.shortDescription],
  );

  const discountPercentage =
    currentProduct.onSale && currentProduct.regularPrice.amount > 0
      ? Math.round(
          ((currentProduct.regularPrice.amount - currentProduct.price.amount) /
            currentProduct.regularPrice.amount) *
            100,
        )
      : 0;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.shortDescription ?? product.name,
          url: window.location.href,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
      console.error("Erro ao compartilhar produto:", error);
    }
  };

  const stockQuantity = currentProduct.manageStock
    ? currentProduct.stockQuantity ?? null
    : null;
  const displayName = currentProduct.name || product.name;
  const displaySku = currentProduct.sku || product.sku;
  const stockLabel =
    currentProduct.stockStatus === "instock" ? "Disponível para compra" : "Sem estoque";

  return (
    <div className="site-stack-section">
      <SurfaceCard tone="strong" className="site-stack-section">
        <div className="flex items-start justify-between gap-4 border-b border-[color:var(--site-color-border)] pb-5 sm:gap-5">
          <div className="site-stack-panel min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {product.categories.slice(0, 3).map((category) => (
                <StatusBadge key={category.id} tone="neutral">
                  {category.name}
                </StatusBadge>
              ))}
            </div>
            <h1 className="site-text-page-title max-w-[12ch] text-balance leading-[0.94] text-[color:var(--site-color-foreground-strong)] sm:max-w-[14ch]">
              {displayName}
            </h1>
          </div>

          <IconButton
            className="shrink-0"
            icon={<Share2 className="h-4 w-4" />}
            label="Compartilhar produto"
            variant="secondary"
            onClick={handleShare}
          />
        </div>

        <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-interactive-muted)] p-5 sm:p-6">
          <div className="site-stack-panel gap-2">
            <span className="site-text-meta uppercase tracking-[0.12em]">Preço final</span>
            <ProductPriceBlock
              price={currentProduct.price}
              regularPrice={currentProduct.regularPrice}
              onSale={currentProduct.onSale}
              discountPercentage={discountPercentage}
              size="lg"
            />
            <p className="site-text-meta">
              Preço e disponibilidade acompanham a combinação escolhida.
            </p>
          </div>
        </div>

        {product.type === "variable" ? (
          <SurfaceCard tone="soft" padding="compact" className="site-stack-panel">
            <div className="site-stack-panel gap-1">
              <h2 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
                Escolha a variação
              </h2>
              <p className="site-text-meta">
                Cor e tamanho ficam juntos para deixar a troca de imagem e disponibilidade mais claras.
              </p>
            </div>

            {colorOptions.length > 0 ? (
              <div className="site-stack-panel gap-2">
                <div>
                  <h3 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
                    Cor
                  </h3>
                  <p className="site-text-meta">
                    Selecione a cor para atualizar preço, imagem e disponibilidade.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <ChipFilter
                      key={color.value}
                      active={selectedColor === color.value}
                      disabled={color.disabled}
                      onClick={() => setSelectedColor(color.value)}
                      className="disabled:cursor-not-allowed disabled:border-[color:var(--site-color-border)] disabled:bg-[color:var(--site-color-surface-inset)] disabled:text-[color:var(--site-color-foreground-subtle)] disabled:opacity-60"
                    >
                      {color.value}
                    </ChipFilter>
                  ))}
                </div>
              </div>
            ) : null}

            {sizeOptions.length > 0 ? (
              <div className="site-stack-panel gap-2">
                <div>
                  <h3 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
                    Tamanho
                  </h3>
                  <p className="site-text-meta">
                    Use os tamanhos disponíveis para chegar à variação correta.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <ChipFilter
                      key={size.value}
                      active={selectedSize === size.value}
                      disabled={size.disabled}
                      onClick={() => setSelectedSize(size.value)}
                      className="disabled:cursor-not-allowed disabled:border-[color:var(--site-color-border)] disabled:bg-[color:var(--site-color-surface-inset)] disabled:text-[color:var(--site-color-foreground-subtle)] disabled:opacity-60"
                    >
                      {size.value}
                    </ChipFilter>
                  ))}
                </div>
              </div>
            ) : null}
          </SurfaceCard>
        ) : null}

        <MetricRow
          items={[
            {
              label: "Avaliação",
              value:
                product.ratingCount > 0
                  ? `${product.ratingAverage.toFixed(1)} / 5`
                  : "Novo item",
              meta:
                product.ratingCount > 0
                  ? `${product.ratingCount} avaliação${product.ratingCount !== 1 ? "ões" : ""}`
                  : "Sem avaliações ainda",
            },
            {
              label: "SKU",
              value: displaySku ?? "Sob consulta",
              meta: "Identificação do item",
            },
            {
              label: "Disponibilidade",
              value: stockLabel,
              meta:
                stockQuantity !== null && stockQuantity > 0
                  ? `${stockQuantity} unidade(s) disponíveis`
                  : "Reposição conforme estoque",
            },
          ]}
          className="md:grid-cols-2 2xl:grid-cols-3"
        />

        <div className="site-stack-panel gap-3">
          {shortDescription ? <p className="site-text-body">{shortDescription}</p> : null}

          <ProductMetaBadges
            featured={currentProduct.featured}
            onSale={currentProduct.onSale}
            type={product.type}
            stockStatus={currentProduct.stockStatus}
            discountPercentage={discountPercentage}
          />
        </div>
      </SurfaceCard>

      <SurfaceCard tone="strong" className="site-stack-section">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="site-text-section-title text-[color:var(--site-color-foreground-strong)]">
              Finalize sua escolha
            </h2>
            <p className="site-text-body">
              Quantidade, disponibilidade e ação principal no mesmo bloco de compra.
            </p>
          </div>
          {stockQuantity !== null && stockQuantity > 0 ? (
            <StatusBadge tone="success">{stockQuantity} unidade(s) disponíveis</StatusBadge>
          ) : null}
        </div>

        <ProductQuantityForm
          productId={product.id}
          variationId={currentProduct.id !== product.id ? currentProduct.id : null}
          stockStatus={currentProduct.stockStatus}
          manageStock={currentProduct.manageStock}
          stockQuantity={currentProduct.stockQuantity}
          addToCartAction={addToCartAction}
        />
      </SurfaceCard>

    </div>
  );
}
