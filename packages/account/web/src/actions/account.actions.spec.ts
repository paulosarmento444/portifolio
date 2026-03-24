import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("next/headers", () => ({
  headers: jest.fn(async () => ({
    get: jest.fn(() => null),
  })),
}));

jest.mock("@site/integrations/cocart/server", () => ({
  cocartServerAdapter: {
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

  it("updates the account password through the Woo compatibility bridge", async () => {
    (wordpressWooRestAdapter.updateCustomerRaw as any).mockResolvedValueOnce({});

    const result = await changeAccountPasswordAction(
      "10",
      "senha-atual",
      "nova-senha-123",
    );

    expect(wordpressWooRestAdapter.updateCustomerRaw).toHaveBeenCalledWith(
      "10",
      {
        password: "nova-senha-123",
      },
    );
    expect(result).toEqual({ success: true });
  });

  it("clears CoCart auth state during account logout", async () => {
    (cocartServerAdapter.logout as any).mockResolvedValueOnce(undefined);

    await logoutAccountAction();

    expect(cocartServerAdapter.logout).toHaveBeenCalledTimes(1);
    expect(clearCoCartAuthTokens).toHaveBeenCalledTimes(1);
  });
});
