import type {
  AccountCustomerView,
  AccountOrderSummaryView,
  AccountOverviewView,
  AuthUserView,
  CustomerAddressView,
} from "@site/shared";

export type AccountMenu =
  | "welcome"
  | "orders"
  | "account"
  | "addresses"
  | "logout";

export type AccountOverviewData = AccountOverviewView;

export type AccountProfileFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
};

export type AccountPasswordFormData = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export type AccountPasswordFormErrors = Partial<
  Record<keyof AccountPasswordFormData, string>
>;

export type AccountAddressFormData = {
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

export type AccountAddressFormErrors = Partial<
  Record<keyof AccountAddressFormData, string>
>;

export type AccountSectionPropsBase = {
  viewer: AuthUserView;
  customer: AccountCustomerView | null | undefined;
  orders: AccountOrderSummaryView[];
};

export type AccountCustomerChangeHandler = (
  customer: AccountCustomerView | null,
) => void;
export type AccountDisplayNameChangeHandler = (displayName: string) => void;
export type AccountAddressType = "billing" | "shipping";
export type AccountBillingAddress = CustomerAddressView | null | undefined;
