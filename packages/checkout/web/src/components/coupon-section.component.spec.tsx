import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("../actions/checkout.actions", () => ({
  applyCouponAction: jest.fn(),
  removeCouponAction: jest.fn(),
}));

const actionsModule = jest.requireMock("../actions/checkout.actions") as {
  applyCouponAction: jest.Mock;
  removeCouponAction: jest.Mock;
};

const { CouponSection } = require("./coupon-section.component") as typeof import("./coupon-section.component");

describe("CouponSection", () => {
  beforeEach(() => {
    actionsModule.applyCouponAction.mockReset();
    actionsModule.removeCouponAction.mockReset();
  });

  it("applies a coupon and propagates the refreshed authoritative cart to the checkout shell", async () => {
    const onCartChange = jest.fn();
    const onCouponChange = jest.fn();
    const updatedCart = {
      items: [],
      subtotal: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
      total: { amount: 54.9, currencyCode: "BRL", formatted: "R$ 54,90" },
      couponCode: "SOLAR",
      couponDiscount: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
      customer: null,
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
    };

    (actionsModule.applyCouponAction as any).mockResolvedValueOnce({
      success: true,
      cart: updatedCart,
      appliedCoupon: {
        code: "SOLAR",
        discount: 10,
        type: "fixed_cart",
        amount: "10",
      },
    });

    render(
      <CouponSection
        initialCoupon={null}
        onCartChange={onCartChange}
        onCouponChange={onCouponChange}
      />,
    );

    fireEvent.change(screen.getByLabelText(/código do cupom/i), {
      target: { value: "SOLAR" },
    });
    fireEvent.click(screen.getByRole("button", { name: /aplicar/i }));

    await waitFor(() => {
      expect(actionsModule.applyCouponAction).toHaveBeenCalled();
      expect(onCartChange).toHaveBeenCalledWith(updatedCart);
      expect(onCouponChange).toHaveBeenCalledWith({
        code: "SOLAR",
        discount: 10,
        type: "fixed_cart",
        amount: "10",
      });
    });
  });

  it("removes the coupon and propagates the cart without free shipping back to the checkout shell", async () => {
    const onCartChange = jest.fn();
    const onCouponChange = jest.fn();
    const cartWithoutCoupon = {
      items: [],
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
    };

    (actionsModule.removeCouponAction as any).mockResolvedValueOnce({
      success: true,
      cart: cartWithoutCoupon,
      appliedCoupon: null,
    });

    render(
      <CouponSection
        initialCoupon={{
          code: "SOLAR",
          discount: 10,
          type: "fixed_cart",
          amount: "10",
        }}
        onCartChange={onCartChange}
        onCouponChange={onCouponChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /remover cupom/i }));

    await waitFor(() => {
      expect(actionsModule.removeCouponAction).toHaveBeenCalled();
      expect(onCartChange).toHaveBeenCalledWith(cartWithoutCoupon);
      expect(onCouponChange).toHaveBeenCalledWith(null);
    });

    expect(screen.queryByText(/cupom aplicado/i)).toBeNull();
    expect(screen.getByText(/aplicar promoção/i)).toBeTruthy();
  });

  it("keeps coupon mutations scoped to the checkout callbacks without needing a page refresh", async () => {
    const onCartChange = jest.fn();
    const onCouponChange = jest.fn();
    const updatedCart = {
      items: [],
      subtotal: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
      total: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
      couponCode: "SOLAR",
      couponDiscount: null,
      customer: null,
      coupons: [],
      shippingPackages: [],
      shippingStatus: "destination_incomplete",
      hasCalculatedShipping: false,
      shippingDestinationComplete: false,
      shippingRates: [],
      shippingTotal: null,
      feeTotal: null,
      taxTotal: null,
    };

    (actionsModule.applyCouponAction as any).mockResolvedValueOnce({
      success: true,
      cart: updatedCart,
      appliedCoupon: {
        code: "SOLAR",
        discount: 0,
        type: "fixed_cart",
        amount: "0",
      },
    });

    (actionsModule.removeCouponAction as any).mockResolvedValueOnce({
      success: true,
      cart: {
        ...updatedCart,
        couponCode: undefined,
      },
      appliedCoupon: null,
    });

    render(
      <CouponSection
        initialCoupon={null}
        onCartChange={onCartChange}
        onCouponChange={onCouponChange}
      />,
    );

    fireEvent.change(screen.getByLabelText(/código do cupom/i), {
      target: { value: "SOLAR" },
    });
    fireEvent.click(screen.getByRole("button", { name: /aplicar/i }));

    await waitFor(() => {
      expect(onCartChange).toHaveBeenCalledWith(updatedCart);
    });

    fireEvent.click(screen.getByRole("button", { name: /remover cupom/i }));

    await waitFor(() => {
      expect(onCouponChange).toHaveBeenLastCalledWith(null);
    });
  });
});
