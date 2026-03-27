import "server-only";

import { serverEnv } from "@site/shared/server";
import {
  checkoutOrderTrackingViewSchema,
  type CheckoutOrderTrackingView,
} from "@site/shared";

const HEADLESS_TRACKING_BRIDGE_BASE_PATH = "/wp-json/pharmacore/v1/orders";

const buildTrackingBridgeUrl = (orderId: number) =>
  new URL(
    `${serverEnv.wordpress.url.replace(/\/+$/, "")}${HEADLESS_TRACKING_BRIDGE_BASE_PATH}/${orderId}/tracking`,
  ).toString();

const readErrorPayloadMessage = async (
  response: Response,
  fallbackMessage: string,
) => {
  try {
    const payload = (await response.json()) as {
      error?: string;
      message?: string;
      tracking?: {
        message?: string;
      };
    };

    return (
      payload.error ||
      payload.message ||
      payload.tracking?.message ||
      fallbackMessage
    );
  } catch {
    return fallbackMessage;
  }
};

export const requestOrderTrackingSnapshot = async (input: {
  orderId: number;
  orderKey: string;
}): Promise<CheckoutOrderTrackingView> => {
  const response = await fetch(buildTrackingBridgeUrl(input.orderId), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "x-pharmacore-order-key": input.orderKey,
    },
  });

  if (!response.ok) {
    throw new Error(
      await readErrorPayloadMessage(
        response,
        "Nao foi possivel consultar o rastreio dos Correios.",
      ),
    );
  }

  const payload = (await response.json()) as {
    tracking?: unknown;
  };

  return checkoutOrderTrackingViewSchema.parse(payload.tracking);
};

export const wordpressOrderTrackingServer = {
  getOrderTracking: requestOrderTrackingSnapshot,
};
