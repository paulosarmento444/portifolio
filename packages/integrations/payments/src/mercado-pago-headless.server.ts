import "server-only";

import { serverEnv } from "@/app/lib/env.server";
import type {
  MercadoPagoCardPaymentInput,
  MercadoPagoHeadlessConfig,
  MercadoPagoOrderPaymentState,
  MercadoPagoProcessPaymentResult,
} from "./mercado-pago-headless.types";

const BRIDGE_BASE_PATH = "/wp-json/pharmacore/v1/mercado-pago";

const buildBridgeUrl = (path: string, searchParams?: URLSearchParams) => {
  const url = new URL(
    `${serverEnv.wordpress.url.replace(/\/+$/, "")}${BRIDGE_BASE_PATH}${path}`,
  );

  if (searchParams) {
    url.search = searchParams.toString();
  }

  return url;
};

const readErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as { error?: string; message?: string };
    return payload.error || payload.message || "Erro ao comunicar com o Mercado Pago.";
  } catch {
    return "Erro ao comunicar com o Mercado Pago.";
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
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as TPayload;
};

export const mercadoPagoHeadlessServer = {
  getConfig: async (): Promise<MercadoPagoHeadlessConfig> => {
    return requestBridge<MercadoPagoHeadlessConfig>("/config");
  },

  getOrderPaymentState: async (input: {
    orderId: number;
    orderKey: string;
    sync?: boolean;
  }): Promise<MercadoPagoOrderPaymentState> => {
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
  },

  processPixPayment: async (input: {
    orderId: number;
    orderKey: string;
  }): Promise<MercadoPagoProcessPaymentResult> => {
    return requestBridge<MercadoPagoProcessPaymentResult>(
      `/orders/${input.orderId}/pix`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: input.orderKey }),
      },
    );
  },

  processCardPayment: async (input: {
    orderId: number;
    orderKey: string;
    payment: MercadoPagoCardPaymentInput;
  }): Promise<MercadoPagoProcessPaymentResult> => {
    return requestBridge<MercadoPagoProcessPaymentResult>(
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
  },

  finalizeThreeDS: async (input: {
    orderId: number;
    orderKey: string;
  }): Promise<MercadoPagoProcessPaymentResult> => {
    return requestBridge<MercadoPagoProcessPaymentResult>(
      `/orders/${input.orderId}/3ds/finalize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: input.orderKey }),
      },
    );
  },
};
