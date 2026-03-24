import { z } from "zod";
import {
  createDateTimeStringSchema,
  createNumberSchema,
  createOptionalIdentifierSchema,
  createOptionalTextSchema,
  createRequiredTextSchema,
} from "../validation";
import {
  entityIdSchema,
  mediaAssetViewSchema,
  moneyValueViewSchema,
  optionalMediaAssetViewSchema,
  paginationViewSchema,
  slugViewSchema,
} from "./common.contract";

export const catalogCategoryViewSchema = z
  .object({
    id: entityIdSchema,
    name: createRequiredTextSchema("Nome da categoria", { max: 120 }),
    slug: slugViewSchema,
    description: createOptionalTextSchema({ max: 4000 }),
    image: optionalMediaAssetViewSchema,
  })
  .strict();
export type CatalogCategoryView = z.infer<typeof catalogCategoryViewSchema>;

export const catalogProductAttributeViewSchema = z
  .object({
    id: createOptionalIdentifierSchema("Atributo"),
    name: createRequiredTextSchema("Nome do atributo", { max: 120 }),
    type: createOptionalTextSchema({ max: 64 }),
    value: createOptionalTextSchema({ max: 2000 }),
    options: z.array(createRequiredTextSchema("Opcao", { max: 120 })).default([]),
  })
  .strict();
export type CatalogProductAttributeView = z.infer<
  typeof catalogProductAttributeViewSchema
>;

export const catalogProductCardViewSchema = z
  .object({
    id: entityIdSchema,
    slug: slugViewSchema,
    name: createRequiredTextSchema("Nome do produto", { max: 255 }),
    type: createRequiredTextSchema("Tipo do produto", { max: 64 }),
    sku: createOptionalTextSchema({ max: 120 }),
    shortDescription: createOptionalTextSchema({ max: 10000 }),
    image: optionalMediaAssetViewSchema,
    categories: z.array(catalogCategoryViewSchema).default([]),
    price: moneyValueViewSchema,
    regularPrice: moneyValueViewSchema,
    salePrice: moneyValueViewSchema.nullable().optional(),
    createdAt: createDateTimeStringSchema("Data do produto"),
    ratingAverage: createNumberSchema("Avaliacao media", { min: 0 }),
    ratingCount: createNumberSchema("Quantidade de avaliacoes", {
      min: 0,
      integer: true,
    }),
    featured: z.boolean(),
    onSale: z.boolean(),
    stockStatus: createRequiredTextSchema("Status de estoque", { max: 64 }),
  })
  .strict();
export type CatalogProductCardView = z.infer<typeof catalogProductCardViewSchema>;

export const catalogProductDetailViewSchema = catalogProductCardViewSchema
  .extend({
    description: createOptionalTextSchema({ max: 50000 }),
    gallery: z.array(mediaAssetViewSchema).default([]),
    attributes: z.array(catalogProductAttributeViewSchema).default([]),
    purchasable: z.boolean(),
    manageStock: z.boolean(),
    stockQuantity: z.number().int().nullable(),
  })
  .strict();
export type CatalogProductDetailView = z.infer<
  typeof catalogProductDetailViewSchema
>;

export const catalogListingViewSchema = z
  .object({
    items: z.array(catalogProductCardViewSchema),
    pagination: paginationViewSchema,
    availableCategories: z.array(catalogCategoryViewSchema).default([]),
  })
  .strict();
export type CatalogListingView = z.infer<typeof catalogListingViewSchema>;

export const catalogQueryViewSchema = z
  .object({
    search: createOptionalTextSchema({ max: 120 }),
    categorySlug: createOptionalTextSchema({ max: 120 }),
    sort: createOptionalTextSchema({ max: 64 }),
    page: createNumberSchema("Pagina", { min: 1, integer: true }),
    pageSize: createNumberSchema("Tamanho da pagina", {
      min: 1,
      integer: true,
    }),
  })
  .strict();
export type CatalogQueryView = z.infer<typeof catalogQueryViewSchema>;
