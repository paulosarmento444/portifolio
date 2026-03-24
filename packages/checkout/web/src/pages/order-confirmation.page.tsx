import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { headers } from "next/headers";
import {
  cocartServerAdapter,
  readCoCartAccessToken,
  readCoCartForwardHeaders,
  verifyCoCartAccessToken,
} from "@site/integrations/cocart/server";
import { mercadoPagoHeadlessServer } from "@site/integrations/payments/server";
import { wordpressWooRestAdapter } from "@site/integrations/wordpress/server";
import {
  EmptyState,
  SectionShell,
  cn,
  ecommerceButtonStyles,
} from "@site/shared";
import { OrderConfirmationView } from "../components/order/order-confirmation.component";

interface CheckoutOrderConfirmationPageProps {
  orderId: string;
}

function OrderNotFoundState() {
  return (
    <div className="site-shell-background">
      <SectionShell container="utility" spacing="hero" stack="section" className="min-h-[calc(100vh-12rem)] justify-center">
        <EmptyState
          icon={<PackageSearch className="h-6 w-6" />}
          eyebrow="Pedido indisponível"
          title="Pedido não encontrado"
          description="Verifique o número informado ou acesse a área da sua conta para consultar seus pedidos recentes."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/my-account?menu=orders" className={cn(ecommerceButtonStyles.primary, "justify-center")}>
                Ver meus pedidos
              </Link>
              <Link href="/store" className={cn(ecommerceButtonStyles.secondary, "justify-center")}>
                Voltar à loja
              </Link>
            </div>
          }
        />
      </SectionShell>
    </div>
  );
}

export async function CheckoutOrderConfirmationPage({
  orderId,
}: CheckoutOrderConfirmationPageProps) {
  const numericOrderId = Number.parseInt(orderId, 10);
  const headerSource = await headers();
  const requestHeaders = await readCoCartForwardHeaders(headerSource);

  if (!Number.isFinite(numericOrderId) || numericOrderId <= 0) {
    return <OrderNotFoundState />;
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

  if (Number.isFinite(customerId) && customerId > 0) {
    try {
      const paymentContext =
        await wordpressWooRestAdapter.getOrderPaymentContextForCustomer(
          numericOrderId,
          customerId,
        );

      if (paymentContext) {
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

        return (
          <OrderConfirmationView
            order={order}
            initialPaymentState={initialPaymentState}
            paymentConfig={paymentConfig}
          />
        );
      }
    } catch {
    }
  }

  return <OrderNotFoundState />;
}
