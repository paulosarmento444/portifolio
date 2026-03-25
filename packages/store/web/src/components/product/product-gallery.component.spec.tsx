/* eslint-disable @next/next/no-img-element */
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import type {
  StoreProductDetail,
  StoreProductVariation,
} from "../../lib/store.types";
import { ProductGallery } from "./product-gallery.component";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src, ...props }: any) => <img alt={alt} src={src} {...props} />,
}));

const buildMoney = (amount: number) => ({
  amount,
  currencyCode: "BRL",
  formatted: `R$ ${amount.toFixed(2)}`,
});

const buildProduct = (): StoreProductDetail => ({
  id: "310",
  slug: "cmfea",
  name: "Produto galeria",
  type: "variable",
  sku: "CMFEA",
  shortDescription: "Resumo",
  image: null,
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
  gallery: [
    {
      id: "image-1",
      url: "https://example.com/image-1.jpg",
      alt: "Imagem principal",
    },
    {
      id: "image-2",
      url: "https://example.com/image-2.jpg",
      alt: "Imagem alternativa",
    },
  ],
  attributes: [],
  purchasable: true,
  manageStock: false,
  stockQuantity: null,
});

const buildVariation = (
  gallery: StoreProductVariation["gallery"] = [
    {
      id: "variation-image-1",
      url: "https://example.com/variation-image-1.jpg",
      alt: "Imagem da variacao",
    },
  ],
): StoreProductVariation => ({
  ...buildProduct(),
  id: "312",
  type: "variation",
  name: "Produto galeria - Azul P",
  sku: "CMFEAPAZ",
  gallery,
});

describe("ProductGallery", () => {
  it("does not render the old zoom button or modal anymore", () => {
    render(<ProductGallery product={buildProduct()} selectedVariation={null} />);

    expect(screen.queryByRole("button", { name: "Ampliar imagem" })).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps thumbnail selection working with the active image state", () => {
    render(<ProductGallery product={buildProduct()} selectedVariation={null} />);

    expect(
      screen.getByTestId("product-gallery-active-image").getAttribute("data-image-key"),
    ).toBe("image-1");

    fireEvent.click(
      screen.getByRole("button", { name: "Selecionar imagem 2 de 2" }),
    );

    expect(
      screen.getByTestId("product-gallery-active-image").getAttribute("data-image-key"),
    ).toBe("image-2");
  });

  it("activates inline zoom on desktop pointer move and resets on pointer leave", () => {
    render(<ProductGallery product={buildProduct()} selectedVariation={null} />);

    const stage = screen.getByTestId("product-gallery-stage");
    const activeImage = screen.getByTestId("product-gallery-active-image");

    jest
      .spyOn(stage, "getBoundingClientRect")
      .mockReturnValue({
        width: 200,
        height: 200,
        top: 0,
        left: 0,
        right: 200,
        bottom: 200,
        x: 0,
        y: 0,
        toJSON: () => null,
      });

    fireEvent.mouseMove(stage, {
      clientX: 150,
      clientY: 60,
    });

    expect(activeImage.getAttribute("data-zoom-active")).toBe("true");
    expect(activeImage.getAttribute("style")).toContain("scale(2.15)");
    expect(activeImage.getAttribute("style")).toContain("75% 30%");

    fireEvent.mouseLeave(stage);

    expect(activeImage.getAttribute("data-zoom-active")).toBe("false");
    expect(activeImage.getAttribute("style")).toContain("scale(1)");
  });

  it("ignores touch pointer movement and stays stable without modal behavior", () => {
    render(
      <ProductGallery
        product={buildProduct()}
        selectedVariation={buildVariation()}
      />,
    );

    const stage = screen.getByTestId("product-gallery-stage");
    const activeImage = screen.getByTestId("product-gallery-active-image");

    fireEvent.touchStart(stage);

    expect(activeImage.getAttribute("data-image-key")).toBe("variation-image-1");
    expect(activeImage.getAttribute("data-zoom-active")).toBe("false");
    expect(activeImage.getAttribute("style")).toContain("scale(1)");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("merges variation images with the parent gallery and keeps the variation first", () => {
    render(
      <ProductGallery
        product={buildProduct()}
        selectedVariation={buildVariation([
          {
            id: "variation-image-1",
            url: "https://example.com/variation-image-1.jpg",
            alt: "Imagem da variacao",
          },
        ])}
      />,
    );

    expect(
      screen.getByTestId("product-gallery-active-image").getAttribute("data-image-key"),
    ).toBe("variation-image-1");
    expect(screen.getAllByRole("button", { name: /Selecionar imagem/i })).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "Selecionar imagem 3 de 3" }));

    expect(
      screen.getByTestId("product-gallery-active-image").getAttribute("data-image-key"),
    ).toBe("image-2");
  });

  it("shows all variation images and deduplicates repeated parent assets", () => {
    render(
      <ProductGallery
        product={{
          ...buildProduct(),
          gallery: [
            {
              id: "shared-parent",
              url: "https://example.com/shared.jpg",
              alt: "Compartilhada",
            },
            {
              id: "image-2",
              url: "https://example.com/image-2.jpg",
              alt: "Imagem alternativa",
            },
          ],
        }}
        selectedVariation={buildVariation([
          {
            id: "variation-image-1",
            url: "https://example.com/variation-image-1.jpg",
            alt: "Imagem da variacao 1",
          },
          {
            id: "shared-variation",
            url: "https://example.com/shared.jpg",
            alt: "Compartilhada",
          },
          {
            id: "variation-image-3",
            url: "https://example.com/variation-image-3.jpg",
            alt: "Imagem da variacao 3",
          },
        ])}
      />,
    );

    expect(screen.getAllByRole("button", { name: /Selecionar imagem/i })).toHaveLength(4);

    fireEvent.click(screen.getByRole("button", { name: "Selecionar imagem 2 de 4" }));
    expect(
      screen.getByTestId("product-gallery-active-image").getAttribute("data-image-key"),
    ).toBe("shared-variation");

    fireEvent.click(screen.getByRole("button", { name: "Selecionar imagem 4 de 4" }));
    expect(
      screen.getByTestId("product-gallery-active-image").getAttribute("data-image-key"),
    ).toBe("image-2");
  });
});
