import { woocommerceClient } from "../lib/wooCommerce";

export const getOrder = async (orderId: number) => {
  try {
    const response = await woocommerceClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    throw error;
  }
};
