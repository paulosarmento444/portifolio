import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

jest.mock("./address-modal.component", () => ({
  AddressModal: () => null,
}));

jest.mock("./checkout-shipping-section.component", () => ({
  CheckoutShippingSection: () => <section data-testid="checkout-shipping-section">Frete</section>,
}));

jest.mock("./payment-method-selector.component", () => ({
  PaymentMethodSelector: () => <section data-testid="payment-method-selector">Pagamento</section>,
}));

const { CheckoutSection } = require("./checkout-section.component") as typeof import("./checkout-section.component");

describe("CheckoutSection", () => {
  it("renders delivery, shipping and payment in the expected order on the left flow", () => {
    render(
      <CheckoutSection
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
          shippingRates: [],
          shippingStatus: "destination_incomplete",
          hasCalculatedShipping: false,
          shippingDestinationComplete: false,
          shippingTotal: null,
          feeTotal: null,
          taxTotal: null,
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
        onSelectedPaymentMethodChange={jest.fn()}
        onCustomerChange={jest.fn()}
        onCartChange={jest.fn()}
      />,
    );

    const delivery = screen.getByTestId("checkout-delivery-section");
    const shipping = screen.getByTestId("checkout-shipping-section");
    const payment = screen.getByTestId("checkout-payment-section");

    expect(delivery.compareDocumentPosition(shipping) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(shipping.compareDocumentPosition(payment) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByTestId("checkout-flow-section")).toBeTruthy();
  });
});
