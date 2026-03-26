import { describe, expect, it, jest } from "@jest/globals";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { MercadoPagoHeadlessConfig } from "@site/integrations/payments";

jest.mock("./mercado-pago-sdk", () => ({
  buildMercadoPagoFieldStyle: jest.fn(() => ({})),
  ensureMercadoPagoSdk: jest.fn(),
  readMercadoPagoDeviceSessionId: jest.fn(() => "device-session-id"),
}));

const mercadoPagoSdkModule = jest.requireMock("./mercado-pago-sdk") as {
  ensureMercadoPagoSdk: jest.Mock;
};
const { MercadoPagoCardForm } = require("./mercado-pago-card-form.component") as typeof import("./mercado-pago-card-form.component");

const cardFormUnmountMock = jest.fn();
const createCardTokenMock = jest.fn(async () => ({ token: "token-123" }));
const getCardFormDataMock = jest.fn(() => ({
  paymentMethodId: "master",
  installments: "1",
}));
const cardFormMock = jest.fn((options: { callbacks?: { onReady?: () => void } }) => {
  options.callbacks?.onReady?.();

  return {
    createCardToken: createCardTokenMock,
    getCardFormData: getCardFormDataMock,
    unmount: cardFormUnmountMock,
  };
});

const baseConfig: MercadoPagoHeadlessConfig = {
  sdkUrl: "https://sdk.mercadopago.com/js/v2",
  publicKey: "test-public-key",
  locale: "pt-BR",
  siteId: "MLB",
  testMode: true,
  enabledGatewayIds: ["woo-mercado-pago-custom", "woo-mercado-pago-pix"],
};

describe("MercadoPagoCardForm", () => {
  beforeEach(() => {
    mercadoPagoSdkModule.ensureMercadoPagoSdk.mockImplementation(
      async () =>
        ({
          cardForm: cardFormMock,
        }) as never,
    );
    cardFormUnmountMock.mockClear();
    createCardTokenMock.mockClear();
    getCardFormDataMock.mockClear();
    cardFormMock.mockClear();
    mercadoPagoSdkModule.ensureMercadoPagoSdk.mockClear();
  });

  it("does not remount the Mercado Pago SDK form when config data refreshes with the same values", async () => {
    const onSubmit = jest.fn(async () => undefined);
    const onRefresh = jest.fn();

    const { rerender } = render(
      <MercadoPagoCardForm
        amount={199.9}
        config={baseConfig}
        isSubmitting={false}
        onRefresh={onRefresh}
        onSubmit={onSubmit}
      />,
    );

    await waitFor(() => {
      expect(mercadoPagoSdkModule.ensureMercadoPagoSdk).toHaveBeenCalledTimes(1);
      expect(cardFormMock).toHaveBeenCalledTimes(1);
    });

    rerender(
      <MercadoPagoCardForm
        amount={199.9}
        config={{
          ...baseConfig,
          enabledGatewayIds: [...baseConfig.enabledGatewayIds],
        }}
        isSubmitting={false}
        onRefresh={onRefresh}
        onSubmit={onSubmit}
      />,
    );

    await waitFor(() => {
      expect(mercadoPagoSdkModule.ensureMercadoPagoSdk).toHaveBeenCalledTimes(1);
      expect(cardFormMock).toHaveBeenCalledTimes(1);
      expect(cardFormUnmountMock).not.toHaveBeenCalled();
    });
  });

  it("reveals document and issuer fields only when the SDK populates them and updates the installments message", async () => {
    await act(async () => {
      render(
        <MercadoPagoCardForm
          amount={249.9}
          config={baseConfig}
          isSubmitting={false}
          onRefresh={jest.fn()}
          onSubmit={jest.fn(async () => undefined)}
        />,
      );
    });

    const documentInput = document.getElementById(
      "pharmacore-mp-identification-number",
    ) as HTMLInputElement;
    const issuerSelect = document.getElementById("pharmacore-mp-issuer") as HTMLSelectElement;
    const identificationTypeSelect = document.getElementById(
      "pharmacore-mp-identification-type",
    ) as HTMLSelectElement;
    const installmentsSelect = document.getElementById(
      "pharmacore-mp-installments",
    ) as HTMLSelectElement;

    expect(documentInput.closest(".hidden")).not.toBeNull();
    expect(issuerSelect.closest(".hidden")).not.toBeNull();
    expect(
      screen.getByText("As parcelas aparecem depois dos primeiros dígitos."),
    ).toBeTruthy();

    identificationTypeSelect.append(new Option("CPF", "CPF"));
    fireEvent.change(identificationTypeSelect);

    issuerSelect.append(new Option("Banco A", "1"));
    issuerSelect.append(new Option("Banco B", "2"));
    fireEvent.change(issuerSelect);

    installmentsSelect.append(new Option("1x de R$ 249,90", "1"));
    fireEvent.change(installmentsSelect);

    await waitFor(() => {
      expect(documentInput.closest(".hidden")).toBeNull();
      expect(issuerSelect.closest(".hidden")).toBeNull();
      expect(screen.getByText("Parcelas carregadas para este cartão.")).toBeTruthy();
    });
  });

  it("renders the form in a single premium surface with a compact summary strip", async () => {
    await act(async () => {
      render(
        <MercadoPagoCardForm
          amount={199.9}
          config={baseConfig}
          isSubmitting={false}
          onRefresh={jest.fn()}
          onSubmit={jest.fn(async () => undefined)}
        />,
      );
    });

    const layout = await screen.findByTestId("mercado-pago-card-layout");
    const summaryStrip = screen.getByTestId("mercado-pago-card-summary-strip");
    const secureCardNumberField = document.getElementById("pharmacore-mp-card-number");
    const cardholderField = screen.getByLabelText("Nome impresso no cartão");
    const installmentsField = screen.getByLabelText("Parcelamento");

    expect(layout.className).toContain("min-w-0");
    expect(layout.className).not.toContain("lg:grid-cols");
    expect(summaryStrip.textContent).toContain("Ambiente protegido");
    expect(summaryStrip.textContent).toContain("Nome do titular");
    expect(secureCardNumberField?.className).toContain("min-h-[2.875rem]");
    expect(secureCardNumberField?.className).toContain("[&>iframe]:!h-[2.875rem]");
    expect(cardholderField.className).toContain("min-h-[2.875rem]");
    expect(installmentsField.className).toContain("min-h-[2.875rem]");
  });

  it("updates the visible cardholder summary without affecting the secure SDK fields", async () => {
    await act(async () => {
      render(
        <MercadoPagoCardForm
          amount={199.9}
          config={baseConfig}
          isSubmitting={false}
          onRefresh={jest.fn()}
          onSubmit={jest.fn(async () => undefined)}
        />,
      );
    });

    fireEvent.change(screen.getByLabelText("Nome impresso no cartão"), {
      target: { value: "Maria Silva" },
    });

    expect(
      screen.getByTestId("mercado-pago-cardholder-preview").textContent,
    ).toBe("Maria Silva");
  });

});
