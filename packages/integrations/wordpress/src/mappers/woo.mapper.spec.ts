import { mapWooOrderToCheckoutOrderConfirmationView } from "./woo.mapper";

describe("mapWooOrderToCheckoutOrderConfirmationView", () => {
  it("maps Woo line items to the checkout contract shape", () => {
    const parsed = mapWooOrderToCheckoutOrderConfirmationView({
      id: 123,
      number: "123",
      status: "pending",
      total: "49.90",
      date_created: "2026-03-12T10:00:00.000Z",
      payment_method: "woo-mercado-pago-custom",
      payment_method_title: "Cartão de crédito",
      payment_url: "http://localhost:8080/finalizar-compra/order-pay/123/?pay_for_order=true",
      billing: {
        first_name: "Ana",
        address_1: "Rua Central",
        city: "Sao Paulo",
      },
      shipping: {
        first_name: "Ana",
        address_1: "Rua Central",
        city: "Sao Paulo",
      },
      line_items: [
        {
          id: 9,
          product_id: 42,
          name: "Produto Teste",
          quantity: 2,
          total: "49.90",
          sku: "SKU-OLD-SHOULD-NOT-LEAK",
        },
      ],
    });

    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0]).toMatchObject({
      productId: "42",
      name: "Produto Teste",
      quantity: 2,
      image: null,
    });
    expect(parsed.items[0]?.total.amount).toBe(49.9);
    expect(parsed.items[0]?.total.currencyCode).toBe("BRL");
    expect(parsed.items[0]?.unitPrice?.amount).toBe(24.95);
    expect(parsed.items[0]?.unitPrice?.currencyCode).toBe("BRL");
    expect(parsed.paymentMethodId).toBe("woo-mercado-pago-custom");
    expect(parsed.paymentUrl).toBe(
      "http://localhost:8080/finalizar-compra/order-pay/123/?pay_for_order=true",
    );
  });

  it("falls back to a stable identifier when Woo omits product_id", () => {
    const parsed = mapWooOrderToCheckoutOrderConfirmationView({
      id: 123,
      number: "123",
      status: "pending",
      total: "10.00",
      date_created: "2026-03-12T10:00:00.000Z",
      line_items: [
        {
          id: 77,
          name: "Item sem produto",
          quantity: 1,
          total: "10.00",
        },
      ],
    });

    expect(parsed.items[0]).toMatchObject({
      productId: "77",
      name: "Item sem produto",
    });
  });

  it("maps tracking metadata and latest customer-facing note", () => {
    const parsed = mapWooOrderToCheckoutOrderConfirmationView(
      {
        id: 378,
        number: "378",
        status: "completed",
        total: "9.00",
        date_created: "2026-03-20T22:48:57.000Z",
        customer_note: "",
        meta_data: [
          {
            key: "_correios_tracking_code",
            value: "CODCORREIOS",
          },
        ],
        line_items: [],
      },
      [
        {
          id: 761,
          note: "Mercado Pago: Pagamento aprovado.",
          customer_note: true,
          date_created: "2026-03-20T22:48:57.000Z",
        },
        {
          id: 812,
          note: "testando observacao do pedido",
          customer_note: true,
          date_created: "2026-03-23T09:12:40.000Z",
        },
      ],
    );

    expect(parsed.trackingCode).toBe("CODCORREIOS");
    expect(parsed.customerNote).toBe("testando observacao do pedido");
  });
});
