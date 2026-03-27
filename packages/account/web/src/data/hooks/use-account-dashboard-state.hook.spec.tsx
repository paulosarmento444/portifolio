import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import type { AccountOverviewView } from "@site/shared";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

const { useRouter, usePathname, useSearchParams } = jest.requireMock(
  "next/navigation",
) as {
  useRouter: jest.Mock;
  usePathname: jest.Mock;
  useSearchParams: jest.Mock;
};
const { useAccountDashboardState } = require("./use-account-dashboard-state.hook") as typeof import("./use-account-dashboard-state.hook");

const replace = jest.fn();

const overview: AccountOverviewView = {
  viewer: {
    id: "10",
    email: "maria@example.com",
    displayName: "Maria Silva",
    roleLabels: ["Cliente"],
  },
  customer: {
    id: "10",
    email: "conta@example.com",
    displayName: "Maria da Conta",
    billingAddress: null,
    shippingAddress: null,
  },
  orders: [],
  posts: [],
};

function HookHarness() {
  const {
    selectedMenu,
    currentMenuLabel,
    isMobileMenuOpen,
    displayName,
    userEmail,
    handleMenuClick,
    setIsMobileMenuOpen,
  } = useAccountDashboardState({ overview });

  return (
    <div>
      <div data-testid="menu">{selectedMenu}</div>
      <div data-testid="label">{currentMenuLabel}</div>
      <div data-testid="name">{displayName}</div>
      <div data-testid="email">{userEmail}</div>
      <div data-testid="mobile">{String(isMobileMenuOpen)}</div>
      <button type="button" onClick={() => handleMenuClick("addresses")}>enderecos</button>
      <button type="button" onClick={() => setIsMobileMenuOpen(true)}>abrir-menu</button>
    </div>
  );
}

describe("useAccountDashboardState", () => {
  beforeEach(() => {
    replace.mockReset();
    useRouter.mockReturnValue({ replace });
    usePathname.mockReturnValue("/my-account");
    useSearchParams.mockReturnValue({
      get: jest.fn((key: string) => (key === "menu" ? "orders" : null)),
      toString: jest.fn(() => "menu=orders"),
    });
  });

  it("deriva o menu ativo, dados visiveis e sincroniza a navegacao ao trocar de secao", () => {
    render(<HookHarness />);

    expect(screen.getByTestId("menu").textContent).toBe("orders");
    expect(screen.getByTestId("label").textContent).toBe("Pedidos");
    expect(screen.getByTestId("name").textContent).toBe("Maria da Conta");
    expect(screen.getByTestId("email").textContent).toBe("conta@example.com");

    fireEvent.click(screen.getByRole("button", { name: "abrir-menu" }));
    expect(screen.getByTestId("mobile").textContent).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "enderecos" }));

    expect(screen.getByTestId("menu").textContent).toBe("addresses");
    expect(screen.getByTestId("mobile").textContent).toBe("false");
    expect(replace).toHaveBeenCalledWith("/my-account?menu=addresses", {
      scroll: false,
    });
  });
});
