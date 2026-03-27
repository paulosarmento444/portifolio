import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../data/actions/account.actions", () => ({
  changeAccountPasswordAction: jest.fn(),
  updateAccountProfileAction: jest.fn(),
}));

const {
  changeAccountPasswordAction,
} = jest.requireMock("../../data/actions/account.actions") as {
  changeAccountPasswordAction: jest.Mock;
};

const { AccountSection } = require("./account-section.component") as typeof import("./account-section.component");

const viewer = {
  id: "12",
  email: "maria@example.com",
  displayName: "Maria",
  firstName: "Maria",
  lastName: "Silva",
  username: "maria",
  roleLabels: [],
};

const customer = {
  id: "12",
  email: "maria@example.com",
  displayName: "Maria Silva",
  billingAddress: {
    firstName: "Maria",
    lastName: "Silva",
    city: "Sao Paulo",
    phone: "11999999999",
  },
  shippingAddress: null,
};

const fillPasswordForm = () => {
  fireEvent.change(screen.getByLabelText("Senha atual"), {
    target: { value: "senha-atual-123" },
  });
  fireEvent.change(screen.getByLabelText("Nova senha"), {
    target: { value: "nova-senha-123" },
  });
  fireEvent.change(screen.getByLabelText("Confirmar nova senha"), {
    target: { value: "nova-senha-123" },
  });
};

describe("AccountSection", () => {
  beforeEach(() => {
    changeAccountPasswordAction.mockReset();
  });

  it("validates required password fields before submitting", async () => {
    render(
      <AccountSection
        viewer={viewer}
        customer={customer}
        onCustomerChange={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Alterar senha" }));
    fireEvent.click(await screen.findByRole("button", { name: "Salvar nova senha" }));

    expect(changeAccountPasswordAction).not.toHaveBeenCalled();
    expect(await screen.findByText("Informe sua senha atual.")).toBeTruthy();
    expect(screen.getByText("Informe sua nova senha.")).toBeTruthy();
    expect(screen.getByText("Confirme a nova senha.")).toBeTruthy();
  });

  it("keeps the modal open and surfaces current password errors from the backend", async () => {
    (changeAccountPasswordAction as jest.Mock).mockImplementationOnce(async () => ({
      success: false,
      error: "A senha atual informada esta incorreta.",
      fieldErrors: {
        current_password: "A senha atual informada esta incorreta.",
      },
    }));

    render(
      <AccountSection
        viewer={viewer}
        customer={customer}
        onCustomerChange={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Alterar senha" }));
    fillPasswordForm();
    fireEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    await waitFor(() =>
      expect(changeAccountPasswordAction).toHaveBeenCalledWith({
        customerId: "12",
        currentPassword: "senha-atual-123",
        newPassword: "nova-senha-123",
        confirmPassword: "nova-senha-123",
      }),
    );
    expect(await screen.findByText("A senha atual informada esta incorreta.")).toBeTruthy();
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("shows a loading state and closes the modal after a successful password change", async () => {
    let resolveRequest: ((value: unknown) => void) | undefined;
    changeAccountPasswordAction.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    render(
      <AccountSection
        viewer={viewer}
        customer={customer}
        onCustomerChange={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Alterar senha" }));
    fillPasswordForm();

    const submitButton = screen.getByRole("button", { name: "Salvar nova senha" });
    fireEvent.click(submitButton);

    const pendingButton = await screen.findByRole("button", { name: "Alterando..." });
    expect(pendingButton.hasAttribute("disabled")).toBe(true);

    resolveRequest?.({ success: true });

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByText("Senha alterada com sucesso.")).toBeTruthy();
  });
});
