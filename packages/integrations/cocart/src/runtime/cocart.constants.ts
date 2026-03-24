export type CoCartEndpointMap = {
  catalogProducts: string;
  catalogCategories: string;
  catalogProduct: (productId: string | number) => string;
  catalogProductVariations: (productId: string | number) => string;
  authLogin: string;
  authLogout: string;
  cart: string;
  clearCart: string;
  addCartItem: string;
  updateCartItem: (itemKey: string) => string;
  removeCartItem: (itemKey: string) => string;
  applyCoupon: string;
  removeCoupon: (couponCode: string) => string;
  updateCart: string;
  updateCartCustomer: string;
  shippingRates: string;
  selectShippingRate: string;
  customerProfile: (customerId?: string | number) => string;
  accountOrders: string;
  orderSummary: (orderId: string | number) => string;
};

export const defaultCoCartEndpointMap: CoCartEndpointMap = {
  catalogProducts: "/products",
  catalogCategories: "/products/categories",
  catalogProduct: (productId) => `/products/${productId}`,
  catalogProductVariations: (productId) => `/products/${productId}/variations`,
  authLogin: "/login",
  authLogout: "/logout",
  cart: "/cart",
  clearCart: "/cart/clear",
  addCartItem: "/cart/add-item",
  updateCartItem: (itemKey) => `/cart/item/${encodeURIComponent(itemKey)}`,
  removeCartItem: (itemKey) => `/cart/item/${encodeURIComponent(itemKey)}`,
  applyCoupon: "/cart/coupons",
  removeCoupon: (couponCode) => `/cart/coupons/${encodeURIComponent(couponCode)}`,
  updateCart: "/cart/update",
  updateCartCustomer: "/cart/update-customer",
  shippingRates: "/cart/shipping-rates",
  selectShippingRate: "/cart/select-shipping-rate",
  customerProfile: (customerId) =>
    customerId ? `/account/customer/${customerId}` : "/account/customer",
  accountOrders: "/account/orders",
  orderSummary: (orderId) => `/orders/${orderId}`,
};
