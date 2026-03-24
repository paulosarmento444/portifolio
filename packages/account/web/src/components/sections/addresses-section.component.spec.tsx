import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../actions/account.actions", () => ({
  saveAccountAddressAction: jest.fn(),
}));

const { saveAccountAddressAction } = jest.requireMock(
  "../../actions/account.actions",
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
    fireEvent.click(screen.getByRole("button", { name: "Salvar endereço" }));

    await waitFor(() =>
      expect(saveAccountAddressAction).toHaveBeenCalledWith(
        "12",
        "billing",
        expect.objectContaining({
          city: "Campinas",
          country: "BR",
        }),
      ),
    );
    expect(onCustomerChange).toHaveBeenCalledWith(customer);
  });
});
