"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearCoCartAuthTokens,
  cocartServerAdapter,
  persistCoCartAuthSession,
  persistCoCartAuthTokens,
  readCoCartForwardHeaders,
} from "@site/integrations/cocart/server";
import {
  registerWordpressUser,
  requestWordpressPasswordReset,
  resetWordpressPassword,
  validateWordpressPasswordResetToken,
} from "@site/integrations/wordpress/server";
import {
  authSessionViewSchema,
  forgotPasswordRequestSchema,
  passwordResetTokenSchema,
  registerCredentialsSchema,
  resetPasswordCredentialsSchema,
} from "@site/shared";

export type AuthActionState = {
  error: string;
  pending: boolean;
};

export async function getAuthSession() {
  const requestHeaders = await readCoCartForwardHeaders(await headers());

  try {
    return await cocartServerAdapter.getAuthSession(requestHeaders);
  } catch {
    return authSessionViewSchema.parse({
      isAuthenticated: false,
      user: null,
    });
  }
}

export async function loginUserAction(
  _prevState: AuthActionState,
  formData: FormData,
) {
  const username = String(
    formData.get("usernameEmail") ?? formData.get("usernameOrEmail") ?? "",
  ).trim();
  const password = String(formData.get("password") ?? "");
  const requestHeaders = await readCoCartForwardHeaders(await headers());

  try {
    const response = await cocartServerAdapter.login({
      username,
      password,
    }, requestHeaders);

    await persistCoCartAuthTokens(response.tokens);
    if (response.session.user) {
      await persistCoCartAuthSession(response.session.user);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível entrar.";

    return {
      error: message,
      pending: false,
    } satisfies AuthActionState;
  }

  redirect("/my-account");
}

export async function logoutUserAction() {
  const requestHeaders = await readCoCartForwardHeaders(await headers());

  try {
    await cocartServerAdapter.logout(requestHeaders);
  } catch {
    // Clearing local auth state is enough to log out the storefront.
  }

  await clearCoCartAuthTokens();
}

export async function registerUserAction(input: {
  username: string;
  password: string;
  email: string;
  confirmPassword: string;
}) {
  const parsedInput = registerCredentialsSchema.parse(input);

  return registerWordpressUser({
    username: parsedInput.username,
    password: parsedInput.password,
    email: parsedInput.email,
  });
}

export async function forgotPasswordAction(input: {
  usernameOrEmail: string;
}) {
  const parsedInput = forgotPasswordRequestSchema.parse(input);

  return requestWordpressPasswordReset({
    usernameOrEmail: parsedInput.usernameOrEmail,
  });
}

export async function validateResetPasswordTokenAction(input: {
  login: string;
  key: string;
}) {
  const parsedInput = passwordResetTokenSchema.parse(input);

  try {
    const result = await validateWordpressPasswordResetToken(parsedInput);

    return {
      valid: true as const,
      login: result.login,
      message: "",
    };
  } catch (error) {
    return {
      valid: false as const,
      login: parsedInput.login,
      message:
        error instanceof Error
          ? error.message
          : "O link de redefinicao e invalido ou expirou.",
    };
  }
}

export async function resetPasswordAction(input: {
  login: string;
  key: string;
  password: string;
  confirmPassword: string;
}) {
  const parsedInput = resetPasswordCredentialsSchema.parse(input);

  return resetWordpressPassword({
    login: parsedInput.login,
    key: parsedInput.key,
    password: parsedInput.password,
  });
}
