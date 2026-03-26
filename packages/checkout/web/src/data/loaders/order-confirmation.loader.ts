import { headers } from "next/headers";
import {
  cocartServerAdapter,
  readCoCartAccessToken,
  readCoCartForwardHeaders,
  verifyCoCartAccessToken,
} from "@site/integrations/cocart/server";
import {
  mercadoPagoHeadlessServer,
  type MercadoPagoHeadlessConfig,
  type MercadoPagoOrderPaymentState,
} from "@site/integrations/payments/server";
import { wordpressWooRestAdapter } from "@site/integrations/wordpress/server";
import type { CheckoutOrderConfirmationView } from "@site/shared";

export type CheckoutOrderConfirmationPageData = {
  order: CheckoutOrderConfirmationView;
  paymentConfig: MercadoPagoHeadlessConfig | null;
  initialPaymentState: MercadoPagoOrderPaymentState | null;
};

export async function loadOrderConfirmationPageData(
  orderId: string,
): Promise<CheckoutOrderConfirmationPageData | null> {
  const numericOrderId = Number.parseInt(orderId, 10);
  const headerSource = await headers();
  const requestHeaders = await readCoCartForwardHeaders(headerSource);

  if (!Number.isFinite(numericOrderId) || numericOrderId <= 0) {
    return null;
  }

  let sessionState:
    | Awaited<ReturnType<typeof cocartServerAdapter.getSessionState>>
    | null = null;
  const accessToken = await readCoCartAccessToken(headerSource);
  const verifiedTokenUser = verifyCoCartAccessToken(accessToken);

  if (!verifiedTokenUser?.id) {
    try {
      sessionState = await cocartServerAdapter.getSessionState(requestHeaders);
    } catch {
      sessionState = null;
    }
  }

  const customerId = Number(verifiedTokenUser?.id || sessionState?.session.user?.id);

  if (!Number.isFinite(customerId) || customerId <= 0) {
    return null;
  }

  try {
    const paymentContext =
      await wordpressWooRestAdapter.getOrderPaymentContextForCustomer(
        numericOrderId,
        customerId,
      );

    if (!paymentContext) {
      return null;
    }

    const [initialPaymentState, paymentConfig] = await Promise.all([
      paymentContext.order.paymentMethodId?.startsWith("woo-mercado-pago")
        ? mercadoPagoHeadlessServer
            .getOrderPaymentState({
              orderId: numericOrderId,
              orderKey: paymentContext.orderKey,
              sync: true,
            })
            .catch(() => null)
        : Promise.resolve(null),
      mercadoPagoHeadlessServer.getConfig().catch(() => null),
    ]);

    const order = initialPaymentState
      ? (await wordpressWooRestAdapter
          .getOrderByIdForCustomer(numericOrderId, customerId)
          .catch(() => paymentContext.order)) || paymentContext.order
      : paymentContext.order;

    return {
      order,
      paymentConfig,
      initialPaymentState,
    };
  } catch {
    return null;
  }
}
