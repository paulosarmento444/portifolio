import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("next/headers", () => ({
  headers: jest.fn(async () => ({
    get: jest.fn(() => null),
  })),
}));

jest.mock("@site/integrations/cocart/server", () => ({
  cocartServerAdapter: {
    getAuthSession: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  },
  clearCoCartAuthTokens: jest.fn(),
  readCoCartForwardHeaders: jest.fn(async () => undefined),
}));

jest.mock("@site/integrations/wordpress/server", () => ({
  wordpressWooRestAdapter: {
    updateAccountCustomer: jest.fn(),
    updateCustomerRaw: jest.fn(),
  },
}));

const {
  cocartServerAdapter,
  clearCoCartAuthTokens,
} = jest.requireMock(
  "@site/integrations/cocart/server",
) as {
  cocartServerAdapter: {
    getAuthSession: jest.Mock;
    login: jest.Mock;
    logout: jest.Mock;
  };
  clearCoCartAuthTokens: jest.Mock;
};

const { wordpressWooRestAdapter } = jest.requireMock(
  "@site/integrations/wordpress/server",
) as {
  wordpressWooRestAdapter: {
    updateAccountCustomer: jest.Mock;
    updateCustomerRaw: jest.Mock;
  };
};

const {
  updateAccountProfileAction,
  changeAccountPasswordAction,
  logoutAccountAction,
  saveAccountAddressAction,
} = require("./account.actions") as typeof import("./account.actions");

describe("account.actions", () => {
  beforeEach(() => {
    cocartServerAdapter.getAuthSession.mockReset();
    cocartServerAdapter.login.mockReset();
    cocartServerAdapter.logout.mockReset();
    clearCoCartAuthTokens.mockReset();
    wordpressWooRestAdapter.updateAccountCustomer.mockReset();
    wordpressWooRestAdapter.updateCustomerRaw.mockReset();
  });

  it("updates the account profile through the Woo compatibility bridge", async () => {
    (wordpressWooRestAdapter.updateAccountCustomer as any).mockResolvedValueOnce({
      id: "10",
      email: "maria@example.com",
      displayName: "Maria",
      billingAddress: null,
      shippingAddress: null,
    });

    const result = await updateAccountProfileAction("10", {
      first_name: "Maria",
      last_name: "Silva",
      email: "maria@example.com",
      phone: "11999999999",
      city: "São Paulo",
    });

    expect(wordpressWooRestAdapter.updateAccountCustomer).toHaveBeenCalledWith(
      "10",
      {
        billing: {
          first_name: "Maria",
          last_name: "Silva",
          email: "maria@example.com",
          phone: "11999999999",
          city: "São Paulo",
        },
        email: "maria@example.com",
        first_name: "Maria",
        last_name: "Silva",
      },
    );
    expect(result).toEqual({
      success: true,
      customer: {
        id: "10",
        email: "maria@example.com",
        displayName: "Maria",
        billingAddress: null,
        shippingAddress: null,
      },
    });
  });

  it("updates addresses through the Woo compatibility bridge", async () => {
    (wordpressWooRestAdapter.updateAccountCustomer as any).mockResolvedValueOnce({
      id: "10",
      email: "maria@example.com",
      displayName: "Maria",
      billingAddress: null,
      shippingAddress: null,
    });

    const result = await saveAccountAddressAction("10", "shipping", {
      first_name: "Maria",
      last_name: "Silva",
      address_1: "Rua Principal",
      address_2: "Apto 12",
      city: "São Paulo",
      state: "SP",
      postcode: "01000-000",
      country: "BR",
      phone: "11999999999",
      email: "maria@example.com",
    });

    expect(wordpressWooRestAdapter.updateAccountCustomer).toHaveBeenCalledWith(
      "10",
      {
        shipping: {
          first_name: "Maria",
          last_name: "Silva",
          address_1: "Rua Principal",
          address_2: "Apto 12",
          city: "São Paulo",
          state: "SP",
          postcode: "01000-000",
          country: "BR",
          phone: "11999999999",
        },
      },
    );
    expect(result.success).toBe(true);
  });

  it("normalizes a full state name into UF before sending the address payload", async () => {
    (wordpressWooRestAdapter.updateAccountCustomer as any).mockResolvedValueOnce({
      id: "10",
      email: "maria@example.com",
      displayName: "Maria",
      billingAddress: null,
      shippingAddress: null,
    });

    await saveAccountAddressAction("10", "billing", {
      first_name: "Maria",
      last_name: "Silva",
      address_1: "Rua Principal",
      address_2: "Apto 12",
      city: "Sao Paulo",
      state: "Rio de Janeiro",
      postcode: "01000-000",
      country: "BR",
      phone: "11999999999",
      email: "maria@example.com",
    });

    expect(wordpressWooRestAdapter.updateAccountCustomer).toHaveBeenCalledWith(
      "10",
      {
        billing: expect.objectContaining({
          state: "RJ",
        }),
      },
    );
  });

  it("rejects invalid state values before reaching the backend", async () => {
    const result = await saveAccountAddressAction("10", "billing", {
      first_name: "Maria",
      last_name: "Silva",
      address_1: "Rua Principal",
      address_2: "Apto 12",
      city: "Sao Paulo",
      state: "Estado Invalido",
      postcode: "01000-000",
      country: "BR",
      phone: "11999999999",
      email: "maria@example.com",
    });

    expect(wordpressWooRestAdapter.updateAccountCustomer).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: "Selecione um estado valido.",
      fieldErrors: {
        state: "Selecione um estado valido.",
      },
    });
  });

  it("rejects invalid password payloads before reaching the backend", async () => {
    const result = await changeAccountPasswordAction({
      customerId: "10",
      currentPassword: "",
      newPassword: "nova",
      confirmPassword: "diferente",
    });

    expect(cocartServerAdapter.getAuthSession).not.toHaveBeenCalled();
    expect(wordpressWooRestAdapter.updateCustomerRaw).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: "Informe sua senha atual.",
      fieldErrors: {
        current_password: "Informe sua senha atual.",
        new_password: "A nova senha precisa ter pelo menos 8 caracteres.",
        confirm_password: "As senhas precisam coincidir.",
      },
    });
  });

  it("rejects password changes when the new password matches the current one", async () => {
    const result = await changeAccountPasswordAction({
      customerId: "10",
      currentPassword: "senha-atual-123",
      newPassword: "senha-atual-123",
      confirmPassword: "senha-atual-123",
    });

    expect(cocartServerAdapter.getAuthSession).not.toHaveBeenCalled();
    expect(wordpressWooRestAdapter.updateCustomerRaw).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: "A nova senha precisa ser diferente da senha atual.",
      fieldErrors: {
        new_password: "A nova senha precisa ser diferente da senha atual.",
      },
    });
  });

  it("rejects password changes when the authenticated session is missing", async () => {
    (cocartServerAdapter.getAuthSession as any).mockResolvedValueOnce({
      isAuthenticated: false,
      user: null,
    });

    const result = await changeAccountPasswordAction({
      customerId: "10",
      currentPassword: "senha-atual-123",
      newPassword: "nova-senha-123",
      confirmPassword: "nova-senha-123",
    });

    expect(result).toEqual({
      success: false,
      error: "Sua sessao expirou. Entre novamente para alterar a senha.",
    });
    expect(wordpressWooRestAdapter.updateCustomerRaw).not.toHaveBeenCalled();
  });

  it("rejects password changes when the current password is invalid", async () => {
    (cocartServerAdapter.getAuthSession as any).mockResolvedValueOnce({
      isAuthenticated: true,
      user: {
        id: "10",
        email: "maria@example.com",
        username: "maria",
      },
    });
    (cocartServerAdapter.login as any).mockRejectedValueOnce({
      response: { status: 403 },
      message: "Authentication failed.",
    });

    const result = await changeAccountPasswordAction({
      customerId: "10",
      currentPassword: "senha-errada-123",
      newPassword: "nova-senha-123",
      confirmPassword: "nova-senha-123",
    });

    expect(cocartServerAdapter.login).toHaveBeenCalledWith({
      username: "maria@example.com",
      password: "senha-errada-123",
    });
    expect(wordpressWooRestAdapter.updateCustomerRaw).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: "A senha atual informada esta incorreta.",
      fieldErrors: {
        current_password: "A senha atual informada esta incorreta.",
      },
    });
  });

  it("updates the account password only after validating the current password", async () => {
    (cocartServerAdapter.getAuthSession as any).mockResolvedValueOnce({
      isAuthenticated: true,
      user: {
        id: "10",
        email: "maria@example.com",
        username: "maria",
      },
    });
    (cocartServerAdapter.login as any).mockResolvedValueOnce({
      session: {
        isAuthenticated: true,
        user: {
          id: "10",
        },
      },
      tokens: {
        accessToken: "jwt-token",
      },
    });
    (wordpressWooRestAdapter.updateCustomerRaw as any).mockResolvedValueOnce({});

    const result = await changeAccountPasswordAction({
      customerId: "10",
      currentPassword: "senha-atual-123",
      newPassword: "nova-senha-123",
      confirmPassword: "nova-senha-123",
    });

    expect(cocartServerAdapter.login).toHaveBeenCalledWith({
      username: "maria@example.com",
      password: "senha-atual-123",
    });
    expect(wordpressWooRestAdapter.updateCustomerRaw).toHaveBeenCalledWith("10", {
      password: "nova-senha-123",
    });
    expect(result).toEqual({ success: true });
  });

  it("clears CoCart auth state during account logout", async () => {
    (cocartServerAdapter.logout as any).mockResolvedValueOnce(undefined);

    await logoutAccountAction();

    expect(cocartServerAdapter.logout).toHaveBeenCalledTimes(1);
    expect(clearCoCartAuthTokens).toHaveBeenCalledTimes(1);
  });
});
