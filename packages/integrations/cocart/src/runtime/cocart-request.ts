import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { authUserViewSchema, type AuthUserView } from "@site/shared";
import type { CoCartRequestHeaders } from "../clients/cocart-http.client";

export const cocartAuthCookieNames = {
  accessToken: "cocart_auth_token",
  refreshToken: "cocart_auth_refresh",
  session: "cocart_auth_session",
} as const;

type HeaderSource = {
  get(name: string): string | null;
};

type CoCartVerifiedTokenUser = {
  id?: string;
  username?: string;
};

type CoCartPersistedSessionPayload = {
  exp: number;
  user: AuthUserView;
};

export const getCoCartJwtVerificationSecret = () => {
  const encodedSecret = process.env.COCART_JWT_AUTH_SECRET_KEY_BASE64?.trim();

  if (encodedSecret) {
    try {
      return Buffer.from(encodedSecret, "base64").toString("utf8").trim();
    } catch {
      return undefined;
    }
  }

  return process.env.COCART_JWT_AUTH_SECRET_KEY?.trim() || undefined;
};

const getCoCartSessionSigningSecret = () =>
  process.env.FAUST_SECRET_KEY?.trim() || getCoCartJwtVerificationSecret();

const FORWARDED_HEADER_MAP = [
  ["cookie", "Cookie"],
  ["authorization", "Authorization"],
  ["user-agent", "User-Agent"],
  ["accept-language", "Accept-Language"],
  ["origin", "Origin"],
  ["referer", "Referer"],
  ["sec-fetch-dest", "Sec-Fetch-Dest"],
  ["sec-fetch-mode", "Sec-Fetch-Mode"],
  ["sec-fetch-site", "Sec-Fetch-Site"],
  ["x-wp-nonce", "X-WP-Nonce"],
] as const;

export const pickCoCartForwardHeaders = (
  source?: HeaderSource | null,
): CoCartRequestHeaders | undefined => {
  if (!source) {
    return undefined;
  }

  const headers: CoCartRequestHeaders = {};

  for (const [inputName, outputName] of FORWARDED_HEADER_MAP) {
    const value = source.get(inputName);

    if (value?.trim()) {
      headers[outputName] = value;
    }
  }

  return Object.keys(headers).length > 0 ? headers : undefined;
};

export const readCoCartForwardHeaders = async (
  source?: HeaderSource | null,
): Promise<CoCartRequestHeaders | undefined> => {
  const forwardedHeaders = pickCoCartForwardHeaders(source) ?? {};
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(cocartAuthCookieNames.accessToken)?.value?.trim();

  if (accessToken && !forwardedHeaders.Authorization) {
    forwardedHeaders.Authorization = `Bearer ${accessToken}`;
  }

  return Object.keys(forwardedHeaders).length > 0 ? forwardedHeaders : undefined;
};

const readCookieValueFromHeader = (cookieHeader: string, cookieName: string) => {
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");

    if (rawName !== cookieName) {
      continue;
    }

    return rawValue.join("=").trim() || undefined;
  }

  return undefined;
};

const parsePersistedSessionCookie = (
  rawValue?: string | null,
): AuthUserView | null => {
  const signingSecret = getCoCartSessionSigningSecret();

  if (!rawValue || !signingSecret) {
    return null;
  }

  const [encodedPayload, signature] = rawValue.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", signingSecret)
    .update(encodedPayload)
    .digest("base64url");

  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSignature, "utf8"),
    )
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as CoCartPersistedSessionPayload;

    if (
      !payload ||
      typeof payload.exp !== "number" ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return authUserViewSchema.parse(payload.user);
  } catch {
    return null;
  }
};

export const readCoCartPersistedAuthSessionFromCookieHeader = (
  cookieHeader?: string | null,
): AuthUserView | null => {
  if (!cookieHeader?.trim()) {
    return null;
  }

  return parsePersistedSessionCookie(
    readCookieValueFromHeader(cookieHeader, cocartAuthCookieNames.session),
  );
};

export const readCoCartPersistedAuthSession = async (
  source?: HeaderSource | null,
): Promise<AuthUserView | null> => {
  const cookieHeader = source?.get("cookie")?.trim();

  if (cookieHeader) {
    return readCoCartPersistedAuthSessionFromCookieHeader(cookieHeader);
  }

  const cookieStore = await cookies();
  return parsePersistedSessionCookie(
    cookieStore.get(cocartAuthCookieNames.session)?.value?.trim(),
  );
};

export const readCoCartAccessToken = async (
  source?: HeaderSource | null,
): Promise<string | undefined> => {
  const authorizationHeader = source?.get("authorization")?.trim();

  if (authorizationHeader?.toLowerCase().startsWith("bearer ")) {
    return authorizationHeader.replace(/^Bearer\s+/i, "").trim() || undefined;
  }

  const cookieHeader = source?.get("cookie")?.trim();

  if (cookieHeader) {
    const tokenFromHeader = readCookieValueFromHeader(
      cookieHeader,
      cocartAuthCookieNames.accessToken,
    );

    if (tokenFromHeader) {
      return tokenFromHeader;
    }
  }

  const cookieStore = await cookies();
  return cookieStore.get(cocartAuthCookieNames.accessToken)?.value?.trim() || undefined;
};

export const verifyCoCartAccessToken = (
  token?: string | null,
): CoCartVerifiedTokenUser | null => {
  if (!token) {
    return null;
  }

  const signingSecret = getCoCartJwtVerificationSecret();

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
    const payload = JSON.parse(
      Buffer.from(rawPayload, "base64url").toString("utf8"),
    ) as {
      exp?: number;
      nbf?: number;
      data?: {
        user?: {
          id?: string | number;
          username?: string;
        };
      };
    };
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (
      (typeof payload.nbf === "number" && payload.nbf > nowInSeconds) ||
      (typeof payload.exp === "number" && payload.exp <= nowInSeconds)
    ) {
      return null;
    }

    return {
      id:
        payload.data?.user?.id === undefined ||
        payload.data.user.id === null ||
        payload.data.user.id === ""
          ? undefined
          : String(payload.data.user.id),
      username: payload.data?.user?.username?.trim() || undefined,
    };
  } catch {
    return null;
  }
};

const cookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7,
};

export const persistCoCartAuthSession = async (user: AuthUserView) => {
  const signingSecret = getCoCartSessionSigningSecret();

  if (!signingSecret) {
    return;
  }

  const payload: CoCartPersistedSessionPayload = {
    exp: Math.floor(Date.now() / 1000) + cookieOptions.maxAge,
    user: authUserViewSchema.parse(user),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signature = crypto
    .createHmac("sha256", signingSecret)
    .update(encodedPayload)
    .digest("base64url");
  const cookieStore = await cookies();

  cookieStore.set(
    cocartAuthCookieNames.session,
    `${encodedPayload}.${signature}`,
    cookieOptions,
  );
};

export const persistCoCartAuthTokens = async (tokens: {
  accessToken: string;
  refreshToken?: string;
}) => {
  const cookieStore = await cookies();

  cookieStore.set(cocartAuthCookieNames.accessToken, tokens.accessToken, cookieOptions);

  if (tokens.refreshToken?.trim()) {
    cookieStore.set(
      cocartAuthCookieNames.refreshToken,
      tokens.refreshToken.trim(),
      cookieOptions,
    );
  } else {
    cookieStore.delete(cocartAuthCookieNames.refreshToken);
  }
};

export const clearCoCartAuthTokens = async () => {
  const cookieStore = await cookies();

  cookieStore.delete(cocartAuthCookieNames.accessToken);
  cookieStore.delete(cocartAuthCookieNames.refreshToken);
  cookieStore.delete(cocartAuthCookieNames.session);
};
