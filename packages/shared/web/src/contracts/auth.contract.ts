import { z } from "zod";
import {
  createEmailSchema,
  createIdentifierSchema,
  createOptionalEmailSchema,
  createOptionalTextSchema,
  createRequiredTextSchema,
} from "../validation";
import { optionalMediaAssetViewSchema } from "./common.contract";

export const authUserViewSchema = z
  .object({
    id: createIdentifierSchema("Usuario"),
    email: createOptionalEmailSchema(),
    username: createOptionalTextSchema({ max: 120 }),
    displayName: createRequiredTextSchema("Nome de exibicao", { max: 120 }),
    firstName: createOptionalTextSchema({ max: 120 }),
    lastName: createOptionalTextSchema({ max: 120 }),
    avatar: optionalMediaAssetViewSchema,
    roleLabels: z.array(createRequiredTextSchema("Perfil", { max: 64 })).default(
      [],
    ),
  })
  .strict();
export type AuthUserView = z.infer<typeof authUserViewSchema>;

export const authSessionViewSchema = z
  .object({
    isAuthenticated: z.boolean(),
    user: authUserViewSchema.nullable().optional(),
  })
  .strict();
export type AuthSessionView = z.infer<typeof authSessionViewSchema>;

export const loginCredentialsSchema = z
  .object({
    usernameOrEmail: createRequiredTextSchema("Usuario ou e-mail", { max: 160 }),
    password: createRequiredTextSchema("Senha", { min: 8, max: 120 }),
  })
  .strict();
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

export const registerCredentialsSchema = z
  .object({
    username: createRequiredTextSchema("Usuario", { min: 3, max: 120 }),
    email: createEmailSchema(),
    password: createRequiredTextSchema("Senha", { min: 8, max: 120 }),
    confirmPassword: createRequiredTextSchema("Confirmacao de senha", {
      min: 8,
      max: 120,
    }),
  })
  .strict()
  .refine((value) => value.password === value.confirmPassword, {
    message: "As senhas precisam coincidir",
    path: ["confirmPassword"],
  });
export type RegisterCredentials = z.infer<typeof registerCredentialsSchema>;

export const forgotPasswordRequestSchema = z
  .object({
    usernameOrEmail: createRequiredTextSchema("Usuario ou e-mail", {
      max: 160,
    }),
  })
  .strict();
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;

export const passwordResetTokenSchema = z
  .object({
    login: createRequiredTextSchema("Usuario", { max: 160 }),
    key: createRequiredTextSchema("Chave de redefinicao", { max: 255 }),
  })
  .strict();
export type PasswordResetTokenInput = z.infer<typeof passwordResetTokenSchema>;

export const resetPasswordCredentialsSchema = passwordResetTokenSchema
  .extend({
    password: createRequiredTextSchema("Nova senha", { min: 8, max: 120 }),
    confirmPassword: createRequiredTextSchema("Confirmacao de senha", {
      min: 8,
      max: 120,
    }),
  })
  .strict()
  .refine((value) => value.password === value.confirmPassword, {
    message: "As senhas precisam coincidir",
    path: ["confirmPassword"],
  });
export type ResetPasswordCredentials = z.infer<
  typeof resetPasswordCredentialsSchema
>;
