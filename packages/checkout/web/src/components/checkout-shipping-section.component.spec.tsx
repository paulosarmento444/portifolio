import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import type { AccountCustomerView } from "@site/shared";
import type { CoCartCartStateView } from "@site/integrations/cocart";

jest.mock("../data/actions/checkout.actions", () => ({
  calculateCheckoutShippingAction: jest.fn(),
  reloadCheckoutShippingAction: jest.fn(),
  selectCheckoutShippingRateAction: jest.fn(),
}));

const checkoutActionsModule = jest.requireMock("../data/actions/checkout.actions") as any;

const { CheckoutShippingSection } = require("./checkout-shipping-section.component") as typeof import("./checkout-shipping-section.component");

const baseCustomer: AccountCustomerView = {
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
};

const customerRequiringManualPostcode: AccountCustomerView = {
  ...baseCustomer,
  shippingAddress: {
    ...baseCustomer.shippingAddress!,
    postcode: "",
  },
};

const buildCart = (overrides?: Partial<CoCartCartStateView>): CoCartCartStateView => ({
  items: [],
  subtotal: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
  total: { amount: 64.9, currencyCode: "BRL", formatted: "R$ 64,90" },
  couponCode: undefined,
  couponDiscount: null,
  customer: baseCustomer,
  coupons: [],
  shippingPackages: [
    {
      packageId: "1",
      packageName: "Correios",
      packageDetails: "Produtos do pedido",
      formattedDestination: "Sao Paulo - SP, 01000-000, Brasil",
      chosenRateId: "sedex:1",
      rates: [
        {
          packageId: "1",
          rateId: "sedex:1",
          rateKey: "sedex:1",
          instanceId: "1",
          methodId: "sedex",
          label: "SEDEX",
          description: "Entrega expressa",
          cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
          selected: true,
          metaData: [],
          deliveryForecastDays: 2,
        },
      ],
    },
  ],
  shippingRates: [
    {
      packageId: "1",
      rateId: "sedex:1",
      rateKey: "sedex:1",
      instanceId: "1",
      methodId: "sedex",
      label: "SEDEX",
      description: "Entrega expressa",
      cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
      selected: true,
      metaData: [],
      deliveryForecastDays: 2,
    },
  ],
  shippingStatus: "rates_available",
  hasCalculatedShipping: true,
  shippingDestinationComplete: true,
  shippingTotal: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
  feeTotal: null,
  taxTotal: null,
  cartHash: "token-1",
  sessionKey: "session-1",
  ...overrides,
});

function CheckoutShippingSectionHarness({
  initialCart,
  customer = baseCustomer,
  onEditAddress = jest.fn(),
}: {
  initialCart: CoCartCartStateView;
  customer?: AccountCustomerView;
  onEditAddress?: jest.Mock;
}) {
  const [cart, setCart] = useState(initialCart);

  return (
    <CheckoutShippingSection
      cart={cart}
      customer={customer}
      onCartChange={setCart}
      onEditAddress={onEditAddress}
    />
  );
}

describe("CheckoutShippingSection", () => {
  beforeEach(() => {
    checkoutActionsModule.calculateCheckoutShippingAction.mockReset();
    checkoutActionsModule.reloadCheckoutShippingAction.mockReset();
    checkoutActionsModule.selectCheckoutShippingRateAction.mockReset();
  });

  it("reuses the current address and renders backend shipping methods", () => {
    render(
      <CheckoutShippingSection
        cart={buildCart()}
        customer={baseCustomer}
        onCartChange={jest.fn()}
        onEditAddress={jest.fn()}
      />,
    );

    expect((screen.getByLabelText(/cep para calcular frete/i) as HTMLInputElement).value).toBe(
      "01000-000",
    );
    expect(screen.getByText("SEDEX")).toBeTruthy();
    expect(screen.getByText(/entrega estimada em 2 dias úteis/i)).toBeTruthy();
    expect(screen.getByText(/frete atual: R\$ 15,00/i)).toBeTruthy();
  });

  it("renders free shipping rates with zero cost instead of treating them as missing", () => {
    render(
      <CheckoutShippingSection
        cart={buildCart({
          shippingPackages: [
            {
              packageId: "1",
              packageName: "Correios",
              packageDetails: "Produtos do pedido",
              formattedDestination: "Sao Paulo - SP, 01000-000, Brasil",
              chosenRateId: "free_shipping:1",
              rates: [
                {
                  packageId: "1",
                  rateId: "free_shipping:1",
                  rateKey: "free_shipping:1",
                  instanceId: "1",
                  methodId: "free_shipping",
                  label: "Frete grátis",
                  description: "Disponível por benefício do cupom",
                  cost: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
                  selected: true,
                  metaData: [],
                  deliveryForecastDays: undefined,
                },
              ],
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
              description: "Disponível por benefício do cupom",
              cost: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
              selected: true,
              metaData: [],
              deliveryForecastDays: undefined,
            },
          ],
          shippingTotal: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
        })}
        customer={baseCustomer}
        onCartChange={jest.fn()}
        onEditAddress={jest.fn()}
      />,
    );

    expect(screen.getByText("Frete grátis")).toBeTruthy();
    expect(screen.getByText("R$ 0,00")).toBeTruthy();
    expect(screen.queryByText(/nenhuma opção encontrada/i)).toBeNull();
  });

  it("replaces the displayed shipping methods when the authoritative cart changes after coupon removal", () => {
    const { rerender } = render(
      <CheckoutShippingSection
        cart={buildCart({
          couponCode: "SOLAR",
          couponDiscount: {
            amount: 10,
            currencyCode: "BRL",
            formatted: "R$ 10,00",
          },
          coupons: [
            {
              code: "SOLAR",
              label: "Cupom: SOLAR",
              description: "Frete grátis liberado pelo cupom aplicado.",
              type: "fixed_cart",
              discount: {
                amount: 10,
                currencyCode: "BRL",
                formatted: "R$ 10,00",
              },
            },
          ],
          shippingPackages: [
            {
              packageId: "1",
              packageName: "Correios",
              packageDetails: "Produtos do pedido",
              formattedDestination: "Sao Paulo - SP, 01000-000, Brasil",
              chosenRateId: "free_shipping:1",
              rates: [
                {
                  packageId: "1",
                  rateId: "free_shipping:1",
                  rateKey: "free_shipping:1",
                  instanceId: "1",
                  methodId: "free_shipping",
                  label: "Frete grátis",
                  description: "Disponível por benefício do cupom",
                  cost: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
                  selected: true,
                  metaData: [],
                  deliveryForecastDays: undefined,
                },
              ],
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
              description: "Disponível por benefício do cupom",
              cost: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
              selected: true,
              metaData: [],
              deliveryForecastDays: undefined,
            },
          ],
          shippingTotal: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
        })}
        customer={baseCustomer}
        onCartChange={jest.fn()}
        onEditAddress={jest.fn()}
      />,
    );

    expect(screen.getByText("Frete grátis")).toBeTruthy();
    expect(screen.getByText(/frete atual: R\$ 0,00/i)).toBeTruthy();

    rerender(
      <CheckoutShippingSection
        cart={buildCart({
          couponCode: undefined,
          couponDiscount: null,
          coupons: [],
          shippingPackages: [
            {
              packageId: "1",
              packageName: "Correios",
              packageDetails: "Produtos do pedido",
              formattedDestination: "Sao Paulo - SP, 01000-000, Brasil",
              chosenRateId: "sedex:1",
              rates: [
                {
                  packageId: "1",
                  rateId: "sedex:1",
                  rateKey: "sedex:1",
                  instanceId: "1",
                  methodId: "sedex",
                  label: "SEDEX",
                  description: "Entrega expressa",
                  cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
                  selected: true,
                  metaData: [],
                  deliveryForecastDays: 2,
                },
                {
                  packageId: "1",
                  rateId: "pac:2",
                  rateKey: "pac:2",
                  instanceId: "2",
                  methodId: "pac",
                  label: "PAC",
                  description: "Entrega econômica",
                  cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
                  selected: false,
                  metaData: [],
                  deliveryForecastDays: 5,
                },
              ],
            },
          ],
          shippingRates: [
            {
              packageId: "1",
              rateId: "sedex:1",
              rateKey: "sedex:1",
              instanceId: "1",
              methodId: "sedex",
              label: "SEDEX",
              description: "Entrega expressa",
              cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
              selected: true,
              metaData: [],
              deliveryForecastDays: 2,
            },
            {
              packageId: "1",
              rateId: "pac:2",
              rateKey: "pac:2",
              instanceId: "2",
              methodId: "pac",
              label: "PAC",
              description: "Entrega econômica",
              cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
              selected: false,
              metaData: [],
              deliveryForecastDays: 5,
            },
          ],
          shippingTotal: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
        })}
        customer={baseCustomer}
        onCartChange={jest.fn()}
        onEditAddress={jest.fn()}
      />,
    );

    expect(screen.queryByText("Frete grátis")).toBeNull();
    expect(screen.getByText("SEDEX")).toBeTruthy();
    expect(screen.getByText("PAC")).toBeTruthy();
    expect(screen.getByText(/frete atual: R\$ 15,00/i)).toBeTruthy();
  });

  it("renders shipping methods as an accessible radio group with descriptive metadata", () => {
    render(
      <CheckoutShippingSection
        cart={buildCart({
          shippingPackages: [
            {
              packageId: "1",
              packageName: "Correios",
              packageDetails: "Produtos do pedido",
              formattedDestination: "Sao Paulo - SP, 01000-000, Brasil",
              chosenRateId: "sedex:1",
              rates: [
                {
                  packageId: "1",
                  rateId: "sedex:1",
                  rateKey: "sedex:1",
                  instanceId: "1",
                  methodId: "sedex",
                  label: "SEDEX",
                  description: "Entrega expressa",
                  cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
                  selected: true,
                  metaData: [],
                  deliveryForecastDays: 2,
                },
                {
                  packageId: "1",
                  rateId: "pac:2",
                  rateKey: "pac:2",
                  instanceId: "2",
                  methodId: "pac",
                  label: "PAC",
                  description: "Entrega econômica",
                  cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
                  selected: false,
                  metaData: [],
                  deliveryForecastDays: 5,
                },
              ],
            },
          ],
          shippingRates: [
            {
              packageId: "1",
              rateId: "sedex:1",
              rateKey: "sedex:1",
              instanceId: "1",
              methodId: "sedex",
              label: "SEDEX",
              description: "Entrega expressa",
              cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
              selected: true,
              metaData: [],
              deliveryForecastDays: 2,
            },
            {
              packageId: "1",
              rateId: "pac:2",
              rateKey: "pac:2",
              instanceId: "2",
              methodId: "pac",
              label: "PAC",
              description: "Entrega econômica",
              cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
              selected: false,
              metaData: [],
              deliveryForecastDays: 5,
            },
          ],
        })}
        customer={baseCustomer}
        onCartChange={jest.fn()}
        onEditAddress={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("radiogroup", { name: /métodos de entrega para correios/i }),
    ).toBeTruthy();

    const pacRadio = screen.getByRole("radio", { name: /PAC R\$ 10,00/i });
    expect(pacRadio.getAttribute("aria-describedby")).toMatch(/pac-2/);
    expect(screen.getByText(/entrega econômica/i)).toBeTruthy();
    expect(screen.getByText(/entrega estimada em 5 dias úteis/i)).toBeTruthy();
  });

  it("calculates shipping and sends the refreshed cart to the parent", async () => {
    const updatedCart = buildCart({
      shippingPackages: [
        {
          packageId: "1",
          packageName: "Correios",
          packageDetails: "Produtos do pedido",
          formattedDestination: "Sao Paulo - SP, 01000-000, Brasil",
          chosenRateId: "pac:2",
          rates: [
            {
              packageId: "1",
              rateId: "pac:2",
              rateKey: "pac:2",
              instanceId: "2",
              methodId: "pac",
              label: "PAC",
              description: undefined,
              cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
              selected: false,
              metaData: [],
              deliveryForecastDays: 5,
            },
          ],
        },
      ],
      shippingRates: [
        {
          packageId: "1",
          rateId: "pac:2",
          rateKey: "pac:2",
          instanceId: "2",
          methodId: "pac",
          label: "PAC",
          description: undefined,
          cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
          selected: false,
          metaData: [],
          deliveryForecastDays: 5,
        },
      ],
      shippingTotal: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
    });
    const onCartChange = jest.fn();
    checkoutActionsModule.calculateCheckoutShippingAction.mockResolvedValueOnce({
      success: true,
      cart: updatedCart,
    });

    render(
      <CheckoutShippingSection
        cart={buildCart({ shippingPackages: [], shippingRates: [], shippingTotal: null })}
        customer={customerRequiringManualPostcode}
        onCartChange={onCartChange}
        onEditAddress={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/cep para calcular frete/i), {
      target: { value: "01000-000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /calcular frete/i }));

    await waitFor(() => {
      expect(checkoutActionsModule.calculateCheckoutShippingAction).toHaveBeenCalledWith(
        expect.objectContaining({
          postcode: "01000-000",
          country: "BR",
          state: "SP",
          city: "Sao Paulo",
        }),
      );
      expect(onCartChange).toHaveBeenCalledWith(updatedCart);
    });
  });

  it("loads shipping methods automatically when the saved destination is already complete", async () => {
    const autoLoadedCart = buildCart({
      shippingPackages: [
        {
          packageId: "1",
          packageName: "Correios",
          packageDetails: "Produtos do pedido",
          formattedDestination: "Sao Paulo - SP, 01000-000, Brasil",
          chosenRateId: "pac:2",
          rates: [
            {
              packageId: "1",
              rateId: "pac:2",
              rateKey: "pac:2",
              instanceId: "2",
              methodId: "pac",
              label: "PAC",
              description: "Entrega econômica",
              cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
              selected: true,
              metaData: [],
              deliveryForecastDays: 5,
            },
            {
              packageId: "1",
              rateId: "sedex:1",
              rateKey: "sedex:1",
              instanceId: "1",
              methodId: "sedex",
              label: "SEDEX",
              description: "Entrega expressa",
              cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
              selected: false,
              metaData: [],
              deliveryForecastDays: 2,
            },
          ],
        },
      ],
      shippingRates: [
        {
          packageId: "1",
          rateId: "pac:2",
          rateKey: "pac:2",
          instanceId: "2",
          methodId: "pac",
          label: "PAC",
          description: "Entrega econômica",
          cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
          selected: true,
          metaData: [],
          deliveryForecastDays: 5,
        },
        {
          packageId: "1",
          rateId: "sedex:1",
          rateKey: "sedex:1",
          instanceId: "1",
          methodId: "sedex",
          label: "SEDEX",
          description: "Entrega expressa",
          cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
          selected: false,
          metaData: [],
          deliveryForecastDays: 2,
        },
      ],
      shippingStatus: "rates_available",
      hasCalculatedShipping: true,
      shippingDestinationComplete: true,
      shippingTotal: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
    });

    checkoutActionsModule.calculateCheckoutShippingAction.mockResolvedValueOnce({
      success: true,
      cart: autoLoadedCart,
    });

    render(
      <CheckoutShippingSectionHarness
        initialCart={buildCart({
          shippingPackages: [],
          shippingRates: [],
          shippingStatus: "destination_incomplete",
          hasCalculatedShipping: false,
          shippingDestinationComplete: true,
          shippingTotal: null,
        })}
      />,
    );

    await waitFor(() => {
      expect(checkoutActionsModule.calculateCheckoutShippingAction).toHaveBeenCalledTimes(1);
      expect(checkoutActionsModule.calculateCheckoutShippingAction).toHaveBeenCalledWith(
        expect.objectContaining({
          postcode: "01000-000",
          country: "BR",
          state: "SP",
          city: "Sao Paulo",
        }),
      );
    });

    expect(await screen.findByText("PAC")).toBeTruthy();
    expect(screen.getByText("SEDEX")).toBeTruthy();
    expect(screen.getByText(/frete atual: R\$ 10,00/i)).toBeTruthy();
  });

  it("shows an empty state when the backend returns no shipping methods", async () => {
    checkoutActionsModule.calculateCheckoutShippingAction.mockResolvedValueOnce({
      success: true,
      cart: buildCart({
        shippingPackages: [],
        shippingRates: [],
        shippingStatus: "no_services",
        hasCalculatedShipping: true,
        shippingDestinationComplete: true,
        shippingTotal: null,
      }),
    });

    render(
      <CheckoutShippingSectionHarness
        initialCart={buildCart({
          shippingPackages: [],
          shippingRates: [],
          shippingStatus: "destination_incomplete",
          hasCalculatedShipping: false,
          shippingDestinationComplete: true,
          shippingTotal: null,
        })}
        customer={customerRequiringManualPostcode}
      />,
    );

    fireEvent.change(screen.getByLabelText(/cep para calcular frete/i), {
      target: { value: "01000-000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /calcular frete/i }));

    expect(await screen.findByText(/nenhuma opção encontrada/i)).toBeTruthy();
  });

  it("blocks calculation when the saved destination is missing the state for Brazil", () => {
    const incompleteCustomer: AccountCustomerView = {
      ...baseCustomer,
      shippingAddress: {
        ...baseCustomer.shippingAddress!,
        state: "",
      },
    };

    render(
      <CheckoutShippingSection
        cart={buildCart({
          shippingPackages: [],
          shippingRates: [],
          shippingStatus: "destination_incomplete",
          hasCalculatedShipping: false,
          shippingDestinationComplete: false,
          shippingTotal: null,
        })}
        customer={incompleteCustomer}
        onCartChange={jest.fn()}
        onEditAddress={jest.fn()}
      />,
    );

    expect(screen.getByText(/endereço incompleto para calcular/i)).toBeTruthy();
    expect(
      screen.getByText(/complete o endereço de entrega com estado e CEP válidos/i),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /calcular frete/i }).hasAttribute("disabled"),
    ).toBe(true);
    expect(checkoutActionsModule.calculateCheckoutShippingAction).not.toHaveBeenCalled();
  });

  it("shows a friendly error state when shipping calculation fails", async () => {
    checkoutActionsModule.calculateCheckoutShippingAction.mockResolvedValueOnce({
      success: false,
      error: "CEP inválido para a zona de entrega.",
    });

    render(
      <CheckoutShippingSection
        cart={buildCart({ shippingPackages: [], shippingRates: [], shippingTotal: null })}
        customer={customerRequiringManualPostcode}
        onCartChange={jest.fn()}
        onEditAddress={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/cep para calcular frete/i), {
      target: { value: "01000-000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /calcular frete/i }));

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(await screen.findByText(/CEP inválido para a zona de entrega\./i)).toBeTruthy();
  });

  it("persists the selected shipping method and refreshes totals in the UI", async () => {
    const initialCart = buildCart({
      shippingPackages: [
        {
          packageId: "1",
          packageName: "Correios",
          packageDetails: "Produtos do pedido",
          formattedDestination: "Sao Paulo - SP, 01000-000, Brasil",
          chosenRateId: "sedex:1",
          rates: [
            {
              packageId: "1",
              rateId: "sedex:1",
              rateKey: "sedex:1",
              instanceId: "1",
              methodId: "sedex",
              label: "SEDEX",
              description: "Entrega expressa",
              cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
              selected: true,
              metaData: [],
              deliveryForecastDays: 2,
            },
            {
              packageId: "1",
              rateId: "pac:2",
              rateKey: "pac:2",
              instanceId: "2",
              methodId: "pac",
              label: "PAC",
              description: "Entrega econômica",
              cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
              selected: false,
              metaData: [],
              deliveryForecastDays: 5,
            },
          ],
        },
      ],
      shippingRates: [
        {
          packageId: "1",
          rateId: "sedex:1",
          rateKey: "sedex:1",
          instanceId: "1",
          methodId: "sedex",
          label: "SEDEX",
          description: "Entrega expressa",
          cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
          selected: true,
          metaData: [],
          deliveryForecastDays: 2,
        },
        {
          packageId: "1",
          rateId: "pac:2",
          rateKey: "pac:2",
          instanceId: "2",
          methodId: "pac",
          label: "PAC",
          description: "Entrega econômica",
          cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
          selected: false,
          metaData: [],
          deliveryForecastDays: 5,
        },
      ],
    });
    const updatedCart = buildCart({
      total: { amount: 59.9, currencyCode: "BRL", formatted: "R$ 59,90" },
      shippingTotal: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
      shippingPackages: [
        {
          packageId: "1",
          packageName: "Correios",
          packageDetails: "Produtos do pedido",
          formattedDestination: "Sao Paulo - SP, 01000-000, Brasil",
          chosenRateId: "pac:2",
          rates: [
            {
              packageId: "1",
              rateId: "sedex:1",
              rateKey: "sedex:1",
              instanceId: "1",
              methodId: "sedex",
              label: "SEDEX",
              description: "Entrega expressa",
              cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
              selected: false,
              metaData: [],
              deliveryForecastDays: 2,
            },
            {
              packageId: "1",
              rateId: "pac:2",
              rateKey: "pac:2",
              instanceId: "2",
              methodId: "pac",
              label: "PAC",
              description: "Entrega econômica",
              cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
              selected: true,
              metaData: [],
              deliveryForecastDays: 5,
            },
          ],
        },
      ],
      shippingRates: [
        {
          packageId: "1",
          rateId: "sedex:1",
          rateKey: "sedex:1",
          instanceId: "1",
          methodId: "sedex",
          label: "SEDEX",
          description: "Entrega expressa",
          cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
          selected: false,
          metaData: [],
          deliveryForecastDays: 2,
        },
        {
          packageId: "1",
          rateId: "pac:2",
          rateKey: "pac:2",
          instanceId: "2",
          methodId: "pac",
          label: "PAC",
          description: "Entrega econômica",
          cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
          selected: true,
          metaData: [],
          deliveryForecastDays: 5,
        },
      ],
    });
    checkoutActionsModule.selectCheckoutShippingRateAction.mockResolvedValueOnce({
      success: true,
      cart: updatedCart,
    });

    render(<CheckoutShippingSectionHarness initialCart={initialCart} />);

    fireEvent.click(screen.getByRole("radio", { name: /PAC R\$ 10,00/i }));

    await waitFor(() => {
      expect(checkoutActionsModule.selectCheckoutShippingRateAction).toHaveBeenCalledWith({
        packageId: "1",
        rateId: "pac:2",
      });
      expect(screen.getByText(/frete atual: R\$ 10,00/i)).toBeTruthy();
    });

    const pacRadio = screen.getByRole("radio", { name: /PAC R\$ 10,00/i });
    expect((pacRadio as HTMLInputElement).checked).toBe(true);
    expect(screen.getAllByText(/Selecionado/i).length).toBeGreaterThan(0);
  });

  it("shows an error when shipping selection persistence fails", async () => {
    const initialCart = buildCart({
      shippingPackages: [
        {
          packageId: "1",
          packageName: "Correios",
          packageDetails: "Produtos do pedido",
          formattedDestination: "Sao Paulo - SP, 01000-000, Brasil",
          chosenRateId: "sedex:1",
          rates: [
            {
              packageId: "1",
              rateId: "sedex:1",
              rateKey: "sedex:1",
              instanceId: "1",
              methodId: "sedex",
              label: "SEDEX",
              description: "Entrega expressa",
              cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
              selected: true,
              metaData: [],
              deliveryForecastDays: 2,
            },
            {
              packageId: "1",
              rateId: "pac:2",
              rateKey: "pac:2",
              instanceId: "2",
              methodId: "pac",
              label: "PAC",
              description: "Entrega econômica",
              cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
              selected: false,
              metaData: [],
              deliveryForecastDays: 5,
            },
          ],
        },
      ],
      shippingRates: [
        {
          packageId: "1",
          rateId: "sedex:1",
          rateKey: "sedex:1",
          instanceId: "1",
          methodId: "sedex",
          label: "SEDEX",
          description: "Entrega expressa",
          cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
          selected: true,
          metaData: [],
          deliveryForecastDays: 2,
        },
        {
          packageId: "1",
          rateId: "pac:2",
          rateKey: "pac:2",
          instanceId: "2",
          methodId: "pac",
          label: "PAC",
          description: "Entrega econômica",
          cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
          selected: false,
          metaData: [],
          deliveryForecastDays: 5,
        },
      ],
    });
    checkoutActionsModule.selectCheckoutShippingRateAction.mockResolvedValueOnce({
      success: false,
      error: "O método selecionado não está mais disponível.",
    });

    render(<CheckoutShippingSectionHarness initialCart={initialCart} />);

    fireEvent.click(screen.getByRole("radio", { name: /PAC R\$ 10,00/i }));

    await waitFor(() => {
      expect(checkoutActionsModule.selectCheckoutShippingRateAction).toHaveBeenCalledWith({
        packageId: "1",
        rateId: "pac:2",
      });
    });

    expect(
      await screen.findByText(/O método selecionado não está mais disponível\./i),
    ).toBeTruthy();
  });

  it("shows a loading state while the selected shipping rate is being persisted", async () => {
    const initialCart = buildCart({
      shippingPackages: [
        {
          packageId: "1",
          packageName: "Correios",
          packageDetails: "Produtos do pedido",
          formattedDestination: "Sao Paulo - SP, 01000-000, Brasil",
          chosenRateId: "sedex:1",
          rates: [
            {
              packageId: "1",
              rateId: "sedex:1",
              rateKey: "sedex:1",
              instanceId: "1",
              methodId: "sedex",
              label: "SEDEX",
              description: "Entrega expressa",
              cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
              selected: true,
              metaData: [],
              deliveryForecastDays: 2,
            },
            {
              packageId: "1",
              rateId: "pac:2",
              rateKey: "pac:2",
              instanceId: "2",
              methodId: "pac",
              label: "PAC",
              description: "Entrega econômica",
              cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
              selected: false,
              metaData: [],
              deliveryForecastDays: 5,
            },
          ],
        },
      ],
      shippingRates: [
        {
          packageId: "1",
          rateId: "sedex:1",
          rateKey: "sedex:1",
          instanceId: "1",
          methodId: "sedex",
          label: "SEDEX",
          description: "Entrega expressa",
          cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
          selected: true,
          metaData: [],
          deliveryForecastDays: 2,
        },
        {
          packageId: "1",
          rateId: "pac:2",
          rateKey: "pac:2",
          instanceId: "2",
          methodId: "pac",
          label: "PAC",
          description: "Entrega econômica",
          cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
          selected: false,
          metaData: [],
          deliveryForecastDays: 5,
        },
      ],
    });
    let resolveSelection!: (value: { success: true; cart: CoCartCartStateView }) => void;
    checkoutActionsModule.selectCheckoutShippingRateAction.mockImplementationOnce(
      () =>
        new Promise<{ success: true; cart: CoCartCartStateView }>((resolve) => {
          resolveSelection = resolve;
        }),
    );

    render(<CheckoutShippingSectionHarness initialCart={initialCart} />);

    fireEvent.click(screen.getByRole("radio", { name: /PAC R\$ 10,00/i }));

    expect(
      screen.getByText(/salvando a opção de entrega escolhida e atualizando os totais/i),
    ).toBeTruthy();

    resolveSelection({
      success: true,
      cart: buildCart({
        total: { amount: 59.9, currencyCode: "BRL", formatted: "R$ 59,90" },
        shippingTotal: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
        shippingPackages: [
          {
            packageId: "1",
            packageName: "Correios",
            packageDetails: "Produtos do pedido",
            formattedDestination: "Sao Paulo - SP, 01000-000, Brasil",
            chosenRateId: "pac:2",
            rates: [
              {
                packageId: "1",
                rateId: "sedex:1",
                rateKey: "sedex:1",
                instanceId: "1",
                methodId: "sedex",
                label: "SEDEX",
                description: "Entrega expressa",
                cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
                selected: false,
                metaData: [],
                deliveryForecastDays: 2,
              },
              {
                packageId: "1",
                rateId: "pac:2",
                rateKey: "pac:2",
                instanceId: "2",
                methodId: "pac",
                label: "PAC",
                description: "Entrega econômica",
                cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
                selected: true,
                metaData: [],
                deliveryForecastDays: 5,
              },
            ],
          },
        ],
        shippingRates: [
          {
            packageId: "1",
            rateId: "sedex:1",
            rateKey: "sedex:1",
            instanceId: "1",
            methodId: "sedex",
            label: "SEDEX",
            description: "Entrega expressa",
            cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
            selected: false,
            metaData: [],
            deliveryForecastDays: 2,
          },
          {
            packageId: "1",
            rateId: "pac:2",
            rateKey: "pac:2",
            instanceId: "2",
            methodId: "pac",
            label: "PAC",
            description: "Entrega econômica",
            cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
            selected: true,
            metaData: [],
            deliveryForecastDays: 5,
          },
        ],
      }),
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/salvando a opção de entrega escolhida e atualizando os totais/i),
      ).toBeNull();
    });
  });

  it("shows a loading state while the shipping request is in flight", async () => {
    let resolveAction!: (value: { success: true; cart: CoCartCartStateView }) => void;
    checkoutActionsModule.calculateCheckoutShippingAction.mockImplementationOnce(
      () =>
        new Promise<{ success: true; cart: CoCartCartStateView }>((resolve) => {
          resolveAction = resolve;
        }),
    );

    render(
      <CheckoutShippingSection
        cart={buildCart({ shippingPackages: [], shippingRates: [], shippingTotal: null })}
        customer={customerRequiringManualPostcode}
        onCartChange={jest.fn()}
        onEditAddress={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/cep para calcular frete/i), {
      target: { value: "01000-000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /calcular frete/i }));

    expect(screen.getByText(/consultando opções reais de entrega/i)).toBeTruthy();

    resolveAction({
      success: true,
      cart: buildCart({ shippingPackages: [], shippingRates: [], shippingTotal: null }),
    });

    await waitFor(() => {
      expect(screen.queryByText(/consultando opções reais de entrega/i)).toBeNull();
    });
  });

  it("delegates address editing to the existing checkout flow", () => {
    const onEditAddress = jest.fn();

    render(
      <CheckoutShippingSection
        cart={buildCart()}
        customer={baseCustomer}
        onCartChange={jest.fn()}
        onEditAddress={onEditAddress}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /editar endereço/i }));

    expect(onEditAddress).toHaveBeenCalled();
  });
});
