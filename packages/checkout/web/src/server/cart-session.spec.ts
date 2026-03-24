import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const cookieStore = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => cookieStore),
}));

const {
  buildCheckoutAppliedCoupon,
  writeCoCartSessionContext,
  readCoCartSessionContext,
} = require("./cart-session") as typeof import("./cart-session");

describe("cart-session", () => {
  beforeEach(() => {
    cookieStore.get.mockReset();
    cookieStore.set.mockReset();
    cookieStore.delete.mockReset();
  });

  it("persists the CoCart session key without mutating the store cart token when it was not provided", async () => {
    await writeCoCartSessionContext({
      sessionKey: "session-1",
    } as any);

    expect(cookieStore.set).toHaveBeenCalledWith(
      "cocart_session_key",
      "session-1",
      expect.objectContaining({
        path: "/",
      }),
    );
    expect(cookieStore.delete).not.toHaveBeenCalledWith("cocart_cart_token");
  });

  it("persists the real Woo Store API cart token when the boundary provides one", async () => {
    await writeCoCartSessionContext({
      sessionKey: "session-1",
      cartToken: "store-token-1",
    } as any);

    expect(cookieStore.set).toHaveBeenCalledWith(
      "cocart_cart_token",
      "store-token-1",
      expect.objectContaining({
        path: "/",
      }),
    );
  });

  it("reads the checkout session context from cookies", async () => {
    cookieStore.get.mockImplementation((...args: unknown[]) => {
      const [name] = args as [string];

      if (name === "cocart_session_key") {
        return { value: "session-1" };
      }

      if (name === "cocart_cart_token") {
        return undefined;
      }

      return undefined;
    });

    await expect(readCoCartSessionContext()).resolves.toEqual({
      sessionKey: "session-1",
      cartToken: undefined,
    });
  });

  it("normalizes coupon benefits as positive values for checkout state", () => {
    expect(
      buildCheckoutAppliedCoupon({
        coupons: [
          {
            code: "SOLAR",
            discount: {
              amount: -10,
              currencyCode: "BRL",
              formatted: "-R$ 10,00",
            },
          },
        ],
        couponDiscount: null,
      } as any),
    ).toEqual({
      code: "SOLAR",
      discount: 10,
      type: undefined,
      amount: "10",
    });
  });
});
