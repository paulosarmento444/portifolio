import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, render } from "@testing-library/react";
import type {
  MercadoPagoHeadlessConfig,
  MercadoPagoOrderPaymentState,
} from "@site/integrations/payments";
import type { CheckoutOrderConfirmationView } from "@site/shared";
import { OrderPaymentPanel } from "./order-payment-panel.component";

jest.mock("./mercado-pago-card-form.component", () => ({
  MercadoPagoCardForm: () => <div data-testid="card-form">card-form</div>,
}));

jest.mock("./mercado-pago-pix-panel.component", () => ({
  MercadoPagoPixPanel: () => <div data-testid="pix-panel">pix-panel</div>,
}));

jest.mock("./mercado-pago-three-ds-panel.component", () => ({
  MercadoPagoThreeDSPanel: () => <div data-testid="three-ds-panel">three-ds-panel</div>,
}));

const baseOrder: CheckoutOrderConfirmationView = {
  orderId: "77",
  orderNumber: "00077",
  status: { code: "pending", label: "Pendente" },
  createdAt: "2026-03-17T10:00:00.000Z",
  total: { amount: 199.9, currencyCode: "BRL", formatted: "R$ 199,90" },
  paymentMethodId: "woo-mercado-pago-custom",
  paymentMethodTitle: "Cartão de crédito",
  paymentUrl: undefined,
  shippingAddress: {},
  billingAddress: {},
  items: [],
  couponCode: undefined,
  couponDiscount: null,
};

const baseConfig: MercadoPagoHeadlessConfig = {
  sdkUrl: "https://sdk.mercadopago.com/js/v2",
  publicKey: "test-public-key",
  locale: "pt-BR",
  siteId: "MLB",
  testMode: true,
  enabledGatewayIds: ["woo-mercado-pago-custom", "woo-mercado-pago-pix"],
};

const buildPaymentState = (
  overrides?: Partial<MercadoPagoOrderPaymentState>,
): MercadoPagoOrderPaymentState => ({
  flow: "card",
  methodId: "woo-mercado-pago-custom",
  methodTitle: "Cartão de crédito",
  orderStatus: "pending",
  orderStatusLabel: "Pendente",
  paymentStatus: "pending",
  isPending: true,
  isPaid: false,
  paymentIds: [],
  checkoutType: "custom_checkout",
  pix: null,
  card: null,
  threeDS: { required: false },
  ...overrides,
});

describe("OrderPaymentPanel", () => {
  const fetchMock = jest.fn<typeof fetch>();

  beforeEach(() => {
    jest.useFakeTimers();
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does not poll the payment status while the card form is still idle", async () => {
    render(
      <OrderPaymentPanel
        order={baseOrder}
        paymentConfig={baseConfig}
        initialPaymentState={buildPaymentState()}
        onOrderChange={jest.fn()}
      />,
    );

    await act(async () => {
      jest.advanceTimersByTime(5500);
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("starts polling after a card payment attempt exists", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        order: baseOrder,
        paymentState: buildPaymentState({
          paymentIds: ["pay_123"],
          card: { installments: 1, paymentMethodId: "master" },
        }),
        config: {
          ...baseConfig,
          enabledGatewayIds: [...baseConfig.enabledGatewayIds],
        },
      }),
    } as Response);

    render(
      <OrderPaymentPanel
        order={baseOrder}
        paymentConfig={baseConfig}
        initialPaymentState={buildPaymentState({
          paymentIds: ["pay_123"],
          card: { installments: 1, paymentMethodId: "master" },
        })}
        onOrderChange={jest.fn()}
      />,
    );

    await act(async () => {
      jest.advanceTimersByTime(5500);
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/orders/77/payment?sync=true", {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });
  });
});
