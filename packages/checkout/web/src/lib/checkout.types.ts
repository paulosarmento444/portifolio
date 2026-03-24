import type {
  AccountCustomerView,
  CheckoutCartView,
  CheckoutOrderConfirmationView,
  CheckoutPaymentMethodView,
  CheckoutShippingDestinationInput,
  CheckoutShippingPackageView,
  CheckoutShippingRateView,
  CheckoutShippingSelectionInput,
} from "@site/shared";
import type { CoCartCartStateView } from "@site/integrations/cocart";

export type CheckoutSessionCartItem = {
  itemKey: string;
  productId: string;
  variationId?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  name: string;
  image: CheckoutCartView["items"][number]["image"];
};

export type CheckoutSessionCart = {
  items: CheckoutSessionCartItem[];
};

export type CheckoutAppliedCoupon = {
  code: string;
  discount: number;
  type?: string;
  amount?: string;
  coupon_id?: number;
};

export type CheckoutPageData = {
  userId: string;
  customer: AccountCustomerView;
  cart: CoCartCartStateView;
  cartState: CheckoutSessionCart;
  paymentMethods: CheckoutPaymentMethodView[];
  appliedCoupon: CheckoutAppliedCoupon | null;
};

export type CheckoutAddressFormData = {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
};

export type CheckoutShippingDestinationFormData = CheckoutShippingDestinationInput;
export type CheckoutShippingPackage = CheckoutShippingPackageView;
export type CheckoutShippingRate = CheckoutShippingRateView;
export type CheckoutSelectedShippingMethodInput = CheckoutShippingSelectionInput;

export type CheckoutPaymentMethodCode = string;
export type CheckoutPaymentFlow = "pix" | "card";

export type CheckoutOrderItemInput = {
  productId: string | number;
  variationId?: string | number;
  quantity: number;
  unitPrice: number;
  total: number;
  name: string;
};

export type CheckoutCreateOrderInput = {
  customerId: string | number;
  billingAddress: CheckoutAddressFormData;
  shippingAddress: CheckoutAddressFormData;
  items: CheckoutOrderItemInput[];
  paymentMethod: CheckoutPaymentMethodCode;
  paymentMethodTitle?: string;
  paymentFlow: CheckoutPaymentFlow;
  coupon?: CheckoutAppliedCoupon | null;
  totalAmount: number;
  customerNote?: string | null;
};

export type CheckoutOrderView = CheckoutOrderConfirmationView;
