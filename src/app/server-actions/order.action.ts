"use server";

import { woocommerceClient } from "../lib/wooCommerce";
import { clearCart } from "../service/CartService";
import { cookies } from "next/headers";

export async function createOrder(orderData: any) {
  try {
    const response = await woocommerceClient.post("/orders", orderData);

    // Limpar carrinho imediatamente após criar o pedido
    clearCart();

    // Remover cupom aplicado
    const cookieStore = await cookies();
    cookieStore.delete("applied_coupon");

    return {
      success: true,
      order: response.data,
    };
  } catch (error: any) {
    console.error("Erro ao criar pedido:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Erro ao criar pedido",
    };
  }
}

export async function confirmOrderPayment(orderId: string) {
  try {
    // Limpar carrinho após confirmação do pagamento
    clearCart();

    // Remover cupom aplicado
    const cookieStore = await cookies();
    cookieStore.delete("applied_coupon");

    return { success: true };
  } catch (error) {
    console.error("Erro ao confirmar pagamento:", error);
    return { success: false };
  }
}
