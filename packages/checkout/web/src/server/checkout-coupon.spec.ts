import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@site/integrations/wordpress/server", () => ({
  wordpressWooRestAdapter: {
    findCouponByCode: jest.fn(),
  },
}));

const { wordpressWooRestAdapter } = jest.requireMock(
  "@site/integrations/wordpress/server",
) as {
  wordpressWooRestAdapter: {
    findCouponByCode: jest.Mock;
  };
};

const { cookies } = jest.requireMock("next/headers") as {
  cookies: jest.Mock;
};

const { syncPersistedCheckoutCouponForCart, validateCheckoutCouponForCart } = require("./checkout-coupon") as typeof import("./checkout-coupon");

const baseCart = {
  items: [
    {
      itemKey: "item-1",
      productId: "132",
      quantity: 1,
      total: { amount: 49, currencyCode: "BRL", formatted: "R$ 49,00" },
    },
  ],
  subtotal: { amount: 49, currencyCode: "BRL", formatted: "R$ 49,00" },
  total: { amount: 49, currencyCode: "BRL", formatted: "R$ 49,00" },
} as any;

describe("checkout-coupon", () => {
  beforeEach(() => {
    wordpressWooRestAdapter.findCouponByCode.mockReset();
    (cookies as any).mockResolvedValue({
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    });
  });

  it("resolves a fixed cart coupon into the applied checkout view", async () => {
    (wordpressWooRestAdapter.findCouponByCode as any).mockResolvedValueOnce({
      id: 61,
      code: "solar",
      status: "publish",
      amount: "10.00",
      discount_type: "fixed_cart",
      minimum_amount: "0.00",
      maximum_amount: "500.00",
      usage_limit: null,
      usage_count: 0,
    });

    const result = await validateCheckoutCouponForCart(baseCart, "solar");

    expect(result).toEqual({
      ok: true,
      rawCoupon: expect.objectContaining({
        code: "solar",
      }),
      coupon: {
        code: "solar",
        discount: 10,
        type: "fixed_cart",
        amount: "10.00",
        coupon_id: 61,
      },
    });
  });

  it("rejects a coupon when the cart exceeds the configured maximum spend", async () => {
    (wordpressWooRestAdapter.findCouponByCode as any).mockResolvedValueOnce({
      id: 61,
      code: "solar",
      status: "publish",
      amount: "10.00",
      discount_type: "fixed_cart",
      minimum_amount: "0.00",
      maximum_amount: "40.00",
      usage_limit: null,
      usage_count: 0,
    });

    const result = await validateCheckoutCouponForCart(baseCart, "solar");

    expect(result).toEqual({
      ok: false,
      error: "O subtotal máximo para esse cupom é R$ 40,00.",
    });
  });

  it("computes percentage discounts from the cart subtotal", async () => {
    (wordpressWooRestAdapter.findCouponByCode as any).mockResolvedValueOnce({
      id: 77,
      code: "promo10",
      status: "publish",
      amount: "10",
      discount_type: "percent",
      minimum_amount: "0.00",
      maximum_amount: "500.00",
      usage_limit: null,
      usage_count: 0,
    });

    const result = await validateCheckoutCouponForCart(baseCart, "PROMO10");

    expect(result).toEqual({
      ok: true,
      rawCoupon: expect.objectContaining({
        code: "promo10",
      }),
      coupon: {
        code: "promo10",
        discount: 4.9,
        type: "percent",
        amount: "10",
        coupon_id: 77,
      },
    });
  });

  it("syncs the persisted coupon cookie from the authoritative cart coupon", async () => {
    const set = jest.fn();
    const del = jest.fn();
    (cookies as any).mockResolvedValueOnce({
      get: jest.fn(),
      set,
      delete: del,
    });

    const result = await syncPersistedCheckoutCouponForCart({
      ...baseCart,
      couponDiscount: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
      coupons: [
        {
          code: "solar",
          discount: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
          type: "fixed_cart",
        },
      ],
    } as any);

    expect(set).toHaveBeenCalledWith(
      "checkout_coupon_code",
      "solar",
      expect.any(Object),
    );
    expect(del).not.toHaveBeenCalled();
    expect(result).toEqual({
      code: "solar",
      discount: 10,
      type: "fixed_cart",
      amount: "10",
    });
  });

  it("clears the persisted coupon cookie when the authoritative cart has no coupon", async () => {
    const set = jest.fn();
    const del = jest.fn();
    (cookies as any).mockResolvedValueOnce({
      get: jest.fn(),
      set,
      delete: del,
    });

    const result = await syncPersistedCheckoutCouponForCart({
      ...baseCart,
      coupons: [],
      couponDiscount: null,
    } as any);

    expect(del).toHaveBeenCalledWith("checkout_coupon_code");
    expect(set).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
