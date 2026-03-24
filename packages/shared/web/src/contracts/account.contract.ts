import { z } from "zod";
import {
  createDateTimeStringSchema,
  createOptionalEmailSchema,
  createOptionalIdentifierSchema,
  createOptionalTextSchema,
  createRequiredTextSchema,
} from "../validation";
import { authUserViewSchema } from "./auth.contract";
import {
  addressViewSchema,
  entityIdSchema,
  moneyValueViewSchema,
  optionalAddressViewSchema,
  optionalMediaAssetViewSchema,
  statusViewSchema,
} from "./common.contract";

export const accountPostSummaryViewSchema = z
  .object({
    id: entityIdSchema,
    title: createRequiredTextSchema("Titulo do post", { max: 255 }),
    uri: createOptionalTextSchema({ max: 255 }),
  })
  .strict();
export type AccountPostSummaryView = z.infer<typeof accountPostSummaryViewSchema>;

export const accountOrderItemViewSchema = z
  .object({
    id: createOptionalIdentifierSchema("Item do pedido"),
    productId: createOptionalIdentifierSchema("Produto"),
    productName: createRequiredTextSchema("Nome do produto", { max: 255 }),
    quantity: z.number().int().min(1),
    total: moneyValueViewSchema,
    sku: createOptionalTextSchema({ max: 120 }),
    image: optionalMediaAssetViewSchema,
  })
  .strict();
export type AccountOrderItemView = z.infer<typeof accountOrderItemViewSchema>;

export const accountOrderSummaryViewSchema = z
  .object({
    id: entityIdSchema,
    number: createRequiredTextSchema("Numero do pedido", { max: 64 }),
    status: statusViewSchema,
    total: moneyValueViewSchema,
    createdAt: createDateTimeStringSchema("Data do pedido"),
    paymentMethodTitle: createOptionalTextSchema({ max: 120 }),
    items: z.array(accountOrderItemViewSchema).default([]),
  })
  .strict();
export type AccountOrderSummaryView = z.infer<
  typeof accountOrderSummaryViewSchema
>;

export const customerAddressViewSchema = addressViewSchema;
export type CustomerAddressView = z.infer<typeof customerAddressViewSchema>;

export const accountCustomerViewSchema = z
  .object({
    id: entityIdSchema,
    email: createOptionalEmailSchema(),
    displayName: createOptionalTextSchema({ max: 120 }),
    billingAddress: customerAddressViewSchema.nullable().optional(),
    shippingAddress: optionalAddressViewSchema,
  })
  .strict();
export type AccountCustomerView = z.infer<typeof accountCustomerViewSchema>;

export const accountOverviewViewSchema = z
  .object({
    viewer: authUserViewSchema,
    customer: accountCustomerViewSchema.nullable().optional(),
    orders: z.array(accountOrderSummaryViewSchema).default([]),
    posts: z.array(accountPostSummaryViewSchema).default([]),
  })
  .strict();
export type AccountOverviewView = z.infer<typeof accountOverviewViewSchema>;
