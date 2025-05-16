import { Billing } from "@/models";
import { woocommerceClient } from "../lib/wooCommerce";

export const createOrder = async (input: {
  customer_id: string;
  payment_method: string;
  line_items: { product_id: number; quantity: number }[];
  billing: Billing;
}): Promise<any> => {
  try {
    const response = await woocommerceClient.post("/orders", input);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const OrderService = {
  createOrder,
};
