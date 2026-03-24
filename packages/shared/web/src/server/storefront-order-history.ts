import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  accountOrderSummaryViewSchema,
  type AccountOrderSummaryView,
} from "../contracts/account.contract";
import {
  checkoutOrderConfirmationViewSchema,
  type CheckoutOrderConfirmationView,
} from "../contracts/checkout.contract";

const ORDER_HISTORY_COOKIE = "storefront_order_history";
const ORDER_HISTORY_VERSION = 1;
const MAX_ORDERS_PER_USER = 8;

const orderHistoryRecordSchema = z
  .object({
    summary: accountOrderSummaryViewSchema,
    detail: checkoutOrderConfirmationViewSchema,
  })
  .strict();

const orderHistoryPayloadSchema = z
  .object({
    version: z.literal(ORDER_HISTORY_VERSION),
    users: z.record(z.array(orderHistoryRecordSchema)),
  })
  .strict();

type OrderHistoryPayload = z.infer<typeof orderHistoryPayloadSchema>;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

const getSigningSecret = () =>
  process.env.COCART_JWT_AUTH_SECRET_KEY?.trim() ||
  process.env.FAUST_SECRET_KEY?.trim() ||
  "storefront-order-history-dev";

const signPayload = (payload: string) =>
  crypto.createHmac("sha256", getSigningSecret()).update(payload).digest("base64url");

const encodePayload = (payload: OrderHistoryPayload) => {
  const serialized = JSON.stringify(payload);
  const encoded = Buffer.from(serialized, "utf8").toString("base64url");
  return `${encoded}.${signPayload(encoded)}`;
};

const decodePayload = (value?: string | null): OrderHistoryPayload => {
  if (!value?.trim()) {
    return {
      version: ORDER_HISTORY_VERSION,
      users: {},
    };
  }

  const [encoded, signature] = value.split(".");

  if (!encoded || !signature || signPayload(encoded) !== signature) {
    return {
      version: ORDER_HISTORY_VERSION,
      users: {},
    };
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    return orderHistoryPayloadSchema.parse(parsed);
  } catch {
    return {
      version: ORDER_HISTORY_VERSION,
      users: {},
    };
  }
};

const mapOrderToSummary = (
  order: CheckoutOrderConfirmationView,
): AccountOrderSummaryView =>
  accountOrderSummaryViewSchema.parse({
    id: order.orderId,
    number: order.orderNumber,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    paymentMethodTitle: order.paymentMethodTitle,
    items: order.items.map((item) => ({
      id: item.productId,
      productId: item.productId,
      productName: item.name,
      quantity: item.quantity,
      total: item.total,
      sku: undefined,
      image: item.image ?? null,
    })),
  });

export async function persistStorefrontOrderHistory(
  userId: string,
  order: CheckoutOrderConfirmationView,
) {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    return;
  }

  const cookieStore = await cookies();
  const payload = decodePayload(cookieStore.get(ORDER_HISTORY_COOKIE)?.value);
  const nextRecord = orderHistoryRecordSchema.parse({
    summary: mapOrderToSummary(order),
    detail: order,
  });

  const currentRecords = payload.users[normalizedUserId] ?? [];
  const nextRecords = [
    nextRecord,
    ...currentRecords.filter(
      (record) => String(record.detail.orderId) !== String(order.orderId),
    ),
  ].slice(0, MAX_ORDERS_PER_USER);

  cookieStore.set(
    ORDER_HISTORY_COOKIE,
    encodePayload({
      ...payload,
      users: {
        ...payload.users,
        [normalizedUserId]: nextRecords,
      },
    }),
    cookieOptions,
  );
}

export async function readStorefrontOrderSummaries(
  userId: string,
): Promise<AccountOrderSummaryView[]> {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    return [];
  }

  const cookieStore = await cookies();
  const payload = decodePayload(cookieStore.get(ORDER_HISTORY_COOKIE)?.value);
  return (payload.users[normalizedUserId] ?? []).map((record) => record.summary);
}

export async function readStorefrontOrderDetail(
  orderId: string | number,
  userId?: string | null,
): Promise<CheckoutOrderConfirmationView | null> {
  const cookieStore = await cookies();
  const payload = decodePayload(cookieStore.get(ORDER_HISTORY_COOKIE)?.value);
  const normalizedOrderId = String(orderId);

  const recordSets =
    userId?.trim()
      ? [payload.users[userId.trim()] ?? []]
      : Object.values(payload.users);

  for (const records of recordSets) {
    const match = records.find(
      (record) => String(record.detail.orderId) === normalizedOrderId,
    );

    if (match) {
      return match.detail;
    }
  }

  return null;
}
