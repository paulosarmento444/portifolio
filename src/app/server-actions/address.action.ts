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

export async function updateCustomerAddress(
  customerId: string,
  addressData: any
) {
  try {
    const response = await woocommerceClient.put(`/customers/${customerId}`, {
      billing: addressData,
      shipping: addressData,
    });

    return {
      success: true,
      customer: response.data,
    };
  } catch (error: any) {
    console.error("Erro ao atualizar endereço:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Erro ao salvar endereço",
    };
  }
}
