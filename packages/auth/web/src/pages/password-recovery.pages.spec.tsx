import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(() => ({
    get: () => null,
  })),
}));

jest.mock("../data/actions/auth.actions", () => ({
  forgotPasswordAction: jest.fn(),
  resetPasswordAction: jest.fn(),
  validateResetPasswordTokenAction: jest.fn(),
}));

const {
  AuthForgotPasswordPage,
} = require("./forgot-password.page") as typeof import("./forgot-password.page");

const {
  AuthResetPasswordPage,
} = require("./reset-password.page") as typeof import("./reset-password.page");

describe("password recovery auth pages", () => {
  it("renders the forgot-password experience from the auth package", () => {
    render(<AuthForgotPasswordPage />);

    expect(screen.getByRole("heading", { name: "Esqueceu sua senha?" })).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Enviar instrucoes",
      }),
    ).toBeTruthy();
  });

  it("renders the reset-password experience from the auth package", () => {
    render(<AuthResetPasswordPage />);

    expect(
      screen.getByRole("heading", {
        name: "Escolha sua nova senha",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Redefinir senha",
      }),
    ).toBeTruthy();
    expect(
      screen.getByText("O link de redefinicao esta incompleto ou expirou."),
    ).toBeTruthy();
  });
});
