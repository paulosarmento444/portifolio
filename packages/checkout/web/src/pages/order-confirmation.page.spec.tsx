import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

jest.mock("next/headers", () => ({
  headers: jest.fn(async () => ({
    get: jest.fn(() => null),
  })),
}));

jest.mock("@site/integrations/cocart/server", () => ({
  cocartServerAdapter: {
    getSessionState: jest.fn(),
  },
  readCoCartForwardHeaders: jest.fn(async () => undefined),
  readCoCartAccessToken: jest.fn(async () => undefined),
  verifyCoCartAccessToken: jest.fn(() => null),
}));

jest.mock("@site/integrations/wordpress/server", () => ({
  wordpressWooRestAdapter: {
    getOrderPaymentContextForCustomer: jest.fn(),
    getOrderByIdForCustomer: jest.fn(),
  },
}));

jest.mock("@site/integrations/payments/server", () => ({
  mercadoPagoHeadlessServer: {
    getConfig: jest.fn(),
    getOrderPaymentState: jest.fn(),
  },
}));

jest.mock("../components/order/order-confirmation.component", () => ({
  OrderConfirmationView: ({ order }: { order: { orderNumber: string } }) => (
    <div data-testid="order-confirmation-view">{order.orderNumber}</div>
  ),
}));

const { cocartServerAdapter } = jest.requireMock(
  "@site/integrations/cocart/server",
) as {
  cocartServerAdapter: {
    getSessionState: jest.MockedFunction<(...args: unknown[]) => Promise<unknown>>;
  };
};

const { wordpressWooRestAdapter } = jest.requireMock(
  "@site/integrations/wordpress/server",
) as {
  wordpressWooRestAdapter: {
    getOrderPaymentContextForCustomer: jest.MockedFunction<(...args: unknown[]) => Promise<unknown>>;
    getOrderByIdForCustomer: jest.MockedFunction<(...args: unknown[]) => Promise<unknown>>;
  };
};

const { mercadoPagoHeadlessServer } = jest.requireMock(
  "@site/integrations/payments/server",
) as {
  mercadoPagoHeadlessServer: {
    getConfig: jest.MockedFunction<(...args: unknown[]) => Promise<unknown>>;
    getOrderPaymentState: jest.MockedFunction<(...args: unknown[]) => Promise<unknown>>;
  };
};

const { CheckoutOrderConfirmationPage } = require("./order-confirmation.page") as typeof import("./order-confirmation.page");

describe("order confirmation page", () => {
  beforeEach(() => {
    cocartServerAdapter.getSessionState.mockReset();
    wordpressWooRestAdapter.getOrderPaymentContextForCustomer.mockReset();
    wordpressWooRestAdapter.getOrderByIdForCustomer.mockReset();
    mercadoPagoHeadlessServer.getConfig.mockReset();
    mercadoPagoHeadlessServer.getOrderPaymentState.mockReset();
  });

  it("returns not found state for invalid order ids", async () => {
    render(await CheckoutOrderConfirmationPage({ orderId: "abc" }));

    expect(screen.getByText("Pedido não encontrado")).toBeTruthy();
  });

  it("renders the order confirmation flow from Woo order detail when available", async () => {
    cocartServerAdapter.getSessionState.mockResolvedValueOnce({
      capabilities: {
        catalog: "unverified",
        cart: "unverified",
        coupons: "unverified",
        shipping: "unverified",
        totals: "unverified",
        account: "unsupported",
        auth: "unverified",
      },
      session: {
        isAuthenticated: true,
        user: {
          id: "10",
        },
      },
    });
    wordpressWooRestAdapter.getOrderPaymentContextForCustomer.mockResolvedValueOnce({
      orderKey: "order-key-77",
      order: {
        orderId: "77",
        orderNumber: "00077",
        status: { code: "pending", label: "Pendente" },
        createdAt: "2026-03-12T10:00:00.000Z",
        total: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
        paymentMethodId: "woo-mercado-pago-pix",
        paymentMethodTitle: "PIX",
        shippingAddress: {},
        billingAddress: {},
        items: [],
        couponCode: undefined,
        couponDiscount: null,
      },
    });
    mercadoPagoHeadlessServer.getOrderPaymentState.mockResolvedValueOnce({
      flow: "pix",
      methodId: "woo-mercado-pago-pix",
      methodTitle: "PIX",
      orderStatus: "pending",
      orderStatusLabel: "Pendente",
      paymentStatus: "pending",
      isPending: true,
      isPaid: false,
      paymentIds: [],
      checkoutType: null,
      pix: null,
      card: null,
      threeDS: { required: false },
    });
    mercadoPagoHeadlessServer.getConfig.mockResolvedValueOnce({
      sdkUrl: "https://sdk.mercadopago.com/js/v2",
      publicKey: "test-public-key",
      locale: "pt-BR",
      siteId: "MLB",
      testMode: true,
      enabledGatewayIds: ["woo-mercado-pago-pix", "woo-mercado-pago-custom"],
    });
    wordpressWooRestAdapter.getOrderByIdForCustomer.mockResolvedValueOnce({
      orderId: "77",
      orderNumber: "00077",
      status: { code: "pending", label: "Pendente" },
      createdAt: "2026-03-12T10:00:00.000Z",
      total: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
      paymentMethodId: "woo-mercado-pago-pix",
      paymentMethodTitle: "PIX",
      shippingAddress: {},
      billingAddress: {},
      items: [],
      couponCode: undefined,
      couponDiscount: null,
    });

    render(await CheckoutOrderConfirmationPage({ orderId: "77" }));

    expect(screen.getByTestId("order-confirmation-view").textContent).toBe("00077");
    expect(wordpressWooRestAdapter.getOrderPaymentContextForCustomer).toHaveBeenCalledWith(77, 10);
    expect(mercadoPagoHeadlessServer.getOrderPaymentState).toHaveBeenCalledWith({
      orderId: 77,
      orderKey: "order-key-77",
      sync: true,
    });
  });

  it("returns not found when the authenticated customer does not own the Woo order", async () => {
    cocartServerAdapter.getSessionState.mockResolvedValueOnce({
      capabilities: {
        catalog: "unverified",
        cart: "unverified",
        coupons: "unverified",
        shipping: "unverified",
        totals: "unverified",
        account: "unverified",
        auth: "unverified",
      },
      session: {
        isAuthenticated: true,
        user: {
          id: "10",
        },
      },
    });
    wordpressWooRestAdapter.getOrderPaymentContextForCustomer.mockResolvedValueOnce(null);

    render(await CheckoutOrderConfirmationPage({ orderId: "77" }));

    expect(screen.getByText("Pedido não encontrado")).toBeTruthy();
  });

  it("returns not found for unauthenticated users", async () => {
    cocartServerAdapter.getSessionState.mockResolvedValueOnce({
      capabilities: {
        catalog: "unverified",
        cart: "unverified",
        coupons: "unverified",
        shipping: "unverified",
        totals: "unverified",
        account: "unsupported",
        auth: "unverified",
      },
      session: {
        isAuthenticated: false,
        user: null,
      },
    });

    render(await CheckoutOrderConfirmationPage({ orderId: "77" }));

    expect(wordpressWooRestAdapter.getOrderPaymentContextForCustomer).not.toHaveBeenCalled();
    expect(screen.getByText("Pedido não encontrado")).toBeTruthy();
  });
});
