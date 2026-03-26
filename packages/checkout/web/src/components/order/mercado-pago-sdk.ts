"use client";

import type { MercadoPagoHeadlessConfig } from "@site/integrations/payments";

declare global {
  interface Window {
    MP_DEVICE_SESSION_ID?: string;
    MercadoPago?: MercadoPagoConstructor;
    __pharmacoreMercadoPagoSdk?: MercadoPagoSdkInstance;
    __pharmacoreMercadoPagoSdkKey?: string;
    __pharmacoreMercadoPagoSdkPromise?: Promise<void>;
    __pharmacoreMercadoPagoSecurityPromise?: Promise<void>;
  }
}

type MercadoPagoSecureField = {
  on?: (eventName: string, callback: () => void) => void;
};

export type MercadoPagoCardFormData = {
  paymentMethodId?: string;
  paymentTypeId?: string;
  issuerId?: string;
  installments?: string | number;
  identificationType?: string;
  identificationNumber?: string;
};

export interface MercadoPagoCardFormController {
  createCardToken: () => Promise<{ token?: string }>;
  getCardFormData: () => MercadoPagoCardFormData;
  unmount?: () => void;
}

export interface MercadoPagoSdkInstance {
  cardForm: (config: {
    amount: string;
    iframe: boolean;
    form: Record<string, unknown>;
    callbacks: Record<string, unknown>;
  }) => MercadoPagoCardFormController;
  getSDKInstanceId?: () => string;
}

interface MercadoPagoConstructor {
  new (publicKey: string, options?: { locale?: string }): MercadoPagoSdkInstance;
}

const loadExternalScript = (src: string, id: string) => {
  const existing = document.querySelector<HTMLScriptElement>(`script[data-pharmacore-script="${id}"]`);

  if (existing) {
    if ((existing as HTMLScriptElement).dataset.loaded === "true") {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), {
        once: true,
      });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.dataset.pharmacoreScript = id;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => reject(new Error(`Failed to load ${src}`)),
      { once: true },
    );
    document.head.appendChild(script);
  });
};

export const ensureMercadoPagoSdk = async (
  config: MercadoPagoHeadlessConfig,
): Promise<MercadoPagoSdkInstance> => {
  if (!window.__pharmacoreMercadoPagoSecurityPromise) {
    window.__pharmacoreMercadoPagoSecurityPromise = loadExternalScript(
      "https://www.mercadopago.com/v2/security.js",
      "mercado-pago-security",
    ).catch((error) => {
      window.__pharmacoreMercadoPagoSecurityPromise = undefined;
      throw error;
    });
  }

  if (!window.__pharmacoreMercadoPagoSdkPromise) {
    window.__pharmacoreMercadoPagoSdkPromise = loadExternalScript(
      config.sdkUrl,
      "mercado-pago-sdk",
    ).catch((error) => {
      window.__pharmacoreMercadoPagoSdkPromise = undefined;
      throw error;
    });
  }

  await Promise.all([
    window.__pharmacoreMercadoPagoSecurityPromise,
    window.__pharmacoreMercadoPagoSdkPromise,
  ]);

  if (!window.MercadoPago) {
    throw new Error("Mercado Pago SDK indisponível no navegador.");
  }

  const sdkIdentity = `${config.publicKey}:${config.locale}`;

  if (
    !window.__pharmacoreMercadoPagoSdk ||
    window.__pharmacoreMercadoPagoSdkKey !== sdkIdentity
  ) {
    window.__pharmacoreMercadoPagoSdk = new window.MercadoPago(config.publicKey, {
      locale: config.locale,
    });
    window.__pharmacoreMercadoPagoSdkKey = sdkIdentity;
  }

  return window.__pharmacoreMercadoPagoSdk;
};

export const readMercadoPagoDeviceSessionId = () =>
  typeof window.MP_DEVICE_SESSION_ID === "string" && window.MP_DEVICE_SESSION_ID.trim()
    ? window.MP_DEVICE_SESSION_ID.trim()
    : undefined;

const readThemeValue = (variableName: string, fallback: string) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  return value || fallback;
};

export const buildMercadoPagoFieldStyle = () => ({
  fontSize: "15px",
  height: "44px",
  padding: "10px 12px",
  textAlign: "left" as const,
  fontFamily: "var(--site-font-body, system-ui)",
  fontWeight: "500",
  color: readThemeValue("--site-color-foreground-strong", "#fbfdff"),
  placeholderColor: readThemeValue("--site-color-foreground-soft", "#9aaabc"),
});

export const buildSecureFieldListeners = (
  field: MercadoPagoSecureField | undefined,
  callbacks: {
    onFocus?: () => void;
    onBlur?: () => void;
  },
) => {
  if (!field?.on) {
    return;
  }

  if (callbacks.onFocus) {
    field.on("focus", callbacks.onFocus);
  }

  if (callbacks.onBlur) {
    field.on("blur", callbacks.onBlur);
  }
};
