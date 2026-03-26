"use server";

import { headers } from "next/headers";
import {
  cocartServerAdapter,
  isCoCartCompatibilityFallbackError,
  readCoCartForwardHeaders,
  type CoCartCartStateView,
} from "@site/integrations/cocart/server";
import { getSupportedCheckoutPaymentMethods } from "@site/integrations/payments/server";
import type {
  AccountCustomerView,
  AuthUserView,
  CheckoutShippingDestinationInput,
  CheckoutShippingSelectionInput,
  CheckoutPaymentMethodView,
} from "@site/shared";
import {
  accountCustomerViewSchema,
  checkoutShippingDestinationInputSchema,
  checkoutShippingSelectionInputSchema,
} from "@site/shared";
import { wordpressWooRestAdapter } from "@site/integrations/wordpress/server";
import type {
  CheckoutAddressFormData,
  CheckoutAppliedCoupon,
  CheckoutCreateOrderInput,
} from "../checkout.types";
import {
  buildCheckoutAppliedCoupon,
  clearCheckoutSession,
  readCoCartSessionContext,
  writeCoCartSessionContext,
} from "../loaders/cart-session.loader";
import {
  clearPersistedCheckoutCouponCode,
  syncPersistedCheckoutCouponForCart,
  writePersistedCheckoutCouponCode,
} from "../loaders/checkout-coupon.loader";

const toOrderPayload = (
  orderData: CheckoutCreateOrderInput,
  paymentMethod: CheckoutPaymentMethodView,
  cart?: Pick<CoCartCartStateView, "shippingRates">,
) => ({
  customer_id:
    orderData.customerId !== undefined &&
    orderData.customerId !== null &&
    String(orderData.customerId).trim() !== ""
      ? Number(orderData.customerId)
      : undefined,
  billing: orderData.billingAddress,
  shipping: orderData.shippingAddress,
  line_items: orderData.items.map((item) => ({
    product_id: Number(item.productId),
    variation_id:
      item.variationId !== undefined && item.variationId !== null && item.variationId !== ""
        ? Number(item.variationId)
        : undefined,
    quantity: item.quantity,
  })),
  coupon_lines: orderData.coupon
    ? [
        {
          code: orderData.coupon.code,
        },
      ]
    : [],
  payment_method: paymentMethod.id,
  payment_method_title: paymentMethod.title,
  customer_note: orderData.customerNote?.trim() || undefined,
  shipping_lines:
    cart?.shippingRates
      ?.filter((rate) => rate.selected)
      .map((rate) => ({
        method_id: rate.methodId || rate.rateId,
        method_title: rate.label,
        total: rate.cost.amount.toFixed(2),
      })) ?? [],
  status: "pending",
});

const persistCartSession = async (
  cart: Pick<CoCartCartStateView, "sessionKey" | "cartToken">,
) => {
  await writeCoCartSessionContext(cart);
};

const commitCheckoutCartMutation = async (
  cart: CoCartCartStateView,
): Promise<CoCartCartStateView> => {
  await persistCartSession(cart);
  await syncPersistedCheckoutCouponForCart(cart).catch(() => null);
  return cart;
};

const runCheckoutCartMutation = async (
  mutate: (
    session: Awaited<ReturnType<typeof readCoCartSessionContext>>,
    requestHeaders: Awaited<ReturnType<typeof readRequestHeaders>>,
  ) => Promise<CoCartCartStateView>,
) => {
  const session = await readCoCartSessionContext();
  const requestHeaders = await readRequestHeaders();
  const cart = await mutate(session, requestHeaders);

  return await commitCheckoutCartMutation(cart);
};

const readRequestHeaders = async () => readCoCartForwardHeaders(await headers());

const ADD_TO_CART_LIMIT_REACHED_MESSAGE =
  "Este produto já está no carrinho e não é possível adicionar mais unidades.";
const GENERIC_ADD_TO_CART_ERROR_MESSAGE =
  "Não foi possível adicionar este produto ao carrinho. Tente novamente.";

const readCartMutationErrorMessage = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return "";
  }

  const errorWithResponse = error as {
    message?: unknown;
    response?: {
      data?: {
        message?: unknown;
      };
    };
  };

  return String(
    errorWithResponse.response?.data?.message ?? errorWithResponse.message ?? "",
  ).trim();
};

const isStockOrLimitRejection = (message: string) => {
  const loweredMessage = message.toLowerCase();

  return (
    loweredMessage.includes("stock") ||
    loweredMessage.includes("estoque") ||
    loweredMessage.includes("limit") ||
    loweredMessage.includes("purchase") ||
    loweredMessage.includes("quantity") ||
    loweredMessage.includes("quantidade") ||
    loweredMessage.includes("already have") ||
    loweredMessage.includes("already in your cart") ||
    loweredMessage.includes("max_purchase")
  );
};

const normalizeAddToCartFailure = (error: unknown) => {
  const message = readCartMutationErrorMessage(error);

  if (message && isStockOrLimitRejection(message)) {
    return {
      success: false as const,
      reason: "limit_reached" as const,
      message: ADD_TO_CART_LIMIT_REACHED_MESSAGE,
    };
  }

  return {
    success: false as const,
    reason: "unknown" as const,
    message: message || GENERIC_ADD_TO_CART_ERROR_MESSAGE,
  };
};

const toCheckoutAddressFormData = (
  address:
    | AccountCustomerView["billingAddress"]
    | AccountCustomerView["shippingAddress"]
    | null
    | undefined,
  fallback?: CheckoutAddressFormData,
): CheckoutAddressFormData => ({
  first_name: address?.firstName || fallback?.first_name || "",
  last_name: address?.lastName || fallback?.last_name || "",
  address_1: address?.addressLine1 || fallback?.address_1 || "",
  address_2: address?.addressLine2 || fallback?.address_2 || "",
  city: address?.city || fallback?.city || "",
  state: address?.state || fallback?.state || "",
  postcode: address?.postcode || fallback?.postcode || "",
  country: address?.country || fallback?.country || "BR",
  phone: address?.phone || fallback?.phone || "",
  email: address?.email || fallback?.email || "",
});

const toShippingDestinationInput = (
  address: CheckoutAddressFormData,
): CheckoutShippingDestinationInput =>
  checkoutShippingDestinationInputSchema.parse({
    postcode: address.postcode,
    country: address.country || "BR",
    state: address.state || undefined,
    city: address.city || undefined,
    addressLine1: address.address_1 || undefined,
    addressLine2: address.address_2 || undefined,
    firstName: address.first_name || undefined,
    lastName: address.last_name || undefined,
    phone: address.phone || undefined,
    email: address.email || undefined,
  });

const syncCheckoutShippingDestination = async (
  input: CheckoutShippingDestinationInput,
) => {
  const parsedInput = checkoutShippingDestinationInputSchema.parse(input);

  return await runCheckoutCartMutation((session, requestHeaders) =>
    cocartServerAdapter.updateCartShippingDestination(
      parsedInput,
      session,
      requestHeaders,
    ),
  );
};

const validateCheckoutShippingDestinationForCalculation = (
  input: CheckoutShippingDestinationInput,
) => {
  const country = input.country.trim().toUpperCase();
  const postcode = input.postcode.trim();
  const state = input.state?.trim().toUpperCase() || "";

  if (!country || !postcode) {
    return {
      ok: false as const,
      error:
        "Complete o endereco de entrega com pais e CEP validos antes de calcular o frete.",
    };
  }

  if (country === "BR" && !state) {
    return {
      ok: false as const,
      error:
        "Complete o endereco de entrega com estado e CEP validos antes de calcular o frete.",
    };
  }

  return {
    ok: true as const,
  };
};

const buildFallbackCustomer = (
  userId: string,
  viewer?: Pick<AuthUserView, "displayName" | "email"> | null,
): AccountCustomerView =>
  accountCustomerViewSchema.parse({
    id: userId,
    email: viewer?.email,
    displayName: viewer?.displayName || "Cliente",
    billingAddress: null,
    shippingAddress: null,
  });

const buildCartDerivedCustomer = (
  userId: string,
  cartCustomer: AccountCustomerView | null | undefined,
  viewer?: Pick<AuthUserView, "displayName" | "email"> | null,
): AccountCustomerView => {
  if (!cartCustomer) {
    return buildFallbackCustomer(userId, viewer);
  }

  if (cartCustomer.id === "0") {
    return accountCustomerViewSchema.parse({
      ...cartCustomer,
      id: userId,
      displayName:
        cartCustomer.displayName || viewer?.displayName || cartCustomer.email || "Cliente",
    });
  }

  return cartCustomer;
};

type CheckoutCommerceState = {
  userId: string;
  customer: AccountCustomerView;
  cart: CoCartCartStateView;
  paymentMethods: CheckoutPaymentMethodView[];
};

async function loadCheckoutCommerceState(options?: {
  includePaymentMethods?: boolean;
}): Promise<CheckoutCommerceState | null> {
  const requestHeaders = await readRequestHeaders();
  const sessionContext = await readCoCartSessionContext();

  let sessionUserId: string | null = null;
  let sessionUser: AuthUserView | null = null;

  try {
    const sessionState = await cocartServerAdapter.getSessionState(requestHeaders);

    if (sessionState.session.isAuthenticated && sessionState.session.user?.id) {
      sessionUserId = String(sessionState.session.user.id);
      sessionUser = sessionState.session.user;
    }
  } catch (error) {
    if (!isCoCartCompatibilityFallbackError(error)) {
      throw error;
    }
  }

  if (!sessionUserId) {
    return null;
  }

  const cart = await cocartServerAdapter.getCartState(sessionContext, requestHeaders);
  const wooCustomer = await wordpressWooRestAdapter
    .getAccountCustomer(Number(sessionUserId))
    .catch(() => null);
  const customer =
    wooCustomer ||
    buildCartDerivedCustomer(sessionUserId, cart.customer || null, sessionUser);
  const paymentMethods = options?.includePaymentMethods
    ? await getSupportedCheckoutPaymentMethods()
    : [];

  return {
    userId: String(customer.id || sessionUserId),
    customer,
    cart,
    paymentMethods,
  };
}

const buildCheckoutOrderFromState = (
  state: CheckoutCommerceState,
  orderData: CheckoutCreateOrderInput,
  coupon: CheckoutAppliedCoupon | null,
): CheckoutCreateOrderInput => {
  const billingAddress = toCheckoutAddressFormData(
    state.customer.billingAddress,
    orderData.billingAddress,
  );
  const shippingAddress = toCheckoutAddressFormData(
    state.customer.shippingAddress || state.customer.billingAddress,
    orderData.shippingAddress,
  );

  return {
    customerId: state.userId,
    billingAddress,
    shippingAddress,
    items: state.cart.items.map((item) => ({
      productId: item.productId,
      variationId: item.variationId,
      quantity: item.quantity,
      unitPrice: item.unitPrice?.amount ?? 0,
      total: item.total.amount,
      name: item.name,
    })),
    paymentMethod: orderData.paymentMethod,
    paymentMethodTitle: orderData.paymentMethodTitle,
    paymentFlow: orderData.paymentFlow,
    coupon,
    totalAmount: state.cart.total.amount,
    customerNote: orderData.customerNote,
  };
};

const clearAuthoritativeCheckoutCart = async (
  cart: CoCartCartStateView,
  session: Awaited<ReturnType<typeof readCoCartSessionContext>>,
  requestHeaders: Awaited<ReturnType<typeof readRequestHeaders>>,
) => {
  try {
    return await cocartServerAdapter.clearCart(session, requestHeaders);
  } catch (error) {
    if (!isCoCartCompatibilityFallbackError(error)) {
      throw error;
    }

    let nextCart = cart;

    for (const item of cart.items) {
      nextCart = await cocartServerAdapter.removeCartItem(
        item.itemKey,
        session,
        requestHeaders,
      );
    }

    return nextCart;
  }
};

export async function addCartItemAction(input: {
  productId: string | number;
  variationId?: string | number;
  quantity: number;
}) {
  const session = await readCoCartSessionContext();
  const requestHeaders = await readRequestHeaders();
  const cart = await cocartServerAdapter.addCartItem(
    {
      productId: String(input.productId),
      variationId:
        input.variationId !== undefined && input.variationId !== null && input.variationId !== ""
          ? String(input.variationId)
          : undefined,
      quantity: input.quantity,
    },
    session,
    requestHeaders,
  );

  return await commitCheckoutCartMutation(cart);
}

export async function addToCartAndRedirectAction(formData: FormData) {
  try {
    await addCartItemAction({
      productId: String(formData.get("product_id") ?? ""),
      variationId: String(formData.get("variation_id") ?? "").trim() || undefined,
      quantity: Number.parseInt(String(formData.get("quantity") ?? "1"), 10),
    });

    return {
      success: true as const,
      redirectTo: "/my-cart",
    };
  } catch (error) {
    return normalizeAddToCartFailure(error);
  }
}

export async function updateCartItemQuantityAction(formData: FormData) {
  const itemKey = String(formData.get("itemKey") ?? "").trim();
  const quantity = Number.parseInt(String(formData.get("quantity") ?? "0"), 10);

  if (!itemKey) {
    return {
      success: false as const,
      error: "Item inválido para atualizar a quantidade.",
    };
  }

  try {
    const session = await readCoCartSessionContext();
    const requestHeaders = await readRequestHeaders();
    const cart = await cocartServerAdapter.updateCartItem(
      {
        itemKey,
        quantity,
      },
      session,
      requestHeaders,
    );

    await commitCheckoutCartMutation(cart);

    return {
      success: true as const,
      cart,
    };
  } catch (error: any) {
    return {
      success: false as const,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível atualizar a quantidade deste item.",
    };
  }
}

export async function removeCartItemAction(formData: FormData) {
  const itemKey = String(formData.get("itemKey") ?? "").trim();

  if (!itemKey) {
    return;
  }

  const session = await readCoCartSessionContext();
  const requestHeaders = await readRequestHeaders();
  const cart = await cocartServerAdapter.removeCartItem(itemKey, session, requestHeaders);
  await commitCheckoutCartMutation(cart);
}

export async function applyCouponAction(formData: FormData) {
  const couponCode = String(formData.get("coupon_code") ?? "").trim();

  if (!couponCode) {
    return { error: "Código do cupom é obrigatório" };
  }

  const checkoutState = await loadCheckoutCommerceState();

  if (!checkoutState) {
    return { error: "Sessão indisponível para aplicar o cupom" };
  }

  try {
    const cart = await runCheckoutCartMutation((session, requestHeaders) =>
      cocartServerAdapter.applyCoupon(
        {
          code: couponCode,
        },
        session,
        requestHeaders,
      ),
    );
    const appliedCoupon = buildCheckoutAppliedCoupon(cart);

    if (!appliedCoupon) {
      await clearPersistedCheckoutCouponCode();
      return {
        error: "O cupom foi enviado, mas o carrinho não confirmou a aplicação.",
      };
    }

    await writePersistedCheckoutCouponCode(appliedCoupon.code);

    return {
      success: true,
      cart,
      appliedCoupon,
    };
  } catch (error: any) {
    try {
      await clearPersistedCheckoutCouponCode();
    } catch {
      // Ignore cookie cleanup failures and return the authoritative error instead.
    }
    return { error: error?.message || "Erro ao aplicar cupom" };
  }
}

export async function removeCouponAction() {
  try {
    const checkoutState = await loadCheckoutCommerceState();

    if (!checkoutState) {
      return { error: "Sessão indisponível para remover o cupom", success: false };
    }

    const couponCode = checkoutState.cart.coupons[0]?.code;

    if (!couponCode) {
      await clearPersistedCheckoutCouponCode();
      return {
        success: true,
        cart: checkoutState.cart,
        appliedCoupon: null,
      };
    }

    const cart = await runCheckoutCartMutation((session, requestHeaders) =>
      cocartServerAdapter.removeCoupon(couponCode, session, requestHeaders),
    );
    await clearPersistedCheckoutCouponCode();

    return {
      success: true,
      cart,
      appliedCoupon: null,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Erro ao remover cupom",
    };
  }
}

export async function saveCheckoutAddressAction(
  customerId: string | number,
  address: CheckoutAddressFormData,
) {
  try {
    const commonAddressPayload = {
      first_name: address.first_name,
      last_name: address.last_name,
      address_1: address.address_1,
      address_2: address.address_2,
      city: address.city,
      state: address.state,
      postcode: address.postcode,
      country: address.country || "BR",
      phone: address.phone,
    };
    const customer = await wordpressWooRestAdapter.updateAccountCustomer(customerId, {
      billing: {
        ...commonAddressPayload,
        email: address.email,
      },
      shipping: commonAddressPayload,
    });

    const cart = await syncCheckoutShippingDestination(
      toShippingDestinationInput(address),
    ).catch(() => null);

    return { success: true, customer, cart: cart ?? null };
  } catch (error: any) {
    console.error("Erro ao salvar endereço:", error);
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao salvar endereço",
    };
  }
}

export async function calculateCheckoutShippingAction(
  input: CheckoutShippingDestinationInput,
) {
  try {
    const parsedInput = checkoutShippingDestinationInputSchema.parse(input);
    const validation = validateCheckoutShippingDestinationForCalculation(parsedInput);

    if (!validation.ok) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const cart = await syncCheckoutShippingDestination(parsedInput);

    return {
      success: true,
      cart,
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível calcular o frete agora.",
    };
  }
}

export async function reloadCheckoutShippingAction() {
  try {
    const cart = await runCheckoutCartMutation((session, requestHeaders) =>
      cocartServerAdapter.refreshCartShipping(session, requestHeaders),
    );

    return {
      success: true,
      cart,
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível atualizar as opções de entrega.",
    };
  }
}

export async function selectCheckoutShippingRateAction(
  input: CheckoutShippingSelectionInput,
) {
  try {
    const parsedInput = checkoutShippingSelectionInputSchema.parse(input);
    const cart = await runCheckoutCartMutation((session, requestHeaders) =>
      cocartServerAdapter.selectShippingRate(
        parsedInput,
        session,
        requestHeaders,
      ),
    );

    return {
      success: true,
      cart,
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível salvar a opção de entrega.",
    };
  }
}

export async function createCheckoutOrderAction(orderData: CheckoutCreateOrderInput) {
  try {
    const sessionContext = await readCoCartSessionContext();
    const requestHeaders = await readRequestHeaders();
    const checkoutState = await loadCheckoutCommerceState({
      includePaymentMethods: true,
    });

    if (!checkoutState) {
      return {
        success: false,
        error: "Sessão indisponível para criar o pedido",
      };
    }

    if (!checkoutState.cart.items.length) {
      return {
        success: false,
        error: "Carrinho vazio. Atualize a página e tente novamente.",
      };
    }

    if (!checkoutState.paymentMethods.length) {
      return {
        success: false,
        error: "Nenhum meio de pagamento ativo esta disponivel no checkout.",
      };
    }

    const selectedPaymentMethod = checkoutState.paymentMethods.find(
      (method) => method.id === orderData.paymentMethod,
    );

    if (!selectedPaymentMethod) {
      return {
        success: false,
        error: "O meio de pagamento selecionado nao esta mais disponivel. Atualize a pagina e tente novamente.",
      };
    }

    const resolvedCoupon = buildCheckoutAppliedCoupon(checkoutState.cart);

    const authoritativeOrderData = buildCheckoutOrderFromState(
      checkoutState,
      orderData,
      resolvedCoupon,
    );
    const order = await wordpressWooRestAdapter.createWooOrder(
      toOrderPayload(authoritativeOrderData, selectedPaymentMethod, checkoutState.cart),
    );
    await clearAuthoritativeCheckoutCart(
      checkoutState.cart,
      sessionContext,
      requestHeaders,
    );
    await clearCheckoutSession();
    await clearPersistedCheckoutCouponCode();

    return {
      success: true,
      order,
    };
  } catch (error: any) {
    console.error("Erro ao criar pedido:", error);
    return {
      success: false,
      error: error?.response?.data?.message || error?.message || "Erro ao criar pedido",
    };
  }
}

const toCheckoutSessionState = (cart: CoCartCartStateView) => ({
  items: cart.items.map((item) => ({
    itemKey: item.itemKey,
    productId: String(item.productId),
    variationId: item.variationId ? String(item.variationId) : undefined,
    quantity: item.quantity,
    unitPrice: item.unitPrice?.amount ?? 0,
    total: item.total.amount,
    name: item.name,
    image: item.image ?? null,
  })),
});

const toCheckoutAppliedCoupon = (
  cart: CoCartCartStateView,
): Promise<CheckoutAppliedCoupon | null> => Promise.resolve(buildCheckoutAppliedCoupon(cart));

export async function loadCheckoutPageData() {
  const checkoutState = await loadCheckoutCommerceState({
    includePaymentMethods: true,
  });

  if (!checkoutState) {
    return null;
  }

  const appliedCoupon = await toCheckoutAppliedCoupon(checkoutState.cart).catch(() => null);

  return {
    userId: checkoutState.userId,
    customer: checkoutState.customer,
    cart: checkoutState.cart,
    cartState: toCheckoutSessionState(checkoutState.cart),
    paymentMethods: checkoutState.paymentMethods,
    appliedCoupon,
  };
}
