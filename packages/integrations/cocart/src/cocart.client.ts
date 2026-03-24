import type {
  AccountOrderSummaryView,
  CatalogListingView,
  CatalogProductDetailView,
} from "@site/shared";
import {
  cocartAddCartItemInputSchema,
  cocartApplyCouponInputSchema,
  cocartCatalogQuerySchema,
  cocartCustomerAddressUpdateInputSchema,
  cocartCustomerPasswordUpdateInputSchema,
  cocartCustomerProfileUpdateInputSchema,
  cocartSelectShippingRateInputSchema,
  cocartShippingDestinationInputSchema,
  cocartUpdateCartItemInputSchema,
  type CoCartAddCartItemInput,
  type CoCartCustomerAddressUpdateInput,
  type CoCartCustomerPasswordUpdateInput,
  type CoCartCustomerProfileUpdateInput,
  type CoCartApplyCouponInput,
  type CoCartCartStateView,
  type CoCartCatalogQuery,
  type CoCartOrderSummaryView,
  type CoCartSelectShippingRateInput,
  type CoCartSessionContext,
  type CoCartSessionStateView,
  type CoCartShippingDestinationInput,
  type CoCartShippingQuoteView,
} from "./contracts";
import {
  createCoCartHttpClient,
  type CoCartFetch,
  type CoCartRequestHeaders,
} from "./clients/cocart-http.client";
import type {
  CoCartRawCart,
  CoCartRawCategoryCollection,
  CoCartRawCustomer,
  CoCartRawOrder,
  CoCartRawOrderCollection,
  CoCartRawProduct,
  CoCartRawProductCollection,
} from "./external/cocart.types";
import {
  mapCoCartCartState,
  mapCoCartCatalogListing,
  mapCoCartCustomerToAccountCustomerView,
  mapCoCartOrderToAccountOrderSummaryView,
  mapCoCartOrderToOrderSummaryView,
  mapCoCartProductToCatalogProductDetailView,
} from "./mappers/cocart.mapper";
import {
  resolveCoCartBaseUrl,
  type CoCartRuntimeConfig,
} from "./runtime/cocart-env";
import { defaultCoCartEndpointMap, type CoCartEndpointMap } from "./runtime/cocart.constants";

export type CreateCoCartBrowserClientConfig = {
  baseUrl: string;
  storeApiBaseUrl?: string;
  timeoutMs?: number;
  endpoints?: Partial<CoCartEndpointMap>;
  fetchFn?: CoCartFetch;
};

export const cocartClientRuntimeRules = {
  browser: [
    "requires explicit baseUrl",
    "must not read server-only environment variables",
    "should only be used when the CoCart runtime is intentionally exposed to the browser",
  ],
  server: [
    "prefer @site/integrations/cocart/server for server components, routes, and actions",
    "treat CoCart as the main ecommerce boundary",
  ],
} as const;

const resolveRuntime = (
  config: CreateCoCartBrowserClientConfig,
): CoCartRuntimeConfig & { fetchFn?: CoCartFetch } => ({
  baseUrl: resolveCoCartBaseUrl(config.baseUrl),
  timeoutMs: config.timeoutMs,
  endpoints: {
    ...defaultCoCartEndpointMap,
    ...(config.endpoints ?? {}),
  },
  sessionHeaderName: "CoCart-API-Cart-Key",
  cartTokenHeaderName: undefined,
  fetchFn: config.fetchFn,
});

const buildSessionHeaders = (
  runtime: CoCartRuntimeConfig,
  session?: CoCartSessionContext,
): CoCartRequestHeaders | undefined => {
  if (!session?.sessionKey && !session?.cartToken) {
    return undefined;
  }

  return {
    ...(session.sessionKey && runtime.sessionHeaderName
      ? { [runtime.sessionHeaderName]: session.sessionKey }
      : {}),
    ...(session.cartToken && runtime.cartTokenHeaderName
      ? { [runtime.cartTokenHeaderName]: session.cartToken }
      : {}),
  };
};

const mergeRequestHeaders = (
  ...headerGroups: Array<CoCartRequestHeaders | undefined>
): CoCartRequestHeaders | undefined => {
  const merged = Object.assign({}, ...headerGroups.filter(Boolean));
  return Object.keys(merged).length > 0 ? merged : undefined;
};

const omitAuthorizationHeader = (
  headers?: CoCartRequestHeaders,
): CoCartRequestHeaders | undefined => {
  if (!headers) {
    return undefined;
  }

  const { Authorization: _authorization, ...rest } = headers;
  return Object.keys(rest).length > 0 ? rest : undefined;
};

const buildCartScopedHeaders = (
  runtime: CoCartRuntimeConfig,
  session?: CoCartSessionContext,
  requestHeaders?: CoCartRequestHeaders,
) =>
  mergeRequestHeaders(
    omitAuthorizationHeader(requestHeaders),
    buildSessionHeaders(runtime, session),
  );

const unwrapOrderCollection = (
  payload: CoCartRawOrderCollection,
): CoCartRawOrder[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.items ?? payload.orders ?? [];
};

const toCustomerUpdatePayload = (input: CoCartCustomerProfileUpdateInput) => ({
  first_name: input.firstName,
  last_name: input.lastName,
  email: input.email,
  billing: {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    city: input.city,
  },
});

const toAddressUpdatePayload = (input: CoCartCustomerAddressUpdateInput) => ({
  [input.addressType]: {
    first_name: input.firstName,
    last_name: input.lastName,
    company: input.company,
    address_1: input.addressLine1,
    address_2: input.addressLine2,
    city: input.city,
    state: input.state,
    postcode: input.postcode,
    country: input.country,
    phone: input.phone,
    email: input.email,
  },
});

const toCoCartShippingDestinationUpdatePayload = (
  input: CoCartShippingDestinationInput,
) => ({
  namespace: "update-customer",
  first_name: input.firstName,
  last_name: input.lastName,
  company: input.company,
  address_1: input.addressLine1,
  address_2: input.addressLine2,
  city: input.city,
  state: input.state,
  country: input.country,
  postcode: input.postcode,
  phone: input.phone,
  s_first_name: input.firstName,
  s_last_name: input.lastName,
  s_company: input.company,
  s_address_1: input.addressLine1,
  s_address_2: input.addressLine2,
  s_city: input.city,
  s_state: input.state,
  s_country: input.country,
  s_postcode: input.postcode,
  s_phone: input.phone,
});

const buildAddCartItemPayload = (input: CoCartAddCartItemInput) => ({
  id: String(input.variationId ?? input.productId),
  quantity: String(input.quantity),
});

const readCartBackedSession = (cart: CoCartRawCart): CoCartSessionStateView["session"] => {
  const billingAddress = cart.customer?.billing_address;
  const shippingAddress = cart.customer?.shipping_address;
  const email = billingAddress?.billing_email?.trim() || undefined;
  const firstName =
    billingAddress?.billing_first_name?.trim() ||
    shippingAddress?.shipping_first_name?.trim() ||
    undefined;
  const lastName =
    billingAddress?.billing_last_name?.trim() ||
    shippingAddress?.shipping_last_name?.trim() ||
    undefined;
  const cartKey = cart.cart_key?.trim() || cart.session_key?.trim() || undefined;
  const isAnonymousCart = !email && Boolean(cartKey?.startsWith("t_"));

  if (isAnonymousCart || !email) {
    return {
      isAuthenticated: false,
      user: null,
    };
  }

  return {
    isAuthenticated: true,
    user: {
      id: "0",
      email,
      username: undefined,
      displayName: [firstName, lastName].filter(Boolean).join(" ") || email || "Cliente",
      firstName,
      lastName,
      avatar: null,
      roleLabels: [],
    },
  };
};

export const createCoCartBrowserClient = (
  config: CreateCoCartBrowserClientConfig,
) => {
  const runtime = resolveRuntime(config);
  const httpClient = createCoCartHttpClient({
    baseUrl: runtime.baseUrl,
    timeoutMs: runtime.timeoutMs,
    endpoints: runtime.endpoints,
    fetchFn: runtime.fetchFn,
  });

  return {
    listCatalogProducts: async (
      query: Partial<CoCartCatalogQuery> = {},
    ): Promise<CatalogListingView> => {
      const parsedQuery = cocartCatalogQuerySchema.parse(query);
      const [payload, categoryPayload] = await Promise.all([
        httpClient.get<CoCartRawProductCollection>(runtime.endpoints.catalogProducts, {
          search: parsedQuery.search,
          category: parsedQuery.category,
          page: parsedQuery.page,
          per_page: parsedQuery.pageSize,
        }),
        httpClient
          .get<CoCartRawCategoryCollection>(runtime.endpoints.catalogCategories, {
            per_page: 100,
          })
          .catch(() => null),
      ]);

      return mapCoCartCatalogListing(payload, parsedQuery, categoryPayload);
    },

    getCatalogProductDetail: async (
      productId: string | number,
    ): Promise<CatalogProductDetailView> => {
      const payload = await httpClient.get<CoCartRawProduct>(
        runtime.endpoints.catalogProduct(productId),
      );

      return mapCoCartProductToCatalogProductDetailView(payload);
    },

    listCatalogProductVariations: async (
      productId: string | number,
    ): Promise<CatalogProductDetailView[]> => {
      const payload = await httpClient.get<CoCartRawProduct[]>(
        runtime.endpoints.catalogProductVariations(productId),
      );

      return payload.map(mapCoCartProductToCatalogProductDetailView);
    },

    getCartState: async (
      session?: CoCartSessionContext,
      requestHeaders?: CoCartRequestHeaders,
    ): Promise<CoCartCartStateView> => {
      const payload = await httpClient.get<CoCartRawCart>(
        runtime.endpoints.cart,
        undefined,
        buildCartScopedHeaders(runtime, session, requestHeaders),
      );
      return mapCoCartCartState(payload);
    },

    clearCart: async (
      session?: CoCartSessionContext,
      requestHeaders?: CoCartRequestHeaders,
    ): Promise<CoCartCartStateView> => {
      const payload = await httpClient.post<CoCartRawCart>(
        runtime.endpoints.clearCart,
        undefined,
        buildCartScopedHeaders(runtime, session, requestHeaders),
      );

      return {
        ...mapCoCartCartState(payload),
        ...(session?.cartToken?.trim()
          ? { cartToken: session.cartToken.trim() }
          : {}),
      };
    },

    addCartItem: async (
      input: CoCartAddCartItemInput,
      session?: CoCartSessionContext,
    ): Promise<CoCartCartStateView> => {
      const parsedInput = cocartAddCartItemInputSchema.parse(input);
      const payload = await httpClient.post<CoCartRawCart>(
        runtime.endpoints.addCartItem,
        buildAddCartItemPayload(parsedInput),
        buildCartScopedHeaders(runtime, session),
      );

      return mapCoCartCartState(payload);
    },

    updateCartItem: async (
      input: { itemKey: string; quantity: number },
      session?: CoCartSessionContext,
    ): Promise<CoCartCartStateView> => {
      const parsedInput = cocartUpdateCartItemInputSchema.parse(input);
      const payload =
        parsedInput.quantity <= 0
          ? await httpClient.delete<CoCartRawCart>(
              runtime.endpoints.removeCartItem(parsedInput.itemKey),
              buildCartScopedHeaders(runtime, session),
            )
          : await httpClient.post<CoCartRawCart>(
              runtime.endpoints.updateCartItem(parsedInput.itemKey),
              {
                quantity: String(parsedInput.quantity),
              },
              buildCartScopedHeaders(runtime, session),
            );

      return mapCoCartCartState(payload);
    },

    removeCartItem: async (
      itemKey: string,
      session?: CoCartSessionContext,
    ): Promise<CoCartCartStateView> => {
      const payload = await httpClient.delete<CoCartRawCart>(
        runtime.endpoints.removeCartItem(itemKey),
        buildCartScopedHeaders(runtime, session),
      );

      return mapCoCartCartState(payload);
    },

    applyCoupon: async (
      input: CoCartApplyCouponInput,
      session?: CoCartSessionContext,
    ): Promise<CoCartCartStateView> => {
      const parsedInput = cocartApplyCouponInputSchema.parse(input);
      const payload = await httpClient.post<CoCartRawCart>(
        runtime.endpoints.updateCart,
        {
          namespace: "apply-coupon",
          coupon_code: parsedInput.code,
        },
        buildCartScopedHeaders(runtime, session),
      );

      return {
        ...mapCoCartCartState(payload),
        ...(session?.cartToken?.trim()
          ? { cartToken: session.cartToken.trim() }
          : {}),
      };
    },

    removeCoupon: async (
      couponCode: string,
      session?: CoCartSessionContext,
    ): Promise<CoCartCartStateView> => {
      const payload = await httpClient.post<CoCartRawCart>(
        runtime.endpoints.updateCart,
        {
          namespace: "remove-coupon",
          coupon_code: couponCode,
        },
        buildCartScopedHeaders(runtime, session),
      );

      return {
        ...mapCoCartCartState(payload),
        ...(session?.cartToken?.trim()
          ? { cartToken: session.cartToken.trim() }
          : {}),
      };
    },

    listShippingRates: async (
      session?: CoCartSessionContext,
    ): Promise<CoCartShippingQuoteView[]> => {
      const payload = await httpClient.get<CoCartRawCart["shipping_rates"]>(
        runtime.endpoints.shippingRates,
        undefined,
        buildCartScopedHeaders(runtime, session),
      );
      return mapCoCartCartState({ shipping_rates: payload }).shippingRates;
    },

    updateCartShippingDestination: async (
      input: CoCartShippingDestinationInput,
      session?: CoCartSessionContext,
    ): Promise<CoCartCartStateView> => {
      const parsedInput = cocartShippingDestinationInputSchema.parse(input);
      const updatedPayload = await httpClient.post<CoCartRawCart>(
        runtime.endpoints.updateCart,
        toCoCartShippingDestinationUpdatePayload(parsedInput),
        buildCartScopedHeaders(runtime, session),
      );

      return {
        ...mapCoCartCartState(updatedPayload),
        ...(session?.cartToken?.trim()
          ? { cartToken: session.cartToken.trim() }
          : {}),
      };
    },

    refreshCartShipping: async (
      session?: CoCartSessionContext,
    ): Promise<CoCartCartStateView> => {
      const payload = await httpClient.get<CoCartRawCart>(
        runtime.endpoints.cart,
        undefined,
        buildCartScopedHeaders(runtime, session),
      );

      return mapCoCartCartState(payload);
    },

    selectShippingRate: async (
      input: CoCartSelectShippingRateInput,
      session?: CoCartSessionContext,
    ): Promise<CoCartCartStateView> => {
      const parsedInput = cocartSelectShippingRateInputSchema.parse(input);
      const payload = await httpClient.post<CoCartRawCart>(
        runtime.endpoints.updateCart,
        {
          namespace: "select-shipping-rate",
          package_id: parsedInput.packageId,
          rate_id: parsedInput.rateId,
        },
        buildCartScopedHeaders(runtime, session),
      );

      return {
        ...mapCoCartCartState(payload),
        ...(session?.cartToken?.trim()
          ? { cartToken: session.cartToken.trim() }
          : {}),
      };
    },

    getCustomerProfile: async (customerId?: string | number) => {
      const payload = await httpClient.get<CoCartRawCustomer>(
        runtime.endpoints.customerProfile(customerId),
      );
      return mapCoCartCustomerToAccountCustomerView(payload);
    },

    updateCustomerProfile: async (
      customerId: string | number,
      input: CoCartCustomerProfileUpdateInput,
    ) => {
      const parsedInput = cocartCustomerProfileUpdateInputSchema.parse(input);
      const payload = await httpClient.put<CoCartRawCustomer>(
        runtime.endpoints.customerProfile(customerId),
        toCustomerUpdatePayload(parsedInput),
      );
      return mapCoCartCustomerToAccountCustomerView(payload);
    },

    updateCustomerAddress: async (
      customerId: string | number,
      input: CoCartCustomerAddressUpdateInput,
    ) => {
      const parsedInput = cocartCustomerAddressUpdateInputSchema.parse(input);
      const payload = await httpClient.put<CoCartRawCustomer>(
        runtime.endpoints.customerProfile(customerId),
        toAddressUpdatePayload(parsedInput),
      );
      return mapCoCartCustomerToAccountCustomerView(payload);
    },

    updateCustomerPassword: async (
      customerId: string | number,
      input: CoCartCustomerPasswordUpdateInput,
    ) => {
      const parsedInput = cocartCustomerPasswordUpdateInputSchema.parse(input);
      const payload = await httpClient.put<CoCartRawCustomer>(
        runtime.endpoints.customerProfile(customerId),
        {
          password: parsedInput.newPassword,
        },
      );
      return mapCoCartCustomerToAccountCustomerView(payload);
    },

    listAccountOrders: async (
      customerId?: string | number,
    ): Promise<AccountOrderSummaryView[]> => {
      const payload = await httpClient.get<CoCartRawOrderCollection>(
        runtime.endpoints.accountOrders,
        customerId
          ? {
              customer_id: customerId,
            }
          : undefined,
      );

      return unwrapOrderCollection(payload).map(mapCoCartOrderToAccountOrderSummaryView);
    },

    getOrderSummary: async (
      orderId: string | number,
    ): Promise<CoCartOrderSummaryView> => {
      const payload = await httpClient.get<CoCartRawOrder>(
        runtime.endpoints.orderSummary(orderId),
      );
      return mapCoCartOrderToOrderSummaryView(payload);
    },

    getAuthSession: async () => {
      const payload = await httpClient.get<CoCartRawCart>(runtime.endpoints.cart);
      return readCartBackedSession(payload);
    },

    getSessionState: async (): Promise<CoCartSessionStateView> => {
      const payload = await httpClient.get<CoCartRawCart>(runtime.endpoints.cart);
      return {
        capabilities: {
          catalog: "unverified",
          cart: "unverified",
          coupons: "unverified",
          shipping: "unverified",
          totals: "unverified",
          account: "unverified",
          auth: "unverified",
        },
        session: readCartBackedSession(payload),
      };
    },
  };
};
