/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ unoptimized: _unoptimized, ...props }: any) => <img {...props} />,
}));

const { MercadoPagoPixPanel } = require("./mercado-pago-pix-panel.component") as typeof import("./mercado-pago-pix-panel.component");

describe("MercadoPagoPixPanel", () => {
  it("renders the PIX qr code in a stacked layout that fits the sidebar column", () => {
    render(
      <MercadoPagoPixPanel
        paymentState={{
          flow: "pix",
          methodId: "woo-mercado-pago-pix",
          methodTitle: "PIX",
          orderStatus: "pending",
          orderStatusLabel: "Aguardando pagamento",
          paymentStatus: "pending",
          isPending: true,
          isPaid: false,
          paymentIds: ["pix_123"],
          checkoutType: null,
          card: null,
          threeDS: { required: false },
          pix: {
            qrCode: "000201010212PIXCODE1234567890",
            qrCodeBase64: "ZmFrZS1pbWFnZS1ieXRlcw==",
            expiresAt: "2026-03-20T14:00:00.000Z",
          },
        }}
        isProcessing={false}
        onGenerate={jest.fn()}
        onRefresh={jest.fn()}
      />,
    );

    expect(screen.getByAltText("QR Code PIX do Mercado Pago")).toBeTruthy();
    expect(screen.getByText(/Código copia e cola/i)).toBeTruthy();
    expect(screen.getByText(/000201010212PIXCODE1234567890/i)).toBeTruthy();

    const layout = screen.getByTestId("mercado-pago-pix-layout");
    expect(layout.className).toContain("grid");
    expect(layout.className).toContain("min-w-0");
    expect(layout.className).not.toContain("lg:grid-cols");
  });
});
