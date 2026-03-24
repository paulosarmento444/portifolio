import type { CheckoutPaymentMethodView } from "@site/shared";
import type { CheckoutPaymentFlow } from "./checkout.types";

export type CheckoutPaymentVisualKind = "pix" | "card";

export type CheckoutPaymentOption = {
  id: string;
  title: string;
  description?: string;
  flow: CheckoutPaymentFlow;
  visualKind: CheckoutPaymentVisualKind;
  helperLabel: string;
};

const OFFICIAL_MERCADO_PAGO_PIX_METHOD_IDS = new Set(["woo-mercado-pago-pix"]);
const OFFICIAL_MERCADO_PAGO_CARD_METHOD_IDS = new Set(["woo-mercado-pago-custom"]);

const buildHaystack = (method: {
  id?: string;
  title?: string;
  description?: string;
}) => `${method.id ?? ""} ${method.title ?? ""} ${method.description ?? ""}`.toLowerCase();

export const resolveCheckoutPaymentFlow = (method: {
  id?: string;
  title?: string;
  description?: string;
}): CheckoutPaymentFlow => {
  const haystack = buildHaystack(method);

  if (
    (method.id && OFFICIAL_MERCADO_PAGO_PIX_METHOD_IDS.has(method.id)) ||
    haystack.includes("pix")
  ) {
    return "pix";
  }

  return "card";
};

export const mapCheckoutPaymentMethodToOption = (
  method: CheckoutPaymentMethodView,
): CheckoutPaymentOption => {
  const flow = resolveCheckoutPaymentFlow(method);
  const isMercadoPagoCardMethod =
    !!method.id && OFFICIAL_MERCADO_PAGO_CARD_METHOD_IDS.has(method.id);

  return {
    id: method.id,
    title: method.title,
    description: method.description || undefined,
    flow,
    visualKind: flow === "pix" ? "pix" : "card",
    helperLabel:
      flow === "pix"
        ? "PIX oficial do Mercado Pago"
        : isMercadoPagoCardMethod
          ? "Cartão oficial do Mercado Pago"
          : "Pagamento seguro no gateway configurado",
  };
};

export const resolveCheckoutOrderFlow = (order: {
  paymentMethodId?: string | null;
  paymentMethodTitle?: string | null;
}): CheckoutPaymentFlow =>
  resolveCheckoutPaymentFlow({
    id: order.paymentMethodId ?? undefined,
    title: order.paymentMethodTitle ?? undefined,
  });
