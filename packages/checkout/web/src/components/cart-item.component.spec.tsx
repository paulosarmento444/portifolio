import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-cart-item-image" />,
}));

jest.mock("../data/actions/checkout.actions", () => ({
  removeCartItemAction: jest.fn(),
  updateCartItemQuantityAction: jest.fn(),
}));

const actionsModule = jest.requireMock("../data/actions/checkout.actions") as {
  removeCartItemAction: jest.Mock;
  updateCartItemQuantityAction: jest.Mock;
};

const { CartItem } = require("./cart-item.component") as typeof import("./cart-item.component");

describe("CartItem", () => {
  beforeEach(() => {
    mockRefresh.mockReset();
    actionsModule.removeCartItemAction.mockReset();
    actionsModule.updateCartItemQuantityAction.mockReset();
  });

  it("keeps the original item pricing visible when the cart line total is discounted by a coupon", () => {
    render(
      <CartItem
        item={{
          itemKey: "line_1",
          productId: "produto-1",
          quantity: 2,
          quantityLimits: {
            min: 1,
            max: 4,
          },
          subtotal: { amount: 150, currencyCode: "BRL", formatted: "R$ 150,00" },
          total: { amount: 140, currencyCode: "BRL", formatted: "R$ 140,00" },
          unitPrice: { amount: 75, currencyCode: "BRL", formatted: "R$ 75,00" },
          name: "Kit Solar",
          image: null,
        }}
      />,
    );

    expect(screen.getByText(/preço unitário: r\$ 75,00/i)).toBeTruthy();
    expect(screen.getByText(/subtotal do item/i)).toBeTruthy();
    expect(screen.getByText("R$ 150,00")).toBeTruthy();
    expect(screen.queryByText("R$ 140,00")).toBeNull();
  });

  it("increments quantity when the authoritative cart allows it", async () => {
    (actionsModule.updateCartItemQuantityAction as any).mockResolvedValueOnce({
      success: true,
      cart: { items: [] },
    });

    render(
      <CartItem
        item={{
          itemKey: "line_1",
          productId: "produto-1",
          quantity: 1,
          quantityLimits: {
            min: 1,
            max: 3,
          },
          subtotal: { amount: 75, currencyCode: "BRL", formatted: "R$ 75,00" },
          total: { amount: 75, currencyCode: "BRL", formatted: "R$ 75,00" },
          unitPrice: { amount: 75, currencyCode: "BRL", formatted: "R$ 75,00" },
          name: "Kit Solar",
          image: null,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /aumentar quantidade/i }));

    await waitFor(() => {
      expect(actionsModule.updateCartItemQuantityAction).toHaveBeenCalledTimes(1);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    const formData = actionsModule.updateCartItemQuantityAction.mock.calls[0]?.[0] as FormData;
    expect(formData.get("itemKey")).toBe("line_1");
    expect(formData.get("quantity")).toBe("2");
  });

  it("keeps decrement blocked when the authoritative cart requires a minimum quantity", () => {
    render(
      <CartItem
        item={{
          itemKey: "line_1",
          productId: "produto-1",
          quantity: 2,
          quantityLimits: {
            min: 2,
            max: 4,
          },
          subtotal: { amount: 150, currencyCode: "BRL", formatted: "R$ 150,00" },
          total: { amount: 150, currencyCode: "BRL", formatted: "R$ 150,00" },
          unitPrice: { amount: 75, currencyCode: "BRL", formatted: "R$ 75,00" },
          name: "Kit Solar",
          image: null,
        }}
      />,
    );

    expect(screen.getByRole("button", { name: /diminuir quantidade/i }).getAttribute("disabled")).not.toBeNull();
    expect(actionsModule.updateCartItemQuantityAction).not.toHaveBeenCalled();
  });

  it("blocks increment when the authoritative cart already reached the last available unit", () => {
    render(
      <CartItem
        item={{
          itemKey: "line_1",
          productId: "produto-1",
          quantity: 1,
          quantityLimits: {
            min: 1,
            max: 1,
          },
          subtotal: { amount: 75, currencyCode: "BRL", formatted: "R$ 75,00" },
          total: { amount: 75, currencyCode: "BRL", formatted: "R$ 75,00" },
          unitPrice: { amount: 75, currencyCode: "BRL", formatted: "R$ 75,00" },
          name: "Kit Solar",
          image: null,
        }}
      />,
    );

    expect(screen.getByRole("button", { name: /aumentar quantidade/i }).getAttribute("disabled")).not.toBeNull();
    expect(screen.getByText(/a última unidade disponível já está no carrinho/i)).toBeTruthy();
    expect(actionsModule.updateCartItemQuantityAction).not.toHaveBeenCalled();
  });

  it("shows a stock message when the backend rejects the increment", async () => {
    (actionsModule.updateCartItemQuantityAction as any).mockResolvedValueOnce({
      success: false,
      error: "Only 2 items are available in stock.",
    });

    render(
      <CartItem
        item={{
          itemKey: "line_1",
          productId: "produto-1",
          quantity: 2,
          quantityLimits: {
            min: 1,
            max: 4,
          },
          subtotal: { amount: 150, currencyCode: "BRL", formatted: "R$ 150,00" },
          total: { amount: 150, currencyCode: "BRL", formatted: "R$ 150,00" },
          unitPrice: { amount: 75, currencyCode: "BRL", formatted: "R$ 75,00" },
          name: "Kit Solar",
          image: null,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /aumentar quantidade/i }));

    expect((await screen.findByRole("alert")).textContent).toMatch(/estoque insuficiente para aumentar a quantidade/i);
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
