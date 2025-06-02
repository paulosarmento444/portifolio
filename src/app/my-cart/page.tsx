import { getCart } from "../service/CartService";
import { getProductsByIds } from "../service/ProductService";
import { getUserId } from "../server-actions/auth.action";
import { getCustomer } from "../service/MyAccountService";
import { paymentMethod } from "../server-actions/checkout.action";
import { CartContainer } from "./components/CartContainer";
import { CartLoginError } from "./components/CartLoginError";

export default async function MyCartPage() {
  try {
    const cart = getCart();
    const products = await getProductsByIds(
      cart.items.map((item) => item.product_id)
    );
    const userId = await getUserId();
    const { billing, shipping } = await getCustomer(userId);
    const paymentMethods = await paymentMethod();

    return (
      <CartContainer
        cart={cart}
        products={products}
        userId={userId}
        billing={billing}
        shipping={shipping}
        paymentMethods={paymentMethods}
      />
    );
  } catch (error) {
    return <CartLoginError />;
  }
}
