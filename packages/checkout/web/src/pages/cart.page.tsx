import { CartLoginError } from "../components/cart-login-error.component";
import { CheckoutPageShell } from "../components/cart-page-shell.component";
import { loadCheckoutPageData } from "../actions/checkout.actions";

export async function CheckoutCartPage() {
  const data = await loadCheckoutPageData();

  if (!data) {
    return <CartLoginError />;
  }

  return <CheckoutPageShell data={data} />;
}
