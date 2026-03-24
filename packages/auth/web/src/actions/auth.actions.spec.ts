import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("next/headers", () => ({
  headers: jest.fn(async () => ({
    get: jest.fn(() => null),
  })),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@site/integrations/cocart/server", () => ({
  cocartServerAdapter: {
    getAuthSession: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  },
  clearCoCartAuthTokens: jest.fn(),
  persistCoCartAuthSession: jest.fn(),
  persistCoCartAuthTokens: jest.fn(),
  readCoCartForwardHeaders: jest.fn(async () => undefined),
}));

jest.mock("@site/integrations/wordpress/server", () => ({
  registerWordpressUser: jest.fn(),
  requestWordpressPasswordReset: jest.fn(),
  validateWordpressPasswordResetToken: jest.fn(),
  resetWordpressPassword: jest.fn(),
}));

const { redirect } = jest.requireMock("next/navigation") as {
  redirect: jest.Mock;
};

const {
  cocartServerAdapter,
  clearCoCartAuthTokens,
  persistCoCartAuthSession,
  persistCoCartAuthTokens,
} = jest.requireMock("@site/integrations/cocart/server") as {
  cocartServerAdapter: {
    getAuthSession: any;
    login: any;
    logout: any;
  };
  clearCoCartAuthTokens: any;
  persistCoCartAuthSession: any;
  persistCoCartAuthTokens: any;
};

const {
  registerWordpressUser,
  requestWordpressPasswordReset,
  validateWordpressPasswordResetToken,
  resetWordpressPassword,
} = jest.requireMock("@site/integrations/wordpress/server") as {
  registerWordpressUser: any;
  requestWordpressPasswordReset: any;
  validateWordpressPasswordResetToken: any;
  resetWordpressPassword: any;
};

const {
  forgotPasswordAction,
  getAuthSession,
  loginUserAction,
  logoutUserAction,
  registerUserAction,
  resetPasswordAction,
  validateResetPasswordTokenAction,
} = require("./auth.actions") as typeof import("./auth.actions");

describe("auth.actions", () => {
  beforeEach(() => {
    redirect.mockReset();
    cocartServerAdapter.getAuthSession.mockReset();
    cocartServerAdapter.login.mockReset();
    cocartServerAdapter.logout.mockReset();
    clearCoCartAuthTokens.mockReset();
    persistCoCartAuthSession.mockReset();
    persistCoCartAuthTokens.mockReset();
    registerWordpressUser.mockReset();
    requestWordpressPasswordReset.mockReset();
    validateWordpressPasswordResetToken.mockReset();
    resetWordpressPassword.mockReset();
  });

  it("prefers the CoCart auth session when it resolves an authenticated user", async () => {
    cocartServerAdapter.getAuthSession.mockResolvedValueOnce({
      isAuthenticated: true,
      user: {
        id: "1",
        displayName: "Maria",
        roleLabels: [],
      },
    });

    const session = await getAuthSession();

    expect(session).toMatchObject({
      isAuthenticated: true,
      user: {
        id: "1",
        displayName: "Maria",
      },
    });
  });

  it("returns an unauthenticated session when the CoCart auth check cannot resolve a user", async () => {
    cocartServerAdapter.getAuthSession.mockRejectedValueOnce(new Error("cart unavailable"));

    const session = await getAuthSession();

    expect(session).toEqual({
      isAuthenticated: false,
      user: null,
    });
  });

  it("uses CoCart login and returns a proper error message on invalid credentials", async () => {
    cocartServerAdapter.login.mockRejectedValueOnce(
      new Error("Credenciais inválidas"),
    );

    const formData = new FormData();
    formData.set("usernameOrEmail", "maria@example.com");
    formData.set("password", "password-123");

    const result = await loginUserAction(
      { error: "", pending: false },
      formData,
    );

    expect(cocartServerAdapter.login).toHaveBeenCalledWith({
      username: "maria@example.com",
      password: "password-123",
    }, undefined);
    expect(result).toEqual({
      error: "Credenciais inválidas",
      pending: false,
    });
  });

  it("persists CoCart auth tokens and redirects to my-account after a successful login", async () => {
    cocartServerAdapter.login.mockResolvedValueOnce({
      session: {
        isAuthenticated: true,
        user: {
          id: "1",
          displayName: "Maria",
          roleLabels: [],
        },
      },
      tokens: {
        accessToken: "jwt-token",
        refreshToken: "refresh-token",
      },
    });

    const formData = new FormData();
    formData.set("usernameEmail", "maria@example.com");
    formData.set("password", "password-123");

    await loginUserAction({ error: "", pending: false }, formData);

    expect(persistCoCartAuthTokens).toHaveBeenCalledWith({
      accessToken: "jwt-token",
      refreshToken: "refresh-token",
    });
    expect(persistCoCartAuthSession).toHaveBeenCalledWith({
      id: "1",
      displayName: "Maria",
      roleLabels: [],
    });
    expect(cocartServerAdapter.login).toHaveBeenCalledWith(
      {
        username: "maria@example.com",
        password: "password-123",
      },
      undefined,
    );
    expect(redirect).toHaveBeenCalledWith("/my-account");
  });

  it("clears CoCart auth state during logout", async () => {
    cocartServerAdapter.logout.mockResolvedValueOnce(undefined);

    await logoutUserAction();

    expect(cocartServerAdapter.logout).toHaveBeenCalledTimes(1);
    expect(clearCoCartAuthTokens).toHaveBeenCalledTimes(1);
  });

  it("normalizes register input through the auth action and delegates compatibility registration", async () => {
    registerWordpressUser.mockResolvedValueOnce({
      displayName: "Maria",
      slug: "maria",
    });

    const result = await registerUserAction({
      username: "maria",
      password: "password-123",
      email: "maria@example.com",
      confirmPassword: "password-123",
    });

    expect(registerWordpressUser).toHaveBeenCalledWith({
      username: "maria",
      password: "password-123",
      email: "maria@example.com",
    });
    expect(result).toEqual({
      displayName: "Maria",
      slug: "maria",
    });
  });

  it("delegates forgot password to the headless WordPress bridge", async () => {
    requestWordpressPasswordReset.mockResolvedValueOnce({
      success: true,
      message:
        "Se a conta existir, enviaremos as instrucoes de redefinicao.",
    });

    const result = await forgotPasswordAction({
      usernameOrEmail: "maria@example.com",
    });

    expect(requestWordpressPasswordReset).toHaveBeenCalledWith({
      usernameOrEmail: "maria@example.com",
    });
    expect(result).toEqual({
      success: true,
      message:
        "Se a conta existir, enviaremos as instrucoes de redefinicao.",
    });
  });

  it("returns an invalid state instead of throwing when the reset token is invalid", async () => {
    validateWordpressPasswordResetToken.mockRejectedValueOnce(
      new Error("O link de redefinicao e invalido ou expirou."),
    );

    const result = await validateResetPasswordTokenAction({
      login: "maria",
      key: "expired-key",
    });

    expect(result).toEqual({
      valid: false,
      login: "maria",
      message: "O link de redefinicao e invalido ou expirou.",
    });
  });

  it("delegates password reset to the WordPress bridge after validating matching passwords", async () => {
    resetWordpressPassword.mockResolvedValueOnce({
      success: true,
      message: "Senha redefinida com sucesso.",
    });

    const result = await resetPasswordAction({
      login: "maria",
      key: "valid-key",
      password: "NovaSenha123!",
      confirmPassword: "NovaSenha123!",
    });

    expect(resetWordpressPassword).toHaveBeenCalledWith({
      login: "maria",
      key: "valid-key",
      password: "NovaSenha123!",
    });
    expect(result).toEqual({
      success: true,
      message: "Senha redefinida com sucesso.",
    });
  });
});
