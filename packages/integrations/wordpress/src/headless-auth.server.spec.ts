import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("./woocommerce-rest.adapter", () => ({
  wordpressWooRestAdapter: {
    createCustomerRaw: jest.fn(),
  },
}));

const originalEnv = process.env;
const originalFetch = global.fetch;
const getFetchMock = () => global.fetch as unknown as jest.Mock;
const getWooAdapterMock = () =>
  jest.requireMock("./woocommerce-rest.adapter") as {
  wordpressWooRestAdapter: {
    createCustomerRaw: jest.Mock;
  };
};

describe("headless-auth.server", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      WORDPRESS_URL: "http://wordpress:80",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL: "http://localhost:8080/graphql",
    };
    global.fetch = jest.fn() as unknown as typeof fetch;
    getWooAdapterMock().wordpressWooRestAdapter.createCustomerRaw.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("registers users through the headless Woo auth bridge", async () => {
    getFetchMock().mockImplementationOnce(async () => ({
      ok: true,
      json: async () => ({
        displayName: "Maria",
        slug: "maria",
      }),
    }) as any);

    const { registerWordpressUser } = require("./headless-auth.server") as typeof import("./headless-auth.server");

    const result = await registerWordpressUser({
      username: "maria",
      password: "password-123",
      email: "maria@example.com",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://wordpress/wp-json/pharmacore/v1/auth/register",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          username: "maria",
          password: "password-123",
          email: "maria@example.com",
        }),
      }),
    );
    expect(result).toEqual({
      displayName: "Maria",
      slug: "maria",
    });
  });

  it("surfaces register bridge errors with the backend message", async () => {
    getFetchMock().mockImplementationOnce(async () => ({
      ok: false,
      json: async () => ({
        message: "O e-mail ja esta em uso.",
      }),
    }) as any);

    const { registerWordpressUser } = require("./headless-auth.server") as typeof import("./headless-auth.server");

    await expect(
      registerWordpressUser({
        username: "maria",
        password: "password-123",
        email: "maria@example.com",
      }),
    ).rejects.toThrow("O e-mail ja esta em uso.");
  });

  it("falls back to Woo REST customer creation when the headless register route is missing", async () => {
    const { wordpressWooRestAdapter } = getWooAdapterMock();

    getFetchMock().mockImplementationOnce(async () => ({
      ok: false,
      status: 404,
      json: async () => ({
        code: "rest_no_route",
        message: "Nenhuma rota foi encontrada.",
      }),
    }) as any);
    (
      wordpressWooRestAdapter.createCustomerRaw as unknown as jest.Mock
    ).mockImplementationOnce(async () => ({
      id: 25,
      email: "maria@example.com",
      username: "maria",
      first_name: "",
      last_name: "",
    }));

    const { registerWordpressUser } = require("./headless-auth.server") as typeof import("./headless-auth.server");

    const result = await registerWordpressUser({
      username: "maria",
      password: "password-123",
      email: "maria@example.com",
    });

    expect(wordpressWooRestAdapter.createCustomerRaw).toHaveBeenCalledWith({
      email: "maria@example.com",
      username: "maria",
      password: "password-123",
    });
    expect(result).toEqual({
      displayName: "maria",
      slug: "maria",
    });
  });

  it("requests forgot password through the headless auth bridge", async () => {
    getFetchMock().mockImplementationOnce(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        message: "Se a conta existir, enviaremos as instrucoes de redefinicao.",
      }),
    }) as any);

    const { requestWordpressPasswordReset } = require("./headless-auth.server") as typeof import("./headless-auth.server");

    const result = await requestWordpressPasswordReset({
      usernameOrEmail: "maria@example.com",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://wordpress/wp-json/pharmacore/v1/auth/forgot-password",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ login: "maria@example.com" }),
      }),
    );
    expect(result.success).toBe(true);
  });

  it("validates reset password tokens through the headless auth bridge", async () => {
    getFetchMock().mockImplementationOnce(async () => ({
      ok: true,
      json: async () => ({
        valid: true,
        login: "maria",
      }),
    }) as any);

    const { validateWordpressPasswordResetToken } = require("./headless-auth.server") as typeof import("./headless-auth.server");

    const result = await validateWordpressPasswordResetToken({
      login: "maria",
      key: "valid-key",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://wordpress/wp-json/pharmacore/v1/auth/reset-password/validate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          login: "maria",
          key: "valid-key",
        }),
      }),
    );
    expect(result).toEqual({
      valid: true,
      login: "maria",
    });
  });

  it("resets the password through the headless auth bridge", async () => {
    getFetchMock().mockImplementationOnce(async () => ({
      ok: true,
      json: async () => ({
        success: true,
        message: "Senha redefinida com sucesso.",
      }),
    }) as any);

    const { resetWordpressPassword } = require("./headless-auth.server") as typeof import("./headless-auth.server");

    const result = await resetWordpressPassword({
      login: "maria",
      key: "valid-key",
      password: "NovaSenha123!",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://wordpress/wp-json/pharmacore/v1/auth/reset-password",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          login: "maria",
          key: "valid-key",
          password: "NovaSenha123!",
        }),
      }),
    );
    expect(result).toEqual({
      success: true,
      message: "Senha redefinida com sucesso.",
    });
  });
});
