import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CatalogProductCardView } from "@site/shared";
import { StatusBadge } from "@site/shared";
import { formatProductPrice } from "./home/home.utils";

interface HomeProductCardProps {
  product: CatalogProductCardView;
}

export default function HomeProductCard({ product }: Readonly<HomeProductCardProps>) {
  const image = product.image;
  const displayPrice = formatProductPrice(product);
  const regularPrice = product.regularPrice.formatted
    ? product.regularPrice.formatted
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: product.regularPrice.currencyCode || "BRL",
      }).format(product.regularPrice.amount);

  const isOnSale = product.onSale && product.regularPrice.amount > product.price.amount;

  return (
    <Link href={`/store/${product.id}`} aria-label={`Ver produto: ${product.name}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-[1.8rem] bg-white shadow-[var(--site-shadow-md)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--site-shadow-lg)] dark:bg-[color:var(--site-color-surface-strong)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--site-color-surface-inset)]">
          <Image
            src={image?.url || "/placeholder.svg"}
            alt={image?.alt || product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0),rgba(15,23,42,0.06))]" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {product.featured ? <StatusBadge tone="warning">Destaque</StatusBadge> : null}
            {isOnSale ? <StatusBadge tone="accent">Oferta</StatusBadge> : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
          <div className="space-y-2">
            {product.categories[0] ? (
              <p className="site-text-meta uppercase tracking-[0.14em]">{product.categories[0].name}</p>
            ) : null}
            <h3 className="line-clamp-2 text-[1.18rem] font-semibold leading-7 tracking-[-0.04em] text-[color:var(--site-color-foreground-strong)]">
              {product.name}
            </h3>
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex flex-wrap items-end gap-2">
              <span className="text-[1.9rem] font-semibold tracking-[-0.06em] text-[color:var(--site-color-foreground-strong)]">
                {displayPrice}
              </span>
              {isOnSale ? (
                <span className="pb-1 text-sm text-[color:var(--site-color-foreground-soft)] line-through">
                  {regularPrice}
                </span>
              ) : null}
            </div>

            <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--site-color-primary)] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 group-hover:bg-[color:var(--site-color-primary-strong)]">
              Ver produto
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
