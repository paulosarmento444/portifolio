import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/store"),
}));

const { SiteNavLinks } = require("./site-nav-links.component") as typeof import("./site-nav-links.component");

describe("SiteNavLinks", () => {
  it("marks the active desktop link from the current pathname", () => {
    render(<SiteNavLinks />);

    expect(
      screen.getByRole("link", { name: "Loja" }).getAttribute("aria-current"),
    ).toBe("page");
  });

  it("supports drawer navigation callbacks", () => {
    const onNavigate = jest.fn();

    render(<SiteNavLinks variant="drawer" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole("link", { name: /blog/i }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
