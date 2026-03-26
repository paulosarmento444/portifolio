import { cookies } from "next/headers";
import type { CoCartCartStateView, CoCartSessionContext } from "@site/integrations/cocart";
import type { CheckoutAppliedCoupon } from "../checkout.types";
import { deriveCheckoutAppliedCouponFromCart } from "../checkout-coupon";

const COCART_SESSION_COOKIE = "cocart_session_key";
const COCART_CART_TOKEN_COOKIE = "cocart_cart_token";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function readCoCartSessionContext(): Promise<CoCartSessionContext> {
  const cookieStore = await cookies();

  return {
    sessionKey: cookieStore.get(COCART_SESSION_COOKIE)?.value,
    cartToken: cookieStore.get(COCART_CART_TOKEN_COOKIE)?.value,
  };
}

export async function writeCoCartSessionContext(
  cart: Pick<CoCartCartStateView, "sessionKey" | "cartToken">,
) {
  const cookieStore = await cookies();
  const cartKey = cart.sessionKey?.trim();

  if (cartKey) {
    cookieStore.set(COCART_SESSION_COOKIE, cartKey, cookieOptions);
  } else {
    cookieStore.delete(COCART_SESSION_COOKIE);
  }

  if ("cartToken" in cart) {
    const cartToken = cart.cartToken?.trim();

    if (cartToken) {
      cookieStore.set(COCART_CART_TOKEN_COOKIE, cartToken, cookieOptions);
    } else {
      cookieStore.delete(COCART_CART_TOKEN_COOKIE);
    }
  }
}

export async function clearCheckoutSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COCART_SESSION_COOKIE);
  cookieStore.delete(COCART_CART_TOKEN_COOKIE);
}

export const buildCheckoutAppliedCoupon = (
  cart: CoCartCartStateView,
): CheckoutAppliedCoupon | null => deriveCheckoutAppliedCouponFromCart(cart);
