import { defaultCoCartEndpointMap, type CoCartEndpointMap } from "./cocart.constants";

export type CoCartRuntimeConfig = {
  baseUrl: string;
  timeoutMs?: number;
  endpoints: CoCartEndpointMap;
  sessionHeaderName?: string;
  cartTokenHeaderName?: string;
};

const resolveHeaderName = (value?: string): string | undefined => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const defaultDockerWordpressUrl = "http://wordpress:80";

const normalizeBaseUrl = (value: string): string => {
  let normalized = value.trim();

  if (!normalized) {
    throw new Error("[cocart] Missing CoCart base URL");
  }

  if (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  if (/localhost|127\.0\.0\.1/i.test(normalized)) {
    normalized = normalized.replace(/^https:\/\//i, "http://");
  }

  return normalized;
};

const normalizeWordpressBaseUrl = (value: string): string => {
  let normalized = value.trim();

  if (!normalized) {
    throw new Error("[cocart] Missing WordPress base URL");
  }

  if (normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `http://${normalized}`;
  }

  return normalized;
};

const isLoopbackBaseUrl = (value: string): boolean =>
  /\/\/(localhost|127\.0\.0\.1)(?::|\/|$)/i.test(value);

const deriveCoCartBaseUrlFromWordpress = (wordpressUrl: string): string =>
  `${normalizeWordpressBaseUrl(wordpressUrl)}/wp-json/cocart/v2`;

const resolveServerWordpressBaseUrl = (value: string): string => {
  const normalized = normalizeWordpressBaseUrl(value);

  if (!isLoopbackBaseUrl(normalized)) {
    return normalized;
  }

  const dockerWordpressUrl = normalizeWordpressBaseUrl(
    process.env.WORDPRESS_INTERNAL_URL?.trim() || defaultDockerWordpressUrl,
  );

  if (dockerWordpressUrl !== normalized) {
    console.warn(
      "[cocart] Ignoring loopback WORDPRESS_URL for server-side requests. Using Docker-internal WordPress base URL instead.",
    );
  }

  return dockerWordpressUrl;
};

export const resolveCoCartServerBaseUrl = (): string => {
  const wordpressUrl = process.env.WORDPRESS_URL?.trim();
  const configuredCoCartUrl = process.env.COCART_API_URL?.trim();

  if (wordpressUrl) {
    const derivedBaseUrl = normalizeBaseUrl(
      deriveCoCartBaseUrlFromWordpress(resolveServerWordpressBaseUrl(wordpressUrl)),
    );

    if (configuredCoCartUrl) {
      const normalizedConfigured = normalizeBaseUrl(configuredCoCartUrl);

      if (
        normalizedConfigured !== derivedBaseUrl &&
        isLoopbackBaseUrl(normalizedConfigured)
      ) {
        console.warn(
          "[cocart] Ignoring loopback COCART_API_URL for server-side requests. Using WORDPRESS_URL-derived CoCart base URL instead.",
        );
      }
    }

    return derivedBaseUrl;
  }

  if (configuredCoCartUrl) {
    if (isLoopbackBaseUrl(configuredCoCartUrl)) {
      console.warn(
        "[cocart] Ignoring loopback COCART_API_URL for server-side requests. Using Docker-internal WordPress base URL instead.",
      );

      return normalizeBaseUrl(
        deriveCoCartBaseUrlFromWordpress(
          process.env.WORDPRESS_INTERNAL_URL?.trim() || defaultDockerWordpressUrl,
        ),
      );
    }

    return normalizeBaseUrl(configuredCoCartUrl);
  }

  throw new Error(
    "[cocart] Missing required server environment variable: WORDPRESS_URL or COCART_API_URL",
  );
};

export const readCoCartServerRuntimeConfig = (): CoCartRuntimeConfig => {
  const timeoutValue = process.env.COCART_TIMEOUT_MS;
  const timeoutMs = timeoutValue ? Number.parseInt(timeoutValue, 10) : undefined;

  return {
    baseUrl: resolveCoCartServerBaseUrl(),
    timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : undefined,
    endpoints: defaultCoCartEndpointMap,
    sessionHeaderName:
      resolveHeaderName(process.env.COCART_SESSION_HEADER_NAME) ||
      "CoCart-API-Cart-Key",
    cartTokenHeaderName: resolveHeaderName(process.env.COCART_CART_TOKEN_HEADER_NAME),
  };
};

export const resolveCoCartBaseUrl = normalizeBaseUrl;
