import { z } from "zod";
import {
  createIdentifierSchema,
  createDateTimeStringSchema,
  createOptionalTextSchema,
  createOptionalUrlSchema,
  createRequiredTextSchema,
} from "../validation";
import {
  addressViewSchema,
  moneyValueViewSchema,
  optionalMediaAssetViewSchema,
  optionalMoneyValueViewSchema,
  statusViewSchema,
} from "./common.contract";

export const checkoutCartItemViewSchema = z
  .object({
    productId: createIdentifierSchema("Produto"),
    quantity: z.number().int().min(1),
    quantityLimits: z
      .object({
        min: z.number().int().min(1),
        max: z.number().int().min(0).nullable(),
      })
      .strict()
      .optional(),
    subtotal: optionalMoneyValueViewSchema,
    total: moneyValueViewSchema,
    unitPrice: optionalMoneyValueViewSchema,
    name: createRequiredTextSchema("Nome do produto", { max: 255 }),
    image: optionalMediaAssetViewSchema,
  })
  .strict();
export type CheckoutCartItemView = z.infer<typeof checkoutCartItemViewSchema>;

export const checkoutCartViewSchema = z
  .object({
    items: z.array(checkoutCartItemViewSchema),
    subtotal: moneyValueViewSchema,
    total: moneyValueViewSchema,
    couponCode: createOptionalTextSchema({ max: 64 }),
    couponDiscount: optionalMoneyValueViewSchema,
  })
  .strict();
export type CheckoutCartView = z.infer<typeof checkoutCartViewSchema>;

export const checkoutShippingRateMetaViewSchema = z
  .object({
    key: createRequiredTextSchema("Chave do metadado do frete", { max: 120 }),
    label: createOptionalTextSchema({ max: 120 }),
    value: z.unknown(),
  })
  .strict();
export type CheckoutShippingRateMetaView = z.infer<
  typeof checkoutShippingRateMetaViewSchema
>;

export const checkoutShippingRateViewSchema = z
  .object({
    packageId: createOptionalTextSchema({ max: 120 }),
    rateId: createRequiredTextSchema("Identificador da tarifa de frete", {
      max: 255,
    }),
    rateKey: createOptionalTextSchema({ max: 255 }),
    methodId: createOptionalTextSchema({ max: 120 }),
    instanceId: createOptionalTextSchema({ max: 120 }),
    label: createRequiredTextSchema("Titulo da tarifa de frete", { max: 255 }),
    description: createOptionalTextSchema({ max: 1000 }),
    cost: moneyValueViewSchema,
    selected: z.boolean(),
    deliveryForecastDays: z.number().int().positive().optional(),
    metaData: z.array(checkoutShippingRateMetaViewSchema).default([]),
  })
  .strict();
export type CheckoutShippingRateView = z.infer<
  typeof checkoutShippingRateViewSchema
>;

export const checkoutShippingPackageViewSchema = z
  .object({
    packageId: createRequiredTextSchema("Pacote de frete", { max: 120 }),
    packageName: createOptionalTextSchema({ max: 255 }),
    packageDetails: createOptionalTextSchema({ max: 1000 }),
    formattedDestination: createOptionalTextSchema({ max: 500 }),
    chosenRateId: createOptionalTextSchema({ max: 255 }),
    rates: z.array(checkoutShippingRateViewSchema).default([]),
  })
  .strict();
export type CheckoutShippingPackageView = z.infer<
  typeof checkoutShippingPackageViewSchema
>;

export const checkoutShippingStatusSchema = z.enum([
  "destination_incomplete",
  "no_services",
  "rates_available",
]);
export type CheckoutShippingStatus = z.infer<typeof checkoutShippingStatusSchema>;

export const checkoutShippingStateViewSchema = z
  .object({
    packages: z.array(checkoutShippingPackageViewSchema).default([]),
    rates: z.array(checkoutShippingRateViewSchema).default([]),
    shippingTotal: optionalMoneyValueViewSchema,
    status: checkoutShippingStatusSchema.default("destination_incomplete"),
    hasCalculatedShipping: z.boolean().default(false),
    destinationComplete: z.boolean().default(false),
  })
  .strict();
export type CheckoutShippingStateView = z.infer<
  typeof checkoutShippingStateViewSchema
>;

export const checkoutShippingDestinationInputSchema = z
  .object({
    postcode: createRequiredTextSchema("CEP", { max: 32 }),
    country: z.string().trim().min(2).max(3).default("BR"),
    state: createOptionalTextSchema({ max: 120 }),
    city: createOptionalTextSchema({ max: 120 }),
    addressLine1: createOptionalTextSchema({ max: 255 }),
    addressLine2: createOptionalTextSchema({ max: 255 }),
    firstName: createOptionalTextSchema({ max: 120 }),
    lastName: createOptionalTextSchema({ max: 120 }),
    company: createOptionalTextSchema({ max: 120 }),
    phone: createOptionalTextSchema({ max: 40 }),
    email: z.string().trim().email().optional(),
  })
  .strict();
export type CheckoutShippingDestinationInput = z.infer<
  typeof checkoutShippingDestinationInputSchema
>;

export const checkoutShippingSelectionInputSchema = z
  .object({
    packageId: createOptionalTextSchema({ max: 120 }),
    rateId: createRequiredTextSchema("Identificador da tarifa selecionada", {
      max: 255,
    }),
  })
  .strict();
export type CheckoutShippingSelectionInput = z.infer<
  typeof checkoutShippingSelectionInputSchema
>;

export const checkoutPaymentMethodViewSchema = z
  .object({
    id: createIdentifierSchema("Metodo de pagamento"),
    title: createRequiredTextSchema("Titulo do metodo de pagamento", {
      max: 120,
    }),
    description: createOptionalTextSchema({ max: 1000 }),
    enabled: z.boolean(),
  })
  .strict();
export type CheckoutPaymentMethodView = z.infer<
  typeof checkoutPaymentMethodViewSchema
>;

export const checkoutOrderTrackingStateSchema = z.enum([
  "available",
  "unavailable",
  "ineligible",
  "error",
]);
export type CheckoutOrderTrackingState = z.infer<
  typeof checkoutOrderTrackingStateSchema
>;

export const checkoutOrderTrackingEventViewSchema = z
  .object({
    status: createRequiredTextSchema("Status do rastreio", { max: 255 }),
    detail: createOptionalTextSchema({ max: 1000 }),
    location: createOptionalTextSchema({ max: 255 }),
    occurredAt: createDateTimeStringSchema("Data do evento"),
  })
  .strict();
export type CheckoutOrderTrackingEventView = z.infer<
  typeof checkoutOrderTrackingEventViewSchema
>;

export const checkoutOrderTrackingViewSchema = z
  .object({
    provider: createRequiredTextSchema("Transportadora", { max: 120 }),
    code: createRequiredTextSchema("Codigo de rastreio", { max: 255 }),
    state: checkoutOrderTrackingStateSchema,
    currentStatus: createOptionalTextSchema({ max: 255 }),
    latestEvent: createOptionalTextSchema({ max: 1000 }),
    latestLocation: createOptionalTextSchema({ max: 255 }),
    lastUpdatedAt: createDateTimeStringSchema("Ultima atualizacao").optional(),
    message: createOptionalTextSchema({ max: 2000 }),
    history: z.array(checkoutOrderTrackingEventViewSchema).default([]),
  })
  .strict();
export type CheckoutOrderTrackingView = z.infer<
  typeof checkoutOrderTrackingViewSchema
>;

export const checkoutOrderConfirmationViewSchema = z
  .object({
    orderId: createIdentifierSchema("Pedido"),
    orderNumber: createRequiredTextSchema("Numero do pedido", { max: 64 }),
    status: statusViewSchema,
    createdAt: createDateTimeStringSchema("Data do pedido"),
    total: moneyValueViewSchema,
    paymentMethodId: createOptionalTextSchema({ max: 120 }),
    paymentMethodTitle: createOptionalTextSchema({ max: 120 }),
    paymentUrl: createOptionalUrlSchema("URL de pagamento"),
    shippingAddress: addressViewSchema,
    billingAddress: addressViewSchema,
    items: z.array(checkoutCartItemViewSchema).default([]),
    couponCode: createOptionalTextSchema({ max: 64 }),
    couponDiscount: optionalMoneyValueViewSchema,
    customerNote: createOptionalTextSchema({ max: 5000 }),
    trackingCode: createOptionalTextSchema({ max: 255 }),
    trackingUrl: createOptionalUrlSchema("URL de rastreio"),
    tracking: checkoutOrderTrackingViewSchema.nullable().optional(),
  })
  .strict();
export type CheckoutOrderConfirmationView = z.infer<
  typeof checkoutOrderConfirmationViewSchema
>;
