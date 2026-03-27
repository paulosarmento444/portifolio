import { z } from "@site/shared";
import type { AccountPasswordFormData } from "../account.types";

export const accountPasswordChangeSchema = z
  .object({
    current_password: z.string().trim().min(1, "Informe sua senha atual."),
    new_password: z
      .string()
      .trim()
      .min(1, "Informe sua nova senha.")
      .min(8, "A nova senha precisa ter pelo menos 8 caracteres."),
    confirm_password: z.string().trim().min(1, "Confirme a nova senha."),
  })
  .strict()
  .superRefine((value, context) => {
    if (
      value.current_password.trim() &&
      value.new_password.trim() &&
      value.current_password.trim() === value.new_password.trim()
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["new_password"],
        message: "A nova senha precisa ser diferente da senha atual.",
      });
    }

    if (
      value.confirm_password.trim() &&
      value.new_password.trim() !== value.confirm_password.trim()
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirm_password"],
        message: "As senhas precisam coincidir.",
      });
    }
  });

export type AccountPasswordChangeInput = z.infer<
  typeof accountPasswordChangeSchema
>;

export type AccountPasswordChangeFieldErrors = Partial<
  Record<keyof AccountPasswordFormData, string>
>;

export const mapAccountPasswordFieldErrors = (
  fieldErrors: Partial<Record<keyof AccountPasswordChangeInput, string[] | undefined>>,
): AccountPasswordChangeFieldErrors => ({
  current_password: fieldErrors.current_password?.[0],
  new_password: fieldErrors.new_password?.[0],
  confirm_password: fieldErrors.confirm_password?.[0],
});
