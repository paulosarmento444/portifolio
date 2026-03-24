/** @jest-environment jsdom */

const fetchPolyfill = require("node-fetch");
const Headers = globalThis.Headers || fetchPolyfill.Headers;
const Request = globalThis.Request || fetchPolyfill.Request;
const BaseResponse = globalThis.Response || fetchPolyfill.Response;

class NextCompatibleResponse extends BaseResponse {
  static json(body: unknown, init?: ResponseInit) {
    return new NextCompatibleResponse(JSON.stringify(body), {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init?.headers || {}),
      },
    });
  }
}

Object.assign(globalThis, {
  Headers,
  Request,
  Response: NextCompatibleResponse,
});

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("@site/integrations/cocart/server", () => ({
  cocartServerAdapter: {
    getSessionState: jest.fn(),
  },
  readCoCartAccessToken: jest.fn(async () => undefined),
  readCoCartForwardHeaders: jest.fn(async () => undefined),
  verifyCoCartAccessToken: jest.fn(() => null),
}));

jest.mock("@site/integrations/payments/server", () => ({
  mercadoPagoHeadlessServer: {
    getConfig: jest.fn(),
    getOrderPaymentState: jest.fn(),
    processPixPayment: jest.fn(),
    processCardPayment: jest.fn(),
    finalizeThreeDS: jest.fn(),
  },
}));

jest.mock("@site/integrations/wordpress/server", () => ({
  wordpressWooRestAdapter: {
    getOrderPaymentContextForCustomer: jest.fn(),
    getOrderByIdForCustomer: jest.fn(),
  },
}));

const { cocartServerAdapter } = jest.requireMock("@site/integrations/cocart/server") as {
  cocartServerAdapter: {
    getSessionState: unknown;
  };
};
const { readCoCartAccessToken, verifyCoCartAccessToken } = jest.requireMock(
  "@site/integrations/cocart/server",
) as {
  readCoCartAccessToken: unknown;
  verifyCoCartAccessToken: unknown;
};

const { mercadoPagoHeadlessServer } = jest.requireMock(
  "@site/integrations/payments/server",
) as {
  mercadoPagoHeadlessServer: {
    getConfig: unknown;
    getOrderPaymentState: unknown;
    processPixPayment: unknown;
  };
};

const { wordpressWooRestAdapter } = jest.requireMock(
  "@site/integrations/wordpress/server",
) as {
  wordpressWooRestAdapter: {
    getOrderPaymentContextForCustomer: unknown;
    getOrderByIdForCustomer: unknown;
  };
};

const mockedGetSessionState = cocartServerAdapter.getSessionState as unknown as {
  mockReset: () => void;
  mockImplementationOnce: (implementation: () => Promise<unknown>) => void;
  mock: { calls: unknown[][] };
};
const mockedReadCoCartAccessToken = readCoCartAccessToken as unknown as {
  mockReset: () => void;
  mockImplementationOnce: (implementation: () => Promise<unknown>) => void;
};
const mockedVerifyCoCartAccessToken = verifyCoCartAccessToken as unknown as {
  mockReset: () => void;
  mockImplementationOnce: (implementation: () => unknown) => void;
};
const mockedGetConfig = mercadoPagoHeadlessServer.getConfig as unknown as {
  mockReset: () => void;
  mockImplementationOnce: (implementation: () => Promise<unknown>) => void;
};
const mockedGetOrderPaymentState =
  mercadoPagoHeadlessServer.getOrderPaymentState as unknown as {
    mockReset: () => void;
    mockImplementationOnce: (implementation: () => Promise<unknown>) => void;
    mock: { calls: unknown[][] };
  };
const mockedProcessPixPayment =
  mercadoPagoHeadlessServer.processPixPayment as unknown as {
    mockReset: () => void;
    mockImplementationOnce: (implementation: () => Promise<unknown>) => void;
    mock: { calls: unknown[][] };
  };
const mockedGetOrderPaymentContextForCustomer =
  wordpressWooRestAdapter.getOrderPaymentContextForCustomer as unknown as {
    mockReset: () => void;
    mockImplementationOnce: (implementation: () => Promise<unknown>) => void;
  };
const mockedGetOrderByIdForCustomer =
  wordpressWooRestAdapter.getOrderByIdForCustomer as unknown as {
    mockReset: () => void;
    mockImplementationOnce: (implementation: () => Promise<unknown>) => void;
  };

const routeModule = require("./route") as typeof import("./route");
const GET = routeModule.GET!;
const POST = routeModule.POST!;

describe("order payment route", () => {
  beforeEach(() => {
    mockedGetSessionState.mockReset();
    mockedReadCoCartAccessToken.mockReset();
    mockedVerifyCoCartAccessToken.mockReset();
    mockedGetConfig.mockReset();
    mockedGetOrderPaymentState.mockReset();
    mockedProcessPixPayment.mockReset();
    mockedGetOrderPaymentContextForCustomer.mockReset();
    mockedGetOrderByIdForCustomer.mockReset();
  });

  it("authorizes the payment route from a locally verified CoCart token without loading session state", async () => {
    mockedReadCoCartAccessToken.mockImplementationOnce(async () => "jwt-token");
    mockedVerifyCoCartAccessToken.mockImplementationOnce(() => ({
      id: "12",
      username: "cliente",
    }));
    mockedGetOrderPaymentContextForCustomer.mockImplementationOnce(async () => ({
      orderKey: "order-key-12",
      order: { orderId: "77", orderNumber: "00077" },
    }));
    mockedGetOrderByIdForCustomer.mockImplementationOnce(async () => ({
      orderId: "77",
      orderNumber: "00077",
    }));
    mockedGetOrderPaymentState.mockImplementationOnce(async () => ({
      flow: "pix",
      methodId: "woo-mercado-pago-pix",
      paymentIds: [],
      orderStatus: "pending",
      orderStatusLabel: "Pendente",
      paymentStatus: "pending",
      isPending: true,
      isPaid: false,
      checkoutType: null,
      pix: null,
      card: null,
      threeDS: { required: false },
    }));
    mockedGetConfig.mockImplementationOnce(async () => ({
      sdkUrl: "https://sdk.mercadopago.com/js/v2",
      publicKey: "test-public-key",
      locale: "pt-BR",
      siteId: "MLB",
      testMode: true,
      enabledGatewayIds: ["woo-mercado-pago-pix"],
    }));

    const response = (await GET(
      new Request("http://localhost/api/orders/77/payment?sync=true"),
      { params: { id: "77" } },
    )) as Response;

    expect(response.status).toBe(200);
    expect(mockedGetSessionState.mock.calls).toHaveLength(0);
  });

  it("returns payment context for the authenticated customer", async () => {
    mockedGetSessionState.mockImplementationOnce(async () => ({
      session: {
        user: {
          id: "12",
        },
      },
    }));
    mockedGetOrderPaymentContextForCustomer.mockImplementationOnce(async () => ({
      orderKey: "order-key-12",
      order: { orderId: "77", orderNumber: "00077" },
    }));
    mockedGetOrderByIdForCustomer.mockImplementationOnce(async () => ({
      orderId: "77",
      orderNumber: "00077",
    }));
    mockedGetOrderPaymentState.mockImplementationOnce(async () => ({
      flow: "pix",
      methodId: "woo-mercado-pago-pix",
      paymentIds: [],
      orderStatus: "pending",
      orderStatusLabel: "Pendente",
      paymentStatus: "pending",
      isPending: true,
      isPaid: false,
      checkoutType: null,
      pix: null,
      card: null,
      threeDS: { required: false },
    }));
    mockedGetConfig.mockImplementationOnce(async () => ({
      sdkUrl: "https://sdk.mercadopago.com/js/v2",
      publicKey: "test-public-key",
      locale: "pt-BR",
      siteId: "MLB",
      testMode: true,
      enabledGatewayIds: ["woo-mercado-pago-pix"],
    }));

    const response = (await GET(
      new Request("http://localhost/api/orders/77/payment?sync=true"),
      { params: { id: "77" } },
    )) as Response;
    const payload = (await response.json()) as {
      order: { orderNumber: string };
      paymentState: { methodId: string };
      config: { publicKey: string };
    };

    expect(response.status).toBe(200);
    expect(payload.order.orderNumber).toBe("00077");
    expect(payload.paymentState.methodId).toBe("woo-mercado-pago-pix");
    expect(payload.config.publicKey).toBe("test-public-key");
    expect(mockedGetOrderPaymentState.mock.calls[0][0]).toEqual({
      orderId: 77,
      orderKey: "order-key-12",
      sync: true,
    });
  });

  it("processes PIX without exposing the order key to the client", async () => {
    mockedGetSessionState.mockImplementationOnce(async () => ({
      session: {
        user: {
          id: "12",
        },
      },
    }));
    mockedGetOrderPaymentContextForCustomer.mockImplementationOnce(async () => ({
      orderKey: "order-key-12",
      order: { orderId: "77", orderNumber: "00077" },
    }));
    mockedGetOrderByIdForCustomer.mockImplementationOnce(async () => ({
      orderId: "77",
      orderNumber: "00077",
    }));
    mockedProcessPixPayment.mockImplementationOnce(async () => ({
      outcome: "processed",
      paymentState: {
        flow: "pix",
        methodId: "woo-mercado-pago-pix",
        paymentIds: ["123"],
        orderStatus: "pending",
        orderStatusLabel: "Pendente",
        paymentStatus: "pending",
        isPending: true,
        isPaid: false,
        checkoutType: null,
        pix: {
          qrCode: "000201010212",
          qrCodeBase64: "base64-png",
        },
        card: null,
        threeDS: { required: false },
      },
    }));

    const response = (await POST(
      new Request("http://localhost/api/orders/77/payment", {
        method: "POST",
        body: JSON.stringify({ action: "pix" }),
      }),
      { params: { id: "77" } },
    )) as Response;
    const payload = (await response.json()) as {
      paymentState: { pix: { qrCode: string } };
      outcome: string;
    };

    expect(response.status).toBe(200);
    expect(payload.outcome).toBe("processed");
    expect(payload.paymentState.pix.qrCode).toBe("000201010212");
    expect(mockedProcessPixPayment.mock.calls[0][0]).toEqual({
      orderId: 77,
      orderKey: "order-key-12",
    });
  });
});
