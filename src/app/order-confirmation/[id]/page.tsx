import { CheckoutOrderConfirmationPage } from "@site/checkout";

export default function OrderConfirmationPage({
  params: { id },
}: {
  params: { id: string };
}) {
  return <CheckoutOrderConfirmationPage orderId={id} />;
}
