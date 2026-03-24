import "server-only";
import crypto from "node:crypto";
import {
  authSessionViewSchema,
  type AccountOrderSummaryView,
  type AuthSessionView,
  type CatalogListingView,
  type CatalogProductDetailView,
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
  cocartSessionStateViewSchema,
  cocartLoginInputSchema,
  cocartUpdateCartItemInputSchema,
  type CoCartAddCartItemInput,
  type CoCartCustomerAddressUpdateInput,
  type CoCartCustomerPasswordUpdateInput,
  type CoCartCustomerProfileUpdateInput,
  type CoCartSelectShippingRateInput,
  type CoCartShippingDestinationInput,
  type CoCartAuthLoginResult,
  type CoCartApplyCouponInput,
  type CoCartCartStateView,
  type CoCartCatalogQuery,
  type CoCartLoginInput,
  type CoCartOrderSummaryView,
  type CoCartSessionContext,
  type CoCartSessionStateView,
  type CoCartShippingQuoteView,
  defaultCoCartCapabilities,
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
  CoCartRawLoginResponse,
  CoCartRawOrder,
  CoCartRawOrderCollection,
  CoCartRawProduct,
  CoCartRawProductCollection,
} from "./external/cocart.types";
import {
  mapCoCartCartState,
  mapCoCartCatalogListing,
  mapCoCartCustomerToAccountCustomerView,
  mapCoCartLoginResponseToAuthLoginResult,
  mapCoCartOrderToAccountOrderSummaryView,
  mapCoCartOrderToOrderSummaryView,
  mapCoCartProductToCatalogProductDetailView,
} from "./mappers/cocart.mapper";
import {
  readCoCartServerRuntimeConfig,
  resolveCoCartBaseUrl,
  resolveCoCartServerBaseUrl,
  type CoCartRuntimeConfig,
} from "./runtime/cocart-env";
import { defaultCoCartEndpointMap, type CoCartEndpointMap } from "./runtime/cocart.constants";
import { isCoCartCompatibilityFallbackError } from "./runtime/cocart-compatibility";
import {
  getCoCartJwtVerificationSecret as getCoCartJwtSecret,
  readCoCartPersistedAuthSessionFromCookieHeader,
} from "./runtime/cocart-request";

export type CreateCoCartAdapterConfig = {
  baseUrl?: string;
  storeApiBaseUrl?: string;
  timeoutMs?: number;
  endpoints?: Partial<CoCartEndpointMap>;
  fetchFn?: CoCartFetch;
};

export type CoCartAdapter = ReturnType<typeof createCoCartServerAdapter>;
type NextAwareRequestInit = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

const resolveRuntime = (config: CreateCoCartAdapterConfig = {}): CoCartRuntimeConfig & {
  fetchFn?: CoCartFetch;
} => {
  const defaults =
    config.baseUrl || config.timeoutMs || config.endpoints
      ? {
          baseUrl: config.baseUrl
            ? resolveCoCartBaseUrl(config.baseUrl)
            : resolveCoCartServerBaseUrl(),
          timeoutMs: config.timeoutMs,
          endpoints: {
            ...defaultCoCartEndpointMap,
            ...(config.endpoints ?? {}),
          },
          sessionHeaderName:
            process.env.COCART_SESSION_HEADER_NAME?.trim() || "CoCart-API-Cart-Key",
          cartTokenHeaderName:
            process.env.COCART_CART_TOKEN_HEADER_NAME?.trim() || undefined,
        }
      : readCoCartServerRuntimeConfig();

  return {
    ...defaults,
    fetchFn: config.fetchFn,
  };
};

const createFreshServerFetch = (fetchFn?: CoCartFetch): CoCartFetch => {
  const runtimeFetch = fetchFn ?? fetch;

  return (input, init) => {
    const requestInit = (init ?? {}) as NextAwareRequestInit;

    return runtimeFetch(input, {
      ...requestInit,
      cache: "no-store",
    });
  };
};

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

const readJson = async (response: Response) => {
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
};

type StoreApiAddress = {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  email?: string;
};

type StoreApiShippingRate = {
  rate_id?: string;
  name?: string;
  description?: string;
  price?: string | number | null;
  taxes?: string | number | null;
  instance_id?: string | number | null;
  method_id?: string;
  meta_data?: unknown;
  selected?: boolean;
};

type StoreApiShippingPackage = {
  package_id?: string | number | null;
  name?: string;
  destination?: StoreApiAddress;
  shipping_rates?: StoreApiShippingRate[];
};

type StoreApiCoupon = {
  code?: string;
  discount_type?: string;
  totals?: {
    total_discount?: string | number | null;
  };
};

type StoreApiCart = {
  items?: Array<{
    id?: string | number | null;
    quantity?: number | { value?: number | null } | null;
  }>;
  coupons?: StoreApiCoupon[];
  totals?: Record<string, unknown> | null;
  shipping_rates?: StoreApiShippingPackage[];
  billing_address?: StoreApiAddress;
  shipping_address?: StoreApiAddress;
  has_calculated_shipping?: boolean;
};

type StoreApiQuoteSession = {
  cart: StoreApiCart;
  cartToken: string;
  nonce?: string;
};

const deriveStoreApiBaseUrl = (
  cocartBaseUrl: string,
  configuredStoreApiBaseUrl?: string,
) => {
  if (configuredStoreApiBaseUrl?.trim()) {
    return resolveCoCartBaseUrl(configuredStoreApiBaseUrl.trim());
  }

  return cocartBaseUrl.replace(/\/wp-json\/cocart\/v2$/i, "/wp-json/wc/store/v1");
};

const buildStoreApiForwardHeaders = (
  requestHeaders?: CoCartRequestHeaders,
): CoCartRequestHeaders | undefined => {
  if (!requestHeaders) {
    return undefined;
  }

  const {
    Authorization: _authorization,
    Cookie: _cookie,
    "CoCart-API-Cart-Key": _cartKey,
    "Cart-Token": _cartToken,
    Nonce: _nonce,
    Accept: _accept,
    "Content-Type": _contentType,
    ...rest
  } = requestHeaders;

  return Object.keys(rest).length > 0 ? rest : undefined;
};

const buildStoreApiRequestHeaders = ({
  requestHeaders,
  cartToken,
  nonce,
}: {
  requestHeaders?: CoCartRequestHeaders;
  cartToken?: string;
  nonce?: string;
}): CoCartRequestHeaders => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  ...(buildStoreApiForwardHeaders(requestHeaders) ?? {}),
  ...(cartToken?.trim() ? { "Cart-Token": cartToken.trim() } : {}),
  ...(nonce?.trim() ? { Nonce: nonce.trim() } : {}),
});

const toStoreApiPrefixedAddress = (
  prefix: "billing" | "shipping",
  address?: StoreApiAddress | null,
) => ({
  [`${prefix}_first_name`]: address?.first_name || "",
  [`${prefix}_last_name`]: address?.last_name || "",
  [`${prefix}_company`]: address?.company || "",
  [`${prefix}_address_1`]: address?.address_1 || "",
  [`${prefix}_address_2`]: address?.address_2 || "",
  [`${prefix}_city`]: address?.city || "",
  [`${prefix}_state`]: address?.state || "",
  [`${prefix}_postcode`]: address?.postcode || "",
  [`${prefix}_country`]: address?.country || "",
  ...(prefix === "billing"
    ? {
        billing_phone: address?.phone || "",
        billing_email: address?.email || "",
      }
    : {
        shipping_phone: address?.phone || "",
      }),
});

const formatStoreApiDestination = (destination?: StoreApiAddress) =>
  [destination?.city, destination?.state].filter(Boolean).join(" / ") || undefined;

const normalizeStoreApiCartToCoCartRawCart = (
  baseCart: CoCartRawCart,
  storeCart: StoreApiCart,
): CoCartRawCart => {
  const storeTotals = storeCart.totals ?? {};
  const shippingPackages = (storeCart.shipping_rates ?? []).reduce<
    Record<string, Record<string, unknown>>
  >((packages, shippingPackage, index) => {
    const packageId =
      shippingPackage.package_id === undefined ||
      shippingPackage.package_id === null ||
      shippingPackage.package_id === ""
        ? index
        : shippingPackage.package_id;
    const normalizedRates = (shippingPackage.shipping_rates ?? []).reduce<
      Record<string, Record<string, unknown>>
    >((rates, rate) => {
      const rateId = rate.rate_id?.trim();

      if (!rateId) {
        return rates;
      }

      rates[rateId] = {
        key: rateId,
        rate_id: rateId,
        method_id: rate.method_id,
        instance_id: rate.instance_id,
        label: rate.name,
        description: rate.description,
        cost: rate.price,
        taxes: rate.taxes,
        selected: rate.selected,
        meta_data: rate.meta_data,
      };

      return rates;
    }, {});
    const chosenRate = (shippingPackage.shipping_rates ?? []).find((rate) => rate.selected);

    packages[String(packageId)] = {
      index: packageId,
      package_id: packageId,
      package_name: shippingPackage.name,
      formatted_destination: formatStoreApiDestination(shippingPackage.destination),
      chosen_method: chosenRate?.rate_id,
      rates: normalizedRates,
    };

    return packages;
  }, {});

  return {
    ...baseCart,
    currency:
      baseCart.currency ??
      ({
        currency_code:
          typeof storeTotals.currency_code === "string"
            ? storeTotals.currency_code
            : undefined,
        currency_minor_unit:
          typeof storeTotals.currency_minor_unit === "number" ||
          typeof storeTotals.currency_minor_unit === "string"
            ? storeTotals.currency_minor_unit
            : undefined,
      } as CoCartRawCart["currency"]),
    coupons: (storeCart.coupons ?? []).map((coupon) => ({
      coupon: coupon.code,
      code: coupon.code,
      discount_type: coupon.discount_type,
      totals: {
        total_discount: coupon.totals?.total_discount ?? 0,
      },
    })),
    totals: {
      ...(baseCart.totals ?? {}),
      ...(storeTotals as CoCartRawCart["totals"]),
      subtotal:
        storeTotals.total_items ??
        storeTotals.subtotal ??
        baseCart.totals?.subtotal ??
        baseCart.totals?.total_subtotal,
      total_subtotal:
        storeTotals.total_items ??
        storeTotals.subtotal ??
        baseCart.totals?.total_subtotal ??
        baseCart.totals?.subtotal,
      total:
        storeTotals.total_price ??
        storeTotals.total ??
        baseCart.totals?.total,
      discount_total:
        storeTotals.total_discount ??
        storeTotals.discount_total ??
        baseCart.totals?.discount_total ??
        baseCart.totals?.total_discount,
      total_discount:
        storeTotals.total_discount ??
        storeTotals.discount_total ??
        baseCart.totals?.total_discount ??
        baseCart.totals?.discount_total,
      shipping_total:
        storeTotals.total_shipping ??
        storeTotals.shipping_total ??
        baseCart.totals?.shipping_total ??
        baseCart.totals?.total_shipping,
      total_shipping:
        storeTotals.total_shipping ??
        storeTotals.shipping_total ??
        baseCart.totals?.total_shipping ??
        baseCart.totals?.shipping_total,
    } as CoCartRawCart["totals"],
    shipping_rates: {
      has_calculated_shipping: storeCart.has_calculated_shipping ?? false,
      total_packages: Object.keys(shippingPackages).length,
      packages: shippingPackages,
    } as CoCartRawCart["shipping_rates"],
    customer: {
      ...(baseCart.customer ?? {}),
      billing_address: toStoreApiPrefixedAddress("billing", storeCart.billing_address),
      shipping_address: toStoreApiPrefixedAddress("shipping", storeCart.shipping_address),
    } as CoCartRawCart["customer"],
  };
};

const readExpectedCartItems = (cart: CoCartCartStateView) =>
  new Map(
    cart.items.map((item) => [
      String(item.variationId ?? item.productId),
      Math.max(0, item.quantity ?? 0),
    ]),
  );

const readQuotedCartItems = (cart: StoreApiCart) =>
  new Map(
    (cart.items ?? []).map((item) => [
      String(item.id ?? ""),
      typeof item.quantity === "object"
        ? Math.max(0, Number(item.quantity?.value ?? 0))
        : Math.max(0, Number(item.quantity ?? 0)),
    ]),
  );

const areQuotedCartItemsSynced = (
  cart: CoCartCartStateView,
  quoteCart: StoreApiCart,
) => {
  const expectedItems = readExpectedCartItems(cart);
  const quotedItems = readQuotedCartItems(quoteCart);

  if (expectedItems.size !== quotedItems.size) {
    return false;
  }

  let isSynced = true;

  expectedItems.forEach((quantity, itemId) => {
    if (quotedItems.get(itemId) !== quantity) {
      isSynced = false;
    }
  });

  return isSynced;
};

const buildStoreApiCustomerPayload = ({
  input,
  quoteCart,
}: {
  input: CoCartShippingDestinationInput;
  quoteCart?: StoreApiCart;
}) => ({
  billing_address: {
    first_name: input.firstName ?? quoteCart?.billing_address?.first_name ?? "",
    last_name: input.lastName ?? quoteCart?.billing_address?.last_name ?? "",
    company: input.company ?? quoteCart?.billing_address?.company ?? "",
    address_1: input.addressLine1 ?? quoteCart?.billing_address?.address_1 ?? "",
    address_2: input.addressLine2 ?? quoteCart?.billing_address?.address_2 ?? "",
    city: input.city ?? quoteCart?.billing_address?.city ?? "",
    state: input.state ?? quoteCart?.billing_address?.state ?? "",
    postcode: input.postcode ?? quoteCart?.billing_address?.postcode ?? "",
    country: input.country ?? quoteCart?.billing_address?.country ?? "BR",
    phone: input.phone ?? quoteCart?.billing_address?.phone ?? "",
    email: input.email ?? quoteCart?.billing_address?.email ?? "",
  },
  shipping_address: {
    first_name: input.firstName ?? quoteCart?.shipping_address?.first_name ?? "",
    last_name: input.lastName ?? quoteCart?.shipping_address?.last_name ?? "",
    company: input.company ?? quoteCart?.shipping_address?.company ?? "",
    address_1: input.addressLine1 ?? quoteCart?.shipping_address?.address_1 ?? "",
    address_2: input.addressLine2 ?? quoteCart?.shipping_address?.address_2 ?? "",
    city: input.city ?? quoteCart?.shipping_address?.city ?? "",
    state: input.state ?? quoteCart?.shipping_address?.state ?? "",
    postcode: input.postcode ?? quoteCart?.shipping_address?.postcode ?? "",
    country: input.country ?? quoteCart?.shipping_address?.country ?? "BR",
    phone: input.phone ?? quoteCart?.shipping_address?.phone ?? "",
  },
});

const buildCoCartShippingDestinationUpdatePayload = (
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

const buildAddCartItemPayload = (input: CoCartAddCartItemInput) => ({
  id: String(input.variationId ?? input.productId),
  quantity: String(input.quantity),
});

const buildBasicAuthorizationHeader = (input: CoCartLoginInput) =>
  `Basic ${Buffer.from(`${input.username}:${input.password}`, "utf8").toString("base64")}`;

type DecodedJwtUser = {
  id?: string;
  username?: string;
};

const decodeJwtUser = (
  token?: string | null,
): DecodedJwtUser | null => {
  if (!token) {
    return null;
  }

  const [, rawPayload] = token.split(".");

  if (!rawPayload) {
    return null;
  }

  try {
    const decodedPayload = JSON.parse(
      Buffer.from(rawPayload, "base64url").toString("utf8"),
    ) as {
      data?: {
        user?: {
          id?: string | number;
          username?: string;
        };
      };
    };

    const rawUser = decodedPayload.data?.user;

    if (!rawUser) {
      return null;
    }

    return {
      id:
        rawUser.id === undefined || rawUser.id === null || rawUser.id === ""
          ? undefined
          : String(rawUser.id),
      username: rawUser.username?.trim() || undefined,
    };
  } catch {
    return null;
  }
};

const verifyJwtUser = (
  token?: string | null,
): DecodedJwtUser | null => {
  if (!token) {
    return null;
  }

  const signingSecret = getCoCartJwtSecret();

  if (!signingSecret) {
    return null;
  }

  const [rawHeader, rawPayload, rawSignature] = token.split(".");

  if (!rawHeader || !rawPayload || !rawSignature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", signingSecret)
    .update(`${rawHeader}.${rawPayload}`)
    .digest("base64url");

  if (
    rawSignature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(rawSignature, "utf8"),
      Buffer.from(expectedSignature, "utf8"),
    )
  ) {
    return null;
  }

  try {
    const decodedPayload = JSON.parse(
      Buffer.from(rawPayload, "base64url").toString("utf8"),
    ) as {
      exp?: number;
      nbf?: number;
    };
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (
      (typeof decodedPayload.nbf === "number" && decodedPayload.nbf > nowInSeconds) ||
      (typeof decodedPayload.exp === "number" && decodedPayload.exp <= nowInSeconds)
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return decodeJwtUser(token);
};

const buildAuthenticatedFallbackUser = (
  tokenUser: DecodedJwtUser,
  identity?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  },
) =>
  authSessionViewSchema.parse({
    isAuthenticated: true,
    user: {
      id: tokenUser.id || "0",
      email: identity?.email,
      username: tokenUser.username,
      displayName:
        [identity?.firstName, identity?.lastName].filter(Boolean).join(" ") ||
        tokenUser.username ||
        identity?.email ||
        "Cliente",
      firstName: identity?.firstName,
      lastName: identity?.lastName,
      avatar: null,
      roleLabels: [],
    },
  });

const readCartBackedIdentity = (cart: CoCartRawCart) => {
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

  return {
    email,
    firstName,
    lastName,
    cartKey,
    isAuthenticated:
      !isAnonymousCart && Boolean(email || firstName || lastName || cartKey),
  };
};

const buildCartBackedSession = async ({
  httpClient,
  requestHeaders,
}: {
  httpClient: ReturnType<typeof createCoCartHttpClient>;
  requestHeaders?: CoCartRequestHeaders;
}): Promise<AuthSessionView> => {
  const authorizationHeader = requestHeaders?.Authorization?.trim();
  const persistedSessionUser = readCoCartPersistedAuthSessionFromCookieHeader(
    requestHeaders?.Cookie,
  );

  const buildPersistedSession = () =>
    persistedSessionUser
      ? authSessionViewSchema.parse({
          isAuthenticated: true,
          user: persistedSessionUser,
        })
      : authSessionViewSchema.parse({
          isAuthenticated: false,
          user: null,
        });

  if (!authorizationHeader) {
    return buildPersistedSession();
  }

  const rawToken = authorizationHeader.replace(/^Bearer\s+/i, "");
  const verifiedTokenUser = verifyJwtUser(rawToken);
  const decodedTokenUser = decodeJwtUser(rawToken);

  try {
    const cart = await httpClient.get<CoCartRawCart>(
      httpClient.endpoints.cart,
      undefined,
      requestHeaders,
    );

    const identity = readCartBackedIdentity(cart);
    const tokenUser = verifiedTokenUser ?? decodedTokenUser;

    if (!identity.isAuthenticated) {
      if (persistedSessionUser) {
        return buildPersistedSession();
      }

      if (!verifiedTokenUser?.id) {
        return authSessionViewSchema.parse({
          isAuthenticated: false,
          user: null,
        });
      }

      return buildAuthenticatedFallbackUser(verifiedTokenUser, identity);
    }

    return buildAuthenticatedFallbackUser(
      {
        id: tokenUser?.id,
        username: tokenUser?.username,
      },
      identity,
    );
  } catch (error) {
    const unauthorizedStatus =
      error instanceof Error &&
      typeof (error as { response?: { status?: number } }).response?.status === "number"
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;

    if (unauthorizedStatus === 401 || unauthorizedStatus === 403) {
      if (persistedSessionUser) {
        return buildPersistedSession();
      }

      if (!verifiedTokenUser?.id) {
        return authSessionViewSchema.parse({
          isAuthenticated: false,
          user: null,
        });
      }

      return buildAuthenticatedFallbackUser(verifiedTokenUser);
    }

    throw error;
  }
};

const withResolvedCartToken = (
  cart: CoCartCartStateView,
  cartToken?: string,
): CoCartCartStateView =>
  ({
    ...cart,
    cartToken: cartToken?.trim() || undefined,
  });

const invalidateResolvedCartToken = (
  cart: CoCartCartStateView,
): CoCartCartStateView => ({
  ...cart,
  cartToken: undefined,
});

export const createCoCartServerAdapter = (config: CreateCoCartAdapterConfig = {}) => {
  const runtime = resolveRuntime(config);
  const freshFetch = createFreshServerFetch(runtime.fetchFn);
  const storeApiBaseUrl = deriveStoreApiBaseUrl(runtime.baseUrl, config.storeApiBaseUrl);
  const httpClient = createCoCartHttpClient({
    baseUrl: runtime.baseUrl,
    timeoutMs: runtime.timeoutMs,
    endpoints: runtime.endpoints,
    fetchFn: freshFetch,
  });

  const requestStoreApiCart = async ({
    path,
    method = "GET",
    body,
    cartToken,
    nonce,
    requestHeaders,
  }: {
    path: string;
    method?: "GET" | "POST";
    body?: unknown;
    cartToken?: string;
    nonce?: string;
    requestHeaders?: CoCartRequestHeaders;
  }): Promise<StoreApiQuoteSession> => {
    const response = await freshFetch(`${storeApiBaseUrl}${path}`, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: buildStoreApiRequestHeaders({
        requestHeaders,
        cartToken,
        nonce,
      }),
    });
    const payload = (await readJson(response)) as StoreApiCart | string | null;

    if (!response.ok || !payload || typeof payload !== "object") {
      const message =
        payload && typeof payload === "object" && "message" in payload
          ? String((payload as { message?: unknown }).message ?? "")
          : `Store API request failed with status ${response.status}`;
      const error = new Error(
        message || `Store API request failed with status ${response.status}`,
      ) as Error & {
        response?: {
          status: number;
          data: unknown;
        };
      };

      error.response = {
        status: response.status,
        data: payload,
      };

      throw error;
    }

    const resolvedCartToken =
      response.headers.get("cart-token")?.trim() || cartToken?.trim();

    if (!resolvedCartToken) {
      throw new Error("Store API did not return a cart token.");
    }

    return {
      cart: payload,
      cartToken: resolvedCartToken,
      nonce: response.headers.get("nonce")?.trim() || nonce?.trim() || undefined,
    };
  };

  const mergeQuoteIntoCart = ({
    baseCartPayload,
    quoteSession,
  }: {
    baseCartPayload: CoCartRawCart;
    quoteSession: StoreApiQuoteSession;
  }) =>
    withResolvedCartToken(
      mapCoCartCartState(
        normalizeStoreApiCartToCoCartRawCart(baseCartPayload, quoteSession.cart),
      ),
      quoteSession.cartToken,
    );

  const ensureQuotedCart = async ({
    baseCartPayload,
    session,
    requestHeaders,
  }: {
    baseCartPayload: CoCartRawCart;
    session?: CoCartSessionContext;
    requestHeaders?: CoCartRequestHeaders;
  }): Promise<StoreApiQuoteSession> => {
    const baseCart = mapCoCartCartState(baseCartPayload);

    if (!baseCart.items.length) {
      throw new Error("Carrinho vazio. Adicione itens antes de continuar.");
    }

    const existingCartToken = session?.cartToken?.trim();

    if (existingCartToken) {
      try {
        const existingQuote = await requestStoreApiCart({
          path: "/cart",
          cartToken: existingCartToken,
          requestHeaders,
        });

        if (areQuotedCartItemsSynced(baseCart, existingQuote.cart)) {
          return existingQuote;
        }
      } catch {
        // Rebuild the quote session from the authoritative CoCart cart below.
      }
    }

    let quoteSession = await requestStoreApiCart({
      path: "/cart",
      requestHeaders,
    });

    for (const item of baseCart.items) {
      quoteSession = await requestStoreApiCart({
        path: "/cart/add-item",
        method: "POST",
        body: {
          id: Number(item.variationId ?? item.productId),
          quantity: item.quantity,
        },
        cartToken: quoteSession.cartToken,
        nonce: quoteSession.nonce,
        requestHeaders,
      });
    }

    return quoteSession;
  };

  return {
    login: async (
      input: CoCartLoginInput,
      requestHeaders?: CoCartRequestHeaders,
    ): Promise<CoCartAuthLoginResult> => {
      const parsedInput = cocartLoginInputSchema.parse(input);
      const payload = await httpClient.post<CoCartRawLoginResponse>(
        runtime.endpoints.authLogin,
        parsedInput,
        {
          ...(requestHeaders ?? {}),
          Authorization: buildBasicAuthorizationHeader(parsedInput),
        },
      );

      return mapCoCartLoginResponseToAuthLoginResult(payload);
    },

    logout: async (requestHeaders?: CoCartRequestHeaders) => {
      await httpClient.post<unknown>(
        runtime.endpoints.authLogout,
        undefined,
        requestHeaders,
      );
    },

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
      const baseCart = mapCoCartCartState(payload);

      if (!session?.cartToken?.trim()) {
        return baseCart;
      }

      try {
        const quoteSession = await requestStoreApiCart({
          path: "/cart",
          cartToken: session.cartToken,
          requestHeaders,
        });

        if (!areQuotedCartItemsSynced(baseCart, quoteSession.cart)) {
          return baseCart;
        }

        return mergeQuoteIntoCart({
          baseCartPayload: payload,
          quoteSession,
        });
      } catch {
        return baseCart;
      }
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

      return invalidateResolvedCartToken(mapCoCartCartState(payload));
    },

    addCartItem: async (
      input: CoCartAddCartItemInput,
      session?: CoCartSessionContext,
      requestHeaders?: CoCartRequestHeaders,
    ): Promise<CoCartCartStateView> => {
      const parsedInput = cocartAddCartItemInputSchema.parse(input);
      const payload = await httpClient.post<CoCartRawCart>(
        runtime.endpoints.addCartItem,
        buildAddCartItemPayload(parsedInput),
        buildCartScopedHeaders(runtime, session, requestHeaders),
      );

      return invalidateResolvedCartToken(mapCoCartCartState(payload));
    },

    updateCartItem: async (
      input: { itemKey: string; quantity: number },
      session?: CoCartSessionContext,
      requestHeaders?: CoCartRequestHeaders,
    ): Promise<CoCartCartStateView> => {
      const parsedInput = cocartUpdateCartItemInputSchema.parse(input);
      const payload =
        parsedInput.quantity <= 0
          ? await httpClient.delete<CoCartRawCart>(
              runtime.endpoints.removeCartItem(parsedInput.itemKey),
              buildCartScopedHeaders(runtime, session, requestHeaders),
            )
          : await httpClient.post<CoCartRawCart>(
              runtime.endpoints.updateCartItem(parsedInput.itemKey),
              {
                quantity: String(parsedInput.quantity),
              },
              buildCartScopedHeaders(runtime, session, requestHeaders),
            );

      return invalidateResolvedCartToken(mapCoCartCartState(payload));
    },

    removeCartItem: async (
      itemKey: string,
      session?: CoCartSessionContext,
      requestHeaders?: CoCartRequestHeaders,
    ): Promise<CoCartCartStateView> => {
      const payload = await httpClient.delete<CoCartRawCart>(
        runtime.endpoints.removeCartItem(itemKey),
        buildCartScopedHeaders(runtime, session, requestHeaders),
      );

      return invalidateResolvedCartToken(mapCoCartCartState(payload));
    },

    applyCoupon: async (
      input: CoCartApplyCouponInput,
      session?: CoCartSessionContext,
      requestHeaders?: CoCartRequestHeaders,
    ): Promise<CoCartCartStateView> => {
      const parsedInput = cocartApplyCouponInputSchema.parse(input);
      const baseCartPayload = await httpClient.get<CoCartRawCart>(
        runtime.endpoints.cart,
        undefined,
        buildCartScopedHeaders(runtime, session, requestHeaders),
      );
      const quoteSession = await ensureQuotedCart({
        baseCartPayload,
        session,
        requestHeaders,
      });
      const updatedQuote = await requestStoreApiCart({
        path: "/cart/apply-coupon",
        method: "POST",
        body: {
          code: parsedInput.code,
        },
        cartToken: quoteSession.cartToken,
        nonce: quoteSession.nonce,
        requestHeaders,
      });

      return mergeQuoteIntoCart({
        baseCartPayload,
        quoteSession: updatedQuote,
      });
    },

    removeCoupon: async (
      couponCode: string,
      session?: CoCartSessionContext,
      requestHeaders?: CoCartRequestHeaders,
    ): Promise<CoCartCartStateView> => {
      const baseCartPayload = await httpClient.get<CoCartRawCart>(
        runtime.endpoints.cart,
        undefined,
        buildCartScopedHeaders(runtime, session, requestHeaders),
      );
      const quoteSession = await ensureQuotedCart({
        baseCartPayload,
        session,
        requestHeaders,
      });
      const updatedQuote = await requestStoreApiCart({
        path: "/cart/remove-coupon",
        method: "POST",
        body: {
          code: couponCode,
        },
        cartToken: quoteSession.cartToken,
        nonce: quoteSession.nonce,
        requestHeaders,
      });

      return mergeQuoteIntoCart({
        baseCartPayload,
        quoteSession: updatedQuote,
      });
    },

    listShippingRates: async (
      session?: CoCartSessionContext,
      requestHeaders?: CoCartRequestHeaders,
    ): Promise<CoCartShippingQuoteView[]> => {
      if (!session?.cartToken?.trim()) {
        return [];
      }

      const quoteSession = await requestStoreApiCart({
        path: "/cart",
        cartToken: session.cartToken,
        requestHeaders,
      });
      const quoteCart = mapCoCartCartState(
        normalizeStoreApiCartToCoCartRawCart(
          {
            items: {},
          } as CoCartRawCart,
          quoteSession.cart,
        ),
      );

      return quoteCart.shippingRates;
    },

    updateCartShippingDestination: async (
      input: CoCartShippingDestinationInput,
      session?: CoCartSessionContext,
      requestHeaders?: CoCartRequestHeaders,
    ): Promise<CoCartCartStateView> => {
      const parsedInput = cocartShippingDestinationInputSchema.parse(input);
      const baseCartPayload = await httpClient.get<CoCartRawCart>(
        runtime.endpoints.cart,
        undefined,
        buildCartScopedHeaders(runtime, session, requestHeaders),
      );
      const quoteSession = await ensureQuotedCart({
        baseCartPayload,
        session,
        requestHeaders,
      });
      const updatedQuote = await requestStoreApiCart({
        path: "/cart/update-customer",
        method: "POST",
        body: buildStoreApiCustomerPayload({
          input: parsedInput,
          quoteCart: quoteSession.cart,
        }),
        cartToken: quoteSession.cartToken,
        nonce: quoteSession.nonce,
        requestHeaders,
      });

      return mergeQuoteIntoCart({
        baseCartPayload,
        quoteSession: updatedQuote,
      });
    },

    refreshCartShipping: async (
      session?: CoCartSessionContext,
      requestHeaders?: CoCartRequestHeaders,
    ): Promise<CoCartCartStateView> => {
      const baseCartPayload = await httpClient.get<CoCartRawCart>(
        runtime.endpoints.cart,
        undefined,
        buildCartScopedHeaders(runtime, session, requestHeaders),
      );

      if (!session?.cartToken?.trim()) {
        return mapCoCartCartState(baseCartPayload);
      }

      const quoteSession = await requestStoreApiCart({
        path: "/cart",
        cartToken: session.cartToken,
        requestHeaders,
      });

      return mergeQuoteIntoCart({
        baseCartPayload,
        quoteSession,
      });
    },

    selectShippingRate: async (
      input: CoCartSelectShippingRateInput,
      session?: CoCartSessionContext,
      requestHeaders?: CoCartRequestHeaders,
    ): Promise<CoCartCartStateView> => {
      const parsedInput = cocartSelectShippingRateInputSchema.parse(input);
      const baseCartPayload = await httpClient.get<CoCartRawCart>(
        runtime.endpoints.cart,
        undefined,
        buildCartScopedHeaders(runtime, session, requestHeaders),
      );
      const quoteSession = await ensureQuotedCart({
        baseCartPayload,
        session,
        requestHeaders,
      });
      const updatedQuote = await requestStoreApiCart({
        path: "/cart/select-shipping-rate",
        method: "POST",
        body: {
          package_id: parsedInput.packageId,
          rate_id: parsedInput.rateId,
        },
        cartToken: quoteSession.cartToken,
        nonce: quoteSession.nonce,
        requestHeaders,
      });

      return mergeQuoteIntoCart({
        baseCartPayload,
        quoteSession: updatedQuote,
      });
    },

    getCustomerProfile: async (
      customerId?: string | number,
      requestHeaders?: CoCartRequestHeaders,
    ) => {
      const payload = await httpClient.get<CoCartRawCustomer>(
        runtime.endpoints.customerProfile(customerId),
        undefined,
        requestHeaders,
      );

      return mapCoCartCustomerToAccountCustomerView(payload);
    },

    updateCustomerProfile: async (
      customerId: string | number,
      input: CoCartCustomerProfileUpdateInput,
      requestHeaders?: CoCartRequestHeaders,
    ) => {
      const parsedInput = cocartCustomerProfileUpdateInputSchema.parse(input);
      const payload = await httpClient.put<CoCartRawCustomer>(
        runtime.endpoints.customerProfile(customerId),
        toCustomerUpdatePayload(parsedInput),
        requestHeaders,
      );

      return mapCoCartCustomerToAccountCustomerView(payload);
    },

    updateCustomerAddress: async (
      customerId: string | number,
      input: CoCartCustomerAddressUpdateInput,
      requestHeaders?: CoCartRequestHeaders,
    ) => {
      const parsedInput = cocartCustomerAddressUpdateInputSchema.parse(input);
      const payload = await httpClient.put<CoCartRawCustomer>(
        runtime.endpoints.customerProfile(customerId),
        toAddressUpdatePayload(parsedInput),
        requestHeaders,
      );

      return mapCoCartCustomerToAccountCustomerView(payload);
    },

    updateCustomerPassword: async (
      customerId: string | number,
      input: CoCartCustomerPasswordUpdateInput,
      requestHeaders?: CoCartRequestHeaders,
    ) => {
      const parsedInput = cocartCustomerPasswordUpdateInputSchema.parse(input);
      const payload = await httpClient.put<CoCartRawCustomer>(
        runtime.endpoints.customerProfile(customerId),
        {
          password: parsedInput.newPassword,
        },
        requestHeaders,
      );

      return mapCoCartCustomerToAccountCustomerView(payload);
    },

    listAccountOrders: async (
      customerId?: string | number,
      requestHeaders?: CoCartRequestHeaders,
    ): Promise<AccountOrderSummaryView[]> => {
      const payload = await httpClient.get<CoCartRawOrderCollection>(
        runtime.endpoints.accountOrders,
        customerId
          ? {
              customer_id: customerId,
            }
          : undefined,
        requestHeaders,
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

    getAuthSession: async (requestHeaders?: CoCartRequestHeaders) => {
      return buildCartBackedSession({
        httpClient,
        requestHeaders,
      });
    },

    getSessionState: async (
      requestHeaders?: CoCartRequestHeaders,
    ): Promise<CoCartSessionStateView> => {
      return cocartSessionStateViewSchema.parse({
        capabilities: defaultCoCartCapabilities,
        session: await buildCartBackedSession({
          httpClient,
          requestHeaders,
        }),
      });
    },
  };
};

let cachedAdapter: CoCartAdapter | null = null;

export const getCoCartServerAdapter = (): CoCartAdapter => {
  if (!cachedAdapter) {
    cachedAdapter = createCoCartServerAdapter();
  }

  return cachedAdapter;
};

export const cocartServerAdapter = new Proxy({} as CoCartAdapter, {
  get(_target, property, receiver) {
    return Reflect.get(getCoCartServerAdapter(), property, receiver);
  },
});
