import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../data/actions/account.actions", () => ({
  saveAccountAddressAction: jest.fn(),
}));

const { saveAccountAddressAction } = jest.requireMock(
  "../../data/actions/account.actions",
) as {
  saveAccountAddressAction: jest.Mock;
};

const { AddressesSection } = require("./addresses-section.component") as typeof import("./addresses-section.component");

describe("AddressesSection", () => {
  beforeEach(() => {
    saveAccountAddressAction.mockReset();
  });

  const viewer = {
    id: "12",
    email: "maria@example.com",
    displayName: "Maria",
    firstName: "Maria",
    lastName: "Silva",
    username: "maria",
    role: "customer",
    roleLabels: [],
  };

  const customer = {
    id: "12",
    email: "maria@example.com",
    displayName: "Maria Silva",
    billingAddress: {
      firstName: "Maria",
      lastName: "Silva",
      addressLine1: "Rua 1",
      addressLine2: "Apto 10",
      city: "Sao Paulo",
      state: "SP",
      postcode: "01000-000",
      country: "BR",
      phone: "11999999999",
      email: "maria@example.com",
    },
    shippingAddress: {
      firstName: "Maria",
      lastName: "Silva",
      addressLine1: "Rua 2",
      addressLine2: "Casa 2",
      city: "Rio de Janeiro",
      state: "RJ",
      postcode: "20000-000",
      country: "BR",
      phone: "21999999999",
      email: "maria@example.com",
    },
  };

  it("keeps focus on the active field while editing the address modal", async () => {
    render(
      <AddressesSection
        viewer={viewer}
        customer={customer}
        onCustomerChange={() => undefined}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Editar endereço" })[1]);

    const cityInput = await screen.findByLabelText("Cidade");

    cityInput.focus();
    expect(document.activeElement).toBe(cityInput);

    await act(async () => {
      fireEvent.change(cityInput, { target: { value: "Campinas" } });
      await Promise.resolve();
    });

    expect((screen.getByLabelText("Cidade") as HTMLInputElement).value).toBe("Campinas");
    expect(document.activeElement).toBe(screen.getByLabelText("Cidade"));
  });

  it("does not render the billing-only e-mail field for the shipping form", async () => {
    render(
      <AddressesSection
        viewer={viewer}
        customer={customer}
        onCustomerChange={() => undefined}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Editar endereço" })[1]);

    expect(screen.queryByLabelText("E-mail")).toBeNull();
    expect(screen.getByLabelText("Complemento")).toBeTruthy();
  });

  it("pre-selects the normalized UF when existing data stores the full state name", async () => {
    render(
      <AddressesSection
        viewer={viewer}
        customer={{
          ...customer,
          billingAddress: {
            ...customer.billingAddress,
            state: "Rio de Janeiro",
          },
        }}
        onCustomerChange={() => undefined}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Editar endereço" })[0]);

    const stateSelect = (await screen.findByLabelText("Estado")) as HTMLSelectElement;

    expect(stateSelect.value).toBe("RJ");
  });

  it("saves the selected address with a default BR country payload", async () => {
    const onCustomerChange = jest.fn();

    (saveAccountAddressAction as any).mockResolvedValueOnce({
      success: true,
      customer,
    });

    render(
      <AddressesSection
        viewer={viewer}
        customer={customer}
        onCustomerChange={onCustomerChange}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Editar endereço" })[0]);

    fireEvent.change(await screen.findByLabelText("Cidade"), {
      target: { value: "Campinas" },
    });
    fireEvent.change(screen.getByLabelText("Estado"), {
      target: { value: "MG" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar endereço" }));

    await waitFor(() =>
      expect(saveAccountAddressAction).toHaveBeenCalledWith(
        "12",
        "billing",
        expect.objectContaining({
          city: "Campinas",
          state: "MG",
          country: "BR",
        }),
      ),
    );
    expect(onCustomerChange).toHaveBeenCalledWith(customer);
  });

  it("shows a field error when the state is missing", async () => {
    render(
      <AddressesSection
        viewer={viewer}
        customer={{
          ...customer,
          billingAddress: null,
        }}
        onCustomerChange={() => undefined}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Adicionar endereço" })[0]);
    fireEvent.click(await screen.findByRole("button", { name: "Salvar endereço" }));

    expect(await screen.findByText("Selecione o estado.")).toBeTruthy();
    expect(saveAccountAddressAction).not.toHaveBeenCalled();
  });

  it("keeps the save button reachable and disabled while the address form is submitting", async () => {
    let resolveRequest: ((value: unknown) => void) | undefined;
    (saveAccountAddressAction as any).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    render(
      <AddressesSection
        viewer={viewer}
        customer={customer}
        onCustomerChange={() => undefined}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Editar endereço" })[0]);

    const submitButton = await screen.findByRole("button", { name: "Salvar endereço" });
    fireEvent.click(submitButton);

    const pendingButton = await screen.findByRole("button", { name: "Salvando..." });
    expect(pendingButton.hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("dialog")).toBeTruthy();

    resolveRequest?.({
      success: true,
      customer,
    });

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
