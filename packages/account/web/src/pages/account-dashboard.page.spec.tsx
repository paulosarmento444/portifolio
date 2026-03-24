import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

jest.mock("next/headers", () => ({
  headers: jest.fn(async () => ({
    get: jest.fn(() => null),
  })),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

jest.mock("@site/integrations/cocart/server", () => ({
  cocartServerAdapter: {
    getSessionState: jest.fn(),
    getCartState: jest.fn(),
  },
  readCoCartForwardHeaders: jest.fn(async () => undefined),
  isCoCartCompatibilityFallbackError: jest.fn(
    (error: Error & { response?: { status?: number } }) => [404, 405, 501].includes(error?.response?.status || 0),
  ),
}));

jest.mock("@site/integrations/wordpress/server", () => ({
  wordpressWooRestAdapter: {
    getOrdersByCustomer: jest.fn(),
    getAccountCustomer: jest.fn(),
  },
}));

jest.mock("../components/account-dashboard.client", () => ({
  AccountDashboardClient: ({ overview }: { overview: { orders: unknown[] } }) => (
    <div data-testid="account-dashboard">{overview.orders.length}</div>
  ),
}));

const { redirect } = jest.requireMock("next/navigation") as {
  redirect: jest.Mock;
};

const {
  cocartServerAdapter,
} = jest.requireMock("@site/integrations/cocart/server") as {
  cocartServerAdapter: {
    getSessionState: jest.MockedFunction<() => Promise<unknown>>;
    getCartState: jest.MockedFunction<(...args: unknown[]) => Promise<unknown>>;
  };
};

const { wordpressWooRestAdapter } = jest.requireMock(
  "@site/integrations/wordpress/server",
) as {
  wordpressWooRestAdapter: {
    getOrdersByCustomer: jest.MockedFunction<(...args: unknown[]) => Promise<unknown>>;
    getAccountCustomer: jest.MockedFunction<(...args: unknown[]) => Promise<unknown>>;
  };
};

const { AccountDashboardPage } = require("./account-dashboard.page") as typeof import("./account-dashboard.page");

describe("account dashboard page", () => {
  beforeEach(() => {
    redirect.mockClear();
    cocartServerAdapter.getSessionState.mockReset();
    cocartServerAdapter.getCartState.mockReset();
    wordpressWooRestAdapter.getOrdersByCustomer.mockReset();
    wordpressWooRestAdapter.getAccountCustomer.mockReset();
  });

  it("redirects unauthenticated users to login", async () => {
    cocartServerAdapter.getSessionState.mockResolvedValueOnce({
      capabilities: {
        catalog: "unverified",
        cart: "unverified",
        coupons: "unverified",
        shipping: "unverified",
        totals: "unverified",
        account: "unverified",
        auth: "unverified",
      },
      session: {
        isAuthenticated: false,
        user: null,
      },
    });
    await expect(AccountDashboardPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/auth/login");
  });

  it("renders the account dashboard from CoCart session and cart state", async () => {
    cocartServerAdapter.getSessionState.mockResolvedValueOnce({
      capabilities: {
        catalog: "unverified",
        cart: "unverified",
        coupons: "unverified",
        shipping: "unverified",
        totals: "unverified",
        account: "unverified",
        auth: "unverified",
      },
      session: {
        isAuthenticated: true,
        user: {
          id: "10",
          displayName: "Maria",
          roleLabels: [],
        },
      },
    });
    cocartServerAdapter.getCartState.mockResolvedValueOnce({
      customer: {
        id: "0",
        email: "maria@example.com",
        displayName: "Maria",
        billingAddress: null,
        shippingAddress: null,
      },
    });
    wordpressWooRestAdapter.getOrdersByCustomer.mockResolvedValueOnce([
      {
        id: 77,
        number: "77",
        status: {
          code: "processing",
          label: "Processando",
        },
        total: {
          amount: 49.9,
          currencyCode: "BRL",
          formatted: "R$ 49,90",
        },
        createdAt: "2026-03-14T10:00:00.000Z",
        paymentMethodTitle: "PIX",
        items: [],
      },
    ]);
    wordpressWooRestAdapter.getAccountCustomer.mockResolvedValueOnce({
      id: "10",
      email: "maria@example.com",
      displayName: "Maria Silva",
      billingAddress: {
        firstName: "Maria",
      },
      shippingAddress: null,
    });

    render(await AccountDashboardPage());

    expect(wordpressWooRestAdapter.getOrdersByCustomer).toHaveBeenCalledWith(10);
    expect(wordpressWooRestAdapter.getAccountCustomer).toHaveBeenCalledWith(10);
    expect(screen.getByTestId("account-dashboard").textContent).toBe("1");
  });

  it("renders a minimal account overview when the authenticated cart has no customer details", async () => {
    cocartServerAdapter.getSessionState.mockResolvedValueOnce({
      capabilities: {
        catalog: "unverified",
        cart: "unverified",
        coupons: "unverified",
        shipping: "unverified",
        totals: "unverified",
        account: "unverified",
        auth: "unverified",
      },
      session: {
        isAuthenticated: true,
        user: {
          id: "10",
          displayName: "Maria",
          email: "maria@example.com",
          roleLabels: [],
        },
      },
    });
    cocartServerAdapter.getCartState.mockResolvedValueOnce({
      customer: null,
    });
    wordpressWooRestAdapter.getOrdersByCustomer.mockResolvedValueOnce([]);
    wordpressWooRestAdapter.getAccountCustomer.mockRejectedValueOnce(
      new Error("Woo unavailable"),
    );

    render(await AccountDashboardPage());

    expect(screen.getByTestId("account-dashboard").textContent).toBe("0");
  });

  it("reads Woo orders directly even when CoCart account capability is unsupported", async () => {
    cocartServerAdapter.getSessionState.mockResolvedValueOnce({
      capabilities: {
        catalog: "unverified",
        cart: "unverified",
        coupons: "unverified",
        shipping: "unverified",
        totals: "unverified",
        account: "unsupported",
        auth: "unverified",
      },
      session: {
        isAuthenticated: true,
        user: {
          id: "10",
          displayName: "Maria",
          email: "maria@example.com",
          roleLabels: [],
        },
      },
    });
    cocartServerAdapter.getCartState.mockResolvedValueOnce({
      customer: null,
    });
    wordpressWooRestAdapter.getOrdersByCustomer.mockResolvedValueOnce([
      {
        id: 501,
        number: "501",
        status: {
          code: "completed",
          label: "Concluído",
        },
        total: {
          amount: 89.9,
          currencyCode: "BRL",
          formatted: "R$ 89,90",
        },
        createdAt: "2026-03-14T10:00:00.000Z",
        paymentMethodTitle: "PIX",
        items: [],
      },
    ]);
    wordpressWooRestAdapter.getAccountCustomer.mockRejectedValueOnce(
      new Error("Woo unavailable"),
    );

    render(await AccountDashboardPage());

    expect(wordpressWooRestAdapter.getOrdersByCustomer).toHaveBeenCalledWith(10);
    expect(screen.getByTestId("account-dashboard").textContent).toBe("1");
  });

  it("keeps the dashboard accessible when CoCart JWT auth is misconfigured upstream", async () => {
    cocartServerAdapter.getSessionState.mockResolvedValueOnce({
      capabilities: {
        catalog: "unverified",
        cart: "unverified",
        coupons: "unverified",
        shipping: "unverified",
        totals: "unverified",
        account: "unverified",
        auth: "unverified",
      },
      session: {
        isAuthenticated: true,
        user: {
          id: "10",
          displayName: "Maria",
          email: "maria@example.com",
          roleLabels: [],
        },
      },
    });
    cocartServerAdapter.getCartState.mockRejectedValueOnce(
      Object.assign(new Error("JWT configuration error."), {
        response: {
          status: 403,
          data: {
            code: "cocart_jwt_auth_bad_config",
          },
        },
      }),
    );
    wordpressWooRestAdapter.getOrdersByCustomer.mockResolvedValueOnce([]);
    wordpressWooRestAdapter.getAccountCustomer.mockResolvedValueOnce({
      id: "10",
      email: "maria@example.com",
      displayName: "Maria Silva",
      billingAddress: null,
      shippingAddress: null,
    });

    render(await AccountDashboardPage());

    expect(wordpressWooRestAdapter.getOrdersByCustomer).toHaveBeenCalledWith(10);
    expect(wordpressWooRestAdapter.getAccountCustomer).toHaveBeenCalledWith(10);
    expect(screen.getByTestId("account-dashboard").textContent).toBe("0");
  });
});
