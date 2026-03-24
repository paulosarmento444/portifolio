import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import type { CheckoutPaymentMethodCode } from "../lib/checkout.types";
import type { CheckoutPaymentOption } from "../lib/payment-methods";
import { PaymentMethodSelector } from "./payment-method-selector.component";

const options: CheckoutPaymentOption[] = [
  {
    id: "woo-mercado-pago-pix",
    title: "Pix",
    description: "Checkout Transparente PIX",
    flow: "pix",
    visualKind: "pix",
    helperLabel: "QR Code oficial do Mercado Pago",
  },
  {
    id: "woo-mercado-pago-custom",
    title: "Cartão de crédito",
    description: "Checkout Transparente do Mercado Pago",
    flow: "card",
    visualKind: "card",
    helperLabel: "Checkout transparente do Mercado Pago",
  },
];

function PaymentMethodSelectorHarness() {
  const [selected, setSelected] = useState<CheckoutPaymentMethodCode>("woo-mercado-pago-pix");

  return (
    <PaymentMethodSelector
      options={options}
      selected={selected}
      onChange={setSelected}
    />
  );
}

describe("PaymentMethodSelector", () => {
  it("keeps the payment options inside an accessible radio group", () => {
    render(<PaymentMethodSelectorHarness />);

    expect(screen.getByRole("radiogroup", { name: /método de pagamento/i })).toBeTruthy();
    expect(screen.getByText(/escolha como deseja concluir a compra/i)).toBeTruthy();
  });

  it("moves selection and focus with arrow-key navigation", () => {
    render(<PaymentMethodSelectorHarness />);

    const pixOption = screen.getByRole("radio", { name: /pix/i });
    const cardOption = screen.getByRole("radio", { name: /cartão de crédito/i });

    pixOption.focus();
    fireEvent.keyDown(pixOption, { key: "ArrowRight" });

    expect(cardOption.getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(cardOption);

    fireEvent.keyDown(cardOption, { key: "Home" });

    expect(pixOption.getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(pixOption);
  });

  it("calls onChange when the payment method is clicked", () => {
    const onChange = jest.fn();

    render(
      <PaymentMethodSelector
        options={options}
        selected="woo-mercado-pago-pix"
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: /cartão de crédito/i }));

    expect(onChange).toHaveBeenCalledWith("woo-mercado-pago-custom");
  });
});
