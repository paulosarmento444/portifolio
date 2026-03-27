import "server-only";
import crypto from "node:crypto";
import axios from "axios";
import { serverEnv } from "@site/shared/server";

export const woocommerceClient = axios.create({
  baseURL: `${serverEnv.wordpress.url}/wp-json/wc/v3`,
});

const resolveAxiosRequestUrl = (config: { url?: string; baseURL?: string }) => {
  const baseUrl = (config.baseURL ?? woocommerceClient.defaults.baseURL ?? "").trim();
  const requestUrl = (config.url ?? "").trim();

  if (!baseUrl) {
    return new URL(requestUrl);
  }

  if (!requestUrl) {
    return new URL(baseUrl);
  }

  if (/^https?:\/\//i.test(requestUrl)) {
    return new URL(requestUrl);
  }

  return new URL(
    `${baseUrl.replace(/\/+$/, "")}/${requestUrl.replace(/^\/+/, "")}`,
  );
};

const encodeOAuthValue = (value: string) =>
  encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );

const normalizeParams = (params?: Record<string, unknown>) =>
  Object.entries(params ?? {})
    .filter(([, value]) => value !== undefined && value !== null)
    .flatMap(([key, value]) =>
      Array.isArray(value)
        ? value.map((item) => [key, String(item)] as const)
        : [[key, String(value)] as const],
    )
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => {
      if (leftKey === rightKey) {
        return leftValue.localeCompare(rightValue);
      }

      return leftKey.localeCompare(rightKey);
    });

const buildWooOAuthParameterString = (params?: Record<string, unknown>) =>
  normalizeParams(params)
    .map(([key, value]) =>
      encodeOAuthValue(`${encodeOAuthValue(key)}=${encodeOAuthValue(value)}`),
    )
    .join("%26");

const buildSignatureBaseRequestUrl = (input: URL) => {
  const publicBaseUrl = new URL(serverEnv.wordpress.publicUrl);

  return `${publicBaseUrl.protocol}//${publicBaseUrl.host}${input.pathname}`;
};

woocommerceClient.interceptors.request.use((config) => {
  const requestUrl = resolveAxiosRequestUrl(config);
  const existingParams = Object.fromEntries(requestUrl.searchParams.entries());
  const oauthParams = {
    oauth_consumer_key: serverEnv.wordpress.wooConsumerKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA256",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
  };

  const params = {
    ...existingParams,
    ...((config.params ?? {}) as Record<string, unknown>),
    ...oauthParams,
  };

  const baseString = [
    (config.method ?? "get").toUpperCase(),
    encodeOAuthValue(buildSignatureBaseRequestUrl(requestUrl)),
    buildWooOAuthParameterString(params),
  ].join("&");

  const signature = crypto
    .createHmac("sha256", `${serverEnv.wordpress.wooConsumerSecret}&`)
    .update(baseString)
    .digest("base64");

  return {
    ...config,
    params: {
      ...params,
      oauth_signature: signature,
    },
  };
});

export const wooRestClientInternals = {
  resolveAxiosRequestUrl,
};
