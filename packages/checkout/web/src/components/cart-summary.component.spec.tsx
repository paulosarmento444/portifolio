import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

const { CartSummary } = require("./cart-summary.component") as typeof import("./cart-summary.component");

describe("CartSummary", () => {
  it("keeps the highlight and metric grid constrained for the narrow checkout sidebar", () => {
    render(
      <CartSummary
        cart={{
          items: [
            {
              itemKey: "line_1",
              productId: "7",
              quantity: 1,
              subtotal: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
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
          shippingStatus: "rates_available",
          hasCalculatedShipping: true,
          shippingDestinationComplete: true,
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
          ],
          shippingTotal: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
          feeTotal: null,
          taxTotal: null,
        }}
      />,
    );

    const highlight = screen.getByTestId("cart-summary-highlight");
    const metrics = screen.getByTestId("cart-summary-metrics");

    expect(highlight.getAttribute("class")).toContain("min-w-0");
    expect(highlight.getAttribute("class")).toContain("w-full");
    expect(metrics.getAttribute("class")).toContain("sm:grid-cols-2");
    expect(metrics.getAttribute("class")).toContain("lg:grid-cols-1");
    expect(metrics.getAttribute("class")).toContain("xl:grid-cols-1");
  });

  it("renders the authoritative cart subtotal and normal shipping when no coupon is applied", () => {
    render(
      <CartSummary
        cart={{
          items: [
            {
              itemKey: "line_1",
              productId: "7",
              quantity: 1,
              subtotal: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
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
          shippingStatus: "rates_available",
          hasCalculatedShipping: true,
          shippingDestinationComplete: true,
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
          ],
          shippingTotal: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
          feeTotal: null,
          taxTotal: null,
        }}
      />,
    );

    expect(screen.getByText(/^Subtotal$/i)).toBeTruthy();
    expect(screen.getByText(/1 item no carrinho/i)).toBeTruthy();
    expect(screen.getAllByText("R$ 64,90").length).toBeGreaterThan(0);
    expect(screen.getAllByText("R$ 15,00").length).toBeGreaterThan(0);
    expect(screen.queryByText(/^Desconto$/i)).toBeNull();
  });

  it("renders discount separately while keeping the authoritative total from the cart", () => {
    render(
      <CartSummary
        cart={{
          items: [
            {
              itemKey: "line_1",
              productId: "7",
              quantity: 1,
              subtotal: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
              total: { amount: 39.9, currencyCode: "BRL", formatted: "R$ 39,90" },
              unitPrice: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
              name: "Produto",
              image: null,
            },
          ],
          subtotal: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
          total: { amount: 39.9, currencyCode: "BRL", formatted: "R$ 39,90" },
          couponCode: "SOLAR",
          couponDiscount: {
            amount: 10,
            currencyCode: "BRL",
            formatted: "R$ 10,00",
          },
          customer: null,
          coupons: [
            {
              code: "SOLAR",
              label: "Cupom: SOLAR",
              description: "Frete grátis liberado pelo cupom.",
              type: "fixed_cart",
              discount: {
                amount: 10,
                currencyCode: "BRL",
                formatted: "R$ 10,00",
              },
            },
          ],
          shippingPackages: [],
          shippingStatus: "rates_available",
          hasCalculatedShipping: true,
          shippingDestinationComplete: true,
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
          feeTotal: null,
          taxTotal: null,
        }}
      />,
    );

    expect(screen.getByText(/^Subtotal$/i)).toBeTruthy();
    expect(screen.getByText(/^Desconto$/i)).toBeTruthy();
    expect(screen.getByText(/cupom solar aplicado ao carrinho autoritativo/i)).toBeTruthy();
    expect(screen.getAllByText("R$ 39,90").length).toBeGreaterThan(0);
    expect(screen.getAllByText("R$ 0,00").length).toBeGreaterThan(0);
    expect(screen.getByText(/- R\$ 10,00/i)).toBeTruthy();
  });
});
