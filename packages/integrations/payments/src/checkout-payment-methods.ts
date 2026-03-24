import "server-only";

import {
  checkoutPaymentMethodViewSchema,
  type CheckoutPaymentMethodView,
} from "@site/shared";
import { wordpressWooRestAdapter } from "@site/integrations/wordpress/server";

export const OFFICIAL_MERCADO_PAGO_PAYMENT_METHOD_IDS = [
  "woo-mercado-pago-custom",
  "woo-mercado-pago-pix",
] as const;

const OFFICIAL_MERCADO_PAGO_PAYMENT_METHOD_SET = new Set<string>(
  OFFICIAL_MERCADO_PAGO_PAYMENT_METHOD_IDS,
);

const isOfficialMercadoPagoMethod = (
  method: Pick<CheckoutPaymentMethodView, "id">,
) => OFFICIAL_MERCADO_PAGO_PAYMENT_METHOD_SET.has(method.id);

const dedupePaymentMethods = (methods: CheckoutPaymentMethodView[]) => {
  const seen = new Set<string>();

  return methods.filter((method) => {
    if (seen.has(method.id)) {
      return false;
    }

    seen.add(method.id);
    return true;
  });
};

export const getSupportedCheckoutPaymentMethods = async () => {
  const wooMethods = await wordpressWooRestAdapter
    .listCheckoutPaymentMethods()
    .catch(() => [] as CheckoutPaymentMethodView[]);

  return dedupePaymentMethods(wooMethods.filter(isOfficialMercadoPagoMethod));
};
