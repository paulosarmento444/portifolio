import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type {
  StoreProductDetail,
  StoreProductVariation,
} from "../../lib/store.types";

jest.mock("./product-hero.component", () => ({
  ProductHero: ({
    product,
    currentProduct,
    selectedVariation,
    selectedColor,
    selectedSize,
    colorOptions,
    sizeOptions,
    setSelectedColor,
    setSelectedSize,
    addToCartAction,
  }: any) => (
    <div data-testid="product-hero">
      <div data-testid="current-product-id">{currentProduct.id}</div>
      <div data-testid="selected-variation-id">{selectedVariation?.id ?? ""}</div>
      <div data-testid="selected-color">{selectedColor}</div>
      <div data-testid="selected-size">{selectedSize}</div>

      <div>
        {colorOptions.map((option: { value: string; disabled: boolean }) => (
          <button
            key={`color-${option.value}`}
            type="button"
            disabled={option.disabled}
            onClick={() => setSelectedColor(option.value)}
          >
            {`cor:${option.value}`}
          </button>
        ))}
      </div>

      <div>
        {sizeOptions.map((option: { value: string; disabled: boolean }) => (
          <button
            key={`size-${option.value}`}
            type="button"
            disabled={option.disabled}
            onClick={() => setSelectedSize(option.value)}
          >
            {`tam:${option.value}`}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          const formData = new FormData();
          formData.append("product_id", product.id);
          if (currentProduct.id !== product.id) {
            formData.append("variation_id", currentProduct.id);
          }

          void addToCartAction(formData);
        }}
      >
        adicionar
      </button>
    </div>
  ),
}));

jest.mock("./product-description.component", () => ({
  ProductDescription: ({ description }: { description: string }) => (
    <div data-testid="product-description" dangerouslySetInnerHTML={{ __html: description }} />
  ),
}));

jest.mock("./product-specs.component", () => ({
  ProductSpecs: () => <div data-testid="product-specs" />,
}));

const { StoreProductClient } =
  require("./store-product.client") as typeof import("./store-product.client");

const buildMoney = (amount: number) => ({
  amount,
  currencyCode: "BRL",
  formatted: new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount),
});

const buildVariableProduct = (): StoreProductDetail => ({
  id: "310",
  slug: "cmfea",
  name: "Camiseta Masculina Fitness Essential 3 listas Adidas",
  type: "variable",
  sku: "CMFEA",
  shortDescription: "Resumo do produto",
  image: null,
  categories: [],
  price: buildMoney(89.9),
  regularPrice: buildMoney(89.9),
  salePrice: null,
  createdAt: "2026-03-12T10:00:00.000Z",
  ratingAverage: 0,
  ratingCount: 0,
  featured: false,
  onSale: false,
  stockStatus: "instock",
  description: "<p>Detalhes do produto</p>",
  gallery: [],
  attributes: [
    {
      id: "1",
      name: "Cor",
      type: "variation",
      options: ["Azul", "Branco"],
    },
    {
      id: "2",
      name: "Tamanho",
      type: "variation",
      options: ["P", "G"],
    },
  ],
  purchasable: true,
  manageStock: false,
  stockQuantity: null,
});

const buildVariation = ({
  id,
  sku,
  color,
  size,
  inStock,
  stockQuantity,
}: {
  id: string;
  sku: string;
  color: string;
  size: string;
  inStock: boolean;
  stockQuantity: number;
}): StoreProductVariation => ({
  id,
  slug: `variation-${id}`,
  name: `Variação ${id}`,
  type: "variation",
  sku,
  shortDescription: `Variação ${color} ${size}`,
  image: null,
  categories: [],
  price: buildMoney(89.9),
  regularPrice: buildMoney(89.9),
  salePrice: null,
  createdAt: "2026-03-12T10:00:00.000Z",
  ratingAverage: 0,
  ratingCount: 0,
  featured: false,
  onSale: false,
  stockStatus: inStock ? "instock" : "outofstock",
  description: `<p>${color} ${size}</p>`,
  gallery: [],
  attributes: [
    { id: "1", name: "Cor", type: "variation", value: color, options: [] },
    { id: "2", name: "Tamanho", type: "variation", value: size, options: [] },
  ],
  purchasable: inStock,
  manageStock: true,
  stockQuantity,
});

describe("StoreProductClient", () => {
  it("sanitizes the product description before rendering the editorial block", () => {
    render(
      <StoreProductClient
        product={{
          ...buildVariableProduct(),
          description: '<p class="legacy" style="color:red">Detalhes</p>',
        }}
        variations={[]}
        addToCartAction={async () => undefined}
      />,
    );

    expect(screen.getByText("Detalhes")).toBeTruthy();

    const proseNode = screen.getByTestId("product-description");
    expect(proseNode.innerHTML).toContain("<p>Detalhes</p>");
    expect(proseNode.innerHTML).not.toContain("style=");
    expect(proseNode.innerHTML).not.toContain("class=");
  });

  it("seeds the PDP with the first in-stock variation and disables impossible or out-of-stock options", async () => {
    let submittedFormData: FormData | null = null;
    const addToCartAction = jest.fn(async (formData: FormData) => {
      submittedFormData = formData;
    });

    render(
      <StoreProductClient
        product={buildVariableProduct()}
        variations={[
          buildVariation({
            id: "312",
            sku: "CMFEAPAZ",
            color: "Azul",
            size: "P",
            inStock: true,
            stockQuantity: 1,
          }),
          buildVariation({
            id: "314",
            sku: "CMFEAGB",
            color: "Branco",
            size: "G",
            inStock: false,
            stockQuantity: 0,
          }),
        ]}
        addToCartAction={addToCartAction}
      />,
    );

    expect(screen.getByTestId("current-product-id").textContent).toBe("312");
    expect(screen.getByTestId("selected-variation-id").textContent).toBe("312");
    expect(screen.getByTestId("selected-color").textContent).toBe("Azul");
    expect(screen.getByTestId("selected-size").textContent).toBe("P");
    expect(
      (screen.getByRole("button", { name: "cor:Branco" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      (screen.getByRole("button", { name: "tam:G" }) as HTMLButtonElement).disabled,
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "adicionar" }));

    await waitFor(() => expect(addToCartAction).toHaveBeenCalledTimes(1));

    expect(submittedFormData).toBeDefined();
    if (!submittedFormData) {
      throw new Error("Expected addToCartAction to receive a FormData payload.");
    }
    const actualSubmittedFormData = submittedFormData as FormData;
    expect(actualSubmittedFormData.get("product_id")).toBe("310");
    expect(actualSubmittedFormData.get("variation_id")).toBe("312");
  });

  it("recalculates the opposite attribute when the shopper changes to another valid in-stock combination", () => {
    render(
      <StoreProductClient
        product={buildVariableProduct()}
        variations={[
          buildVariation({
            id: "312",
            sku: "CMFEAPAZ",
            color: "Azul",
            size: "P",
            inStock: true,
            stockQuantity: 4,
          }),
          buildVariation({
            id: "314",
            sku: "CMFEAGB",
            color: "Branco",
            size: "G",
            inStock: true,
            stockQuantity: 2,
          }),
        ]}
        addToCartAction={async () => undefined}
      />,
    );

    expect(
      (screen.getByRole("button", { name: "cor:Branco" }) as HTMLButtonElement).disabled,
    ).toBe(false);
    expect(
      (screen.getByRole("button", { name: "tam:G" }) as HTMLButtonElement).disabled,
    ).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "tam:G" }));

    expect(screen.getByTestId("current-product-id").textContent).toBe("314");
    expect(screen.getByTestId("selected-color").textContent).toBe("Branco");
    expect(screen.getByTestId("selected-size").textContent).toBe("G");
    expect(
      (screen.getByRole("button", { name: "cor:Azul" }) as HTMLButtonElement).disabled,
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "tam:P" }));

    expect(screen.getByTestId("current-product-id").textContent).toBe("312");
    expect(screen.getByTestId("selected-color").textContent).toBe("Azul");
    expect(screen.getByTestId("selected-size").textContent).toBe("P");
    expect(
      (screen.getByRole("button", { name: "cor:Branco" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("keeps simple products without variation controls", () => {
    render(
      <StoreProductClient
        product={{
          ...buildVariableProduct(),
          id: "44",
          slug: "produto-44",
          name: "Produto simples",
          type: "simple",
          sku: "SKU-44",
          attributes: [],
        }}
        variations={[]}
        addToCartAction={async () => undefined}
      />,
    );

    expect(screen.queryByRole("button", { name: "cor:Azul" })).toBeNull();
    expect(screen.queryByRole("button", { name: "tam:P" })).toBeNull();
    expect(screen.getByTestId("current-product-id").textContent).toBe("44");
  });
});
