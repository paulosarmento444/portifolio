export type CoCartRawImageSizeMap = Record<string, string | null | undefined>;

export type CoCartRawImage = {
  id?: string | number | null;
  src?: string | CoCartRawImageSizeMap | null;
  url?: string | CoCartRawImageSizeMap | null;
  source_url?: string | CoCartRawImageSizeMap | null;
  alt?: string | null;
  alt_text?: string | null;
  name?: string | null;
  title?: string | null;
};

export type CoCartRawCategory = {
  id?: string | number | null;
  slug?: string | null;
  name?: string | null;
  description?: string | null;
  image?: CoCartRawImage | CoCartRawImageSizeMap | null;
  thumbnail?: CoCartRawImage | CoCartRawImageSizeMap | null;
};

export type CoCartRawAttribute = {
  id?: string | number | null;
  name?: string | null;
  variation?: boolean | null;
  used_for_variation?: boolean | null;
  options?: string[] | Record<string, string> | null;
  option?: string | Record<string, string> | null;
  value?: string | null;
};

export type CoCartRawPrices = {
  price?: string | number | null;
  regular_price?: string | number | null;
  sale_price?: string | number | null;
  on_sale?: boolean | null;
  currency_code?: string | null;
  currency?: {
    code?: string | null;
    currency_code?: string | null;
    currency_minor_unit?: string | number | null;
  } | null;
};

export type CoCartRawProduct = {
  id?: string | number | null;
  slug?: string | null;
  name?: string | null;
  type?: string | null;
  sku?: string | null;
  short_description?: string | null;
  description?: string | null;
  average_rating?: string | number | null;
  rating_count?: string | number | null;
  featured?: boolean | null;
  on_sale?: boolean | null;
  stock_status?: string | null;
  stock_quantity?: string | number | null;
  manage_stock?: boolean | null;
  purchasable?: boolean | null;
  date_created?: string | null;
  date_created_gmt?: string | null;
  dates?: {
    created?: string | null;
    created_gmt?: string | null;
    modified?: string | null;
    modified_gmt?: string | null;
  } | null;
  price?: string | number | null;
  regular_price?: string | number | null;
  sale_price?: string | number | null;
  prices?: CoCartRawPrices | null;
  image?: CoCartRawImage | CoCartRawImageSizeMap | null;
  featured_image?: CoCartRawImage | CoCartRawImageSizeMap | null;
  images?: Array<CoCartRawImage | CoCartRawImageSizeMap> | null;
  categories?: CoCartRawCategory[] | null;
  attributes?: CoCartRawAttribute[] | Record<string, CoCartRawAttribute> | null;
  hidden_conditions?: {
    manage_stock?: boolean | null;
  } | null;
  stock?: {
    is_in_stock?: boolean | null;
    stock_quantity?: string | number | null;
    stock_status?: string | null;
  } | null;
  add_to_cart?: {
    is_purchasable?: boolean | null;
  } | null;
  review_count?: string | number | null;
};

export type CoCartRawTotals = {
  currency_code?: string | null;
  subtotal?: string | number | null;
  total?: string | number | null;
  discount_total?: string | number | null;
  shipping_total?: string | number | null;
  fee_total?: string | number | null;
  total_tax?: string | number | null;
  total_subtotal?: string | number | null;
  total_discount?: string | number | null;
  total_shipping?: string | number | null;
  total_fees?: string | number | null;
};

export type CoCartRawCartItem = {
  item_key?: string | null;
  key?: string | null;
  id?: string | number | null;
  product_id?: string | number | null;
  variation_id?: string | number | null;
  name?: string | null;
  title?: string | null;
  sku?: string | null;
  quantity?:
    | string
    | number
    | {
        value?: string | number | null;
        min_purchase?: string | number | null;
        max_purchase?: string | number | null;
      }
    | null;
  price?: string | number | null;
  prices?: CoCartRawPrices | null;
  totals?: {
    line_total?: string | number | null;
    line_subtotal?: string | number | null;
    subtotal?: string | number | null;
    total?: string | number | null;
  } | null;
  featured_image?: CoCartRawImage | CoCartRawImageSizeMap | string | null;
  image?: CoCartRawImage | CoCartRawImageSizeMap | string | null;
  images?: Array<CoCartRawImage | CoCartRawImageSizeMap> | null;
};

export type CoCartRawCoupon = {
  code?: string | null;
  coupon?: string | null;
  label?: string | null;
  description?: string | null;
  discount_type?: string | null;
  saving?: string | number | null;
  saving_html?: string | null;
  totals?: {
    total_discount?: string | number | null;
    discount_total?: string | number | null;
  } | null;
  discount_total?: string | number | null;
};

export type CoCartRawShippingRate = {
  package_id?: string | number | null;
  key?: string | null;
  rate_id?: string | null;
  method_id?: string | null;
  instance_id?: string | number | null;
  label?: string | null;
  name?: string | null;
  html?: string | null;
  description?: string | null;
  selected?: boolean | null;
  chosen?: boolean | null;
  chosen_method?: boolean | null;
  cost?: string | number | null;
  price?: string | number | null;
  taxes?: string | number | null;
  meta_data?:
    | Record<string, unknown>
    | Array<{
        id?: string | number | null;
        key?: string | null;
        display_key?: string | null;
        value?: unknown;
        display_value?: unknown;
      }>
    | null;
};

export type CoCartRawShippingPackage = {
  package_name?: string | null;
  package_details?: string | null;
  index?: string | number | null;
  package_id?: string | number | null;
  chosen_method?: string | null;
  formatted_destination?: string | null;
  rates?: CoCartRawShippingRate[] | Record<string, CoCartRawShippingRate> | null;
};

export type CoCartRawShippingDetails = {
  total_packages?: string | number | null;
  show_package_details?: boolean | null;
  has_calculated_shipping?: boolean | null;
  packages?:
    | CoCartRawShippingPackage[]
    | Record<string, CoCartRawShippingPackage>
    | null;
};

export type CoCartRawCart = {
  session_key?: string | null;
  cart_key?: string | null;
  cart_hash?: string | null;
  currency?: {
    currency_code?: string | null;
    currency_minor_unit?: string | number | null;
  } | null;
  customer?: {
    billing_address?: {
      billing_first_name?: string | null;
      billing_last_name?: string | null;
      billing_country?: string | null;
      billing_address_1?: string | null;
      billing_address_2?: string | null;
      billing_city?: string | null;
      billing_state?: string | null;
      billing_postcode?: string | null;
      billing_phone?: string | null;
      billing_email?: string | null;
    } | null;
    shipping_address?: {
      shipping_first_name?: string | null;
      shipping_last_name?: string | null;
      shipping_country?: string | null;
      shipping_address_1?: string | null;
      shipping_address_2?: string | null;
      shipping_city?: string | null;
      shipping_state?: string | null;
      shipping_postcode?: string | null;
    } | null;
  } | null;
  items?: CoCartRawCartItem[] | Record<string, CoCartRawCartItem> | null;
  cart?: {
    items?: CoCartRawCartItem[] | Record<string, CoCartRawCartItem> | null;
  } | null;
  coupons?: CoCartRawCoupon[] | Record<string, CoCartRawCoupon> | null;
  applied_coupons?: CoCartRawCoupon[] | Record<string, CoCartRawCoupon> | null;
  shipping_rates?:
    | CoCartRawShippingDetails
    | CoCartRawShippingPackage[]
    | Record<string, CoCartRawShippingPackage>
    | CoCartRawShippingRate[]
    | Record<string, CoCartRawShippingRate>
    | null;
  shipping?:
    | CoCartRawShippingDetails
    | CoCartRawShippingPackage[]
    | Record<string, CoCartRawShippingPackage>
    | CoCartRawShippingRate[]
    | Record<string, CoCartRawShippingRate>
    | null;
  totals?: CoCartRawTotals | null;
};

export type CoCartRawCustomer = {
  id?: string | number | null;
  email?: string | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  billing_address?: Record<string, unknown> | null;
  shipping_address?: Record<string, unknown> | null;
  billing?: Record<string, unknown> | null;
  shipping?: Record<string, unknown> | null;
};

export type CoCartRawOrder = {
  id?: string | number | null;
  number?: string | number | null;
  status?: string | null;
  total?: string | number | null;
  date_created?: string | null;
  payment_method_title?: string | null;
  billing?: Record<string, unknown> | null;
  shipping?: Record<string, unknown> | null;
  line_items?: Array<{
    id?: string | number | null;
    product_id?: string | number | null;
    name?: string | null;
    quantity?: string | number | null;
    total?: string | number | null;
    subtotal?: string | number | null;
    image?: CoCartRawImage | null;
  }> | null;
  coupon_lines?: Array<{
    code?: string | null;
    discount?: string | number | null;
  }> | null;
};

export type CoCartRawOrderCollection =
  | CoCartRawOrder[]
  | {
      items?: CoCartRawOrder[] | null;
      orders?: CoCartRawOrder[] | null;
    };

export type CoCartRawSession = {
  isAuthenticated?: boolean | null;
  authenticated?: boolean | null;
  user?: {
    id?: string | number | null;
    email?: string | null;
    username?: string | null;
    display_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    avatar?: CoCartRawImage | null;
    roles?: string[] | null;
  } | null;
  customer?: CoCartRawCustomer | null;
};

export type CoCartRawLoginResponse = {
  user_id?: string | number | null;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  username?: string | null;
  role?: string | null;
  avatar_urls?: Record<string, string | null | undefined> | null;
  email?: string | null;
  extras?: {
    jwt_token?: string | null;
    jwt_refresh?: string | null;
  } | null;
};

export type CoCartRawProductCollection =
  | CoCartRawProduct[]
  | {
      items?: CoCartRawProduct[] | null;
      products?: CoCartRawProduct[] | null;
      categories?: CoCartRawCategory[] | null;
      page?: string | number | null;
      pageSize?: string | number | null;
      page_size?: string | number | null;
      totalItems?: string | number | null;
      total_products?: string | number | null;
      totalPages?: string | number | null;
      total_pages?: string | number | null;
      hasNextPage?: boolean | null;
      hasPreviousPage?: boolean | null;
      _links?: {
        next?: unknown[] | null;
        prev?: unknown[] | null;
      } | null;
    };

export type CoCartRawCategoryCollection =
  | CoCartRawCategory[]
  | {
      items?: CoCartRawCategory[] | null;
      categories?: CoCartRawCategory[] | null;
      product_categories?: CoCartRawCategory[] | null;
    };
