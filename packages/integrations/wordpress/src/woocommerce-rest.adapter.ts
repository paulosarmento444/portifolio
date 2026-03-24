import "server-only";
import type {
  WooCustomer,
  WooCoupon,
  WooOrder,
  WooOrderNote,
  WooPaymentGateway,
} from "./external/woocommerce.types";
import type {
  AccountCustomerView,
  CheckoutOrderConfirmationView,
  CheckoutOrderTrackingView,
} from "@site/shared";
import { checkoutOrderConfirmationViewSchema } from "@site/shared";
import { woocommerceClient } from "./clients/woocommerce.client";
import { wordpressOrderTrackingServer } from "./headless-order-tracking.server";
import {
  mapWooCustomerToAccountCustomerView,
  mapWooOrderToAccountOrderSummaryView,
  mapWooOrderToCheckoutOrderConfirmationView,
  mapWooPaymentGatewayToCheckoutPaymentMethodView,
} from "./mappers/woo.mapper";

export type WooOrderPaymentContext = {
  order: CheckoutOrderConfirmationView;
  orderKey: string;
};

const buildTrackingLookupFailure = (
  order: CheckoutOrderConfirmationView,
  message: string,
): CheckoutOrderTrackingView | null => {
  const code = order.trackingCode?.trim();

  if (!code) {
    return null;
  }

  return {
    provider: "Correios",
    code,
    state: "error",
    message,
    history: [],
  };
};

const attachTrackingSnapshot = async (
  order: WooOrder,
  mappedOrder: CheckoutOrderConfirmationView,
): Promise<CheckoutOrderConfirmationView> => {
  const trackingCode = mappedOrder.trackingCode?.trim();
  const orderKey = order.order_key?.trim();
  const orderId = Number(order.id ?? 0);

  if (!trackingCode) {
    return checkoutOrderConfirmationViewSchema.parse({
      ...mappedOrder,
      tracking: null,
    });
  }

  if (!orderKey || !Number.isFinite(orderId) || orderId <= 0) {
    return checkoutOrderConfirmationViewSchema.parse({
      ...mappedOrder,
      tracking: buildTrackingLookupFailure(
        mappedOrder,
        "Nao foi possivel autenticar a consulta oficial de rastreio para este pedido.",
      ),
    });
  }

  try {
    const tracking = await wordpressOrderTrackingServer.getOrderTracking({
      orderId,
      orderKey,
    });

    return checkoutOrderConfirmationViewSchema.parse({
      ...mappedOrder,
      tracking,
    });
  } catch (error) {
    return checkoutOrderConfirmationViewSchema.parse({
      ...mappedOrder,
      tracking: buildTrackingLookupFailure(
        mappedOrder,
        error instanceof Error
          ? error.message
          : "Nao foi possivel consultar o rastreio dos Correios.",
      ),
    });
  }
};

export const wordpressWooRestAdapter = {
  getOrderRaw: async (orderId: number): Promise<WooOrder> => {
    const { data } = await woocommerceClient.get<WooOrder>(`/orders/${orderId}`);
    return data;
  },

  getOrderNotesRaw: async (orderId: number): Promise<WooOrderNote[]> => {
    const { data } = await woocommerceClient.get<WooOrderNote[]>(
      `/orders/${orderId}/notes`,
    );

    return data;
  },

  listOrdersRaw: async (customerId: number): Promise<WooOrder[]> => {
    const { data } = await woocommerceClient.get<WooOrder[]>("/orders", {
      params: {
        customer: customerId,
        per_page: 100,
        orderby: "date",
        order: "desc",
      },
    });

    return data;
  },

  getCustomerRaw: async (customerId: number): Promise<WooCustomer> => {
    const { data } = await woocommerceClient.get<WooCustomer>(
      `/customers/${customerId}`,
    );

    return data;
  },

  createCustomerRaw: async (payload: {
    email: string;
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<WooCustomer> => {
    const { data } = await woocommerceClient.post<WooCustomer>(
      "/customers",
      payload,
    );

    return data;
  },

  updateCustomerRaw: async (
    customerId: string | number,
    payload: unknown,
  ): Promise<WooCustomer> => {
    const { data } = await woocommerceClient.put<WooCustomer>(
      `/customers/${customerId}`,
      payload,
    );

    return data;
  },

  createOrderRaw: async <TInput>(payload: TInput): Promise<WooOrder> => {
    const { data } = await woocommerceClient.post<WooOrder>("/orders", payload);
    return data;
  },

  listPaymentGatewaysRaw: async (): Promise<WooPaymentGateway[]> => {
    const { data } = await woocommerceClient.get<WooPaymentGateway[]>(
      "/payment_gateways",
    );

    return data;
  },

  listCouponsRaw: async (search?: string): Promise<WooCoupon[]> => {
    const { data } = await woocommerceClient.get<WooCoupon[]>("/coupons", {
      params: {
        per_page: 100,
        ...(search ? { search } : {}),
      },
    });

    return data;
  },

  findCouponByCode: async (couponCode: string): Promise<WooCoupon | null> => {
    const normalizedCode = couponCode.trim().toLowerCase();

    if (!normalizedCode) {
      return null;
    }

    const coupons = await wordpressWooRestAdapter.listCouponsRaw(couponCode);

    return (
      coupons.find(
        (coupon) => coupon.code?.trim().toLowerCase() === normalizedCode,
      ) ?? null
    );
  },

  getOrdersByCustomer: async (customerId: number) => {
    const orders = await wordpressWooRestAdapter.listOrdersRaw(customerId);
    return orders.map(mapWooOrderToAccountOrderSummaryView);
  },

  getOrderById: async (
    orderId: number,
  ): Promise<CheckoutOrderConfirmationView> => {
    const [order, notes] = await Promise.all([
      wordpressWooRestAdapter.getOrderRaw(orderId),
      wordpressWooRestAdapter.getOrderNotesRaw(orderId).catch(() => []),
    ]);

    return attachTrackingSnapshot(
      order,
      mapWooOrderToCheckoutOrderConfirmationView(order, notes),
    );
  },

  getOrderByIdForCustomer: async (
    orderId: number,
    customerId: number,
  ): Promise<CheckoutOrderConfirmationView | null> => {
    const [order, notes] = await Promise.all([
      wordpressWooRestAdapter.getOrderRaw(orderId),
      wordpressWooRestAdapter.getOrderNotesRaw(orderId).catch(() => []),
    ]);

    if (String(order.customer_id ?? "") !== String(customerId)) {
      return null;
    }

    return attachTrackingSnapshot(
      order,
      mapWooOrderToCheckoutOrderConfirmationView(order, notes),
    );
  },

  getOrderPaymentContextForCustomer: async (
    orderId: number,
    customerId: number,
  ): Promise<WooOrderPaymentContext | null> => {
    const [order, notes] = await Promise.all([
      wordpressWooRestAdapter.getOrderRaw(orderId),
      wordpressWooRestAdapter.getOrderNotesRaw(orderId).catch(() => []),
    ]);

    if (String(order.customer_id ?? "") !== String(customerId)) {
      return null;
    }

    const orderKey = order.order_key?.trim();

    if (!orderKey) {
      throw new Error("WooCommerce order is missing order_key.");
    }

    return {
      order: await attachTrackingSnapshot(
        order,
        mapWooOrderToCheckoutOrderConfirmationView(order, notes),
      ),
      orderKey,
    };
  },

  getAccountCustomer: async (customerId: number) => {
    const customer = await wordpressWooRestAdapter.getCustomerRaw(customerId);
    return mapWooCustomerToAccountCustomerView(customer);
  },

  updateAccountCustomer: async (
    customerId: string | number,
    payload: unknown,
  ): Promise<AccountCustomerView> => {
    const customer = await wordpressWooRestAdapter.updateCustomerRaw(
      customerId,
      payload,
    );
    return mapWooCustomerToAccountCustomerView(customer);
  },

  listCheckoutPaymentMethods: async () => {
    const paymentMethods = await wordpressWooRestAdapter.listPaymentGatewaysRaw();
    return paymentMethods
      .map(mapWooPaymentGatewayToCheckoutPaymentMethodView)
      .filter((method) => method.enabled);
  },

  createWooOrder: async <TInput>(
    payload: TInput,
  ): Promise<CheckoutOrderConfirmationView> => {
    const order = await wordpressWooRestAdapter.createOrderRaw(payload);
    return mapWooOrderToCheckoutOrderConfirmationView(order);
  },

  listAccountOrders: async (customerId: number) => {
    return wordpressWooRestAdapter.getOrdersByCustomer(customerId);
  },

  createCheckoutOrder: async <TInput>(
    payload: TInput,
  ): Promise<CheckoutOrderConfirmationView> => {
    return wordpressWooRestAdapter.createWooOrder(payload);
  },

  getCheckoutOrderConfirmation: async (
    orderId: number,
  ): Promise<CheckoutOrderConfirmationView> => {
    return wordpressWooRestAdapter.getOrderById(orderId);
  },
};
