import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("@site/integrations/wordpress/server", () => ({
  wordpressWooRestAdapter: {
    listCheckoutPaymentMethods: jest.fn(),
  },
}));

const { wordpressWooRestAdapter } = jest.requireMock(
  "@site/integrations/wordpress/server",
) as {
  wordpressWooRestAdapter: {
    listCheckoutPaymentMethods: jest.Mock;
  };
};

const {
  getSupportedCheckoutPaymentMethods,
  OFFICIAL_MERCADO_PAGO_PAYMENT_METHOD_IDS,
} = require("./checkout-payment-methods") as typeof import("./checkout-payment-methods");

describe("getSupportedCheckoutPaymentMethods", () => {
  beforeEach(() => {
    wordpressWooRestAdapter.listCheckoutPaymentMethods.mockReset();
  });

  it("returns only enabled official Mercado Pago Woo gateways", async () => {
    (wordpressWooRestAdapter.listCheckoutPaymentMethods as any).mockResolvedValueOnce([
      {
        id: "woo-mercado-pago-pix",
        title: "Pix",
        description: "Checkout Transparente PIX",
        enabled: true,
      },
      {
        id: "woo-mercado-pago-custom",
        title: "Cartão de crédito",
        description: "Checkout Transparente",
        enabled: true,
      },
      {
        id: "cod",
        title: "Dinheiro",
        description: "Pagamento na entrega",
        enabled: true,
      },
    ]);

    const methods = await getSupportedCheckoutPaymentMethods();

    expect(methods).toEqual([
      {
        id: "woo-mercado-pago-pix",
        title: "Pix",
        description: "Checkout Transparente PIX",
        enabled: true,
      },
      {
        id: "woo-mercado-pago-custom",
        title: "Cartão de crédito",
        description: "Checkout Transparente",
        enabled: true,
      },
    ]);
  });

  it("deduplicates repeated official gateways", async () => {
    (wordpressWooRestAdapter.listCheckoutPaymentMethods as any).mockResolvedValueOnce([
      {
        id: "woo-mercado-pago-pix",
        title: "Pix",
        description: "Checkout Transparente PIX",
        enabled: true,
      },
      {
        id: "woo-mercado-pago-pix",
        title: "Pix duplicado",
        description: "Não deve aparecer duas vezes",
        enabled: true,
      },
    ]);

    const methods = await getSupportedCheckoutPaymentMethods();

    expect(methods).toHaveLength(1);
    expect(methods[0]?.id).toBe("woo-mercado-pago-pix");
  });

  it("keeps the supported official gateway ids explicit", () => {
    expect(OFFICIAL_MERCADO_PAGO_PAYMENT_METHOD_IDS).toEqual([
      "woo-mercado-pago-custom",
      "woo-mercado-pago-pix",
    ]);
  });
});
