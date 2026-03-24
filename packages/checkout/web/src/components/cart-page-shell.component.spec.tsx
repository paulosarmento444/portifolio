import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import type { CoCartCartStateView } from "@site/integrations/cocart";

const cartWithNormalShipping: CoCartCartStateView = {
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
    {
      packageId: "1",
      rateId: "pac:1",
      rateKey: "pac:1",
      instanceId: "1",
      methodId: "pac",
      label: "PAC",
      description: undefined,
      cost: { amount: 12, currencyCode: "BRL", formatted: "R$ 12,00" },
      selected: false,
      metaData: [],
      deliveryForecastDays: 4,
    },
  ],
  shippingStatus: "rates_available",
  hasCalculatedShipping: true,
  shippingDestinationComplete: true,
  shippingTotal: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
  feeTotal: null,
  taxTotal: null,
};

const cartWithFreeShipping: CoCartCartStateView = {
  ...cartWithNormalShipping,
  total: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
  couponCode: "SOLAR",
  couponDiscount: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
  coupons: [
    {
      code: "SOLAR",
      label: "Cupom: SOLAR",
      description: "Frete grátis liberado pelo cupom.",
      type: "fixed_cart",
      discount: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
    },
  ],
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
};

const appliedFreeShippingCoupon = {
  code: "SOLAR",
  discount: 10,
  type: "fixed_cart",
  amount: "10",
};

jest.mock("./cart-content.component", () => ({
  CartContent: ({ onCartChange, onCouponChange }: any) => (
    <section data-testid="checkout-items-section">
      Itens
      <button
        type="button"
        onClick={() => {
          onCartChange?.(cartWithFreeShipping);
          onCouponChange?.({
            code: "SOLAR",
            discount: 10,
            type: "fixed_cart",
            amount: "10",
          });
        }}
      >
        Aplicar cupom shell
      </button>
      <button
        type="button"
        onClick={() => {
          onCartChange?.(cartWithNormalShipping);
          onCouponChange?.(null);
        }}
      >
        Remover cupom shell
      </button>
    </section>
  ),
}));

jest.mock("./checkout-section.component", () => ({
  CheckoutSection: () => <section data-testid="checkout-flow-section">Fluxo checkout</section>,
}));

jest.mock("./cart-sidebar.component", () => ({
  CartSidebar: ({ cart }: any) => (
    <aside data-testid="checkout-sidebar-section">
      <span data-testid="sidebar-coupon-code">{cart.coupons[0]?.code ?? "none"}</span>
      <span data-testid="sidebar-shipping-labels">
        {cart.shippingRates.map((rate: any) => rate.label).join(",")}
      </span>
      <span data-testid="sidebar-shipping-total">
        {cart.shippingTotal?.formatted ?? "none"}
      </span>
    </aside>
  ),
}));

jest.mock("./empty-cart.component", () => ({
  EmptyCart: () => <div data-testid="empty-cart-state">Vazio</div>,
}));

const { CheckoutPageShell } = require("./cart-page-shell.component") as typeof import("./cart-page-shell.component");

describe("CheckoutPageShell", () => {
  it("renders items, checkout flow on the left, and finalization sidebar on the right", () => {
    render(
      <CheckoutPageShell
        data={{
          userId: "12",
          customer: {
            id: "12",
            email: "maria@example.com",
            displayName: "Maria",
            billingAddress: null,
            shippingAddress: null,
          },
          cart: cartWithNormalShipping,
          cartState: {
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
          },
          paymentMethods: [],
          appliedCoupon: null,
        }}
      />,
    );

    const items = screen.getByTestId("checkout-items-section");
    const flow = screen.getByTestId("checkout-flow-section");
    const sidebar = screen.getByTestId("checkout-sidebar-section");
    const layoutGrid = sidebar.parentElement;

    expect(items.compareDocumentPosition(flow) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(flow.compareDocumentPosition(sidebar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(layoutGrid?.getAttribute("class")).toContain("lg:grid-cols-[minmax(0,1fr)_minmax(18rem,20rem)]");
    expect(layoutGrid?.getAttribute("class")).toContain("xl:grid-cols-[minmax(0,1fr)_21rem]");
  });

  it("keeps the final shell state stable after coupon apply and removal callbacks", () => {
    render(
      <CheckoutPageShell
        data={{
          userId: "12",
          customer: {
            id: "12",
            email: "maria@example.com",
            displayName: "Maria",
            billingAddress: null,
            shippingAddress: null,
          },
          cart: cartWithNormalShipping,
          cartState: {
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
          },
          paymentMethods: [],
          appliedCoupon: null,
        }}
      />,
    );

    expect(screen.getByTestId("sidebar-coupon-code").textContent).toBe("none");
    expect(screen.getByTestId("sidebar-shipping-labels").textContent).toContain("SEDEX");
    expect(screen.getByTestId("sidebar-shipping-total").textContent).toBe("R$ 15,00");

    fireEvent.click(screen.getByRole("button", { name: /aplicar cupom shell/i }));

    expect(screen.getByTestId("sidebar-coupon-code").textContent).toBe("SOLAR");
    expect(screen.getByTestId("sidebar-shipping-labels").textContent).toBe("Frete grátis");
    expect(screen.getByTestId("sidebar-shipping-total").textContent).toBe("R$ 0,00");

    fireEvent.click(screen.getByRole("button", { name: /remover cupom shell/i }));

    expect(screen.getByTestId("sidebar-coupon-code").textContent).toBe("none");
    expect(screen.getByTestId("sidebar-shipping-labels").textContent).toContain("SEDEX");
    expect(screen.getByTestId("sidebar-shipping-labels").textContent).toContain("PAC");
    expect(screen.getByTestId("sidebar-shipping-total").textContent).toBe("R$ 15,00");
  });

  it("does not rehydrate the shell with a stale coupon snapshot after removal", () => {
    const staleData = {
      userId: "12",
      customer: {
        id: "12",
        email: "maria@example.com",
        displayName: "Maria",
        billingAddress: null,
        shippingAddress: null,
      },
      cart: cartWithFreeShipping,
      cartState: {
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
      },
      paymentMethods: [],
      appliedCoupon: appliedFreeShippingCoupon,
    };

    const freshData = {
      ...staleData,
      cart: cartWithNormalShipping,
      appliedCoupon: null,
    };

    const { rerender } = render(<CheckoutPageShell data={staleData} />);

    expect(screen.getByTestId("sidebar-coupon-code").textContent).toBe("SOLAR");
    expect(screen.getByTestId("sidebar-shipping-labels").textContent).toBe("Frete grátis");

    fireEvent.click(screen.getByRole("button", { name: /remover cupom shell/i }));

    expect(screen.getByTestId("sidebar-coupon-code").textContent).toBe("none");
    expect(screen.getByTestId("sidebar-shipping-labels").textContent).toContain("SEDEX");
    expect(screen.getByTestId("sidebar-shipping-total").textContent).toBe("R$ 15,00");

    rerender(<CheckoutPageShell data={{ ...staleData }} />);

    expect(screen.getByTestId("sidebar-coupon-code").textContent).toBe("none");
    expect(screen.getByTestId("sidebar-shipping-labels").textContent).toContain("SEDEX");
    expect(screen.queryByText("Frete grátis")).toBeNull();

    rerender(<CheckoutPageShell data={freshData} />);

    expect(screen.getByTestId("sidebar-coupon-code").textContent).toBe("none");
    expect(screen.getByTestId("sidebar-shipping-labels").textContent).toContain("PAC");
    expect(screen.getByTestId("sidebar-shipping-total").textContent).toBe("R$ 15,00");
  });

  it("renders the empty cart state when there are no items", () => {
    render(
      <CheckoutPageShell
        data={{
          userId: "12",
          customer: {
            id: "12",
            email: "maria@example.com",
            displayName: "Maria",
            billingAddress: null,
            shippingAddress: null,
          },
          cart: {
            items: [],
            subtotal: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
            total: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
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
          },
          cartState: { items: [] },
          paymentMethods: [],
          appliedCoupon: null,
        }}
      />,
    );

    expect(screen.getByTestId("empty-cart-state")).toBeTruthy();
    expect(screen.queryByTestId("checkout-items-section")).toBeNull();
  });
});
