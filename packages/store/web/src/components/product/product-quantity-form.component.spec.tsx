import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockPush = jest.fn();
const mockToastError = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("react-hot-toast", () => ({
  toast: {
    error: mockToastError,
  },
}));

const { ProductQuantityForm } =
  require("./product-quantity-form.component") as typeof import("./product-quantity-form.component");

describe("ProductQuantityForm", () => {
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    mockPush.mockReset();
    mockToastError.mockReset();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("redirects to my-cart after a successful add to cart", async () => {
    const addToCartAction = jest.fn(async () => ({
      success: true as const,
      redirectTo: "/my-cart",
    }));

    render(
      <ProductQuantityForm
        productId="310"
        variationId="312"
        stockStatus="instock"
        manageStock
        stockQuantity={1}
        addToCartAction={addToCartAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /adicionar ao carrinho/i }));

    await waitFor(() => {
      expect(addToCartAction).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/my-cart");
    });

    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("shows a toast when the authoritative add is blocked by stock or max quantity", async () => {
    const addToCartAction = jest.fn(async () => ({
      success: false as const,
      reason: "limit_reached" as const,
      message: "Este produto já está no carrinho e não é possível adicionar mais unidades.",
    }));

    render(
      <ProductQuantityForm
        productId="310"
        variationId="312"
        stockStatus="instock"
        manageStock
        stockQuantity={1}
        addToCartAction={addToCartAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /adicionar ao carrinho/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Este produto já está no carrinho e não é possível adicionar mais unidades.",
      );
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows a generic toast when the add to cart action throws unexpectedly", async () => {
    const addToCartAction = jest.fn(async () => {
      throw new Error("network");
    });

    render(
      <ProductQuantityForm
        productId="310"
        stockStatus="instock"
        manageStock={false}
        stockQuantity={null}
        addToCartAction={addToCartAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /adicionar ao carrinho/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Não foi possível adicionar este produto ao carrinho. Tente novamente.",
      );
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
