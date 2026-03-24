import {
  accountCustomerViewSchema,
  accountOrderSummaryViewSchema,
  checkoutOrderConfirmationViewSchema,
  checkoutPaymentMethodViewSchema,
  type AccountCustomerView,
  type AccountOrderSummaryView,
  type CheckoutOrderConfirmationView,
  type CheckoutPaymentMethodView,
} from "@site/shared";
import type {
  WooAddress,
  WooCustomer,
  WooMetaData,
  WooOrder,
  WooOrderNote,
  WooPaymentGateway,
} from "../external/woocommerce.types";
import {
  humanizeStatus,
  toMoneyAmount,
} from "../shared.normalize";

const toAddress = (address?: WooAddress | null) => {
  if (!address) {
    return undefined;
  }

  return {
    firstName: address.first_name ?? undefined,
    lastName: address.last_name ?? undefined,
    company: address.company ?? undefined,
    addressLine1: address.address_1 ?? undefined,
    addressLine2: address.address_2 ?? undefined,
    city: address.city ?? undefined,
    postcode: address.postcode ?? undefined,
    country: address.country ?? undefined,
    state: address.state ?? undefined,
    email: address.email ?? undefined,
    phone: address.phone ?? undefined,
  };
};

const toMoneyValue = (amount?: string | number | null) => {
  const parsedAmount = toMoneyAmount(amount);

  return {
    amount: parsedAmount,
    currencyCode: "BRL",
    formatted: new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parsedAmount),
  };
};

const TRACKING_CODE_META_KEYS = [
  "_correios_tracking_code",
  "tracking_code",
  "_tracking_code",
  "_tracking_number",
  "tracking_number",
] as const;

const TRACKING_URL_META_KEYS = [
  "_correios_tracking_url",
  "tracking_url",
  "_tracking_url",
] as const;

const readMetaValue = (
  metaData: WooMetaData[] | null | undefined,
  candidateKeys: readonly string[],
) => {
  const normalizedMetaData = metaData ?? [];

  for (const key of candidateKeys) {
    const entry = normalizedMetaData.find((item) => item.key === key);
    const rawValue = entry?.value;

    if (typeof rawValue === "string" && rawValue.trim()) {
      return rawValue.trim();
    }

    if (typeof rawValue === "number") {
      return String(rawValue);
    }
  }

  return undefined;
};

const resolveLatestCustomerNote = (
  order: WooOrder,
  notes?: WooOrderNote[] | null,
) => {
  const directNote = order.customer_note?.trim();

  if (directNote) {
    return directNote;
  }

  const customerNotes = (notes ?? [])
    .filter((note) => note.customer_note && note.note?.trim())
    .sort((left, right) => {
      const leftTime = left.date_created
        ? new Date(left.date_created).getTime()
        : 0;
      const rightTime = right.date_created
        ? new Date(right.date_created).getTime()
        : 0;

      return rightTime - leftTime;
    });

  return customerNotes[0]?.note?.trim();
};

export const mapWooOrderToAccountOrderSummaryView = (
  order: WooOrder,
): AccountOrderSummaryView =>
  accountOrderSummaryViewSchema.parse({
    id: order.id ?? 0,
    number: order.number ?? String(order.id ?? "0"),
    status: {
      code: order.status ?? "unknown",
      label: humanizeStatus(order.status),
    },
    total: toMoneyValue(order.total),
    createdAt: order.date_created ?? new Date(0).toISOString(),
    paymentMethodTitle: order.payment_method_title ?? undefined,
    items: (order.line_items ?? []).map((item) => ({
      id: item.id ?? undefined,
      productId: item.product_id ?? undefined,
      productName: item.name ?? "Produto",
      quantity: item.quantity ?? 1,
      total: toMoneyValue(item.total),
      sku: item.sku ?? undefined,
      image: null,
    })),
  });

export const mapWooCustomerToAccountCustomerView = (
  customer: WooCustomer,
): AccountCustomerView =>
  accountCustomerViewSchema.parse({
    id: customer.id ?? 0,
    email: customer.email ?? undefined,
    displayName:
      [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
      customer.username ||
      undefined,
    billingAddress: toAddress(customer.billing) ?? null,
    shippingAddress: toAddress(customer.shipping) ?? null,
  });

export const mapWooPaymentGatewayToCheckoutPaymentMethodView = (
  paymentGateway: WooPaymentGateway,
): CheckoutPaymentMethodView =>
  checkoutPaymentMethodViewSchema.parse({
    id: paymentGateway.id ?? "unknown",
    title: paymentGateway.title ?? "Metodo de pagamento",
    description: paymentGateway.description ?? undefined,
    enabled:
      typeof paymentGateway.enabled === "boolean"
        ? paymentGateway.enabled
        : paymentGateway.enabled === "yes" || paymentGateway.enabled === "true",
  });

export const mapWooOrderToCheckoutOrderConfirmationView = (
  order: WooOrder,
  notes?: WooOrderNote[] | null,
): CheckoutOrderConfirmationView =>
  checkoutOrderConfirmationViewSchema.parse({
    orderId: order.id ?? 0,
    orderNumber: order.number ?? String(order.id ?? "0"),
    status: {
      code: order.status ?? "unknown",
      label: humanizeStatus(order.status),
    },
    createdAt: order.date_created ?? new Date(0).toISOString(),
    total: toMoneyValue(order.total),
    paymentMethodId: order.payment_method ?? undefined,
    paymentMethodTitle: order.payment_method_title ?? undefined,
    paymentUrl: order.payment_url ?? undefined,
    shippingAddress: toAddress(order.shipping) ?? {},
    billingAddress: toAddress(order.billing) ?? {},
    items: (order.line_items ?? []).map((item, index) => ({
      productId:
        item.product_id ??
        item.id ??
        `order-item-${order.id ?? "unknown"}-${index}`,
      name: item.name ?? "Produto",
      quantity: item.quantity ?? 1,
      total: toMoneyValue(item.total),
      unitPrice: toMoneyValue(
        toMoneyAmount(item.total) / Math.max(item.quantity ?? 1, 1),
      ),
      image: null,
    })),
    couponCode: order.coupon_lines?.[0]?.code ?? undefined,
    couponDiscount: order.coupon_lines?.[0]?.discount
      ? toMoneyValue(order.coupon_lines[0].discount)
      : null,
    customerNote: resolveLatestCustomerNote(order, notes),
    trackingCode: readMetaValue(order.meta_data, TRACKING_CODE_META_KEYS),
    trackingUrl: readMetaValue(order.meta_data, TRACKING_URL_META_KEYS),
  });
