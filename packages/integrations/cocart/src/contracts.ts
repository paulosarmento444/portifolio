import { z } from "zod";
import {
  accountOrderSummaryViewSchema,
  accountCustomerViewSchema,
  authSessionViewSchema,
  catalogListingViewSchema,
  catalogProductDetailViewSchema,
  checkoutCartViewSchema,
  checkoutCartItemViewSchema,
  checkoutOrderConfirmationViewSchema,
  checkoutShippingDestinationInputSchema,
  checkoutShippingPackageViewSchema,
  checkoutShippingRateMetaViewSchema,
  checkoutShippingRateViewSchema,
  checkoutShippingStatusSchema,
  checkoutShippingSelectionInputSchema,
  moneyValueViewSchema,
  optionalMoneyValueViewSchema,
} from "@site/shared";

const identifierSchema = z.union([z.string(), z.number()]).transform(String);
const optionalTextSchema = z.string().trim().min(1).optional();

export const cocartCapabilityStatusSchema = z.enum([
  "available",
  "unverified",
  "unsupported",
]);
export type CoCartCapabilityStatus = z.infer<typeof cocartCapabilityStatusSchema>;

export const cocartCapabilityMapSchema = z
  .object({
    catalog: cocartCapabilityStatusSchema,
    cart: cocartCapabilityStatusSchema,
    coupons: cocartCapabilityStatusSchema,
    shipping: cocartCapabilityStatusSchema,
    totals: cocartCapabilityStatusSchema,
    account: cocartCapabilityStatusSchema,
    auth: cocartCapabilityStatusSchema,
  })
  .strict();
export type CoCartCapabilityMap = z.infer<typeof cocartCapabilityMapSchema>;

export const cocartAuthTokensSchema = z
  .object({
    accessToken: z.string().trim().min(1),
    refreshToken: optionalTextSchema,
  })
  .strict();
export type CoCartAuthTokens = z.infer<typeof cocartAuthTokensSchema>;

export const cocartAuthLoginResultSchema = z
  .object({
    session: authSessionViewSchema,
    tokens: cocartAuthTokensSchema,
  })
  .strict();
export type CoCartAuthLoginResult = z.infer<
  typeof cocartAuthLoginResultSchema
>;

export const cocartCouponStateViewSchema = z
  .object({
    code: z.string().trim().min(1),
    label: optionalTextSchema,
    description: optionalTextSchema,
    type: optionalTextSchema,
    discount: optionalMoneyValueViewSchema,
  })
  .strict();
export type CoCartCouponStateView = z.infer<typeof cocartCouponStateViewSchema>;

export const cocartShippingRateMetaViewSchema = checkoutShippingRateMetaViewSchema;
export type CoCartShippingRateMetaView = z.infer<
  typeof cocartShippingRateMetaViewSchema
>;

export const cocartShippingQuoteViewSchema = checkoutShippingRateViewSchema;
export type CoCartShippingQuoteView = z.infer<
  typeof cocartShippingQuoteViewSchema
>;

export const cocartShippingPackageViewSchema = checkoutShippingPackageViewSchema;
export type CoCartShippingPackageView = z.infer<
  typeof cocartShippingPackageViewSchema
>;

export const cocartTotalsViewSchema = z
  .object({
    subtotal: moneyValueViewSchema,
    total: moneyValueViewSchema,
    discountTotal: optionalMoneyValueViewSchema,
    shippingTotal: optionalMoneyValueViewSchema,
    feeTotal: optionalMoneyValueViewSchema,
    taxTotal: optionalMoneyValueViewSchema,
  })
  .strict();
export type CoCartTotalsView = z.infer<typeof cocartTotalsViewSchema>;

export const cocartCartItemViewSchema = checkoutCartItemViewSchema
  .extend({
    itemKey: z.string().trim().min(1),
    variationId: identifierSchema.optional(),
  })
  .strict();
export type CoCartCartItemView = z.infer<typeof cocartCartItemViewSchema>;

export const cocartCustomerProfileViewSchema = accountCustomerViewSchema;
export type CoCartCustomerProfileView = z.infer<
  typeof cocartCustomerProfileViewSchema
>;

export const cocartCartStateViewSchema = checkoutCartViewSchema
  .extend({
    items: z.array(cocartCartItemViewSchema),
    customer: cocartCustomerProfileViewSchema.nullable().default(null),
    coupons: z.array(cocartCouponStateViewSchema).default([]),
    shippingPackages: z.array(cocartShippingPackageViewSchema).default([]),
    shippingRates: z.array(cocartShippingQuoteViewSchema).default([]),
    shippingStatus: checkoutShippingStatusSchema.default("destination_incomplete"),
    hasCalculatedShipping: z.boolean().default(false),
    shippingDestinationComplete: z.boolean().default(false),
    shippingTotal: optionalMoneyValueViewSchema,
    feeTotal: optionalMoneyValueViewSchema,
    taxTotal: optionalMoneyValueViewSchema,
    sessionKey: z.string().trim().optional(),
    cartToken: z.string().trim().optional(),
    cartHash: z.string().trim().optional(),
  })
  .strict();
export type CoCartCartStateView = z.infer<typeof cocartCartStateViewSchema>;

export const cocartCatalogListingViewSchema = catalogListingViewSchema;
export type CoCartCatalogListingView = z.infer<
  typeof cocartCatalogListingViewSchema
>;

export const cocartProductDetailViewSchema = catalogProductDetailViewSchema;
export type CoCartProductDetailView = z.infer<
  typeof cocartProductDetailViewSchema
>;

export const cocartAccountOrderSummaryViewSchema = accountOrderSummaryViewSchema;
export type CoCartAccountOrderSummaryView = z.infer<
  typeof cocartAccountOrderSummaryViewSchema
>;

export const cocartOrderSummaryViewSchema = checkoutOrderConfirmationViewSchema
  .extend({
    paymentUrl: optionalTextSchema,
    needsPayment: z.boolean().default(false),
  })
  .strict();
export type CoCartOrderSummaryView = z.infer<
  typeof cocartOrderSummaryViewSchema
>;

export const cocartSessionStateViewSchema = z
  .object({
    capabilities: cocartCapabilityMapSchema,
    session: authSessionViewSchema,
  })
  .strict();
export type CoCartSessionStateView = z.infer<
  typeof cocartSessionStateViewSchema
>;

export const cocartCatalogQuerySchema = z
  .object({
    search: z.string().trim().optional(),
    category: z.union([z.string(), z.number()]).optional(),
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(24),
  })
  .strict();
export type CoCartCatalogQuery = z.infer<typeof cocartCatalogQuerySchema>;

export const cocartLoginInputSchema = z
  .object({
    username: z.string().trim().min(1),
    password: z.string().min(1),
  })
  .strict();
export type CoCartLoginInput = z.infer<typeof cocartLoginInputSchema>;

export const cocartApplyCouponInputSchema = z
  .object({
    code: z.string().trim().min(1),
  })
  .strict();
export type CoCartApplyCouponInput = z.infer<
  typeof cocartApplyCouponInputSchema
>;

export const cocartEntityIdentifierSchema = identifierSchema;
export type CoCartEntityIdentifier = z.infer<
  typeof cocartEntityIdentifierSchema
>;

export const cocartSessionContextSchema = z
  .object({
    sessionKey: optionalTextSchema,
    cartToken: optionalTextSchema,
  })
  .strict();
export type CoCartSessionContext = z.infer<typeof cocartSessionContextSchema>;

export const cocartAddCartItemInputSchema = z
  .object({
    productId: identifierSchema,
    quantity: z.number().int().min(1).default(1),
    variationId: identifierSchema.optional(),
  })
  .strict();
export type CoCartAddCartItemInput = z.infer<
  typeof cocartAddCartItemInputSchema
>;

export const cocartUpdateCartItemInputSchema = z
  .object({
    itemKey: z.string().trim().min(1),
    quantity: z.number().int().min(0),
  })
  .strict();
export type CoCartUpdateCartItemInput = z.infer<
  typeof cocartUpdateCartItemInputSchema
>;

export const cocartCustomerProfileUpdateInputSchema = z
  .object({
    firstName: optionalTextSchema,
    lastName: optionalTextSchema,
    email: z.string().trim().email().optional(),
    phone: optionalTextSchema,
    city: optionalTextSchema,
  })
  .strict();
export type CoCartCustomerProfileUpdateInput = z.infer<
  typeof cocartCustomerProfileUpdateInputSchema
>;

export const cocartCustomerAddressUpdateInputSchema = z
  .object({
    addressType: z.enum(["billing", "shipping"]),
    firstName: optionalTextSchema,
    lastName: optionalTextSchema,
    company: optionalTextSchema,
    addressLine1: optionalTextSchema,
    addressLine2: optionalTextSchema,
    city: optionalTextSchema,
    state: optionalTextSchema,
    postcode: optionalTextSchema,
    country: optionalTextSchema,
    phone: optionalTextSchema,
    email: z.string().trim().email().optional(),
  })
  .strict();
export type CoCartCustomerAddressUpdateInput = z.infer<
  typeof cocartCustomerAddressUpdateInputSchema
>;

export const cocartShippingDestinationInputSchema =
  checkoutShippingDestinationInputSchema;
export type CoCartShippingDestinationInput = z.infer<
  typeof cocartShippingDestinationInputSchema
>;

export const cocartSelectShippingRateInputSchema =
  checkoutShippingSelectionInputSchema;
export type CoCartSelectShippingRateInput = z.infer<
  typeof cocartSelectShippingRateInputSchema
>;

export const cocartCustomerPasswordUpdateInputSchema = z
  .object({
    newPassword: z.string().trim().min(6),
  })
  .strict();
export type CoCartCustomerPasswordUpdateInput = z.infer<
  typeof cocartCustomerPasswordUpdateInputSchema
>;

export const defaultCoCartCapabilities = cocartCapabilityMapSchema.parse({
  catalog: "unverified",
  cart: "unverified",
  coupons: "unverified",
  shipping: "unverified",
  totals: "unverified",
  account: "unsupported",
  auth: "unverified",
});
