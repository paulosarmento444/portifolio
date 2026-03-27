import { z } from "@site/shared";
import type {
  AccountAddressFormData,
  AccountAddressFormErrors,
} from "../account.types";
import {
  isBrazilianStateValue,
  normalizeBrazilianStateValue,
} from "../brazilian-states";

const accountAddressStateSchema = z
  .string()
  .trim()
  .min(1, "Selecione o estado.")
  .transform((value) => normalizeBrazilianStateValue(value))
  .refine((value) => isBrazilianStateValue(value), {
    message: "Selecione um estado valido.",
  });

export const accountAddressSchema = z
  .object({
    first_name: z.string(),
    last_name: z.string(),
    address_1: z.string(),
    address_2: z.string(),
    city: z.string(),
    state: accountAddressStateSchema,
    postcode: z.string(),
    country: z.string().trim().default("BR"),
    phone: z.string(),
    email: z.string(),
  })
  .strict();

export type AccountAddressInput = z.infer<typeof accountAddressSchema>;

export const mapAccountAddressFieldErrors = (
  fieldErrors: Partial<Record<keyof AccountAddressInput, string[] | undefined>>,
): AccountAddressFormErrors => ({
  state: fieldErrors.state?.[0],
});
