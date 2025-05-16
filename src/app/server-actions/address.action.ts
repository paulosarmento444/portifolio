"use server";

import { woocommerceClient } from "../lib/wooCommerce";
import { Address } from "../service/MyAccountService";

export const addBillingAddress = async (viewerId: number, billing: Address) => {
  try {
    const response = await woocommerceClient.post(`/customers/${viewerId}`, {
      billing,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar endereço de faturamento:", error);
    throw new Error();
  }
};

export const addShippingAddress = async (viewerId: number, shipping: any) => {
  try {
    const response = await woocommerceClient.post(`/customers/${viewerId}`, {
      shipping,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar endereço de entrega:", error);
    throw new Error();
  }
};
