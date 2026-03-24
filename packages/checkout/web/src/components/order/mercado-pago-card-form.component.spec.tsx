import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    render(
      <MercadoPagoCardForm
        amount={249.9}
        config={baseConfig}
        isSubmitting={false}
        onRefresh={jest.fn()}
        onSubmit={jest.fn(async () => undefined)}
      />,
    );

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
      screen.getByText(
        "As parcelas aparecem assim que o Mercado Pago reconhece os primeiros dígitos do cartão.",
      ),
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
      expect(
        screen.getByText("As parcelas já foram carregadas para o cartão informado."),
      ).toBeTruthy();
    });
  });
  it("keeps the transparent checkout form stacked for the narrow payment sidebar", async () => {
    render(
      <MercadoPagoCardForm
        amount={199.9}
        config={baseConfig}
        isSubmitting={false}
        onRefresh={jest.fn()}
        onSubmit={jest.fn(async () => undefined)}
      />,
    );

    const layout = await screen.findByTestId("mercado-pago-card-layout");

    expect(layout.className).toContain("min-w-0");
    expect(layout.className).not.toContain("lg:grid-cols");
  });

});
