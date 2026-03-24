import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

const { useSearchParams } = jest.requireMock("next/navigation") as {
  useSearchParams: jest.Mock;
};

const { StoreCatalogClient } = require("./store-catalog.client") as typeof import("./store-catalog.client");

const buildProducts = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    slug: `produto-${index + 1}`,
    name: `Produto ${index + 1}`,
    type: "simple" as const,
    sku: `SKU-${index + 1}`,
    shortDescription: `Descricao do produto ${index + 1}`,
    image: null,
    categories: [
      {
        id: index < 6 ? "a" : "b",
        name: index < 6 ? "Performance" : "Acessórios",
        slug: index < 6 ? "performance" : "acessorios",
      },
    ],
    price: { amount: 100 + index, currencyCode: "BRL", formatted: `R$ ${100 + index},00` },
    regularPrice: { amount: 120 + index, currencyCode: "BRL", formatted: `R$ ${120 + index},00` },
    salePrice: null,
    createdAt: "2026-03-17T10:00:00.000Z",
    ratingAverage: 4.5,
    ratingCount: 12,
    featured: index % 2 === 0,
    onSale: index % 3 === 0,
    stockStatus: "instock" as const,
  }));

const categories = [
  { id: "a", name: "Performance", slug: "performance", description: "", image: null },
  { id: "b", name: "Acessórios", slug: "acessorios", description: "", image: null },
];

describe("StoreCatalogClient", () => {
  beforeEach(() => {
    useSearchParams.mockReturnValue({
      get: jest.fn(() => null),
    });
    window.scrollTo = jest.fn();
  });

  it("renders the new storefront shell with dynamic categories and paginates the real product list", () => {
    render(
      <StoreCatalogClient
        initialProducts={buildProducts(13)}
        initialCategories={categories}
      />,
    );

    expect(screen.getByText(/Todos os produtos/i)).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeTruthy();
    expect(screen.getByLabelText("Buscar produtos")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Performance/i })).toBeTruthy();
    expect(screen.getByText("Página 1 de 2")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Ir para página 2" }));

    expect(screen.getByText("Página 2 de 2")).toBeTruthy();
    expect(screen.getByText("Produto 13")).toBeTruthy();
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it("keeps sidebar interactions working for categories, search and product navigation", () => {
    render(
      <StoreCatalogClient
        initialProducts={buildProducts(13)}
        initialCategories={categories}
      />,
    );

    const productLink = screen.getByRole("link", { name: "Ver produto: Produto 1" });
    expect(productLink.getAttribute("href")).toBe("/store/1");

    fireEvent.click(screen.getByRole("button", { name: /Acessórios/i }));
    expect(screen.getByRole("status").textContent).toContain("7 produtos");

    fireEvent.change(screen.getByLabelText("Buscar produtos"), {
      target: { value: "Produto 13" },
    });

    expect(screen.getByRole("status").textContent).toContain("1 produto");
    expect(screen.getByText("Produto 13")).toBeTruthy();
  });
});
