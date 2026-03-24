import "server-only";

import crypto from "node:crypto";
import { serverEnv } from "@/app/lib/env.server";
import { wordpressWooRestAdapter } from "@site/integrations/wordpress/server";
import type { WooOrder } from "../../wordpress/src/external/woocommerce.types";
import type {
  MercadoPagoCardPaymentInput,
  MercadoPagoHeadlessConfig,
  MercadoPagoOrderPaymentState,
  MercadoPagoProcessPaymentResult,
  MercadoPagoProcessOutcome,
} from "./mercado-pago-headless.types";

const BRIDGE_BASE_PATH = "/wp-json/pharmacore/v1/mercado-pago";
const DIRECT_SDK_URL = "https://sdk.mercadopago.com/js/v2";
const MERCADO_PAGO_API_BASE_URL = "https://api.mercadopago.com";
const PIX_GATEWAY_ID = "woo-mercado-pago-pix";
const CARD_GATEWAY_ID = "woo-mercado-pago-custom";
const SUPPORTED_GATEWAY_IDS = new Set([PIX_GATEWAY_ID, CARD_GATEWAY_ID]);
const DEFAULT_STORE_ID_PREFIX = "WC-";
const DEFAULT_SITE_ID = "MLB";
const DEFAULT_LOCALE = "pt-BR";
const PAYMENT_IDS_META_KEY = "_Mercado_Pago_Payment_IDs";
const PAYMENT_META_PREFIX = "Mercado Pago - Payment ";
const PAYMENT_META_DETAILS_PREFIX = "Mercado Pago - ";
const PAYMENT_TYPE_META_SUFFIX = " - payment_type";
const INSTALLMENTS_META_SUFFIX = " - installments";
const TRANSACTION_AMOUNT_META_SUFFIX = " - transaction_amount";
const TOTAL_PAID_AMOUNT_META_SUFFIX = " - total_paid_amount";
const CARD_LAST_FOUR_META_SUFFIX = " - card_last_four_digits";
const PIX_QR_CODE_META_KEY = "mp_pix_qr_code";
const PIX_QR_BASE64_META_KEY = "mp_pix_qr_base64";
const PIX_EXPIRATION_META_KEY = "checkout_pix_date_expiration";
const CHECKOUT_TYPE_META_KEY = "checkout_type";
const IS_PRODUCTION_MODE_META_KEY = "is_production_mode";
const HEADLESS_THREE_DS_URL_META = "_pharmacore_headless_mp_3ds_url";
const HEADLESS_THREE_DS_CREQ_META = "_pharmacore_headless_mp_3ds_creq";
const HEADLESS_THREE_DS_PAYMENT_ID_META = "_pharmacore_headless_mp_3ds_payment_id";
const HEADLESS_THREE_DS_LAST_FOUR_META = "_pharmacore_headless_mp_3ds_last_four";

type MercadoPagoBridgeErrorPayload = {
  message: string;
  code?: string;
};

type DirectMercadoPagoConfig = MercadoPagoHeadlessConfig & {
  accessToken: string;
};

type MercadoPagoPaymentResponse = {
  id?: number | string | null;
  status?: string | null;
  status_detail?: string | null;
  payment_method_id?: string | null;
  payment_type_id?: string | null;
  installments?: number | string | null;
  transaction_amount?: number | string | null;
  coupon_amount?: number | string | null;
  transaction_amount_refunded?: number | string | null;
  date_created?: string | null;
  date_of_expiration?: string | null;
  card?: {
    last_four_digits?: string | null;
  } | null;
  transaction_details?: {
    total_paid_amount?: number | string | null;
    installment_amount?: number | string | null;
  } | null;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string | null;
      qr_code_base64?: string | null;
    } | null;
  } | null;
  three_ds_info?: {
    external_resource_url?: string | null;
    creq?: string | null;
  } | null;
};

class MercadoPagoBridgeError extends Error {
  status: number;

  code?: string;

  constructor(payload: MercadoPagoBridgeErrorPayload, status: number) {
    super(payload.message);
    this.name = "MercadoPagoBridgeError";
    this.status = status;
    this.code = payload.code;
  }
}

let directConfigPromise: Promise<DirectMercadoPagoConfig> | null = null;

const buildBridgeUrl = (path: string, searchParams?: URLSearchParams) => {
  const url = new URL(
    `${serverEnv.wordpress.url.replace(/\/+$/, "")}${BRIDGE_BASE_PATH}${path}`,
  );

  if (searchParams) {
    url.search = searchParams.toString();
  }

  return url;
};

const normalizeOfficialGatewayId = (value: string | null | undefined) => {
  const normalized = String(value || "").trim();
  return SUPPORTED_GATEWAY_IDS.has(normalized) ? normalized : null;
};

const readBridgeErrorPayload = async (
  response: Response,
): Promise<MercadoPagoBridgeErrorPayload> => {
  try {
    const payload = (await response.json()) as {
      error?: string;
      message?: string;
      code?: string;
    };

    return {
      message:
        payload.error ||
        payload.message ||
        "Erro ao comunicar com o Mercado Pago.",
      code: payload.code,
    };
  } catch {
    return {
      message: "Erro ao comunicar com o Mercado Pago.",
    };
  }
};

const requestBridge = async <TPayload>(
  path: string,
  init?: RequestInit,
): Promise<TPayload> => {
  const response = await fetch(buildBridgeUrl(path), {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new MercadoPagoBridgeError(
      await readBridgeErrorPayload(response),
      response.status,
    );
  }

  return (await response.json()) as TPayload;
};

const isBridgeUnavailableError = (error: unknown) =>
  error instanceof MercadoPagoBridgeError &&
  error.status === 404 &&
  error.code === "rest_no_route";

const ensureDirectFallbackCredentials = async (): Promise<DirectMercadoPagoConfig> => {
  if (!directConfigPromise) {
    directConfigPromise = (async () => {
      const accessToken = serverEnv.payments.mercadoPago.accessToken?.trim() || "";
      const publicKey = serverEnv.payments.mercadoPago.publicKey?.trim() || "";

      if (!accessToken || !publicKey) {
        throw new Error(
          "A bridge headless do Mercado Pago nao esta publicada no WordPress online e o storefront nao recebeu MERCADO_PAGO_ACCESS_TOKEN e NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY para fallback.",
        );
      }

      const listPaymentGatewaysRaw =
        typeof wordpressWooRestAdapter.listPaymentGatewaysRaw === "function"
          ? wordpressWooRestAdapter.listPaymentGatewaysRaw.bind(wordpressWooRestAdapter)
          : null;
      const gateways = listPaymentGatewaysRaw
        ? ((await Promise.resolve(listPaymentGatewaysRaw()).catch(() => [])) ?? [])
        : [];
      const enabledGatewayIds = gateways
        .filter((gateway) => {
          const id = normalizeOfficialGatewayId(gateway.id);
          const enabled = String(gateway.enabled ?? "")
            .trim()
            .toLowerCase();

          return Boolean(id) && (enabled === "yes" || enabled === "true");
        })
        .map((gateway) => normalizeOfficialGatewayId(gateway.id))
        .filter((gatewayId): gatewayId is string => Boolean(gatewayId));

      let siteId = serverEnv.payments.mercadoPago.siteId?.trim() || "";

      if (!siteId) {
        const profile = await fetch(`${MERCADO_PAGO_API_BASE_URL}/users/me`, {
          cache: "no-store",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (profile.ok) {
          const payload = (await profile.json()) as { site_id?: string | null };
          siteId = String(payload.site_id || "").trim();
        }
      }

      return {
        accessToken,
        sdkUrl: DIRECT_SDK_URL,
        publicKey,
        locale: DEFAULT_LOCALE,
        siteId: siteId || DEFAULT_SITE_ID,
        testMode:
          accessToken.startsWith("TEST-") ||
          accessToken.startsWith("APP_TEST") ||
          publicKey.startsWith("TEST-"),
        enabledGatewayIds:
          enabledGatewayIds.length > 0
            ? enabledGatewayIds
            : [CARD_GATEWAY_ID, PIX_GATEWAY_ID],
      };
    })();
  }

  return directConfigPromise;
};

const readMercadoPagoErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as {
      message?: string;
      cause?: Array<{ description?: string; message?: string }>;
      error?: string;
    };

    const causeMessage = payload.cause?.find(
      (cause) => cause.description || cause.message,
    );

    return (
      causeMessage?.description ||
      causeMessage?.message ||
      payload.message ||
      payload.error ||
      "Erro ao comunicar com o Mercado Pago."
    );
  } catch {
    return "Erro ao comunicar com o Mercado Pago.";
  }
};

const requestMercadoPagoApi = async <TPayload>(
  path: string,
  config: DirectMercadoPagoConfig,
  init?: RequestInit,
): Promise<TPayload> => {
  const response = await fetch(`${MERCADO_PAGO_API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${config.accessToken}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await readMercadoPagoErrorMessage(response));
  }

  return (await response.json()) as TPayload;
};

const coerceMetaString = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
};

const toMetaNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    const parsed = Number.parseFloat(normalized);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const getOrderMetaEntry = (order: WooOrder, key: string) =>
  order.meta_data?.find((entry) => entry.key === key) ?? null;

const getOrderMetaValue = (order: WooOrder, key: string) =>
  getOrderMetaEntry(order, key)?.value;

const getOrderMetaString = (order: WooOrder, key: string) =>
  coerceMetaString(getOrderMetaValue(order, key));

const parsePaymentIds = (value: unknown) =>
  coerceMetaString(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const joinPaymentIds = (paymentIds: string[]) =>
  Array.from(new Set(paymentIds.filter(Boolean))).join(", ");

const buildPaymentMetaKey = (paymentId: string) =>
  `${PAYMENT_META_PREFIX}${paymentId}`;

const buildPaymentDetailsMetaKey = (
  paymentId: string,
  suffix: string,
) => `${PAYMENT_META_DETAILS_PREFIX}${paymentId}${suffix}`;

const buildPaymentMetadataString = (payment: MercadoPagoPaymentResponse) => {
  const parts = [
    `[Date ${payment.date_created || new Date().toISOString()}]`,
    `[Amount ${toMetaNumber(payment.transaction_amount) ?? 0}]`,
    `[Payment Type ${payment.payment_type_id || ""}]`,
    `[Payment Method ${payment.payment_method_id || ""}]`,
    `[Paid ${toMetaNumber(payment.transaction_details?.total_paid_amount) ?? 0}]`,
    `[Coupon ${toMetaNumber(payment.coupon_amount) ?? 0}]`,
    `[Refund ${toMetaNumber(payment.transaction_amount_refunded) ?? 0}]`,
  ];

  return parts.join("/");
};

const mapWooStatusLabel = (status: string) => {
  switch (status) {
    case "processing":
      return "Processando";
    case "completed":
      return "Concluido";
    case "cancelled":
      return "Cancelado";
    case "failed":
      return "Falhou";
    case "refunded":
      return "Reembolsado";
    case "on-hold":
      return "Aguardando";
    case "pending":
    default:
      return "Pendente";
  }
};

const resolveWooStatusFromPayment = (
  paymentStatus: string,
  currentStatus: string,
): string => {
  switch (paymentStatus) {
    case "approved":
      return currentStatus === "completed" ? "completed" : "processing";
    case "rejected":
      return "failed";
    case "cancelled":
      return "cancelled";
    case "refunded":
      return "refunded";
    default:
      return currentStatus || "pending";
  }
};

const normalizeGatewayEnabledIds = (config: DirectMercadoPagoConfig) =>
  config.enabledGatewayIds.filter((gatewayId) =>
    SUPPORTED_GATEWAY_IDS.has(gatewayId),
  );

const buildWooMetaPatch = (
  order: WooOrder,
  entries: Record<string, unknown>,
): Array<{ id?: number; key: string; value: unknown }> =>
  Object.entries(entries).map(([key, value]) => {
    const existingEntry = getOrderMetaEntry(order, key);

    return {
      ...(existingEntry?.id ? { id: Number(existingEntry.id) } : {}),
      key,
      value,
    };
  });

const persistPaymentSnapshot = async (input: {
  order: WooOrder;
  payment: MercadoPagoPaymentResponse;
  checkoutType: "pix" | "credit_card";
  directConfig: DirectMercadoPagoConfig;
}) => {
  const paymentId = String(input.payment.id || "").trim();

  if (!paymentId) {
    return input.order;
  }

  const paymentIds = joinPaymentIds([
    ...parsePaymentIds(getOrderMetaValue(input.order, PAYMENT_IDS_META_KEY)),
    paymentId,
  ]);
  const metaPatch: Record<string, unknown> = {
    [PAYMENT_IDS_META_KEY]: paymentIds,
    [CHECKOUT_TYPE_META_KEY]: input.checkoutType,
    [IS_PRODUCTION_MODE_META_KEY]: input.directConfig.testMode ? "no" : "yes",
    [buildPaymentMetaKey(paymentId)]: buildPaymentMetadataString(input.payment),
  };

  if (input.checkoutType === "pix") {
    metaPatch[PIX_QR_CODE_META_KEY] =
      input.payment.point_of_interaction?.transaction_data?.qr_code || "";
    metaPatch[PIX_QR_BASE64_META_KEY] =
      input.payment.point_of_interaction?.transaction_data?.qr_code_base64 || "";
    metaPatch[PIX_EXPIRATION_META_KEY] = input.payment.date_of_expiration || "";
  } else {
    metaPatch[buildPaymentDetailsMetaKey(paymentId, PAYMENT_TYPE_META_SUFFIX)] =
      input.payment.payment_type_id || "";
    metaPatch[buildPaymentDetailsMetaKey(paymentId, INSTALLMENTS_META_SUFFIX)] =
      toMetaNumber(input.payment.installments) ?? 0;
    metaPatch[buildPaymentDetailsMetaKey(paymentId, TRANSACTION_AMOUNT_META_SUFFIX)] =
      toMetaNumber(input.payment.transaction_amount) ?? 0;
    metaPatch[buildPaymentDetailsMetaKey(paymentId, TOTAL_PAID_AMOUNT_META_SUFFIX)] =
      toMetaNumber(input.payment.transaction_details?.total_paid_amount) ?? 0;
    metaPatch[buildPaymentDetailsMetaKey(paymentId, CARD_LAST_FOUR_META_SUFFIX)] =
      input.payment.card?.last_four_digits || "";
  }

  if (
    input.payment.status_detail === "pending_challenge" &&
    input.payment.three_ds_info?.external_resource_url &&
    input.payment.three_ds_info?.creq
  ) {
    metaPatch[HEADLESS_THREE_DS_URL_META] =
      input.payment.three_ds_info.external_resource_url;
    metaPatch[HEADLESS_THREE_DS_CREQ_META] = input.payment.three_ds_info.creq;
    metaPatch[HEADLESS_THREE_DS_PAYMENT_ID_META] = paymentId;
    metaPatch[HEADLESS_THREE_DS_LAST_FOUR_META] =
      input.payment.card?.last_four_digits || "";
  } else {
    metaPatch[HEADLESS_THREE_DS_URL_META] = "";
    metaPatch[HEADLESS_THREE_DS_CREQ_META] = "";
    metaPatch[HEADLESS_THREE_DS_PAYMENT_ID_META] = "";
    metaPatch[HEADLESS_THREE_DS_LAST_FOUR_META] = "";
  }

  return wordpressWooRestAdapter.updateOrderRaw(input.order.id || 0, {
    meta_data: buildWooMetaPatch(input.order, metaPatch),
    status: resolveWooStatusFromPayment(
      String(input.payment.status || ""),
      String(input.order.status || "pending"),
    ),
  });
};

const buildPaymentStateFromOrder = (
  order: WooOrder,
  fallbackMethodId: string,
  latestPayment?: MercadoPagoPaymentResponse | null,
): MercadoPagoOrderPaymentState => {
  const methodId = String(order.payment_method || fallbackMethodId || "").trim();
  const flow = methodId === PIX_GATEWAY_ID ? "pix" : "card";
  const paymentIds = parsePaymentIds(getOrderMetaValue(order, PAYMENT_IDS_META_KEY));
  const latestPaymentId =
    String(latestPayment?.id || "").trim() || paymentIds[paymentIds.length - 1] || "";
  const latestPaymentMetaKey = latestPaymentId ? buildPaymentMetaKey(latestPaymentId) : "";
  const latestPaymentMetadata = latestPaymentMetaKey
    ? getOrderMetaString(order, latestPaymentMetaKey)
    : "";
  const orderStatus = String(order.status || "pending");
  const paymentStatus =
    String(latestPayment?.status || "").trim() || orderStatus;
  const isPaid =
    paymentStatus === "approved" ||
    orderStatus === "processing" ||
    orderStatus === "completed";
  const threeDSRequired = Boolean(
    getOrderMetaString(order, HEADLESS_THREE_DS_URL_META) &&
      getOrderMetaString(order, HEADLESS_THREE_DS_CREQ_META) &&
      getOrderMetaString(order, HEADLESS_THREE_DS_PAYMENT_ID_META),
  );

  return {
    flow,
    methodId,
    methodTitle: order.payment_method_title ?? undefined,
    orderStatus,
    orderStatusLabel: mapWooStatusLabel(orderStatus),
    paymentStatus,
    isPending: !isPaid,
    isPaid,
    paymentIds,
    checkoutType: getOrderMetaString(order, CHECKOUT_TYPE_META_KEY) || undefined,
    pix:
      flow === "pix"
        ? {
            qrCode:
              latestPayment?.point_of_interaction?.transaction_data?.qr_code ||
              getOrderMetaString(order, PIX_QR_CODE_META_KEY) ||
              undefined,
            qrCodeBase64:
              latestPayment?.point_of_interaction?.transaction_data?.qr_code_base64 ||
              getOrderMetaString(order, PIX_QR_BASE64_META_KEY) ||
              undefined,
            expiresAt:
              latestPayment?.date_of_expiration ||
              getOrderMetaString(order, PIX_EXPIRATION_META_KEY) ||
              undefined,
          }
        : null,
    card:
      flow === "card"
        ? {
            paymentMethodId:
              String(latestPayment?.payment_method_id || "").trim() ||
              (latestPaymentMetadata.match(/\[Payment Method ([^\]]+)\]/)?.[1] ?? undefined),
            paymentTypeId:
              String(latestPayment?.payment_type_id || "").trim() ||
              (latestPaymentMetadata.match(/\[Payment Type ([^\]]+)\]/)?.[1] ?? undefined),
            lastFourDigits:
              latestPayment?.card?.last_four_digits ||
              (latestPaymentId
                ? getOrderMetaString(
                    order,
                    buildPaymentDetailsMetaKey(latestPaymentId, CARD_LAST_FOUR_META_SUFFIX),
                  )
                : "") ||
              getOrderMetaString(order, HEADLESS_THREE_DS_LAST_FOUR_META) ||
              undefined,
            installments:
              toMetaNumber(latestPayment?.installments) ??
              (latestPaymentId
                ? toMetaNumber(
                    getOrderMetaValue(
                      order,
                      buildPaymentDetailsMetaKey(
                        latestPaymentId,
                        INSTALLMENTS_META_SUFFIX,
                      ),
                    ),
                  )
                : null) ??
              undefined,
            transactionAmount:
              toMetaNumber(latestPayment?.transaction_amount) ??
              (latestPaymentId
                ? toMetaNumber(
                    getOrderMetaValue(
                      order,
                      buildPaymentDetailsMetaKey(
                        latestPaymentId,
                        TRANSACTION_AMOUNT_META_SUFFIX,
                      ),
                    ),
                  )
                : null) ??
              undefined,
            totalPaidAmount:
              toMetaNumber(latestPayment?.transaction_details?.total_paid_amount) ??
              (latestPaymentId
                ? toMetaNumber(
                    getOrderMetaValue(
                      order,
                      buildPaymentDetailsMetaKey(
                        latestPaymentId,
                        TOTAL_PAID_AMOUNT_META_SUFFIX,
                      ),
                    ),
                  )
                : null) ??
              undefined,
          }
        : null,
    threeDS: threeDSRequired
      ? {
          required: true,
          url: getOrderMetaString(order, HEADLESS_THREE_DS_URL_META) || undefined,
          creq: getOrderMetaString(order, HEADLESS_THREE_DS_CREQ_META) || undefined,
          lastFourDigits:
            getOrderMetaString(order, HEADLESS_THREE_DS_LAST_FOUR_META) || undefined,
        }
      : {
          required: false,
        },
  };
};

const buildNotificationUrl = (gatewayWebhookApiName: string) =>
  `${serverEnv.wordpress.publicUrl.replace(/\/+$/, "")}/?wc-api=${gatewayWebhookApiName}&source_news=webhooks`;

const toDirectPayer = (order: WooOrder) => ({
  email: String(order.billing?.email || "").trim() || undefined,
  first_name: String(order.billing?.first_name || "").trim() || undefined,
  last_name: String(order.billing?.last_name || "").trim() || undefined,
  address: {
    city: String(order.billing?.city || "").trim() || undefined,
    federal_unit: String(order.billing?.state || "").trim() || undefined,
    zip_code: String(order.billing?.postcode || "").replace(/\D/g, "") || undefined,
    street_name:
      [order.billing?.address_1, order.billing?.address_2]
        .map((value) => String(value || "").trim())
        .filter(Boolean)
        .join(" ") || undefined,
  },
});

const toDirectDescription = (order: WooOrder) =>
  (order.line_items ?? [])
    .map((item) => String(item.name || "").trim())
    .filter(Boolean)
    .join(", ") || `Pedido #${order.number || order.id || ""}`;

const toExternalReference = (orderId: number) => `${DEFAULT_STORE_ID_PREFIX}${orderId}`;

const fetchRawAuthorizedOrder = async (input: {
  orderId: number;
  orderKey: string;
}) => {
  const order = await wordpressWooRestAdapter.getOrderRaw(input.orderId);
  const orderKey = String(order.order_key || "").trim();

  if (!orderKey || orderKey !== input.orderKey) {
    throw new Error("Nao foi possivel autenticar o pedido para pagamento.");
  }

  return order;
};

const processPixDirectly = async (input: {
  orderId: number;
  orderKey: string;
}): Promise<MercadoPagoProcessPaymentResult> => {
  const config = await ensureDirectFallbackCredentials();
  const order = await fetchRawAuthorizedOrder(input);
  const payment = await requestMercadoPagoApi<MercadoPagoPaymentResponse>(
    "/v1/payments",
    config,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": `pharmacore-pix-${input.orderId}-${crypto.randomUUID()}`,
      },
      body: JSON.stringify({
        transaction_amount: toMetaNumber(order.total) ?? 0,
        description: toDirectDescription(order),
        payment_method_id: "pix",
        installments: 1,
        date_of_expiration: new Date(
          Date.now() + 30 * 60 * 1000,
        ).toISOString(),
        notification_url: buildNotificationUrl("WC_WooMercadoPago_Pix_Gateway"),
        external_reference: toExternalReference(input.orderId),
        payer: toDirectPayer(order),
        point_of_interaction: {
          type: "CHECKOUT",
        },
      }),
    },
  );
  const persistedOrder = await persistPaymentSnapshot({
    order,
    payment,
    checkoutType: "pix",
    directConfig: config,
  });

  return {
    outcome: "processed",
    paymentState: buildPaymentStateFromOrder(persistedOrder, PIX_GATEWAY_ID, payment),
  };
};

const processCardDirectly = async (input: {
  orderId: number;
  orderKey: string;
  payment: MercadoPagoCardPaymentInput;
}): Promise<MercadoPagoProcessPaymentResult> => {
  const config = await ensureDirectFallbackCredentials();
  const order = await fetchRawAuthorizedOrder(input);
  const directPayment = await requestMercadoPagoApi<MercadoPagoPaymentResponse>(
    "/v1/payments",
    config,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": `pharmacore-card-${input.orderId}-${crypto.randomUUID()}`,
      },
      body: JSON.stringify({
        transaction_amount: toMetaNumber(order.total) ?? 0,
        token: input.payment.token,
        description: toDirectDescription(order),
        installments: input.payment.installments,
        payment_method_id: input.payment.paymentMethodId,
        payment_type_id: input.payment.paymentTypeId,
        issuer_id: input.payment.issuerId,
        three_d_secure_mode: "optional",
        binary_mode: false,
        notification_url: buildNotificationUrl("WC_WooMercadoPago_Custom_Gateway"),
        external_reference: toExternalReference(input.orderId),
        payer: {
          ...toDirectPayer(order),
          ...(input.payment.identificationType && input.payment.identificationNumber
            ? {
                identification: {
                  type: input.payment.identificationType,
                  number: input.payment.identificationNumber,
                },
              }
            : {}),
        },
        session_id: input.payment.sessionId,
      }),
    },
  );
  const persistedOrder = await persistPaymentSnapshot({
    order,
    payment: directPayment,
    checkoutType: "credit_card",
    directConfig: config,
  });
  const outcome: MercadoPagoProcessOutcome =
    directPayment.status_detail === "pending_challenge" &&
    Boolean(directPayment.three_ds_info?.external_resource_url) &&
    Boolean(directPayment.three_ds_info?.creq)
      ? "three_ds"
      : "processed";

  return {
    outcome,
    paymentState: buildPaymentStateFromOrder(
      persistedOrder,
      CARD_GATEWAY_ID,
      directPayment,
    ),
  };
};

const syncDirectPaymentState = async (input: {
  orderId: number;
  orderKey: string;
  fallbackMethodId: string;
}): Promise<MercadoPagoOrderPaymentState> => {
  const config = await ensureDirectFallbackCredentials();
  let order = await fetchRawAuthorizedOrder(input);
  const latestPaymentId = parsePaymentIds(
    getOrderMetaValue(order, PAYMENT_IDS_META_KEY),
  ).at(-1);

  if (latestPaymentId) {
    const payment = await requestMercadoPagoApi<MercadoPagoPaymentResponse>(
      `/v1/payments/${latestPaymentId}`,
      config,
    );

    order = await persistPaymentSnapshot({
      order,
      payment,
      checkoutType: input.fallbackMethodId === PIX_GATEWAY_ID ? "pix" : "credit_card",
      directConfig: config,
    });

    return buildPaymentStateFromOrder(order, input.fallbackMethodId, payment);
  }

  return buildPaymentStateFromOrder(order, input.fallbackMethodId, null);
};

export const mercadoPagoHeadlessServer = {
  getConfig: async (): Promise<MercadoPagoHeadlessConfig> => {
    try {
      return await requestBridge<MercadoPagoHeadlessConfig>("/config");
    } catch (error) {
      if (!isBridgeUnavailableError(error)) {
        throw error;
      }

      const config = await ensureDirectFallbackCredentials();

      return {
        sdkUrl: config.sdkUrl,
        publicKey: config.publicKey,
        locale: config.locale,
        siteId: config.siteId,
        testMode: config.testMode,
        enabledGatewayIds: normalizeGatewayEnabledIds(config),
      };
    }
  },

  getOrderPaymentState: async (input: {
    orderId: number;
    orderKey: string;
    sync?: boolean;
  }): Promise<MercadoPagoOrderPaymentState> => {
    const fallbackOrder = await fetchRawAuthorizedOrder(input).catch(() => null);
    const fallbackMethodId =
      normalizeOfficialGatewayId(fallbackOrder?.payment_method) || CARD_GATEWAY_ID;

    try {
      const searchParams = new URLSearchParams({
        key: input.orderKey,
      });

      if (input.sync) {
        searchParams.set("sync", "true");
      }

      const payload = await requestBridge<{ paymentState: MercadoPagoOrderPaymentState }>(
        `/orders/${input.orderId}/state?${searchParams.toString()}`,
      );

      return payload.paymentState;
    } catch (error) {
      if (!isBridgeUnavailableError(error)) {
        throw error;
      }

      if (input.sync) {
        return syncDirectPaymentState({
          ...input,
          fallbackMethodId,
        });
      }

      const order = fallbackOrder ?? (await fetchRawAuthorizedOrder(input));
      return buildPaymentStateFromOrder(order, fallbackMethodId, null);
    }
  },

  processPixPayment: async (input: {
    orderId: number;
    orderKey: string;
  }): Promise<MercadoPagoProcessPaymentResult> => {
    try {
      return await requestBridge<MercadoPagoProcessPaymentResult>(
        `/orders/${input.orderId}/pix`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key: input.orderKey }),
        },
      );
    } catch (error) {
      if (!isBridgeUnavailableError(error)) {
        throw error;
      }

      return processPixDirectly(input);
    }
  },

  processCardPayment: async (input: {
    orderId: number;
    orderKey: string;
    payment: MercadoPagoCardPaymentInput;
  }): Promise<MercadoPagoProcessPaymentResult> => {
    try {
      return await requestBridge<MercadoPagoProcessPaymentResult>(
        `/orders/${input.orderId}/card`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: input.orderKey,
            ...input.payment,
          }),
        },
      );
    } catch (error) {
      if (!isBridgeUnavailableError(error)) {
        throw error;
      }

      return processCardDirectly(input);
    }
  },

  finalizeThreeDS: async (input: {
    orderId: number;
    orderKey: string;
  }): Promise<MercadoPagoProcessPaymentResult> => {
    try {
      return await requestBridge<MercadoPagoProcessPaymentResult>(
        `/orders/${input.orderId}/3ds/finalize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key: input.orderKey }),
        },
      );
    } catch (error) {
      if (!isBridgeUnavailableError(error)) {
        throw error;
      }

      const paymentState = await syncDirectPaymentState({
        ...input,
        fallbackMethodId: CARD_GATEWAY_ID,
      });

      return {
        outcome: "processed",
        paymentState,
      };
    }
  },
};
