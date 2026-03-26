import type { CatalogProductCardView } from "../../contracts";

export const stripHtml = (value?: string | null) =>
  value?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "";

export const formatProductPrice = (product: CatalogProductCardView) =>
  product.price.formatted
    ? product.price.formatted
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: product.price.currencyCode || "BRL",
      }).format(product.price.amount);
