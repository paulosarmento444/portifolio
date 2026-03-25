/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen, within } from "@testing-library/react";
import type { CheckoutOrderConfirmationView } from "@site/shared";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ unoptimized: _unoptimized, ...props }: any) => <img {...props} />,
}));

jest.mock("./order-payment-panel.component", () => ({
  OrderPaymentPanel: () => <div data-testid="order-payment-panel">payment-panel</div>,
}));

const { OrderConfirmationView } = require("./order-confirmation.component") as typeof import("./order-confirmation.component");

const baseOrder: CheckoutOrderConfirmationView = {
  orderId: "91",
  orderNumber: "00091",
  status: { code: "pending", label: "Pendente" },
  createdAt: "2026-03-20T10:00:00.000Z",
  total: { amount: 149.9, currencyCode: "BRL", formatted: "R$ 149,90" },
  paymentMethodId: "woo-mercado-pago-pix",
  paymentMethodTitle: "PIX",
  paymentUrl: undefined,
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
  items: [],
  couponCode: undefined,
  couponDiscount: null,
  customerNote: undefined,
  trackingCode: undefined,
  trackingUrl: undefined,
  tracking: null,
};

describe("OrderConfirmationView", () => {
  it("renders payment below the order items and keeps payment out of the right sidebar", () => {
    render(
      <OrderConfirmationView
        order={baseOrder}
        paymentConfig={null}
        initialPaymentState={null}
      />,
    );

    const primaryColumn = screen.getByTestId("order-confirmation-primary-column");
    const sidebar = screen.getByTestId("order-confirmation-sidebar");
    const paymentCard = screen.getByTestId("order-confirmation-payment-card");

    expect(primaryColumn.contains(paymentCard)).toBe(true);
    expect(within(primaryColumn).getByText("Itens do pedido")).toBeTruthy();
    expect(within(paymentCard).getByText("Total do pedido")).toBeTruthy();
    expect(within(paymentCard).getByTestId("order-payment-panel")).toBeTruthy();
    expect(within(sidebar).getByText("Endereços do pedido")).toBeTruthy();
    expect(within(sidebar).queryByTestId("order-payment-panel")).toBeNull();
  });

  it("renders tracking and customer note blocks when the order exposes them", () => {
    render(
      <OrderConfirmationView
        order={{
          ...baseOrder,
          trackingCode: "AN666661093BR",
          customerNote: "testando observacao do pedido",
          tracking: {
            provider: "Correios",
            code: "AN666661093BR",
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
          },
        }}
        paymentConfig={null}
        initialPaymentState={null}
      />,
    );

    const sidebar = screen.getByTestId("order-confirmation-sidebar");

    expect(within(sidebar).getByTestId("order-confirmation-updates-card")).toBeTruthy();
    expect(within(sidebar).getByTestId("order-confirmation-tracking-card")).toBeTruthy();
    expect(within(sidebar).getByText("AN666661093BR")).toBeTruthy();
    expect(within(sidebar).getByTestId("order-confirmation-tracking-summary")).toBeTruthy();
    expect(within(sidebar).getByTestId("order-confirmation-tracking-history")).toBeTruthy();
    expect(within(sidebar).getByTestId("order-confirmation-customer-note-card")).toBeTruthy();
    expect(within(sidebar).getByText("testando observacao do pedido")).toBeTruthy();
  });

  it("renders item pricing, shipping, discount, and the final total in a cart-like summary", () => {
    render(
      <OrderConfirmationView
        order={{
          ...baseOrder,
          subtotal: {
            amount: 120,
            currencyCode: "BRL",
            formatted: "R$ 120,00",
          },
          shippingTotal: {
            amount: 15,
            currencyCode: "BRL",
            formatted: "R$ 15,00",
          },
          total: {
            amount: 125,
            currencyCode: "BRL",
            formatted: "R$ 125,00",
          },
          couponCode: "PIX10",
          couponDiscount: {
            amount: 10,
            currencyCode: "BRL",
            formatted: "R$ 10,00",
          },
          items: [
            {
              productId: "42",
              name: "Produto Teste",
              quantity: 2,
              unitPrice: {
                amount: 60,
                currencyCode: "BRL",
                formatted: "R$ 60,00",
              },
              subtotal: {
                amount: 120,
                currencyCode: "BRL",
                formatted: "R$ 120,00",
              },
              total: {
                amount: 110,
                currencyCode: "BRL",
                formatted: "R$ 110,00",
              },
              image: null,
            },
          ],
        }}
        paymentConfig={null}
        initialPaymentState={null}
      />,
    );

    const primaryColumn = screen.getByTestId("order-confirmation-primary-column");
    const financialSummary = screen.getByTestId("order-confirmation-financial-summary");

    expect(within(primaryColumn).getByText("Preço unitário")).toBeTruthy();
    expect(within(primaryColumn).getAllByText("Subtotal").length).toBeGreaterThan(0);
    expect(within(primaryColumn).getByText("Total após desconto")).toBeTruthy();
    expect(within(primaryColumn).getByText("R$ 60,00")).toBeTruthy();
    expect(within(primaryColumn).getAllByText("R$ 120,00").length).toBeGreaterThan(0);
    expect(within(primaryColumn).getAllByText("R$ 110,00").length).toBeGreaterThan(0);

    expect(within(financialSummary).getByText("Frete")).toBeTruthy();
    expect(within(financialSummary).getByText("Desconto (PIX10)")).toBeTruthy();
    expect(within(financialSummary).getByText("R$ 15,00")).toBeTruthy();
    expect(within(financialSummary).getByText("- R$ 10,00")).toBeTruthy();
    expect(within(financialSummary).getAllByText("R$ 125,00").length).toBeGreaterThan(0);
  });

  it("renders a clear fallback state when tracking exists but the official lookup is unavailable", () => {
    render(
      <OrderConfirmationView
        order={{
          ...baseOrder,
          trackingCode: "AN666661093BR",
          tracking: {
            provider: "Correios",
            code: "AN666661093BR",
            state: "unavailable",
            message:
              "A consulta oficial de rastreio dos Correios está desativada neste ambiente.",
            history: [],
          },
        }}
        paymentConfig={null}
        initialPaymentState={null}
      />,
    );

    const sidebar = screen.getByTestId("order-confirmation-sidebar");

    expect(
      within(sidebar).getByTestId("order-confirmation-tracking-fallback"),
    ).toBeTruthy();
    expect(
      within(sidebar).getByText(
        "A consulta oficial de rastreio dos Correios está desativada neste ambiente.",
      ),
    ).toBeTruthy();
  });

  it("hides the updates card when tracking and customer note are absent", () => {
    render(
      <OrderConfirmationView
        order={baseOrder}
        paymentConfig={null}
        initialPaymentState={null}
      />,
    );

    expect(screen.queryByTestId("order-confirmation-updates-card")).toBeNull();
  });

  it("keeps the financial summary concise when freight and coupon are absent", () => {
    render(
      <OrderConfirmationView
        order={{
          ...baseOrder,
          items: [
            {
              productId: "42",
              name: "Produto Teste",
              quantity: 1,
              unitPrice: {
                amount: 149.9,
                currencyCode: "BRL",
                formatted: "R$ 149,90",
              },
              subtotal: {
                amount: 149.9,
                currencyCode: "BRL",
                formatted: "R$ 149,90",
              },
              total: {
                amount: 149.9,
                currencyCode: "BRL",
                formatted: "R$ 149,90",
              },
              image: null,
            },
          ],
        }}
        paymentConfig={null}
        initialPaymentState={null}
      />,
    );

    const financialSummary = screen.getByTestId("order-confirmation-financial-summary");

    expect(within(financialSummary).queryByText("Frete")).toBeNull();
    expect(within(financialSummary).queryByText(/Desconto/)).toBeNull();
    expect(within(financialSummary).getByText("Total final")).toBeTruthy();
  });
});
