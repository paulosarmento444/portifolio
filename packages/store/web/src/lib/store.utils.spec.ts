import { describe, expect, it } from "@jest/globals";
import type { StoreProductDetail, StoreProductVariation } from "./store.types";
import { resolveGallery } from "./store.utils";

const buildMoney = (amount: number) => ({
  amount,
  currencyCode: "BRL",
  formatted: `R$ ${amount.toFixed(2)}`,
});

const buildProduct = (gallery: StoreProductDetail["gallery"]): StoreProductDetail => ({
  id: "310",
  slug: "produto-base",
  name: "Produto base",
  type: "variable",
  sku: "PROD-BASE",
  shortDescription: "Resumo",
  image: gallery[0] ?? null,
  categories: [],
  price: buildMoney(149),
  regularPrice: buildMoney(149),
  salePrice: null,
  createdAt: "2026-03-12T10:00:00.000Z",
  ratingAverage: 0,
  ratingCount: 0,
  featured: false,
  onSale: false,
  stockStatus: "instock",
  description: "<p>Detalhes</p>",
  gallery,
  attributes: [],
  purchasable: true,
  manageStock: false,
  stockQuantity: null,
});

const buildVariation = (
  gallery: StoreProductVariation["gallery"],
): StoreProductVariation => ({
  ...buildProduct(gallery),
  id: "311",
  slug: "produto-variacao",
  name: "Produto variacao",
  type: "variation",
  sku: "PROD-VAR",
});

describe("resolveGallery", () => {
  it("keeps the parent gallery for products without a selected variation", () => {
    const product = buildProduct([
      { id: "parent-1", url: "https://example.com/parent-1.jpg", alt: "Pai 1" },
      { id: "parent-2", url: "https://example.com/parent-2.jpg", alt: "Pai 2" },
    ]);

    expect(resolveGallery(product, null).map((image) => image.id)).toEqual([
      "parent-1",
      "parent-2",
    ]);
  });

  it("prioritizes variation images and complements with the parent gallery", () => {
    const product = buildProduct([
      { id: "parent-1", url: "https://example.com/parent-1.jpg", alt: "Pai 1" },
      { id: "parent-2", url: "https://example.com/parent-2.jpg", alt: "Pai 2" },
    ]);
    const variation = buildVariation([
      { id: "variation-1", url: "https://example.com/variation-1.jpg", alt: "Var 1" },
    ]);

    expect(resolveGallery(product, variation).map((image) => image.id)).toEqual([
      "variation-1",
      "parent-1",
      "parent-2",
    ]);
  });

  it("keeps multiple variation images and removes duplicates from the parent gallery", () => {
    const product = buildProduct([
      { id: "shared-parent", url: "https://example.com/shared.jpg", alt: "Compartilhada" },
      { id: "parent-2", url: "https://example.com/parent-2.jpg", alt: "Pai 2" },
    ]);
    const variation = buildVariation([
      { id: "variation-1", url: "https://example.com/variation-1.jpg", alt: "Var 1" },
      { id: "shared-variation", url: "https://example.com/shared.jpg", alt: "Compartilhada" },
      { id: "variation-3", url: "https://example.com/variation-3.jpg", alt: "Var 3" },
    ]);

    expect(resolveGallery(product, variation).map((image) => image.url)).toEqual([
      "https://example.com/variation-1.jpg",
      "https://example.com/shared.jpg",
      "https://example.com/variation-3.jpg",
      "https://example.com/parent-2.jpg",
    ]);
  });

  it("falls back to the parent gallery when the variation has no own images", () => {
    const product = buildProduct([
      { id: "parent-1", url: "https://example.com/parent-1.jpg", alt: "Pai 1" },
    ]);
    const variation = buildVariation([]);

    expect(resolveGallery(product, variation).map((image) => image.id)).toEqual([
      "parent-1",
    ]);
  });
});
