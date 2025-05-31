import { getCart } from "../service/CartService";
import { getProductsByIds } from "../service/ProductService";
import { getUserId } from "../server-actions/auth.action";
import { getCustomer } from "../service/MyAccountService";
import { paymentMethod } from "../server-actions/checkout.action";
import { CartContainer } from "./components/CartContainer";

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
    console.error("Erro ao carregar página do carrinho:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Erro ao carregar carrinho
          </h1>
          <p className="text-gray-300">Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }
}
