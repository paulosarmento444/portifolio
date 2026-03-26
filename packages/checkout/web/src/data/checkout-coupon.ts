import type { CoCartCartStateView } from "@site/integrations/cocart";
import type { CheckoutAppliedCoupon } from "./checkout.types";

export const deriveCheckoutAppliedCouponFromCart = (
  cart: Pick<CoCartCartStateView, "coupons" | "couponDiscount">,
): CheckoutAppliedCoupon | null => {
  const primaryCoupon = cart.coupons[0];

  if (!primaryCoupon) {
    return null;
  }

  return {
    code: primaryCoupon.code,
    discount: Math.abs(
      Number(primaryCoupon.discount?.amount ?? cart.couponDiscount?.amount ?? 0),
    ),
    type: primaryCoupon.type,
    amount:
      primaryCoupon.discount?.amount !== undefined
        ? String(Math.abs(primaryCoupon.discount.amount))
        : undefined,
  };
};
