import { z } from "zod";
import {
  createDateTimeStringSchema,
  createOptionalIdentifierSchema,
  createOptionalTextSchema,
  createRequiredTextSchema,
} from "../validation";
import {
  mediaAssetViewSchema,
  optionalMediaAssetViewSchema,
  optionalPaginationViewSchema,
  slugViewSchema,
} from "./common.contract";

export const blogCategoryViewSchema = z
  .object({
    name: createRequiredTextSchema("Nome da categoria", { max: 120 }),
    slug: slugViewSchema,
  })
  .strict();
export type BlogCategoryView = z.infer<typeof blogCategoryViewSchema>;

export const blogAuthorViewSchema = z
  .object({
    id: createOptionalIdentifierSchema("Autor"),
    name: createRequiredTextSchema("Nome do autor", { max: 120 }),
    avatar: optionalMediaAssetViewSchema,
  })
  .strict();
export type BlogAuthorView = z.infer<typeof blogAuthorViewSchema>;

export const blogPostSummaryViewSchema = z
  .object({
    id: createOptionalIdentifierSchema("Post"),
    title: createRequiredTextSchema("Titulo do post", { max: 255 }),
    uri: createRequiredTextSchema("URI do post", { max: 255 }),
    slug: createOptionalTextSchema({ max: 255 }),
    excerpt: createOptionalTextSchema({ max: 12000 }),
    publishedAt: createDateTimeStringSchema("Data do post"),
    featuredImage: optionalMediaAssetViewSchema,
    categories: z.array(blogCategoryViewSchema).default([]),
  })
  .strict();
export type BlogPostSummaryView = z.infer<typeof blogPostSummaryViewSchema>;

export const blogPostDetailViewSchema = blogPostSummaryViewSchema
  .extend({
    content: createRequiredTextSchema("Conteudo do post", { max: 100000 }),
    author: blogAuthorViewSchema.nullable().optional(),
    relatedPosts: z.array(blogPostSummaryViewSchema).default([]),
  })
  .strict();
export type BlogPostDetailView = z.infer<typeof blogPostDetailViewSchema>;

export const blogListingViewSchema = z
  .object({
    items: z.array(blogPostSummaryViewSchema),
    pagination: optionalPaginationViewSchema,
    availableCategories: z.array(blogCategoryViewSchema).default([]),
  })
  .strict();
export type BlogListingView = z.infer<typeof blogListingViewSchema>;
