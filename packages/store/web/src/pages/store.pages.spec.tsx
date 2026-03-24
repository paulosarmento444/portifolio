import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { render, screen } from "@testing-library/react";

jest.mock("@site/integrations/cocart/server", () => ({
  cocartServerAdapter: {
    listCatalogProducts: jest.fn(),
    getCatalogProductDetail: jest.fn(),
    listCatalogProductVariations: jest.fn(),
  },
}));

jest.mock("../components/catalog/store-catalog.client", () => ({
  StoreCatalogClient: ({
    initialProducts,
    initialCategories,
    initialError,
  }: {
    initialProducts: Array<{ name: string }>;
    initialCategories: Array<{ name: string }>;
    initialError?: string | null;
  }) => (
    <div>
      <span data-testid="catalog-products">{initialProducts.length}</span>
      <span data-testid="catalog-categories">{initialCategories.length}</span>
      <span data-testid="catalog-error">{initialError ?? ""}</span>
    </div>
  ),
}));

jest.mock("../components/product/store-product.client", () => ({
  StoreProductClient: ({
    product,
    variations,
  }: {
    product: { name: string };
    variations: unknown[];
  }) => (
    <div>
      <span data-testid="product-name">{product.name}</span>
      <span data-testid="product-variations">{variations.length}</span>
    </div>
  ),
}));

jest.mock("../components/product/product-not-found-state.component", () => ({
  ProductNotFoundState: () => <div data-testid="not-found">NOT_FOUND</div>,
}));

jest.mock("../components/product/product-error-state.component", () => ({
  ProductErrorState: ({ error }: { error: string }) => (
    <div data-testid="product-error">{error}</div>
  ),
}));

const { cocartServerAdapter } = jest.requireMock(
  "@site/integrations/cocart/server",
) as {
  cocartServerAdapter: {
    listCatalogProducts: jest.Mock;
    getCatalogProductDetail: jest.Mock;
    listCatalogProductVariations: jest.Mock;
  };
};

const { StoreCatalogPage } = require("./store-catalog.page") as typeof import("./store-catalog.page");
const { StoreProductPage } = require("./store-product.page") as typeof import("./store-product.page");

const mockedCoCartAdapter = cocartServerAdapter as unknown as {
  listCatalogProducts: jest.Mock;
  getCatalogProductDetail: jest.Mock;
  listCatalogProductVariations: jest.Mock;
};

describe("store pages", () => {
  beforeEach(() => {
    mockedCoCartAdapter.listCatalogProducts.mockReset();
    mockedCoCartAdapter.getCatalogProductDetail.mockReset();
    mockedCoCartAdapter.listCatalogProductVariations.mockReset();
  });

  it("renders catalog data from the CoCart adapter boundary", async () => {
    (mockedCoCartAdapter.listCatalogProducts as any).mockResolvedValueOnce({
      items: [
        {
          id: "10",
          slug: "produto-10",
          name: "Produto Teste",
          type: "simple",
          sku: "SKU",
          shortDescription: "Desc",
          image: null,
          categories: [],
          price: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
          regularPrice: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
          salePrice: null,
          createdAt: "2026-03-12T10:00:00.000Z",
          ratingAverage: 4.2,
          ratingCount: 4,
          featured: false,
          onSale: false,
          stockStatus: "instock",
        },
      ],
      availableCategories: [
        { id: "1", name: "Vitaminas", slug: "vitaminas", description: "", image: null },
      ],
      pagination: {
        currentPage: 1,
        pageSize: 100,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    render(await StoreCatalogPage());

    expect(mockedCoCartAdapter.listCatalogProducts).toHaveBeenCalledWith({
      page: 1,
      pageSize: 100,
    });
    expect(screen.getByTestId("catalog-products").textContent).toBe("1");
    expect(screen.getByTestId("catalog-categories").textContent).toBe("1");
    expect(screen.getByTestId("catalog-error").textContent).toBe("");
  });

  it("falls back to an empty catalog state when loading fails", async () => {
    (mockedCoCartAdapter.listCatalogProducts as any).mockRejectedValueOnce(
      new Error("cocart down"),
    );

    render(await StoreCatalogPage());

    expect(screen.getByTestId("catalog-products").textContent).toBe("0");
    expect(screen.getByTestId("catalog-categories").textContent).toBe("0");
    expect(screen.getByTestId("catalog-error").textContent).toBe(
      "Erro ao carregar dados. Tente novamente.",
    );
  });

  it("merges multiple CoCart catalog pages so new products are not hidden behind the first batch", async () => {
    (mockedCoCartAdapter.listCatalogProducts as any)
      .mockResolvedValueOnce({
        items: [
          {
            id: "10",
            slug: "produto-10",
            name: "Produto Página 1",
            type: "simple",
            sku: "SKU-10",
            shortDescription: "Desc",
            image: null,
            categories: [{ id: "1", name: "Categoria 1", slug: "categoria-1" }],
            price: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
            regularPrice: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
            salePrice: null,
            createdAt: "2026-03-12T10:00:00.000Z",
            ratingAverage: 4.2,
            ratingCount: 4,
            featured: false,
            onSale: false,
            stockStatus: "instock",
          },
        ],
        availableCategories: [
          { id: "1", name: "Categoria 1", slug: "categoria-1", description: "", image: null },
        ],
        pagination: {
          currentPage: 1,
          pageSize: 100,
          totalItems: 101,
          totalPages: 2,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: "11",
            slug: "produto-11",
            name: "Produto Página 2",
            type: "simple",
            sku: "SKU-11",
            shortDescription: "Desc",
            image: null,
            categories: [{ id: "2", name: "Categoria 2", slug: "categoria-2" }],
            price: { amount: 12, currencyCode: "BRL", formatted: "R$ 12,00" },
            regularPrice: { amount: 12, currencyCode: "BRL", formatted: "R$ 12,00" },
            salePrice: null,
            createdAt: "2026-03-13T10:00:00.000Z",
            ratingAverage: 4.5,
            ratingCount: 2,
            featured: true,
            onSale: false,
            stockStatus: "instock",
          },
        ],
        availableCategories: [
          { id: "2", name: "Categoria 2", slug: "categoria-2", description: "", image: null },
        ],
        pagination: {
          currentPage: 2,
          pageSize: 100,
          totalItems: 101,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });

    render(await StoreCatalogPage());

    expect(mockedCoCartAdapter.listCatalogProducts).toHaveBeenNthCalledWith(1, {
      page: 1,
      pageSize: 100,
    });
    expect(mockedCoCartAdapter.listCatalogProducts).toHaveBeenNthCalledWith(2, {
      page: 2,
      pageSize: 100,
    });
    expect(screen.getByTestId("catalog-products").textContent).toBe("2");
    expect(screen.getByTestId("catalog-categories").textContent).toBe("2");
  });

  it("renders a not found state for invalid product ids", async () => {
    render(
      await StoreProductPage({
        productId: "abc",
        addToCartAction: async () => undefined,
      }),
    );

    expect(screen.getByTestId("not-found").textContent).toBe("NOT_FOUND");
  });

  it("loads product detail and variations through the CoCart boundary", async () => {
    (mockedCoCartAdapter.getCatalogProductDetail as any).mockResolvedValueOnce({
      id: "20",
      slug: "produto-20",
      name: "Produto Variavel",
      type: "variable",
      sku: "SKU-20",
      shortDescription: "Desc",
      image: null,
      categories: [],
      price: { amount: 20, currencyCode: "BRL", formatted: "R$ 20,00" },
      regularPrice: { amount: 20, currencyCode: "BRL", formatted: "R$ 20,00" },
      salePrice: null,
      createdAt: "2026-03-12T10:00:00.000Z",
      ratingAverage: 0,
      ratingCount: 0,
      featured: false,
      onSale: false,
      stockStatus: "instock",
      description: "<p>desc</p>",
      gallery: [],
      attributes: [],
      purchasable: true,
      manageStock: false,
      stockQuantity: 10,
    });
    (mockedCoCartAdapter.listCatalogProductVariations as any).mockResolvedValueOnce([
      {
        id: "21",
      },
    ]);

    render(
      await StoreProductPage({
        productId: "20",
        addToCartAction: async () => undefined,
      }),
    );

    expect(mockedCoCartAdapter.listCatalogProductVariations).toHaveBeenCalledWith(20);
    expect(screen.getByTestId("product-name").textContent).toBe("Produto Variavel");
    expect(screen.getByTestId("product-variations").textContent).toBe("1");
  });

  it("returns not found for CoCart 404 product errors", async () => {
    (mockedCoCartAdapter.getCatalogProductDetail as any).mockRejectedValueOnce({
      response: {
        status: 404,
      },
    });

    render(
      await StoreProductPage({
        productId: "99",
        addToCartAction: async () => undefined,
      }),
    );

    expect(screen.getByTestId("not-found").textContent).toBe("NOT_FOUND");
  });
});
