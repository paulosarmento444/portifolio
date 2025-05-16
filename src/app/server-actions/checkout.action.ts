"use server";

import { redirect } from "next/navigation";
import { clearCart, getCart } from "../service/CartService";
import { createOrder } from "../service/OrderService";
import { woocommerceClient } from "../lib/wooCommerce";
import { Address } from "../service/MyAccountService";

export async function checkoutAction(formData: FormData) {
  const cart = getCart();
  let order;
  try {
    order = await createOrder({
      card_hash: formData.get("card_hash") as string,
      items: cart.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    });
    clearCart();
  } catch (e) {
    console.error(e);
    return {
      error: { message: "O pagamento não foi aprovado." },
    };
  }

  redirect(`/checkout/${order.id}/success`);
}

export const addAddress = async (viewerId: number, address: Address) => {
  try {
    const response = await woocommerceClient.put(`/customers/${viewerId}`, {
      address,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error adding address: ${error}`);
  }
};

export const paymentMethod = async () => {
  try {
    const response = await woocommerceClient.get("/payment_gateways");

    const enabledPaymentMethods = response.data.filter(
      (method: any) => method.enabled === true
    );
    return enabledPaymentMethods;
  } catch (error) {
    throw new Error(`Error getting payment methods: ${error}`);
  }
};
