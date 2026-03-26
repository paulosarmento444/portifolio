import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { UserProfile } from "./UserProfile";

describe("UserProfile", () => {
  it("renders only the first name visually while preserving the full account label", () => {
    render(<UserProfile name="Paulo Cesar Junior" />);

    const accountLink = screen.getByRole("link", {
      name: "Abrir conta de Paulo Cesar Junior",
    });

    expect(accountLink.getAttribute("href")).toBe("/my-account");
    expect(accountLink.getAttribute("class")).toContain("max-w-[11rem]");
    expect(screen.getByText("Paulo")).toBeTruthy();
    expect(screen.queryByText("Paulo Cesar Junior")).toBeNull();
  });

  it("falls back to the login entry point when no account name is available", () => {
    render(<UserProfile />);

    const loginLink = screen.getByRole("link", {
      name: "Entrar ou criar conta",
    });

    expect(loginLink.getAttribute("href")).toBe("/auth/login");
    expect(screen.getByText("Entrar")).toBeTruthy();
  });
});
