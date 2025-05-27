"use server";

import { woocommerceClient } from "../lib/wooCommerce";
import { Address } from "../service/MyAccountService";

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
