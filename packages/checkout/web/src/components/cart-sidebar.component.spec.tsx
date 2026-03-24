import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: jest.fn(),
  }),
}));

jest.mock("../actions/checkout.actions", () => ({
  createCheckoutOrderAction: jest.fn(),
}));

const actionsModule = jest.requireMock("../actions/checkout.actions") as {
  createCheckoutOrderAction: jest.Mock;
};

const { CartSidebar } = require("./cart-sidebar.component") as typeof import("./cart-sidebar.component");

describe("CartSidebar", () => {
  it("renders the summary and finalization CTA in the right sidebar and completes the order", async () => {
    (actionsModule.createCheckoutOrderAction as any).mockResolvedValueOnce({
      success: true,
      order: {
        orderId: "77",
      },
    });

    render(
      <CartSidebar
        cart={{
          items: [
            {
              itemKey: "line_1",
              productId: "7",
              quantity: 1,
              total: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
              unitPrice: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
              name: "Produto",
              image: null,
            },
          ],
          subtotal: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
          total: { amount: 64.9, currencyCode: "BRL", formatted: "R$ 64,90" },
          couponCode: undefined,
          couponDiscount: null,
          customer: null,
          coupons: [],
          shippingPackages: [],
          shippingStatus: "rates_available",
          hasCalculatedShipping: true,
          shippingDestinationComplete: true,
          shippingRates: [
            {
              packageId: "1",
              rateId: "sedex:1",
              rateKey: "sedex:1",
              instanceId: "1",
              methodId: "sedex",
              label: "SEDEX",
              description: undefined,
              cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
              selected: true,
              metaData: [],
              deliveryForecastDays: 2,
            },
          ],
          shippingTotal: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
          feeTotal: null,
          taxTotal: null,
        }}
        cartState={{
          items: [
            {
              itemKey: "line_1",
              productId: "7",
              quantity: 1,
              unitPrice: 49.9,
              total: 49.9,
              name: "Produto",
              image: null,
            },
          ],
        }}
        userId="12"
        customer={{
          id: "12",
          email: "maria@example.com",
          displayName: "Maria",
          billingAddress: {
            firstName: "Maria",
            lastName: "Silva",
            addressLine1: "Rua 1",
            addressLine2: "Apto 100",
            city: "Sao Paulo",
            state: "SP",
            postcode: "01000-000",
            country: "BR",
            phone: "11999999999",
            email: "maria@example.com",
          },
          shippingAddress: {
            firstName: "Maria",
            lastName: "Silva",
            addressLine1: "Rua 1",
            addressLine2: "Apto 100",
            city: "Sao Paulo",
            state: "SP",
            postcode: "01000-000",
            country: "BR",
            phone: "11999999999",
            email: "maria@example.com",
          },
        }}
        paymentOptions={[
          {
            id: "woo-mercado-pago-pix",
            title: "Pix",
            description: "PIX",
            flow: "pix",
            visualKind: "pix",
            helperLabel: "PIX oficial do Mercado Pago",
          },
        ]}
        selectedPaymentMethod="woo-mercado-pago-pix"
      />,
    );

    const sidebar = screen.getByTestId("checkout-sidebar-section");
    const totalRow = screen.getByTestId("checkout-finalization-total-row");

    expect(sidebar).toBeTruthy();
    expect(sidebar.getAttribute("class")).toContain("min-w-0");
    expect(screen.getByTestId("checkout-finalization-section")).toBeTruthy();
    expect(screen.getByText(/Resumo do pedido/i)).toBeTruthy();
    expect(totalRow.getAttribute("class")).toBe("grid gap-3");
    expect(screen.getByText(/pronto para criar pedido/i).getAttribute("class")).toContain("w-fit");

    fireEvent.click(screen.getByRole("button", { name: /criar pedido e abrir pix/i }));

    await waitFor(() => {
      expect(actionsModule.createCheckoutOrderAction).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/order-confirmation/77#payment");
    });
  });

  it("keeps the authoritative cart total when a coupon is already reflected in the backend cart", async () => {
    (actionsModule.createCheckoutOrderAction as any).mockResolvedValueOnce({
      success: true,
      order: {
        orderId: "88",
      },
    });

    render(
      <CartSidebar
        cart={{
          items: [
            {
              itemKey: "line_1",
              productId: "7",
              quantity: 1,
              total: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
              unitPrice: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
              name: "Produto",
              image: null,
            },
          ],
          subtotal: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
          total: { amount: 54.9, currencyCode: "BRL", formatted: "R$ 54,90" },
          couponCode: "SOLAR",
          couponDiscount: {
            amount: 10,
            currencyCode: "BRL",
            formatted: "R$ 10,00",
          },
          customer: null,
          coupons: [
            {
              code: "SOLAR",
              label: "Cupom: SOLAR",
              description: "Frete grátis liberado pelo cupom.",
              type: "fixed_cart",
              discount: {
                amount: 10,
                currencyCode: "BRL",
                formatted: "R$ 10,00",
              },
            },
          ],
          shippingPackages: [],
          shippingStatus: "rates_available",
          hasCalculatedShipping: true,
          shippingDestinationComplete: true,
          shippingRates: [
            {
              packageId: "1",
              rateId: "free_shipping:1",
              rateKey: "free_shipping:1",
              instanceId: "1",
              methodId: "free_shipping",
              label: "Frete grátis",
              description: undefined,
              cost: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
              selected: true,
              metaData: [],
              deliveryForecastDays: undefined,
            },
          ],
          shippingTotal: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
          feeTotal: null,
          taxTotal: null,
        }}
        cartState={{
          items: [
            {
              itemKey: "line_1",
              productId: "7",
              quantity: 1,
              unitPrice: 49.9,
              total: 49.9,
              name: "Produto",
              image: null,
            },
          ],
        }}
        userId="12"
        customer={{
          id: "12",
          email: "maria@example.com",
          displayName: "Maria",
          billingAddress: {
            firstName: "Maria",
            lastName: "Silva",
            addressLine1: "Rua 1",
            addressLine2: "Apto 100",
            city: "Sao Paulo",
            state: "SP",
            postcode: "01000-000",
            country: "BR",
            phone: "11999999999",
            email: "maria@example.com",
          },
          shippingAddress: {
            firstName: "Maria",
            lastName: "Silva",
            addressLine1: "Rua 1",
            addressLine2: "Apto 100",
            city: "Sao Paulo",
            state: "SP",
            postcode: "01000-000",
            country: "BR",
            phone: "11999999999",
            email: "maria@example.com",
          },
        }}
        paymentOptions={[
          {
            id: "woo-mercado-pago-pix",
            title: "Pix",
            description: "PIX",
            flow: "pix",
            visualKind: "pix",
            helperLabel: "PIX oficial do Mercado Pago",
          },
        ]}
        selectedPaymentMethod="woo-mercado-pago-pix"
      />,
    );

    expect(screen.getAllByText("R$ 54,90").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /criar pedido e abrir pix/i }));

    await waitFor(() => {
      expect(actionsModule.createCheckoutOrderAction).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 54.9,
          coupon: expect.objectContaining({
            code: "SOLAR",
          }),
        }),
      );
    });
  });
});
