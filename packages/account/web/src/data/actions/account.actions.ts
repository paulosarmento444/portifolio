"use server";

import { headers } from "next/headers";
import {
  clearCoCartAuthTokens,
  cocartServerAdapter,
  readCoCartForwardHeaders,
} from "@site/integrations/cocart/server";
import { wordpressWooRestAdapter } from "@site/integrations/wordpress/server";
import type {
  AccountAddressFormData,
  AccountAddressType,
  AccountProfileFormData,
} from "../account.types";

const normalizeAccountAddressPayload = (address: AccountAddressFormData) => ({
  first_name: address.first_name,
  last_name: address.last_name,
  address_1: address.address_1,
  address_2: address.address_2,
  city: address.city,
  state: address.state,
  postcode: address.postcode,
  country: address.country?.trim() || "BR",
  phone: address.phone,
  email: address.email,
});

export async function updateAccountProfileAction(
  customerId: string | number,
  data: AccountProfileFormData,
) {
  try {
    const customer = await wordpressWooRestAdapter.updateAccountCustomer(customerId, {
      billing: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        city: data.city,
      },
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
    });

    return { success: true, customer };
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error?.response?.data || error);
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao atualizar perfil",
    };
  }
}

export async function changeAccountPasswordAction(
  customerId: string | number,
  _currentPassword: string,
  newPassword: string,
) {
  try {
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: "A nova senha deve ter pelo menos 6 caracteres",
      };
    }

    await wordpressWooRestAdapter.updateCustomerRaw(customerId, {
      password: newPassword,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao alterar senha:", error?.response?.data || error);
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao alterar senha",
    };
  }
}

export async function saveAccountAddressAction(
  customerId: string | number,
  addressType: AccountAddressType,
  address: AccountAddressFormData,
) {
  try {
    const payload = normalizeAccountAddressPayload(address);
    const customer = await wordpressWooRestAdapter.updateAccountCustomer(customerId, {
      [addressType]:
        addressType === "billing"
          ? payload
          : {
              ...payload,
              email: undefined,
            },
    });

    return { success: true, customer };
  } catch (error: any) {
    console.error("Erro ao salvar endereço:", error?.response?.data || error);
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao salvar endereço",
    };
  }
}

export async function logoutAccountAction() {
  const requestHeaders = await readCoCartForwardHeaders(await headers());

  try {
    await cocartServerAdapter.logout(requestHeaders);
  } catch {
    // Clearing local auth state is enough to log out the storefront.
  }

  await clearCoCartAuthTokens();
}
