/** @jest-environment jsdom */

const fetchPolyfill = require("node-fetch");
const BaseResponse = globalThis.Response || fetchPolyfill.Response;

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

class TestResponse extends BaseResponse {
  static json(body: unknown, init?: ResponseInit) {
    return new TestResponse(JSON.stringify(body), {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init?.headers || {}),
      },
    });
  }
}

Object.assign(globalThis, {
  Response: TestResponse,
});

jest.mock("@/app/lib/env.server", () => ({
  serverEnv: {
    wordpress: {
      url: "https://buzios.solaresporte.com.br",
      publicUrl: "https://buzios.solaresporte.com.br",
    },
    payments: {
      mercadoPago: {
        accessToken: "APP_USR-fallback-token",
        publicKey: "APP_USR-fallback-public",
        siteId: "MLB",
      },
    },
  },
}));

jest.mock("@site/integrations/wordpress/server", () => ({
  wordpressWooRestAdapter: {
    listPaymentGatewaysRaw: jest.fn(),
    getOrderRaw: jest.fn(),
    updateOrderRaw: jest.fn(),
  },
}));

const { wordpressWooRestAdapter } = jest.requireMock(
  "@site/integrations/wordpress/server",
) as {
  wordpressWooRestAdapter: {
    listPaymentGatewaysRaw: jest.Mock;
    getOrderRaw: jest.Mock;
    updateOrderRaw: jest.Mock;
  };
};

type GatewayRecord = {
  id: string;
  enabled: string | boolean;
};

const listPaymentGatewaysRawMock =
  wordpressWooRestAdapter.listPaymentGatewaysRaw as jest.MockedFunction<
    () => Promise<GatewayRecord[]>
  >;
const getOrderRawMock =
  wordpressWooRestAdapter.getOrderRaw as jest.MockedFunction<
    (orderId: number) => Promise<unknown>
  >;
const updateOrderRawMock =
  wordpressWooRestAdapter.updateOrderRaw as jest.MockedFunction<
    (
      orderId: number,
      payload: {
        status?: string;
        meta_data?: Array<{ id?: number; key?: string; value?: unknown }>;
      },
    ) => Promise<unknown>
  >;

const mergeMetaData = (
  existing: Array<{ id?: number; key?: string | null; value?: unknown }>,
  patch: Array<{ id?: number; key?: string; value?: unknown }>,
) => {
  const next = [...existing];

  for (const entry of patch) {
    const matchIndex = next.findIndex((meta) =>
      entry.id ? meta.id === entry.id : meta.key === entry.key,
    );

    if (matchIndex >= 0) {
      next[matchIndex] = {
        ...next[matchIndex],
        ...entry,
      };
      continue;
    }

    next.push({
      id: entry.id ?? next.length + 1,
      key: entry.key,
      value: entry.value,
    });
  }

  return next;
};

describe("mercadoPagoHeadlessServer", () => {
  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    listPaymentGatewaysRawMock.mockReset();
    getOrderRawMock.mockReset();
    updateOrderRawMock.mockReset();
    fetchMock = jest.fn() as unknown as jest.MockedFunction<typeof fetch>;
    global.fetch = fetchMock;
  });

  it("falls back to local config when the WordPress payment bridge is missing", async () => {
    listPaymentGatewaysRawMock.mockResolvedValueOnce([
      { id: "woo-mercado-pago-custom", enabled: true },
      { id: "woo-mercado-pago-pix", enabled: "yes" },
      { id: "cod", enabled: true },
    ]);

    fetchMock.mockResolvedValueOnce(
      TestResponse.json(
        {
          code: "rest_no_route",
          message: "Nenhuma rota foi encontrada.",
        },
        { status: 404 },
      ) as Response,
    );

    const { mercadoPagoHeadlessServer } = require("./mercado-pago-headless.server") as typeof import("./mercado-pago-headless.server");
    const config = await mercadoPagoHeadlessServer.getConfig();

    expect(config.publicKey).toBe("APP_USR-fallback-public");
    expect(config.sdkUrl).toBe("https://sdk.mercadopago.com/js/v2");
    expect(config.enabledGatewayIds).toEqual([
      "woo-mercado-pago-custom",
      "woo-mercado-pago-pix",
    ]);
  });

  it("processes PIX directly and persists the payment snapshot when the bridge route is unavailable", async () => {
    const rawOrder = {
      id: 65,
      order_key: "wc_order_test",
      status: "pending",
      total: "254.00",
      payment_method: "woo-mercado-pago-pix",
      payment_method_title: "Pix",
      billing: {
        email: "teste@example.com",
        first_name: "Teste",
        last_name: "Checkout",
        city: "Rio de Janeiro",
        state: "RJ",
        postcode: "22041001",
        address_1: "Rua Teste 123",
      },
      line_items: [
        {
          name: "Chuteira Futsal Predator cub in sala - 42, Preto e Branco",
        },
      ],
      meta_data: [],
    };

    getOrderRawMock.mockResolvedValue(rawOrder);
    updateOrderRawMock.mockImplementationOnce(
      async (orderId: number, payload: { status?: string; meta_data?: Array<{ id?: number; key?: string; value?: unknown }> }) => ({
        ...rawOrder,
        id: orderId,
        status: payload.status ?? rawOrder.status,
        meta_data: mergeMetaData(rawOrder.meta_data, payload.meta_data ?? []),
      }),
    );

    fetchMock
      .mockResolvedValueOnce(
        TestResponse.json(
          {
            code: "rest_no_route",
            message: "Nenhuma rota foi encontrada.",
          },
          { status: 404 },
        ) as Response,
      )
      .mockResolvedValueOnce(
        TestResponse.json({
          id: 150938290875,
          status: "pending",
          status_detail: "pending_waiting_transfer",
          payment_method_id: "pix",
          payment_type_id: "bank_transfer",
          transaction_amount: 254,
          transaction_details: {
            total_paid_amount: 254,
          },
          date_created: "2026-03-24T03:37:42.006-04:00",
          date_of_expiration: "2026-03-24T03:30:00.000-04:00",
          point_of_interaction: {
            transaction_data: {
              qr_code: "0002012633pix",
              qr_code_base64: "aGVhZGxlc3MtcGl4LXFy",
            },
          },
        }) as Response,
      );

    const { mercadoPagoHeadlessServer } = require("./mercado-pago-headless.server") as typeof import("./mercado-pago-headless.server");
    const result = await mercadoPagoHeadlessServer.processPixPayment({
      orderId: 65,
      orderKey: "wc_order_test",
    });

    expect(result.outcome).toBe("processed");
    expect(result.paymentState.methodId).toBe("woo-mercado-pago-pix");
    expect(result.paymentState.pix?.qrCode).toBe("0002012633pix");
    expect(result.paymentState.pix?.qrCodeBase64).toBe("aGVhZGxlc3MtcGl4LXFy");
    expect(updateOrderRawMock).toHaveBeenCalled();
  });
});
