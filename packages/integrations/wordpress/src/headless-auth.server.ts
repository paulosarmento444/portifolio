import "server-only";

import { serverEnv } from "@/app/lib/env.server";
import { wordpressWooRestAdapter } from "./woocommerce-rest.adapter";

export type WordpressRegisterUserInput = {
  username: string;
  password: string;
  email: string;
};

export type WordpressRegisterUserResult = {
  displayName?: string;
  slug?: string;
};

export type WordpressForgotPasswordInput = {
  usernameOrEmail: string;
};

export type WordpressForgotPasswordResult = {
  success: true;
  message: string;
};

export type WordpressResetPasswordTokenInput = {
  login: string;
  key: string;
};

export type WordpressResetPasswordTokenResult = {
  valid: true;
  login: string;
};

export type WordpressResetPasswordInput = WordpressResetPasswordTokenInput & {
  password: string;
};

export type WordpressResetPasswordResult = {
  success: true;
  message: string;
};

const HEADLESS_AUTH_BRIDGE_BASE_PATH = "/wp-json/pharmacore/v1/auth";

const buildAuthBridgeUrl = (path: string, searchParams?: URLSearchParams) => {
  const url = new URL(
    `${serverEnv.wordpress.url.replace(/\/+$/, "")}${HEADLESS_AUTH_BRIDGE_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`,
  );

  if (searchParams) {
    url.search = searchParams.toString();
  }

  return url.toString();
};

const readErrorPayloadMessage = async (
  response: Response,
  fallbackMessage: string,
) => {
  try {
    const payload = (await response.json()) as {
      code?: string;
      error?: string;
      message?: string;
    };

    return {
      code: payload.code,
      message: payload.error || payload.message || fallbackMessage,
    };
  } catch {
    return {
      message: fallbackMessage,
    };
  }
};

const createBridgeError = async (
  response: Response,
  fallbackMessage: string,
) => {
  const payload = await readErrorPayloadMessage(response, fallbackMessage);
  const error = new Error(payload.message) as Error & {
    status?: number;
    code?: string;
  };

  error.status = response.status;
  error.code = payload.code;

  return error;
};

const isMissingHeadlessRegisterRouteError = (error: unknown) =>
  error instanceof Error &&
  ((error as { status?: number }).status === 404 ||
    (error as { code?: string }).code === "rest_no_route");

const requestHeadlessAuthBridge = async <TPayload>(
  path: string,
  init: RequestInit,
  fallbackMessage: string,
): Promise<TPayload> => {
  const response = await fetch(buildAuthBridgeUrl(path), {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw await createBridgeError(response, fallbackMessage);
  }

  return (await response.json()) as TPayload;
};

export const registerWordpressUser = async (
  input: WordpressRegisterUserInput,
): Promise<WordpressRegisterUserResult> => {
  try {
    return await requestHeadlessAuthBridge<WordpressRegisterUserResult>(
      "/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      },
      "Nao foi possivel criar sua conta.",
    );
  } catch (error) {
    if (!isMissingHeadlessRegisterRouteError(error)) {
      throw error;
    }

    try {
      const customer = await wordpressWooRestAdapter.createCustomerRaw({
        email: input.email,
        username: input.username,
        password: input.password,
      });

      return {
        displayName:
          [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
          customer.username?.trim() ||
          customer.email?.trim() ||
          input.username,
        slug: customer.username?.trim() || input.username,
      };
    } catch (fallbackError) {
      const message =
        fallbackError instanceof Error &&
        typeof (fallbackError as { response?: { data?: { message?: string } } })
          .response?.data?.message === "string"
          ? (fallbackError as { response?: { data?: { message?: string } } }).response!
              .data!.message!
          : fallbackError instanceof Error
            ? fallbackError.message
            : "Nao foi possivel criar sua conta.";

      throw new Error(message);
    }
  }
};

export const requestWordpressPasswordReset = async (
  input: WordpressForgotPasswordInput,
): Promise<WordpressForgotPasswordResult> =>
  requestHeadlessAuthBridge<WordpressForgotPasswordResult>(
    "/forgot-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: input.usernameOrEmail,
      }),
    },
    "Nao foi possivel solicitar a redefinicao de senha.",
  );

export const validateWordpressPasswordResetToken = async (
  input: WordpressResetPasswordTokenInput,
): Promise<WordpressResetPasswordTokenResult> =>
  requestHeadlessAuthBridge<WordpressResetPasswordTokenResult>(
    "/reset-password/validate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
    "O link de redefinicao e invalido ou expirou.",
  );

export const resetWordpressPassword = async (
  input: WordpressResetPasswordInput,
): Promise<WordpressResetPasswordResult> =>
  requestHeadlessAuthBridge<WordpressResetPasswordResult>(
    "/reset-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
    "Nao foi possivel redefinir a senha.",
  );

export const wordpressHeadlessAuthServer = {
  registerUser: registerWordpressUser,
  requestPasswordReset: requestWordpressPasswordReset,
  validatePasswordResetToken: validateWordpressPasswordResetToken,
  resetPassword: resetWordpressPassword,
};
