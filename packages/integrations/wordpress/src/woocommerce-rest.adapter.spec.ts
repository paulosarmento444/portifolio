import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("./clients/woocommerce.client", () => ({
  woocommerceClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock("./headless-order-tracking.server", () => ({
  wordpressOrderTrackingServer: {
    getOrderTracking: jest.fn(),
  },
}));

const { woocommerceClient } = require("./clients/woocommerce.client") as {
  woocommerceClient: {
    get: jest.Mock;
    post: jest.Mock;
    put: jest.Mock;
  };
};

const { wordpressOrderTrackingServer } = require("./headless-order-tracking.server") as {
  wordpressOrderTrackingServer: {
    getOrderTracking: jest.Mock;
  };
};

const { wordpressWooRestAdapter } = require("./woocommerce-rest.adapter") as typeof import("./woocommerce-rest.adapter");

const mockedWooClient = woocommerceClient as {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
};

describe("wordpressWooRestAdapter", () => {
  beforeEach(() => {
    mockedWooClient.get.mockReset();
    mockedWooClient.post.mockReset();
    mockedWooClient.put.mockReset();
    wordpressOrderTrackingServer.getOrderTracking.mockReset();
  });

  it("maps Woo customers into the account customer contract", async () => {
    (mockedWooClient.get as any).mockResolvedValueOnce({
      data: {
        id: 14,
        email: "maria@example.com",
        first_name: "Maria",
        last_name: "Silva",
        username: "maria",
        billing: {
          first_name: "Maria",
          last_name: "Silva",
          email: "maria@example.com",
          phone: "11999999999",
          address_2: "Apto 12",
          city: "Sao Paulo",
        },
        shipping: {
          first_name: "Maria",
          last_name: "Silva",
          address_1: "Rua A",
          address_2: "Apto 12",
          city: "Sao Paulo",
          postcode: "01000-000",
          country: "BR",
          state: "SP",
          phone: "11999999999",
        },
      },
    });

    const customer = await wordpressWooRestAdapter.getAccountCustomer(14);

    expect(mockedWooClient.get).toHaveBeenCalledWith("/customers/14");
    expect(customer).toMatchObject({
      id: "14",
      email: "maria@example.com",
      displayName: "Maria Silva",
      billingAddress: {
        city: "Sao Paulo",
        addressLine2: "Apto 12",
      },
      shippingAddress: {
        addressLine1: "Rua A",
        addressLine2: "Apto 12",
        phone: "11999999999",
        postcode: "01000-000",
      },
    });
  });

  it("creates Woo orders and maps them into the confirmation contract expected by checkout", async () => {
    (mockedWooClient.post as any).mockResolvedValueOnce({
      data: {
        id: 42,
        number: "00042",
        status: "pending",
        total: "49.90",
        date_created: "2026-03-11T12:00:00.000Z",
        payment_method: "woo-mercado-pago-custom",
        payment_method_title: "Cartão de crédito",
        payment_url: "http://localhost:8080/finalizar-compra/order-pay/42/?pay_for_order=true",
        billing: {
          first_name: "Maria",
          email: "maria@example.com",
        },
        shipping: {
          first_name: "Maria",
        },
        line_items: [
          {
            id: 900,
            product_id: 77,
            name: "Produto Checkout",
            quantity: 2,
            total: "49.90",
            sku: "SKU-77",
          },
        ],
      },
    });

    const order = await wordpressWooRestAdapter.createWooOrder({
      customer_id: 1,
    });

    expect(mockedWooClient.post).toHaveBeenCalledWith("/orders", {
      customer_id: 1,
    });
    expect(order.items).toHaveLength(1);
    expect(order.items[0]).toMatchObject({
      productId: "77",
      name: "Produto Checkout",
      quantity: 2,
    });
    expect(order.items[0].unitPrice?.amount).toBeCloseTo(24.95);
    expect("productName" in order.items[0]).toBe(false);
    expect("sku" in order.items[0]).toBe(false);
    expect(order.paymentMethodId).toBe("woo-mercado-pago-custom");
    expect(order.paymentUrl).toBe(
      "http://localhost:8080/finalizar-compra/order-pay/42/?pay_for_order=true",
    );
  });

  it("lists orders by customer and fetches a single customer-owned order", async () => {
    (mockedWooClient.get as any)
      .mockResolvedValueOnce({
        data: [
          {
            id: 42,
            customer_id: 14,
            number: "00042",
            status: "processing",
            total: "49.90",
            date_created: "2026-03-11T12:00:00.000Z",
            payment_method_title: "Pix",
            line_items: [],
          },
        ],
      })
      .mockResolvedValueOnce({
        data: {
          id: 42,
          customer_id: 14,
          order_key: "wc_order_owned",
          number: "00042",
          status: "processing",
          total: "49.90",
          date_created: "2026-03-11T12:00:00.000Z",
          payment_method_title: "Pix",
          meta_data: [
            {
              key: "_correios_tracking_code",
              value: "CODCORREIOS",
            },
          ],
          line_items: [],
        },
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 812,
            note: "testando observacao do pedido",
            customer_note: true,
            date_created: "2026-03-23T09:12:40.000Z",
          },
        ],
      })
      .mockResolvedValueOnce({
        data: {
          id: 99,
          customer_id: 20,
          number: "00099",
          status: "pending",
          total: "10.00",
          date_created: "2026-03-11T12:00:00.000Z",
          payment_method_title: "Pix",
          line_items: [],
        },
      })
      .mockResolvedValueOnce({
        data: [],
      });
    (wordpressOrderTrackingServer.getOrderTracking as any).mockResolvedValueOnce({
      provider: "Correios",
      code: "CODCORREIOS",
      state: "available",
      currentStatus: "Objeto em transferência - por favor aguarde",
      latestEvent: "Objeto em transferência - por favor aguarde",
      latestLocation: "BELO HORIZONTE / MG -> RIO DE JANEIRO / RJ",
      lastUpdatedAt: "2026-03-23T09:25:44",
      history: [
        {
          status: "Objeto em transferência - por favor aguarde",
          occurredAt: "2026-03-23T09:25:44",
          location: "BELO HORIZONTE / MG -> RIO DE JANEIRO / RJ",
        },
      ],
    });

    const orders = await wordpressWooRestAdapter.getOrdersByCustomer(14);
    const ownedOrder = await wordpressWooRestAdapter.getOrderByIdForCustomer(42, 14);
    const foreignOrder = await wordpressWooRestAdapter.getOrderByIdForCustomer(99, 14);

    expect(mockedWooClient.get).toHaveBeenNthCalledWith(1, "/orders", {
      params: {
        customer: 14,
        per_page: 100,
        orderby: "date",
        order: "desc",
      },
    });
    expect(mockedWooClient.get).toHaveBeenNthCalledWith(2, "/orders/42");
    expect(mockedWooClient.get).toHaveBeenNthCalledWith(3, "/orders/42/notes");
    expect(mockedWooClient.get).toHaveBeenNthCalledWith(4, "/orders/99");
    expect(mockedWooClient.get).toHaveBeenNthCalledWith(5, "/orders/99/notes");
    expect(orders).toHaveLength(1);
    expect(ownedOrder).toMatchObject({
      orderId: "42",
      orderNumber: "00042",
      trackingCode: "CODCORREIOS",
      customerNote: "testando observacao do pedido",
      tracking: {
        state: "available",
        currentStatus: "Objeto em transferência - por favor aguarde",
      },
    });
    expect(wordpressOrderTrackingServer.getOrderTracking).toHaveBeenCalledWith({
      orderId: 42,
      orderKey: expect.any(String),
    });
    expect(foreignOrder).toBeNull();
  });

  it("falls back to an inline tracking error state when the bridge lookup fails", async () => {
    (mockedWooClient.get as any)
      .mockResolvedValueOnce({
        data: {
          id: 42,
          customer_id: 14,
          order_key: "wc_order_test",
          number: "00042",
          status: "processing",
          total: "49.90",
          date_created: "2026-03-11T12:00:00.000Z",
          payment_method_title: "Pix",
          meta_data: [
            {
              key: "_correios_tracking_code",
              value: "CODCORREIOS",
            },
          ],
          line_items: [],
        },
      })
      .mockResolvedValueOnce({
        data: [],
      });
    (wordpressOrderTrackingServer.getOrderTracking as any).mockRejectedValueOnce(
      new Error("Consulta temporariamente indisponivel."),
    );

    const order = await wordpressWooRestAdapter.getOrderByIdForCustomer(42, 14);

    expect(order).toMatchObject({
      tracking: {
        code: "CODCORREIOS",
        state: "error",
        message: "Consulta temporariamente indisponivel.",
      },
    });
  });

  it("lists enabled payment methods for checkout compatibility", async () => {
    (mockedWooClient.get as any).mockResolvedValueOnce({
      data: [
        {
          id: "woo-mercado-pago-pix",
          title: "Pix",
          description: "Pagamento instantaneo",
          enabled: "yes",
        },
        {
          id: "woo-mercado-pago-basic",
          title: "Checkout Pro",
          enabled: "no",
        },
      ]
    });

    const paymentMethods = await wordpressWooRestAdapter.listCheckoutPaymentMethods();

    expect(mockedWooClient.get).toHaveBeenCalledWith("/payment_gateways");
    expect(paymentMethods).toEqual([
      {
        id: "woo-mercado-pago-pix",
        title: "Pix",
        description: "Pagamento instantaneo",
        enabled: true,
      },
    ]);
  });

  it("finds an exact coupon by code through the Woo coupons endpoint", async () => {
    (mockedWooClient.get as any).mockResolvedValueOnce({
      data: [
        {
          id: 61,
          code: "solar",
          status: "publish",
          amount: "10.00",
          discount_type: "fixed_cart",
        },
        {
          id: 62,
          code: "solarvip",
          status: "publish",
          amount: "15.00",
          discount_type: "fixed_cart",
        },
      ],
    });

    const coupon = await wordpressWooRestAdapter.findCouponByCode("SOLAR");

    expect(mockedWooClient.get).toHaveBeenCalledWith("/coupons", {
      params: {
        per_page: 100,
        search: "SOLAR",
      },
    });
    expect(coupon).toMatchObject({
      id: 61,
      code: "solar",
      amount: "10.00",
      discount_type: "fixed_cart",
    });
  });
});
