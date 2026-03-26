import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";

const toggleTheme = jest.fn();

jest.mock("../theme", () => ({
  useTheme: jest.fn(() => ({
    isLoaded: true,
    theme: "dark",
    toggleTheme,
  })),
}));

const { ThemeToggleButton } = require("./theme-toggle-button.component") as typeof import("./theme-toggle-button.component");

describe("ThemeToggleButton", () => {
  it("renders the icon variant with the next-theme label and toggles on click", () => {
    render(<ThemeToggleButton />);

    const button = screen.getByRole("button", {
      name: "Ativar tema claro",
    });

    fireEvent.click(button);

    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it("renders the full-width button variant when requested", () => {
    render(<ThemeToggleButton variant="button" fullWidth />);

    expect(
      screen.getByRole("button", {
        name: "Ativar tema claro",
      }).getAttribute("class"),
    ).toContain("w-full");
  });
});
