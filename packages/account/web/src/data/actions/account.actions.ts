"use server";

import { headers } from "next/headers";
import type { AccountCustomerView } from "@site/shared";
import {
  clearCoCartAuthTokens,
  cocartServerAdapter,
  readCoCartForwardHeaders,
} from "@site/integrations/cocart/server";
import { wordpressWooRestAdapter } from "@site/integrations/wordpress/server";
import type {
  AccountAddressFormData,
  AccountAddressFormErrors,
  AccountAddressType,
  AccountProfileFormData,
} from "../account.types";
import {
  accountAddressSchema,
  mapAccountAddressFieldErrors,
} from "../schemas/account-address.schema";
import {
  accountPasswordChangeSchema,
  mapAccountPasswordFieldErrors,
} from "../schemas/account-password-change.schema";

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

type AccountAddressActionResult =
  | {
      success: true;
      customer: AccountCustomerView;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: AccountAddressFormErrors;
    };

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

export async function changeAccountPasswordAction(input: {
  customerId: string | number;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const parsedInput = accountPasswordChangeSchema.safeParse({
    current_password: input.currentPassword,
    new_password: input.newPassword,
    confirm_password: input.confirmPassword,
  });

  if (!parsedInput.success) {
    const fieldErrors = mapAccountPasswordFieldErrors(
      parsedInput.error.flatten().fieldErrors,
    );

    return {
      success: false,
      error:
        parsedInput.error.issues[0]?.message ||
        "Revise os dados informados para alterar a senha.",
      fieldErrors,
    };
  }

  try {
    const requestHeaders = await readCoCartForwardHeaders(await headers());
    const session = await cocartServerAdapter.getAuthSession(requestHeaders);

    if (!session.isAuthenticated || !session.user?.id) {
      return {
        success: false,
        error: "Sua sessao expirou. Entre novamente para alterar a senha.",
      };
    }

    if (String(session.user.id) !== String(input.customerId)) {
      return {
        success: false,
        error: "Nao foi possivel validar a conta para alterar a senha.",
      };
    }

    const loginIdentifier =
      session.user.email?.trim() || session.user.username?.trim();

    if (!loginIdentifier) {
      return {
        success: false,
        error: "Nao foi possivel validar a identidade da conta autenticada.",
      };
    }

    try {
      await cocartServerAdapter.login({
        username: loginIdentifier,
        password: parsedInput.data.current_password,
      });
    } catch (error: any) {
      const status =
        typeof error?.response?.status === "number"
          ? error.response.status
          : undefined;
      const message =
        typeof error?.message === "string" ? error.message : undefined;

      if (
        status === 401 ||
        status === 403 ||
        /authentication failed/i.test(message || "")
      ) {
        return {
          success: false,
          error: "A senha atual informada esta incorreta.",
          fieldErrors: {
            current_password: "A senha atual informada esta incorreta.",
          },
        };
      }

      return {
        success: false,
        error: "Nao foi possivel validar sua senha atual.",
      };
    }

    await wordpressWooRestAdapter.updateCustomerRaw(session.user.id, {
      password: parsedInput.data.new_password,
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
): Promise<AccountAddressActionResult> {
  const parsedAddress = accountAddressSchema.safeParse(address);

  if (!parsedAddress.success) {
    const fieldErrors = mapAccountAddressFieldErrors(
      parsedAddress.error.flatten().fieldErrors,
    );

    return {
      success: false,
      error:
        parsedAddress.error.issues[0]?.message ||
        "Revise os dados informados para salvar o endereco.",
      fieldErrors,
    };
  }

  try {
    const payload = normalizeAccountAddressPayload(parsedAddress.data);
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
        "Erro ao salvar endereco",
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
