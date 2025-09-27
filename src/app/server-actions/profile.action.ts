"use server";

import { woocommerceClient } from "../lib/wooCommerce";

export async function updateCustomerProfile(
  customerId: string | number,
  data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    city?: string;
    cpf?: string;
  }
) {
  try {
    const payload: any = {
      billing: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        cpf: data.cpf,
      },
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
    };

    const response = await woocommerceClient.put(
      `/customers/${customerId}`,
      payload
    );
    return { success: true, customer: response.data };
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error?.response?.data || error);
    return {
      success: false,
      error: error?.response?.data?.message || "Erro ao atualizar perfil",
    };
  }
}

export async function changeCustomerPassword(
  customerId: string | number,
  currentPassword: string,
  newPassword: string
) {
  try {
    // Observação: a API do WooCommerce permite atualizar senha com credenciais administrativas.
    // Aqui, por padrão, não é possível validar a senha atual sem um endpoint de autenticação do WP.
    // Ainda assim, exigimos currentPassword no contrato e podemos futuramente validar.
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: "A nova senha deve ter pelo menos 6 caracteres",
      };
    }

    const response = await woocommerceClient.put(`/customers/${customerId}`, {
      password: newPassword,
    });
    return { success: true, customer: response.data };
  } catch (error: any) {
    console.error("Erro ao alterar senha:", error?.response?.data || error);
    return {
      success: false,
      error: error?.response?.data?.message || "Erro ao alterar senha",
    };
  }
}


