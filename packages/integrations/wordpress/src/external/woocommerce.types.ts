export type WooImage = {
  id?: number | null;
  src?: string | null;
  alt?: string | null;
  name?: string | null;
};

export type WooCategory = {
  id?: number | null;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  image?: WooImage | null;
};

export type WooAttribute = {
  id?: number | null;
  name?: string | null;
  variation?: boolean | null;
  options?: string[] | null;
  option?: string | null;
};

export type WooDimension = {
  length?: string | null;
  width?: string | null;
  height?: string | null;
};

export type WooProduct = {
  id?: number | null;
  name?: string | null;
  slug?: string | null;
  short_description?: string | null;
  description?: string | null;
  sku?: string | null;
  price?: string | null;
  regular_price?: string | null;
  sale_price?: string | null;
  featured?: boolean | null;
  stock_status?: string | null;
  stock_quantity?: number | null;
  date_created?: string | null;
  average_rating?: string | null;
  rating_count?: number | null;
  type?: string | null;
  on_sale?: boolean | null;
  purchasable?: boolean | null;
  manage_stock?: boolean | null;
  image?: WooImage | null;
  images?: WooImage[] | null;
  categories?: WooCategory[] | null;
  attributes?: WooAttribute[] | null;
  dimensions?: WooDimension | null;
};

export type WooOrderItem = {
  id?: number | null;
  product_id?: number | null;
  name?: string | null;
  quantity?: number | null;
  total?: string | null;
  sku?: string | null;
};

export type WooCouponLine = {
  id?: number | null;
  code?: string | null;
  discount?: string | null;
};

export type WooMetaData = {
  id?: number | null;
  key?: string | null;
  value?: unknown;
};

export type WooAddress = {
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  city?: string | null;
  postcode?: string | null;
  country?: string | null;
  state?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type WooOrder = {
  id?: number | null;
  customer_id?: number | null;
  order_key?: string | null;
  number?: string | null;
  status?: string | null;
  total?: string | null;
  date_created?: string | null;
  payment_method?: string | null;
  payment_method_title?: string | null;
  payment_url?: string | null;
  customer_note?: string | null;
  line_items?: WooOrderItem[] | null;
  coupon_lines?: WooCouponLine[] | null;
  meta_data?: WooMetaData[] | null;
  billing?: WooAddress | null;
  shipping?: WooAddress | null;
};

export type WooOrderNote = {
  id?: number | null;
  author?: string | null;
  date_created?: string | null;
  note?: string | null;
  customer_note?: boolean | null;
};

export type WooCustomer = {
  id?: number | null;
  email?: string | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  billing?: WooAddress | null;
  shipping?: WooAddress | null;
  avatar_url?: string | null;
  role?: string | null;
  roles?: string[] | null;
};

export type WooPaymentGateway = {
  id?: string | null;
  title?: string | null;
  description?: string | null;
  enabled?: boolean | string | null;
};

export type WooCoupon = {
  id?: number | null;
  code?: string | null;
  status?: string | null;
  amount?: string | null;
  discount_type?: "percent" | "fixed_cart" | "fixed_product" | null;
  description?: string | null;
  date_expires?: string | null;
  minimum_amount?: string | null;
  maximum_amount?: string | null;
  individual_use?: boolean | null;
  exclude_sale_items?: boolean | null;
  free_shipping?: boolean | null;
  usage_limit?: number | null;
  usage_limit_per_user?: number | null;
  usage_count?: number | null;
  product_ids?: number[] | null;
  excluded_product_ids?: number[] | null;
  product_categories?: number[] | null;
  excluded_product_categories?: number[] | null;
};
