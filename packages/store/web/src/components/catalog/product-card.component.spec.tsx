/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import type { StoreCatalogProduct } from "../../data/store.types";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ unoptimized: _unoptimized, fill: _fill, ...props }: any) => <img {...props} />,
}));

const { ProductCard } = require("./product-card.component") as typeof import("./product-card.component");

const baseProduct: StoreCatalogProduct = {
  id: "1",
  slug: "tenis-premium",
  name: "Tênis Premium Carbon",
  type: "simple",
  sku: "TENIS-1",
  shortDescription: "Descrição longa para validar a composição do card em modo lista.",
  image: {
    url: "/produto.jpg",
    alt: "Tênis Premium Carbon",
  },
  categories: [{ id: "performance", name: "Performance", slug: "performance" }],
  price: { amount: 149.9, currencyCode: "BRL", formatted: "R$ 149,90" },
  regularPrice: { amount: 199.9, currencyCode: "BRL", formatted: "R$ 199,90" },
  salePrice: { amount: 149.9, currencyCode: "BRL", formatted: "R$ 149,90" },
  createdAt: "2026-03-20T10:00:00.000Z",
  ratingAverage: 4.8,
  ratingCount: 14,
  featured: true,
  onSale: true,
  stockStatus: "instock",
};

describe("ProductCard", () => {
  it("renders premium commerce information without losing the original pricing context", () => {
    render(<ProductCard product={baseProduct} viewMode="grid" />);

    expect(screen.getByRole("link", { name: /ver produto: tênis premium carbon/i }).getAttribute("href")).toBe("/store/1");
    expect(screen.getByText("Oferta")).toBeTruthy();
    expect(screen.getByText("-25%")).toBeTruthy();
    expect(screen.getByText("Performance")).toBeTruthy();
    expect(screen.getByText("R$ 149,90")).toBeTruthy();
    expect(screen.getByText("R$ 199,90")).toBeTruthy();
    expect(screen.getByText("4.8 • 14 avaliações")).toBeTruthy();
    expect(screen.getByText("Comprar")).toBeTruthy();
  });

  it("shows the supporting description only in list mode", () => {
    const { rerender } = render(<ProductCard product={baseProduct} viewMode="grid" />);

    expect(
      screen.queryByText(/descrição longa para validar a composição do card em modo lista/i),
    ).toBeNull();

    rerender(<ProductCard product={baseProduct} viewMode="list" />);

    expect(
      screen.getByText(/descrição longa para validar a composição do card em modo lista/i),
    ).toBeTruthy();
  });
});
