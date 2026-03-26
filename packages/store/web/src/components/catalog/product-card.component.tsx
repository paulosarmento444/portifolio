"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { cn, StatusBadge } from "@site/shared";
import type { StoreCatalogProduct, StoreViewMode } from "../../data/store.types";
import {
    formatMoney,
    resolveStockLabel,
    truncatePlainText,
} from "../../data/store.utils";

interface ProductCardProps {
    product: StoreCatalogProduct;
    viewMode: StoreViewMode;
}

export function ProductCard({ product, viewMode }: ProductCardProps) {
    const [imageError, setImageError] = useState(false);

    const imageUrl = imageError
        ? "/placeholder.svg?height=640&width=640"
        : product.image?.url;
    const description = useMemo(
        () => truncatePlainText(product.shortDescription, 150),
        [product.shortDescription],
    );

    const discountPercentage =
        product.onSale && product.regularPrice.amount > 0
            ? Math.round(
                  ((product.regularPrice.amount - product.price.amount) /
                      product.regularPrice.amount) *
                      100,
              )
            : 0;

    const kicker = product.categories[0]?.name ?? "Catálogo";
    const promoLabel = product.onSale
        ? "Oferta"
        : product.featured
          ? "Destaque"
          : null;
    const stockLabel = resolveStockLabel(product.stockStatus);
    const ratingSummary =
        product.ratingCount > 0
            ? `${product.ratingAverage.toFixed(1)} • ${product.ratingCount} avaliações`
            : stockLabel;

    return (
        <Link
            href={`/store/${product.id}`}
            className="group block h-full"
            aria-label={`Ver produto: ${product.name}`}
        >
            <article
                className={cn(
                    "flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[color:var(--store-catalog-card-border)] bg-[color:var(--store-catalog-card-surface)] shadow-[var(--store-catalog-card-shadow)] transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--store-catalog-accent-soft)] hover:shadow-[var(--store-catalog-card-shadow-hover)]",
                    viewMode === "list" &&
                        "md:grid md:grid-cols-[18rem_minmax(0,1fr)]",
                )}
            >
                <div
                    className={cn(
                        "relative overflow-hidden border-b border-[color:var(--store-catalog-card-border)]",
                        viewMode === "list"
                            ? "aspect-[4/3] md:aspect-auto md:min-h-full md:border-b-0 md:border-r"
                            : "aspect-square",
                    )}
                    style={{
                        backgroundColor: "var(--store-catalog-card-inset)",
                        backgroundImage: "var(--store-catalog-image-surface)",
                    }}
                >
                    <Image
                        alt={product.image?.alt || product.name}
                        src={imageUrl || "/placeholder.svg"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.045]"
                        onError={() => setImageError(true)}
                        sizes={
                            viewMode === "list"
                                ? "(max-width: 768px) 100vw, 18rem"
                                : "(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 22vw"
                        }
                        loading="lazy"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-[image:var(--store-catalog-image-overlay)]" />
                    <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-2">
                        {promoLabel ? (
                            <StatusBadge
                                tone={product.onSale ? "accent" : "warning"}
                            >
                                {promoLabel}
                            </StatusBadge>
                        ) : null}
                        {discountPercentage > 0 ? (
                            <span className="inline-flex min-h-7 items-center rounded-full border border-[color:var(--store-catalog-accent-soft)] bg-[color:var(--store-catalog-card-surface)] px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--store-catalog-accent)] shadow-[var(--site-shadow-sm)]">
                                -{discountPercentage}%
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className="flex h-full flex-1 flex-col gap-3.5 p-4 sm:p-5 ">
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <p className="site-text-meta text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--store-catalog-meta)]">
                                {kicker}
                            </p>

                            <h3 className="line-clamp-2 min-h-[3.15rem] text-[1.05rem] font-semibold leading-6 tracking-[-0.04em] text-[color:var(--store-catalog-title)]">
                                {product.name}
                            </h3>
                        </div>

                        {viewMode === "list" && description ? (
                            <p className="text-sm leading-5 text-[color:var(--store-catalog-meta)]">
                                {description}
                            </p>
                        ) : null}

                        <div className="flex items-center justify-between gap-2">
                            <div className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-[color:var(--store-catalog-card-border)] bg-[color:var(--store-catalog-card-inset)] px-2.5 text-[11px] font-medium text-[color:var(--store-catalog-meta)]">
                                <Star className="h-3.5 w-3.5 fill-current text-[color:var(--store-catalog-accent)]" />
                                <span>{ratingSummary}</span>
                            </div>
                            {product.ratingCount > 0 ? (
                                <span className="text-[11px] font-medium text-[color:var(--store-catalog-caption)]">
                                    {stockLabel}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    <div className="mt-auto grid gap-3 pt-1 ">
                        <div className="space-y-1.5">
                            <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                                <span className="text-[1.6rem] font-semibold tracking-[-0.05em] text-[color:var(--store-catalog-price)]">
                                    {formatMoney(product.price)}
                                </span>
                                {product.onSale ? (
                                    <span className="pb-0.5 text-[13px] text-[color:var(--store-catalog-price-muted)] line-through">
                                        {formatMoney(product.regularPrice)}
                                    </span>
                                ) : null}
                            </div>
                            <p className="text-[11px] leading-4 text-[color:var(--store-catalog-caption)]">
                                Entrega e frete definidos no checkout.
                            </p>
                        </div>

                        <span className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-[color:var(--store-catalog-accent)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--store-catalog-cta-shadow)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:bg-[color:var(--store-catalog-accent-strong)] group-hover:shadow-[0_20px_30px_rgba(48,83,255,0.24)] group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-[color:var(--store-catalog-accent)] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[color:var(--store-catalog-card-surface)]">
                            Comprar
                            <ArrowRight className="h-4 w-4" />
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
