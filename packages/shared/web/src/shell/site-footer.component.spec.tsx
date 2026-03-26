import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./site-footer.component";

describe("SiteFooter", () => {
  it("renders the shared support entry points and storefront actions", () => {
    render(<SiteFooter />);

    expect(screen.getByRole("contentinfo", { name: "Rodapé do site" })).toBeTruthy();
    expect(
      screen
        .getAllByRole("link", {
          name: "contato@solaresportes.com.br",
        })
        .map((link) => link.getAttribute("href")),
    ).toContain("mailto:contato@solaresportes.com.br");
    expect(
      screen.getByRole("link", {
        name: /Abrir catálogo/i,
      }).getAttribute("href"),
    ).toBe("/store");
  });
});
