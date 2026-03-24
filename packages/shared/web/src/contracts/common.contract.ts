import { z } from "zod";
import {
  createIdentifierSchema,
  createNumberSchema,
  createOptionalEmailSchema,
  createOptionalIdentifierSchema,
  createOptionalTextSchema,
  createRequiredTextSchema,
  createSlugSchema,
  createUrlSchema,
} from "../validation";

export const entityIdSchema = createIdentifierSchema("Identificador");
export type EntityId = z.infer<typeof entityIdSchema>;

export const slugViewSchema = createSlugSchema("Slug");
export type SlugView = z.infer<typeof slugViewSchema>;

export const mediaAssetViewSchema = z
  .object({
    id: createOptionalIdentifierSchema("Midia"),
    url: createUrlSchema("URL da midia"),
    alt: createOptionalTextSchema({ max: 240 }),
  })
  .strict();
export type MediaAssetView = z.infer<typeof mediaAssetViewSchema>;

export const moneyValueViewSchema = z
  .object({
    amount: createNumberSchema("Valor", { min: 0 }),
    currencyCode: createRequiredTextSchema("Moeda", { max: 8 }),
    formatted: createOptionalTextSchema({ max: 64 }),
  })
  .strict();
export type MoneyValueView = z.infer<typeof moneyValueViewSchema>;

export const paginationViewSchema = z
  .object({
    currentPage: createNumberSchema("Pagina atual", { min: 1, integer: true }),
    pageSize: createNumberSchema("Tamanho da pagina", {
      min: 1,
      integer: true,
    }),
    totalItems: createNumberSchema("Total de itens", {
      min: 0,
      integer: true,
    }),
    totalPages: createNumberSchema("Total de paginas", {
      min: 1,
      integer: true,
    }),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  })
  .strict();
export type PaginationView = z.infer<typeof paginationViewSchema>;

export const statusViewSchema = z
  .object({
    code: createRequiredTextSchema("Codigo do status", { max: 64 }),
    label: createRequiredTextSchema("Rotulo do status", { max: 120 }),
  })
  .strict();
export type StatusView = z.infer<typeof statusViewSchema>;

export const addressViewSchema = z
  .object({
    firstName: createOptionalTextSchema({ max: 120 }),
    lastName: createOptionalTextSchema({ max: 120 }),
    company: createOptionalTextSchema({ max: 120 }),
    addressLine1: createOptionalTextSchema({ max: 255 }),
    addressLine2: createOptionalTextSchema({ max: 255 }),
    city: createOptionalTextSchema({ max: 120 }),
    postcode: createOptionalTextSchema({ max: 32 }),
    country: createOptionalTextSchema({ max: 64 }),
    state: createOptionalTextSchema({ max: 64 }),
    email: createOptionalEmailSchema(),
    phone: createOptionalTextSchema({ max: 32 }),
  })
  .strict();
export type AddressView = z.infer<typeof addressViewSchema>;

export const optionalMediaAssetViewSchema = mediaAssetViewSchema.nullable().optional();
export const optionalPaginationViewSchema = paginationViewSchema.nullable().optional();
export const optionalAddressViewSchema = addressViewSchema.nullable().optional();
export const optionalMoneyValueViewSchema = moneyValueViewSchema.nullable().optional();
