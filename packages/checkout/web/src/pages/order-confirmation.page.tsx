import Link from "next/link";
import { PackageSearch } from "lucide-react";
import {
  EmptyState,
  SectionShell,
  cn,
  ecommerceButtonStyles,
} from "@site/shared";
import { loadOrderConfirmationPageData } from "../data/loaders/order-confirmation.loader";
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
  const pageData = await loadOrderConfirmationPageData(orderId);

  if (!pageData) {
    return <OrderNotFoundState />;
  }

  return (
    <OrderConfirmationView
      order={pageData.order}
      initialPaymentState={pageData.initialPaymentState}
      paymentConfig={pageData.paymentConfig}
    />
  );
}
