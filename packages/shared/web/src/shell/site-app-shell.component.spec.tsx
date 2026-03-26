import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

jest.mock("../theme", () => ({
  ThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>,
}));

jest.mock("./site-header.component", () => ({
  SiteHeader: ({ initialAccountName }: any) => (
    <header data-testid="site-header">{initialAccountName}</header>
  ),
}));

jest.mock("./site-footer.component", () => ({
  SiteFooter: () => <footer data-testid="site-footer">Footer</footer>,
}));

const { SiteAppShell } = require("./site-app-shell.component") as typeof import("./site-app-shell.component");

describe("SiteAppShell", () => {
  it("renders the shell structure around the page content", () => {
    render(
      <SiteAppShell initialTheme="dark" initialAccountName="Maria Silva">
        <div>Conteúdo da página</div>
      </SiteAppShell>,
    );

    expect(screen.getByTestId("theme-provider")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Pular para o conteúdo" }).getAttribute("href")).toBe(
      "#main-content",
    );
    expect(screen.getByTestId("site-header").textContent).toBe("Maria Silva");
    expect(screen.getByText("Conteúdo da página")).toBeTruthy();
    expect(screen.getByTestId("site-footer")).toBeTruthy();
  });
});
