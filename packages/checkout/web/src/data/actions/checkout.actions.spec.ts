import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("next/headers", () => ({
  headers: jest.fn(async () => ({
    get: () => null,
  })),
}));

jest.mock("@site/integrations/cocart/server", () => ({
  cocartServerAdapter: {
    addCartItem: jest.fn(),
    clearCart: jest.fn(),
    updateCartItem: jest.fn(),
    removeCartItem: jest.fn(),
    applyCoupon: jest.fn(),
    removeCoupon: jest.fn(),
    getCartState: jest.fn(),
    getSessionState: jest.fn(),
    updateCustomerAddress: jest.fn(),
    updateCartShippingDestination: jest.fn(),
    refreshCartShipping: jest.fn(),
    selectShippingRate: jest.fn(),
  },
  isCoCartCompatibilityFallbackError: jest.fn((error: Error & { response?: { status?: number } }) => {
    return [404, 405, 501].includes(error?.response?.status || 0);
  }),
  readCoCartForwardHeaders: jest.fn(async () => undefined),
}));

jest.mock("@site/integrations/payments/server", () => ({
  getSupportedCheckoutPaymentMethods: jest.fn(),
}));

jest.mock("@site/integrations/wordpress/server", () => ({
  wordpressWooRestAdapter: {
    getAccountCustomer: jest.fn(),
    createWooOrder: jest.fn(),
    updateAccountCustomer: jest.fn(),
  },
}));

jest.mock("../loaders/cart-session.loader", () => ({
  buildCheckoutAppliedCoupon: jest.fn(),
  clearCheckoutSession: jest.fn(),
  readCoCartSessionContext: jest.fn(),
  writeCoCartSessionContext: jest.fn(),
}));

jest.mock("../loaders/checkout-coupon.loader", () => ({
  clearPersistedCheckoutCouponCode: jest.fn(),
  readPersistedCheckoutCouponCode: jest.fn(),
  resolvePersistedCheckoutCouponForCart: jest.fn(),
  syncPersistedCheckoutCouponForCart: jest.fn(),
  validateCheckoutCouponForCart: jest.fn(),
  writePersistedCheckoutCouponCode: jest.fn(),
}));

const { cocartServerAdapter } = jest.requireMock("@site/integrations/cocart/server") as {
  cocartServerAdapter: {
    addCartItem: jest.Mock;
    clearCart: jest.Mock;
    updateCartItem: jest.Mock;
    removeCartItem: jest.Mock;
    applyCoupon: jest.Mock;
    removeCoupon: jest.Mock;
    getCartState: jest.Mock;
    getSessionState: jest.Mock;
    updateCustomerAddress: jest.Mock;
    updateCartShippingDestination: jest.Mock;
    refreshCartShipping: jest.Mock;
    selectShippingRate: jest.Mock;
  };
};

const { getSupportedCheckoutPaymentMethods } = jest.requireMock(
  "@site/integrations/payments/server",
) as {
  getSupportedCheckoutPaymentMethods: jest.Mock;
};

const { wordpressWooRestAdapter } = jest.requireMock(
  "@site/integrations/wordpress/server",
) as {
  wordpressWooRestAdapter: {
    getAccountCustomer: jest.Mock;
    createWooOrder: jest.Mock;
    updateAccountCustomer: jest.Mock;
  };
};

const {
  buildCheckoutAppliedCoupon,
  clearCheckoutSession,
  readCoCartSessionContext,
  writeCoCartSessionContext,
} = jest.requireMock("../loaders/cart-session.loader") as {
  buildCheckoutAppliedCoupon: jest.Mock;
  clearCheckoutSession: jest.Mock;
  readCoCartSessionContext: jest.Mock;
  writeCoCartSessionContext: jest.Mock;
};

const {
  clearPersistedCheckoutCouponCode,
  readPersistedCheckoutCouponCode,
  resolvePersistedCheckoutCouponForCart,
  syncPersistedCheckoutCouponForCart,
  validateCheckoutCouponForCart,
  writePersistedCheckoutCouponCode,
} = jest.requireMock("../loaders/checkout-coupon.loader") as {
  clearPersistedCheckoutCouponCode: jest.Mock;
  readPersistedCheckoutCouponCode: jest.Mock;
  resolvePersistedCheckoutCouponForCart: jest.Mock;
  syncPersistedCheckoutCouponForCart: jest.Mock;
  validateCheckoutCouponForCart: jest.Mock;
  writePersistedCheckoutCouponCode: jest.Mock;
};

const {
  addCartItemAction,
  addToCartAndRedirectAction,
  applyCouponAction,
  createCheckoutOrderAction,
  calculateCheckoutShippingAction,
  loadCheckoutPageData,
  removeCartItemAction,
  removeCouponAction,
  reloadCheckoutShippingAction,
  saveCheckoutAddressAction,
  selectCheckoutShippingRateAction,
  updateCartItemQuantityAction,
} = require("./checkout.actions") as typeof import("./checkout.actions");

const mockedCoCartAdapter = cocartServerAdapter as {
  addCartItem: jest.Mock;
  clearCart: jest.Mock;
  updateCartItem: jest.Mock;
  removeCartItem: jest.Mock;
  applyCoupon: jest.Mock;
  removeCoupon: jest.Mock;
  getCartState: jest.Mock;
  getSessionState: jest.Mock;
  updateCustomerAddress: jest.Mock;
  updateCartShippingDestination: jest.Mock;
  refreshCartShipping: jest.Mock;
  selectShippingRate: jest.Mock;
};

const mockedWooAdapter = wordpressWooRestAdapter as {
  getAccountCustomer: jest.Mock;
  createWooOrder: jest.Mock;
  updateAccountCustomer: jest.Mock;
};

const mockedClearCheckoutSession = clearCheckoutSession as jest.Mock;
const mockedBuildCheckoutAppliedCoupon = buildCheckoutAppliedCoupon as jest.Mock;
const mockedReadCoCartSessionContext = readCoCartSessionContext as jest.Mock;
const mockedWriteCoCartSessionContext = writeCoCartSessionContext as jest.Mock;
const mockedClearPersistedCheckoutCouponCode =
  clearPersistedCheckoutCouponCode as jest.Mock;
const mockedReadPersistedCheckoutCouponCode =
  readPersistedCheckoutCouponCode as jest.Mock;
const mockedResolvePersistedCheckoutCouponForCart =
  resolvePersistedCheckoutCouponForCart as jest.Mock;
const mockedSyncPersistedCheckoutCouponForCart =
  syncPersistedCheckoutCouponForCart as jest.Mock;
const mockedValidateCheckoutCouponForCart =
  validateCheckoutCouponForCart as jest.Mock;
const mockedWritePersistedCheckoutCouponCode =
  writePersistedCheckoutCouponCode as jest.Mock;

const baseCartState = {
  customer: {
    id: "0",
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
  },
  items: [
    {
      itemKey: "line_1",
      productId: "7",
      variationId: "21",
      quantity: 2,
      total: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
      unitPrice: { amount: 24.95, currencyCode: "BRL", formatted: "R$ 24,95" },
      name: "Produto 7",
      image: null,
    },
  ],
  subtotal: { amount: 49.9, currencyCode: "BRL", formatted: "R$ 49,90" },
  total: { amount: 64.9, currencyCode: "BRL", formatted: "R$ 64,90" },
  couponCode: "PROMO10",
  couponDiscount: {
    amount: 10,
    currencyCode: "BRL",
    formatted: "R$ 10,00",
  },
  coupons: [
    {
      code: "PROMO10",
      label: undefined,
      description: undefined,
      type: "percent",
      discount: {
        amount: 10,
        currencyCode: "BRL",
        formatted: "R$ 10,00",
      },
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
      description: undefined,
      cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
      selected: true,
      metaData: [],
      deliveryForecastDays: 2,
    },
  ],
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
          description: undefined,
          cost: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
          selected: true,
          metaData: [],
          deliveryForecastDays: 2,
        },
      ],
    },
  ],
  shippingStatus: "rates_available",
  hasCalculatedShipping: true,
  shippingDestinationComplete: true,
  shippingTotal: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
  feeTotal: null,
  taxTotal: null,
  sessionKey: "session-1",
  cartHash: "token-1",
};

const baseCustomer = {
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

const authenticatedCoCartSession = {
  capabilities: {
    catalog: "available",
    cart: "available",
    coupons: "available",
    shipping: "available",
    totals: "available",
    account: "available",
    auth: "available",
  },
  session: {
    isAuthenticated: true,
    user: {
      id: "12",
      email: "maria@example.com",
      username: "maria",
      displayName: "Maria",
      roleLabels: [],
    },
  },
};

describe("checkout.actions", () => {
  beforeEach(() => {
    mockedCoCartAdapter.addCartItem.mockReset();
    mockedCoCartAdapter.clearCart.mockReset();
    mockedCoCartAdapter.updateCartItem.mockReset();
    mockedCoCartAdapter.removeCartItem.mockReset();
    mockedCoCartAdapter.applyCoupon.mockReset();
    mockedCoCartAdapter.removeCoupon.mockReset();
    mockedCoCartAdapter.getCartState.mockReset();
    mockedCoCartAdapter.getSessionState.mockReset();
    mockedCoCartAdapter.updateCustomerAddress.mockReset();
    mockedCoCartAdapter.updateCartShippingDestination.mockReset();
    mockedCoCartAdapter.refreshCartShipping.mockReset();
    mockedCoCartAdapter.selectShippingRate.mockReset();
    mockedWooAdapter.getAccountCustomer.mockReset();
    mockedWooAdapter.createWooOrder.mockReset();
    mockedWooAdapter.updateAccountCustomer.mockReset();
    (mockedWooAdapter.getAccountCustomer as any).mockResolvedValue(baseCustomer);
    getSupportedCheckoutPaymentMethods.mockReset();
    mockedBuildCheckoutAppliedCoupon.mockReset();
    mockedClearCheckoutSession.mockReset();
    mockedReadCoCartSessionContext.mockReset();
    mockedWriteCoCartSessionContext.mockReset();
    mockedClearPersistedCheckoutCouponCode.mockReset();
    mockedReadPersistedCheckoutCouponCode.mockReset();
    mockedResolvePersistedCheckoutCouponForCart.mockReset();
    mockedSyncPersistedCheckoutCouponForCart.mockReset();
    mockedValidateCheckoutCouponForCart.mockReset();
    mockedWritePersistedCheckoutCouponCode.mockReset();

    (mockedReadCoCartSessionContext as any).mockResolvedValue({
      sessionKey: "session-1",
      cartToken: "token-1",
    });
    mockedBuildCheckoutAppliedCoupon.mockImplementation((cart: any) => {
      const primaryCoupon = cart?.coupons?.[0];
      return primaryCoupon
        ? {
            code: primaryCoupon.code,
            discount: Number(primaryCoupon.discount?.amount || cart.couponDiscount?.amount || 0),
            type: primaryCoupon.type,
            amount:
              primaryCoupon.discount?.amount !== undefined
                ? String(primaryCoupon.discount.amount)
                : undefined,
          }
        : null;
    });
    (mockedResolvePersistedCheckoutCouponForCart as any).mockResolvedValue({
      code: "PROMO10",
      discount: 10,
      type: "percent",
      amount: "10",
    });
    (mockedReadPersistedCheckoutCouponCode as any).mockResolvedValue(null);
    (mockedSyncPersistedCheckoutCouponForCart as any).mockResolvedValue(null);
    (mockedValidateCheckoutCouponForCart as any).mockResolvedValue({
      ok: true,
      coupon: {
        code: "PROMO10",
        discount: 10,
        type: "percent",
        amount: "10",
      },
      rawCoupon: {
        id: 61,
        code: "PROMO10",
        discount_type: "percent",
      },
    });
  });

  it("returns null when checkout is accessed without an authenticated CoCart session", async () => {
    (mockedCoCartAdapter.getSessionState as any).mockResolvedValueOnce({
      capabilities: authenticatedCoCartSession.capabilities,
      session: {
        isAuthenticated: false,
        user: null,
      },
    });

    const result = await loadCheckoutPageData();

    expect(result).toBeNull();
    expect(mockedCoCartAdapter.getCartState).not.toHaveBeenCalled();
  });

  it("loads checkout data from CoCart-backed session, customer and cart state", async () => {
    (mockedCoCartAdapter.getSessionState as any).mockResolvedValueOnce(
      authenticatedCoCartSession,
    );
    (mockedCoCartAdapter.getCartState as any).mockResolvedValueOnce(baseCartState);
    (mockedWooAdapter.getAccountCustomer as any).mockResolvedValueOnce(baseCustomer);
    (getSupportedCheckoutPaymentMethods as any).mockResolvedValueOnce([
      {
        id: "woo-mercado-pago-pix",
        title: "PIX",
        enabled: true,
      },
    ]);

    const result = await loadCheckoutPageData();

    expect(mockedCoCartAdapter.getSessionState).toHaveBeenCalled();
    expect(mockedCoCartAdapter.getCartState).toHaveBeenCalledWith(
      {
        sessionKey: "session-1",
        cartToken: "token-1",
      },
      undefined,
    );
    expect(mockedWriteCoCartSessionContext).not.toHaveBeenCalled();
    expect(mockedWooAdapter.getAccountCustomer).toHaveBeenCalledWith(12);
    expect(result).toMatchObject({
      userId: "12",
      customer: {
        id: "12",
      },
      paymentMethods: [
        {
          id: "woo-mercado-pago-pix",
          title: "PIX",
        },
      ],
      appliedCoupon: {
        code: "PROMO10",
        discount: 10,
      },
      cartState: {
        items: [
          {
            itemKey: "line_1",
            productId: "7",
            variationId: "21",
            quantity: 2,
            total: 49.9,
            unitPrice: 24.95,
          },
        ],
      },
    });
  });

  it("keeps checkout available with a minimal customer profile when token auth is valid but CoCart customer routes are unavailable", async () => {
    (mockedCoCartAdapter.getSessionState as any).mockResolvedValueOnce({
      ...authenticatedCoCartSession,
      session: {
        ...authenticatedCoCartSession.session,
        user: {
          ...authenticatedCoCartSession.session.user,
          email: "maria@example.com",
        },
      },
    });
    (mockedCoCartAdapter.getCartState as any).mockResolvedValueOnce({
      ...baseCartState,
      customer: null,
    });
    (mockedWooAdapter.getAccountCustomer as any).mockRejectedValueOnce(
      new Error("Woo unavailable"),
    );
    (getSupportedCheckoutPaymentMethods as any).mockResolvedValueOnce([]);

    const result = await loadCheckoutPageData();

    expect(result).toMatchObject({
      userId: "12",
      customer: {
        id: "12",
        email: "maria@example.com",
        displayName: "Maria",
        billingAddress: null,
        shippingAddress: null,
      },
    });
    expect(mockedWooAdapter.getAccountCustomer).toHaveBeenCalledWith(12);
  });

  it("loads supported payment methods from the payments boundary instead of Woo REST", async () => {
    (mockedCoCartAdapter.getSessionState as any).mockResolvedValueOnce(
      authenticatedCoCartSession,
    );
    (mockedCoCartAdapter.getCartState as any).mockResolvedValueOnce(baseCartState);
    (mockedWooAdapter.getAccountCustomer as any).mockResolvedValueOnce(baseCustomer);
    (getSupportedCheckoutPaymentMethods as any).mockResolvedValueOnce([
      {
        id: "woo-mercado-pago-pix",
        title: "PIX",
        enabled: true,
      },
      {
        id: "woo-mercado-pago-custom",
        title: "Cartão de crédito",
        enabled: true,
      },
    ]);

    const result = await loadCheckoutPageData();

    expect(result).toMatchObject({
      userId: "12",
      paymentMethods: [{ id: "woo-mercado-pago-pix" }, { id: "woo-mercado-pago-custom" }],
    });
    expect(mockedWooAdapter.getAccountCustomer).toHaveBeenCalledWith(12);
  });

  it("mutates cart state through CoCart and persists the returned session", async () => {
    (mockedCoCartAdapter.addCartItem as any).mockResolvedValueOnce(baseCartState);
    (mockedCoCartAdapter.addCartItem as any).mockResolvedValueOnce(baseCartState);
    (mockedCoCartAdapter.updateCartItem as any).mockResolvedValueOnce({
      ...baseCartState,
      items: [
        {
          ...baseCartState.items[0],
          quantity: 3,
        },
      ],
    });
    (mockedCoCartAdapter.removeCartItem as any).mockResolvedValueOnce({
      ...baseCartState,
      items: [],
      subtotal: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
      total: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
    });

    await addCartItemAction({ productId: "7", quantity: 2 });
    await addCartItemAction({ productId: "7", variationId: "21", quantity: 1 });

    const updateForm = new FormData();
    updateForm.append("itemKey", "line_1");
    updateForm.append("quantity", "3");
    const updateResult = await updateCartItemQuantityAction(updateForm);

    const removeForm = new FormData();
    removeForm.append("itemKey", "line_1");
    await removeCartItemAction(removeForm);

    expect(mockedCoCartAdapter.addCartItem).toHaveBeenNthCalledWith(
      1,
      {
        productId: "7",
        quantity: 2,
      },
      {
        sessionKey: "session-1",
        cartToken: "token-1",
      },
      undefined,
    );
    expect(mockedCoCartAdapter.addCartItem).toHaveBeenNthCalledWith(
      2,
      {
        productId: "7",
        variationId: "21",
        quantity: 1,
      },
      {
        sessionKey: "session-1",
        cartToken: "token-1",
      },
      undefined,
    );
    expect(updateResult).toMatchObject({
      success: true,
      cart: expect.objectContaining({
        items: [expect.objectContaining({ quantity: 3 })],
      }),
    });
    expect(mockedCoCartAdapter.updateCartItem).toHaveBeenCalledWith(
      {
        itemKey: "line_1",
        quantity: 3,
      },
      {
        sessionKey: "session-1",
        cartToken: "token-1",
      },
      undefined,
    );
    expect(mockedCoCartAdapter.removeCartItem).toHaveBeenCalledWith("line_1", {
      sessionKey: "session-1",
      cartToken: "token-1",
    }, undefined);
    expect(mockedWriteCoCartSessionContext).toHaveBeenCalledTimes(4);
    expect(mockedSyncPersistedCheckoutCouponForCart).toHaveBeenCalledTimes(4);
  });

  it("returns a redirect target when add to cart succeeds", async () => {
    (mockedCoCartAdapter.addCartItem as any).mockResolvedValueOnce(baseCartState);

    const formData = new FormData();
    formData.append("product_id", "7");
    formData.append("variation_id", "21");
    formData.append("quantity", "1");

    const result = await addToCartAndRedirectAction(formData);

    expect(result).toEqual({
      success: true,
      redirectTo: "/my-cart",
    });
    expect(mockedCoCartAdapter.addCartItem).toHaveBeenCalledWith(
      {
        productId: "7",
        variationId: "21",
        quantity: 1,
      },
      {
        sessionKey: "session-1",
        cartToken: "token-1",
      },
      undefined,
    );
  });

  it("returns a friendly stock-limit error when add to cart is rejected by stock availability", async () => {
    (mockedCoCartAdapter.addCartItem as any).mockRejectedValueOnce({
      response: {
        data: {
          message: "You cannot add that amount to the cart — we have 0 in stock and you already have 1 in your cart.",
        },
      },
      message:
        "You cannot add that amount to the cart — we have 0 in stock and you already have 1 in your cart.",
    });

    const formData = new FormData();
    formData.append("product_id", "7");
    formData.append("quantity", "1");

    const result = await addToCartAndRedirectAction(formData);

    expect(result).toEqual({
      success: false,
      reason: "limit_reached",
      message: "Este produto já está no carrinho e não é possível adicionar mais unidades.",
    });
    expect(mockedWriteCoCartSessionContext).not.toHaveBeenCalled();
    expect(mockedSyncPersistedCheckoutCouponForCart).not.toHaveBeenCalled();
  });

  it("returns a stock-aware error when the authoritative cart rejects a quantity update", async () => {
    (mockedCoCartAdapter.updateCartItem as any).mockRejectedValueOnce({
      response: {
        data: {
          message: "Estoque insuficiente para este item.",
        },
      },
      message: "Estoque insuficiente para este item.",
    });

    const updateForm = new FormData();
    updateForm.append("itemKey", "line_1");
    updateForm.append("quantity", "4");

    const result = await updateCartItemQuantityAction(updateForm);

    expect(result).toEqual({
      success: false,
      error: "Estoque insuficiente para este item.",
    });
    expect(mockedCoCartAdapter.updateCartItem).toHaveBeenCalledWith(
      {
        itemKey: "line_1",
        quantity: 4,
      },
      {
        sessionKey: "session-1",
        cartToken: "token-1",
      },
      undefined,
    );
    expect(mockedWriteCoCartSessionContext).not.toHaveBeenCalled();
    expect(mockedSyncPersistedCheckoutCouponForCart).not.toHaveBeenCalled();
  });

  it("saves checkout address through the Woo compatibility bridge", async () => {
    (mockedWooAdapter.updateAccountCustomer as any).mockResolvedValueOnce(baseCustomer);
    (mockedCoCartAdapter.updateCartShippingDestination as any).mockResolvedValueOnce(baseCartState);

    const result = await saveCheckoutAddressAction("12", {
      first_name: "Maria",
      last_name: "Silva",
      address_1: "Rua 1",
      address_2: "Apto 100",
      city: "Sao Paulo",
      state: "SP",
      postcode: "01000-000",
      country: "BR",
      phone: "11999999999",
      email: "maria@example.com",
    });

    expect(mockedWooAdapter.updateAccountCustomer).toHaveBeenCalledWith(
      "12",
      {
        billing: {
          first_name: "Maria",
          last_name: "Silva",
          address_1: "Rua 1",
          address_2: "Apto 100",
          city: "Sao Paulo",
          state: "SP",
          postcode: "01000-000",
          country: "BR",
          phone: "11999999999",
          email: "maria@example.com",
        },
        shipping: {
          first_name: "Maria",
          last_name: "Silva",
          address_1: "Rua 1",
          address_2: "Apto 100",
          city: "Sao Paulo",
          state: "SP",
          postcode: "01000-000",
          country: "BR",
          phone: "11999999999",
        },
      },
    );
    expect(mockedCoCartAdapter.updateCartShippingDestination).toHaveBeenCalledWith(
      {
        postcode: "01000-000",
        country: "BR",
        state: "SP",
        city: "Sao Paulo",
        addressLine1: "Rua 1",
        addressLine2: "Apto 100",
        firstName: "Maria",
        lastName: "Silva",
        phone: "11999999999",
        email: "maria@example.com",
      },
      {
        sessionKey: "session-1",
        cartToken: "token-1",
      },
      undefined,
    );
    expect(result).toEqual({
      success: true,
      customer: baseCustomer,
      cart: baseCartState,
    });
  });

  it("keeps the profile address save successful when cart-session shipping sync fails", async () => {
    (mockedWooAdapter.updateAccountCustomer as any).mockResolvedValueOnce(baseCustomer);
    (mockedCoCartAdapter.updateCartShippingDestination as any).mockRejectedValueOnce(
      new Error("shipping sync unavailable"),
    );

    const result = await saveCheckoutAddressAction("12", {
      first_name: "Maria",
      last_name: "Silva",
      address_1: "Rua 1",
      address_2: "Apto 100",
      city: "Sao Paulo",
      state: "SP",
      postcode: "01000-000",
      country: "BR",
      phone: "11999999999",
      email: "maria@example.com",
    });

    expect(mockedWooAdapter.updateAccountCustomer).toHaveBeenCalledWith(
      "12",
      expect.objectContaining({
        billing: expect.objectContaining({
          postcode: "01000-000",
        }),
        shipping: expect.objectContaining({
          postcode: "01000-000",
        }),
      }),
    );
    expect(mockedCoCartAdapter.updateCartShippingDestination).toHaveBeenCalledTimes(1);
    expect(mockedWriteCoCartSessionContext).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      customer: baseCustomer,
      cart: null,
    });
  });

  it("calculates shipping through the cart-session shipping boundary", async () => {
    (mockedCoCartAdapter.updateCartShippingDestination as any).mockResolvedValueOnce(baseCartState);

    const result = await calculateCheckoutShippingAction({
      postcode: "01000-000",
      country: "BR",
      state: "SP",
      city: "Sao Paulo",
    });

    expect(mockedCoCartAdapter.updateCartShippingDestination).toHaveBeenCalledWith(
      {
        postcode: "01000-000",
        country: "BR",
        state: "SP",
        city: "Sao Paulo",
      },
      {
        sessionKey: "session-1",
        cartToken: "token-1",
      },
      undefined,
    );
    expect(mockedWriteCoCartSessionContext).toHaveBeenCalledWith(baseCartState);
    expect(mockedSyncPersistedCheckoutCouponForCart).toHaveBeenCalledWith(baseCartState);
    expect(result).toEqual({
      success: true,
      cart: baseCartState,
    });
  });

  it("blocks shipping calculation when the Brazilian destination is missing the state", async () => {
    const result = await calculateCheckoutShippingAction({
      postcode: "01000-000",
      country: "BR",
    });

    expect(mockedCoCartAdapter.updateCartShippingDestination).not.toHaveBeenCalled();
    expect(mockedWriteCoCartSessionContext).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error:
        "Complete o endereco de entrega com estado e CEP validos antes de calcular o frete.",
    });
  });

  it("reloads shipping options from the authoritative cart", async () => {
    (mockedCoCartAdapter.refreshCartShipping as any).mockResolvedValueOnce(baseCartState);

    const result = await reloadCheckoutShippingAction();

    expect(mockedCoCartAdapter.refreshCartShipping).toHaveBeenCalledWith(
      {
        sessionKey: "session-1",
        cartToken: "token-1",
      },
      undefined,
    );
    expect(mockedWriteCoCartSessionContext).toHaveBeenCalledWith(baseCartState);
    expect(mockedSyncPersistedCheckoutCouponForCart).toHaveBeenCalledWith(baseCartState);
    expect(result).toEqual({
      success: true,
      cart: baseCartState,
    });
  });

  it("persists the selected shipping rate and returns the refreshed cart", async () => {
    const selectedPacCart = {
      ...baseCartState,
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
          description: undefined,
          cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
          selected: true,
          metaData: [],
          deliveryForecastDays: 5,
        },
      ],
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
              description: undefined,
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
              description: undefined,
              cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
              selected: true,
              metaData: [],
              deliveryForecastDays: 5,
            },
          ],
        },
      ],
      shippingTotal: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
      total: { amount: 59.9, currencyCode: "BRL", formatted: "R$ 59,90" },
    };
    (mockedCoCartAdapter.selectShippingRate as any).mockResolvedValueOnce(selectedPacCart);

    const result = await selectCheckoutShippingRateAction({
      packageId: "1",
      rateId: "pac:2",
    });

    expect(mockedCoCartAdapter.selectShippingRate).toHaveBeenCalledWith(
      {
        packageId: "1",
        rateId: "pac:2",
      },
      {
        sessionKey: "session-1",
        cartToken: "token-1",
      },
      undefined,
    );
    expect(mockedWriteCoCartSessionContext).toHaveBeenCalledWith(selectedPacCart);
    expect(mockedSyncPersistedCheckoutCouponForCart).toHaveBeenCalledWith(selectedPacCart);
    expect(result).toEqual({
      success: true,
      cart: selectedPacCart,
    });
  });

  it("applies a free-shipping coupon through CoCart and returns refreshed free shipping rates", async () => {
    const freeShippingCart = {
      ...baseCartState,
      total: { amount: 54.9, currencyCode: "BRL", formatted: "R$ 54,90" },
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
              description: "Liberado pelo cupom aplicado",
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
          description: "Liberado pelo cupom aplicado",
          cost: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
          selected: true,
          metaData: [],
          deliveryForecastDays: undefined,
        },
      ],
      shippingTotal: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
    };
    (mockedCoCartAdapter.getSessionState as any).mockResolvedValueOnce(
      authenticatedCoCartSession,
    );
    (mockedCoCartAdapter.getCartState as any).mockResolvedValueOnce(baseCartState);
    (mockedCoCartAdapter.applyCoupon as any).mockResolvedValueOnce(freeShippingCart);
    (mockedWooAdapter.getAccountCustomer as any).mockResolvedValueOnce(baseCustomer);

    const couponForm = new FormData();
    couponForm.append("coupon_code", "SOLAR");

    const result = await applyCouponAction(couponForm);

    expect(mockedCoCartAdapter.applyCoupon).toHaveBeenCalledWith(
      { code: "SOLAR" },
      {
        sessionKey: "session-1",
        cartToken: "token-1",
      },
      undefined,
    );
    expect(mockedWritePersistedCheckoutCouponCode).toHaveBeenCalledWith("SOLAR");
    expect(mockedWriteCoCartSessionContext).toHaveBeenCalledWith(freeShippingCart);
    expect(result).toEqual({
      success: true,
      cart: freeShippingCart,
      appliedCoupon: {
        code: "SOLAR",
        discount: 10,
        type: "fixed_cart",
        amount: "10",
      },
    });
    expect(result.cart!.shippingRates[0]).toMatchObject({
      rateId: "free_shipping:1",
      label: "Frete grátis",
      cost: expect.objectContaining({
        amount: 0,
        formatted: "R$ 0,00",
      }),
    });
  });

  it("removes a free-shipping coupon from the authoritative CoCart cart and restores paid shipping totals", async () => {
    const freeShippingCart = {
      ...baseCartState,
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
      total: { amount: 54.9, currencyCode: "BRL", formatted: "R$ 54,90" },
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
              description: "Liberado pelo cupom aplicado",
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
          description: "Liberado pelo cupom aplicado",
          cost: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
          selected: true,
          metaData: [],
          deliveryForecastDays: undefined,
        },
      ],
      shippingTotal: { amount: 0, currencyCode: "BRL", formatted: "R$ 0,00" },
    };
    const cartWithoutCoupon = {
      ...baseCartState,
      couponCode: undefined,
      couponDiscount: null,
      coupons: [],
      total: { amount: 64.9, currencyCode: "BRL", formatted: "R$ 64,90" },
      shippingPackages: [
        {
          packageId: "1",
          packageName: "Correios",
          packageDetails: "Produtos do pedido",
          formattedDestination: "Sao Paulo - SP, 01000-000, Brasil",
          chosenRateId: "sedex:1",
          rates: [baseCartState.shippingRates[0]],
        },
      ],
      shippingRates: [baseCartState.shippingRates[0]],
      shippingTotal: { amount: 15, currencyCode: "BRL", formatted: "R$ 15,00" },
    };
    (mockedCoCartAdapter.getSessionState as any).mockResolvedValueOnce(
      authenticatedCoCartSession,
    );
    (mockedCoCartAdapter.getCartState as any).mockResolvedValueOnce(freeShippingCart);
    (mockedWooAdapter.getAccountCustomer as any).mockResolvedValueOnce(baseCustomer);
    (mockedCoCartAdapter.removeCoupon as any).mockResolvedValueOnce(cartWithoutCoupon);

    const result = await removeCouponAction();

    expect(mockedCoCartAdapter.removeCoupon).toHaveBeenCalledWith(
      "SOLAR",
      {
        sessionKey: "session-1",
        cartToken: "token-1",
      },
      undefined,
    );
    expect(mockedClearPersistedCheckoutCouponCode).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      cart: cartWithoutCoupon,
      appliedCoupon: null,
    });
    expect(result.cart).toMatchObject({
      coupons: [],
      couponDiscount: null,
      shippingRates: [
        expect.objectContaining({
          rateId: "sedex:1",
        }),
      ],
      shippingTotal: expect.objectContaining({
        amount: 15,
      }),
      total: expect.objectContaining({
        amount: 64.9,
      }),
    });
  });

  it("creates the order in Woo from authoritative CoCart cart/customer state", async () => {
    (mockedCoCartAdapter.getSessionState as any)
      .mockResolvedValueOnce(authenticatedCoCartSession)
      .mockResolvedValueOnce(authenticatedCoCartSession);
    (mockedCoCartAdapter.applyCoupon as any).mockResolvedValueOnce(baseCartState);
    (mockedCoCartAdapter.getCartState as any)
      .mockResolvedValueOnce(baseCartState)
      .mockResolvedValueOnce(baseCartState);
    (getSupportedCheckoutPaymentMethods as any).mockResolvedValueOnce([
      {
        id: "woo-mercado-pago-custom",
        title: "Cartão de crédito",
        description: "Mercado Pago",
        enabled: true,
      },
    ]);
    (mockedWooAdapter.getAccountCustomer as any)
      .mockResolvedValueOnce(baseCustomer)
      .mockResolvedValueOnce(baseCustomer);
    (mockedWooAdapter.createWooOrder as any).mockResolvedValueOnce({
      orderId: "77",
      orderNumber: "00077",
      status: {
        code: "pending",
        label: "Pendente",
      },
      createdAt: "2026-03-12T10:00:00.000Z",
      total: { amount: 54.9, currencyCode: "BRL", formatted: "R$ 54,90" },
      paymentMethodId: "woo-mercado-pago-custom",
      paymentMethodTitle: "Cartão de crédito",
      shippingAddress: {},
      billingAddress: {},
      items: [],
      couponCode: "PROMO10",
      couponDiscount: {
        amount: 10,
        currencyCode: "BRL",
        formatted: "R$ 10,00",
      },
    });

    const couponForm = new FormData();
    couponForm.append("coupon_code", "PROMO10");
    const couponResult = await applyCouponAction(couponForm);

    const orderResult = await createCheckoutOrderAction({
      customerId: "999",
      billingAddress: {
        first_name: "Outro",
        last_name: "Endereco",
        address_1: "Rua Errada",
        address_2: "Apto 999",
        city: "Rio",
        state: "RJ",
        postcode: "20000-000",
        country: "BR",
        phone: "21999999999",
        email: "outro@example.com",
      },
      shippingAddress: {
        first_name: "Outro",
        last_name: "Endereco",
        address_1: "Rua Errada",
        address_2: "Apto 999",
        city: "Rio",
        state: "RJ",
        postcode: "20000-000",
        country: "BR",
        phone: "21999999999",
        email: "outro@example.com",
      },
      items: [
        {
          productId: "1000",
          variationId: "1001",
          quantity: 1,
          unitPrice: 10,
          total: 10,
          name: "Ignorado",
        },
      ],
      paymentMethod: "woo-mercado-pago-custom",
      paymentMethodTitle: "Cartão de crédito",
      paymentFlow: "card",
      coupon: {
        code: "PROMO10",
        discount: 999,
      },
      totalAmount: 999,
    });

    expect(mockedCoCartAdapter.applyCoupon).toHaveBeenCalledWith(
      {
        code: "PROMO10",
      },
      {
        sessionKey: "session-1",
        cartToken: "token-1",
      },
      undefined,
    );
    expect(couponResult).toEqual({
      success: true,
      cart: baseCartState,
      appliedCoupon: {
        code: "PROMO10",
        discount: 10,
        type: "percent",
        amount: "10",
      },
    });
    expect(mockedWritePersistedCheckoutCouponCode).toHaveBeenCalledWith("PROMO10");
    expect(mockedWooAdapter.createWooOrder).toHaveBeenCalledWith({
      customer_id: 12,
      billing: expect.objectContaining({
        first_name: "Maria",
        address_1: "Rua 1",
        city: "Sao Paulo",
      }),
      shipping: expect.objectContaining({
        first_name: "Maria",
        address_1: "Rua 1",
        city: "Sao Paulo",
      }),
      line_items: [
        {
          product_id: 7,
          variation_id: 21,
          quantity: 2,
        },
      ],
      coupon_lines: [
        {
          code: "PROMO10",
        },
      ],
      payment_method: "woo-mercado-pago-custom",
      payment_method_title: "Cartão de crédito",
      shipping_lines: [
        {
          method_id: "sedex",
          method_title: "SEDEX",
          total: "15.00",
        },
      ],
      status: "pending",
    });
    expect(mockedClearCheckoutSession).toHaveBeenCalledTimes(1);
    expect(mockedClearPersistedCheckoutCouponCode).toHaveBeenCalledTimes(1);
    expect(mockedCoCartAdapter.clearCart).toHaveBeenCalledWith(
      {
        sessionKey: "session-1",
        cartToken: "token-1",
      },
      undefined,
    );
    expect(orderResult).toEqual({
      success: true,
      order: expect.objectContaining({
        orderId: "77",
      }),
    });
  });

  it("keeps shipping_lines aligned with the selected backend shipping rate through checkout completion", async () => {
    const selectedPacCart = {
      ...baseCartState,
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
          description: undefined,
          cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
          selected: true,
          metaData: [],
          deliveryForecastDays: 5,
        },
      ],
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
              description: undefined,
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
              description: undefined,
              cost: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
              selected: true,
              metaData: [],
              deliveryForecastDays: 5,
            },
          ],
        },
      ],
      shippingTotal: { amount: 10, currencyCode: "BRL", formatted: "R$ 10,00" },
      total: { amount: 59.9, currencyCode: "BRL", formatted: "R$ 59,90" },
    };

    (mockedCoCartAdapter.selectShippingRate as any).mockResolvedValueOnce(selectedPacCart);
    (mockedCoCartAdapter.getSessionState as any)
      .mockResolvedValueOnce(authenticatedCoCartSession)
      .mockResolvedValueOnce(authenticatedCoCartSession);
    (mockedCoCartAdapter.getCartState as any)
      .mockResolvedValueOnce(selectedPacCart)
      .mockResolvedValueOnce(selectedPacCart);
    (getSupportedCheckoutPaymentMethods as any).mockResolvedValueOnce([
      {
        id: "woo-mercado-pago-custom",
        title: "Cartão de crédito",
        description: "Mercado Pago",
        enabled: true,
      },
    ]);
    (mockedWooAdapter.getAccountCustomer as any)
      .mockResolvedValueOnce(baseCustomer)
      .mockResolvedValueOnce(baseCustomer);
    (mockedWooAdapter.createWooOrder as any).mockResolvedValueOnce({
      orderId: "88",
      orderNumber: "00088",
      status: {
        code: "pending",
        label: "Pendente",
      },
      createdAt: "2026-03-12T10:00:00.000Z",
      total: { amount: 59.9, currencyCode: "BRL", formatted: "R$ 59,90" },
      paymentMethodId: "woo-mercado-pago-custom",
      paymentMethodTitle: "Cartão de crédito",
      shippingAddress: {},
      billingAddress: {},
      items: [],
      couponCode: undefined,
      couponDiscount: null,
    });

    const selectionResult = await selectCheckoutShippingRateAction({
      packageId: "1",
      rateId: "pac:2",
    });

    const orderResult = await createCheckoutOrderAction({
      customerId: "12",
      billingAddress: {
        first_name: "Maria",
        last_name: "Silva",
        address_1: "Rua 1",
        address_2: "Apto 100",
        city: "Sao Paulo",
        state: "SP",
        postcode: "01000-000",
        country: "BR",
        phone: "11999999999",
        email: "maria@example.com",
      },
      shippingAddress: {
        first_name: "Maria",
        last_name: "Silva",
        address_1: "Rua 1",
        address_2: "Apto 100",
        city: "Sao Paulo",
        state: "SP",
        postcode: "01000-000",
        country: "BR",
        phone: "11999999999",
        email: "maria@example.com",
      },
      items: [],
      paymentMethod: "woo-mercado-pago-custom",
      paymentMethodTitle: "Cartão de crédito",
      paymentFlow: "card",
      coupon: null,
      totalAmount: 0,
    });

    expect(selectionResult).toEqual({
      success: true,
      cart: selectedPacCart,
    });
    expect(mockedWooAdapter.createWooOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        shipping_lines: [
          {
            method_id: "pac",
            method_title: "PAC",
            total: "10.00",
          },
        ],
      }),
    );
    expect(orderResult).toEqual({
      success: true,
      order: expect.objectContaining({
        orderId: "88",
      }),
    });
    expect(mockedCoCartAdapter.clearCart).toHaveBeenCalledTimes(1);
  });

  it("keeps checkout completion successful after Woo order creation", async () => {
    (mockedCoCartAdapter.getSessionState as any).mockResolvedValueOnce(
      authenticatedCoCartSession,
    );
    (mockedCoCartAdapter.getCartState as any).mockResolvedValueOnce(baseCartState);
    (getSupportedCheckoutPaymentMethods as any).mockResolvedValueOnce([
      {
        id: "woo-mercado-pago-pix",
        title: "PIX",
        enabled: true,
      },
    ]);
    (mockedWooAdapter.createWooOrder as any).mockResolvedValueOnce({
      orderId: "77",
      orderNumber: "00077",
      status: {
        code: "pending",
        label: "Pendente",
      },
      createdAt: "2026-03-12T10:00:00.000Z",
      total: { amount: 64.9, currencyCode: "BRL", formatted: "R$ 64,90" },
      paymentMethodId: "woo-mercado-pago-pix",
      paymentMethodTitle: "PIX",
      shippingAddress: {},
      billingAddress: {},
      items: [],
      couponCode: "PROMO10",
      couponDiscount: {
        amount: 10,
        currencyCode: "BRL",
        formatted: "R$ 10,00",
      },
    });

    const orderResult = await createCheckoutOrderAction({
      customerId: "12",
      billingAddress: {
        first_name: "Maria",
        last_name: "Silva",
        address_1: "Rua 1",
        address_2: "Apto 100",
        city: "Sao Paulo",
        state: "SP",
        postcode: "01000-000",
        country: "BR",
        phone: "11999999999",
        email: "maria@example.com",
      },
      shippingAddress: {
        first_name: "Maria",
        last_name: "Silva",
        address_1: "Rua 1",
        address_2: "Apto 100",
        city: "Sao Paulo",
        state: "SP",
        postcode: "01000-000",
        country: "BR",
        phone: "11999999999",
        email: "maria@example.com",
      },
      items: [],
      paymentMethod: "woo-mercado-pago-pix",
      paymentMethodTitle: "PIX",
      paymentFlow: "pix",
      coupon: null,
      totalAmount: 0,
    });

    expect(orderResult).toEqual({
      success: true,
      order: expect.objectContaining({
        orderId: "77",
      }),
    });
    expect(mockedCoCartAdapter.clearCart).toHaveBeenCalledTimes(1);
    expect(mockedClearCheckoutSession).toHaveBeenCalledTimes(1);
    expect(mockedClearPersistedCheckoutCouponCode).toHaveBeenCalledTimes(1);
  });

  it("blocks order creation when the selected payment method is no longer available", async () => {
    (mockedCoCartAdapter.getSessionState as any).mockResolvedValueOnce(
      authenticatedCoCartSession,
    );
    (mockedCoCartAdapter.getCartState as any).mockResolvedValueOnce(baseCartState);
    (getSupportedCheckoutPaymentMethods as any).mockResolvedValueOnce([
      {
        id: "woo-mercado-pago-custom",
        title: "Cartão de crédito",
        enabled: true,
      },
    ]);

    const result = await createCheckoutOrderAction({
      customerId: "12",
      billingAddress: {
        first_name: "Maria",
        last_name: "Silva",
        address_1: "Rua 1",
        address_2: "Apto 100",
        city: "Sao Paulo",
        state: "SP",
        postcode: "01000-000",
        country: "BR",
        phone: "11999999999",
        email: "maria@example.com",
      },
      shippingAddress: {
        first_name: "Maria",
        last_name: "Silva",
        address_1: "Rua 1",
        address_2: "Apto 100",
        city: "Sao Paulo",
        state: "SP",
        postcode: "01000-000",
        country: "BR",
        phone: "11999999999",
        email: "maria@example.com",
      },
      items: [],
      paymentMethod: "woo-mercado-pago-pix",
      paymentMethodTitle: "PIX",
      paymentFlow: "pix",
      coupon: null,
      totalAmount: 0,
    });

    expect(result).toEqual({
      success: false,
      error:
        "O meio de pagamento selecionado nao esta mais disponivel. Atualize a pagina e tente novamente.",
    });
    expect(mockedWooAdapter.createWooOrder).not.toHaveBeenCalled();
  });
});
