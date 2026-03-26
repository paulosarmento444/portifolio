import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { cleanup, render, screen } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

jest.mock("../hooks/useScroll", () => ({
  useScroll: jest.fn(() => false),
}));

jest.mock("./Logo", () => ({
  Logo: () => <span data-testid="site-logo">Logo</span>,
}));

jest.mock("./NavLinks", () => ({
  NavLinks: () => <nav data-testid="site-nav-links">Nav</nav>,
}));

jest.mock("./ShellSearchShortcut", () => ({
  ShellSearchShortcut: () => <div data-testid="site-search-shortcut">Buscar</div>,
}));

jest.mock("./ThemeToggleButton", () => ({
  ThemeToggleButton: () => <button type="button">Tema</button>,
}));

jest.mock("@site/shared", () => ({
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

const Header = require("./Header").default as typeof import("./Header").default;

describe("Header", () => {
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
    render(<Header initialAccountName="Maria Silva" />);

    expect(screen.getByText("Maria")).toBeTruthy();
    expect(screen.queryByText("Minha conta")).toBeNull();
    expect(document.documentElement.style.getPropertyValue("--site-shell-offset")).toBe(
      "156px",
    );
  });

  it("keeps the account entry pointed at login when there is no authenticated user", () => {
    render(<Header initialAccountName="" />);

    expect(
      screen.getByRole("link", {
        name: "Entrar ou criar conta",
      }).getAttribute("href"),
    ).toBe("/auth/login");
  });
});
