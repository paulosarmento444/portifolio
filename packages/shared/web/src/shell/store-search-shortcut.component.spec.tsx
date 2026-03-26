import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { StoreSearchShortcut } from "./store-search-shortcut.component";

describe("StoreSearchShortcut", () => {
  it("links the shell search shortcut to the storefront", () => {
    render(<StoreSearchShortcut />);

    expect(
      screen.getByRole("link", { name: "Buscar na loja" }).getAttribute("href"),
    ).toBe("/store");
    expect(screen.getByText("Loja, categorias e conteúdo editorial")).toBeTruthy();
  });

  it("renders the compact variant without the secondary helper text", () => {
    render(<StoreSearchShortcut compact />);

    expect(screen.getByText("Buscar produtos")).toBeTruthy();
    expect(
      screen.queryByText("Loja, categorias e conteúdo editorial"),
    ).toBeNull();
  });
});
