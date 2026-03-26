import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { cleanup, render, screen } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

jest.mock("./use-scroll.hook", () => ({
  useScroll: jest.fn(() => false),
}));

jest.mock("./theme-toggle-button.component", () => ({
  ThemeToggleButton: () => <button type="button">Tema</button>,
}));

jest.mock("./site-logo.component", () => ({
  SiteLogo: () => <span data-testid="site-logo">Logo</span>,
}));

jest.mock("./site-nav-links.component", () => ({
  SiteNavLinks: () => <nav data-testid="site-nav-links">Nav</nav>,
}));

jest.mock("./store-search-shortcut.component", () => ({
  StoreSearchShortcut: () => <div data-testid="site-search-shortcut">Buscar</div>,
}));

jest.mock("./site-shell.config", () => ({
  utilityNavigation: [
    {
      href: "/my-account",
      label: "Minha conta",
      description: "Pedidos, dados e endereços",
      icon: () => <span />,
    },
    {
      href: "/my-cart",
      label: "Carrinho",
      description: "Resumo e checkout",
      icon: () => <span />,
    },
  ],
}));

jest.mock("../ui", () => ({
  DrawerShell: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="drawer-shell">{children}</div> : null,
  IconButton: ({ label, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  ),
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
}));

const { SiteHeader } = require("./site-header.component") as typeof import("./site-header.component");

describe("SiteHeader", () => {
  let offsetHeightSpy: jest.SpiedGetter<number>;

  beforeEach(() => {
    document.documentElement.style.removeProperty("--site-shell-offset");
    offsetHeightSpy = jest
      .spyOn(HTMLElement.prototype, "offsetHeight", "get")
      .mockImplementation(function mockOffsetHeight(this: HTMLElement) {
        return this.getAttribute("data-testid") === "site-header" ? 156 : 44;
      });
  });

  afterEach(() => {
    cleanup();
    offsetHeightSpy.mockRestore();
    document.documentElement.style.removeProperty("--site-shell-offset");
  });

  it("renders only the first name in the header and synchronizes the shell offset", () => {
    render(<SiteHeader initialAccountName="Maria Silva" />);

    expect(screen.getByText("Maria")).toBeTruthy();
    expect(screen.queryByText("Minha conta")).toBeNull();
    expect(document.documentElement.style.getPropertyValue("--site-shell-offset")).toBe(
      "156px",
    );
  });

  it("keeps the account entry pointed at login when there is no authenticated user", () => {
    render(<SiteHeader initialAccountName="" />);

    expect(
      screen.getByRole("link", {
        name: "Entrar ou criar conta",
      }).getAttribute("href"),
    ).toBe("/auth/login");
  });
});
