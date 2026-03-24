import { cookies } from "next/headers";
import {
  wordpressWooRestAdapter,
  type WooCoupon,
} from "@site/integrations/wordpress/server";
import type { CoCartCartStateView } from "@site/integrations/cocart";
import type { CheckoutAppliedCoupon } from "../lib/checkout.types";
import { deriveCheckoutAppliedCouponFromCart } from "../lib/checkout-coupon";

const CHECKOUT_COUPON_COOKIE = "checkout_coupon_code";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

type CheckoutCouponResolution =
  | {
      ok: true;
      coupon: CheckoutAppliedCoupon;
      rawCoupon: WooCoupon;
    }
  | {
      ok: false;
      error: string;
    };

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);

const normalizeCouponCode = (value: string) => value.trim().toLowerCase();

const toMoneyAmount = (value?: string | number | null) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const readCartSubtotalAmount = (cart: CoCartCartStateView) =>
  roundCurrency(cart.subtotal?.amount ?? cart.total?.amount ?? 0);

const readCartQuantity = (cart: CoCartCartStateView) =>
  cart.items.reduce((total, item) => total + Math.max(item.quantity ?? 0, 0), 0);

const isCouponExpired = (coupon: WooCoupon) => {
  if (!coupon.date_expires) {
    return false;
  }

  const expiresAt = Date.parse(coupon.date_expires);
  return Number.isFinite(expiresAt) && expiresAt < Date.now();
};

const buildCouponError = (message: string): CheckoutCouponResolution => ({
  ok: false,
  error: message,
});

const computeFixedProductDiscount = (
  cart: CoCartCartStateView,
  coupon: WooCoupon,
  baseAmount: number,
) => {
  const includedProductIds = new Set((coupon.product_ids ?? []).map(String));
  const excludedProductIds = new Set((coupon.excluded_product_ids ?? []).map(String));

  const eligibleQuantity = cart.items.reduce((total, item) => {
    const productId = String(item.productId ?? "");

    if (includedProductIds.size > 0 && !includedProductIds.has(productId)) {
      return total;
    }

    if (excludedProductIds.has(productId)) {
      return total;
    }

    return total + Math.max(item.quantity ?? 0, 0);
  }, 0);

  return roundCurrency(Math.min(baseAmount * eligibleQuantity, readCartSubtotalAmount(cart)));
};

const computeCouponDiscount = (
  cart: CoCartCartStateView,
  coupon: WooCoupon,
): number => {
  const subtotalAmount = readCartSubtotalAmount(cart);
  const couponAmount = toMoneyAmount(coupon.amount);

  switch (coupon.discount_type) {
    case "percent":
      return roundCurrency((subtotalAmount * couponAmount) / 100);
    case "fixed_product":
      return computeFixedProductDiscount(cart, coupon, couponAmount);
    case "fixed_cart":
    default:
      return roundCurrency(Math.min(couponAmount, subtotalAmount));
  }
};

export const validateCheckoutCouponForCart = async (
  cart: CoCartCartStateView,
  couponCode: string,
): Promise<CheckoutCouponResolution> => {
  const normalizedCode = couponCode.trim();

  if (!normalizedCode) {
    return buildCouponError("Código do cupom é obrigatório.");
  }

  const coupon = await wordpressWooRestAdapter.findCouponByCode(normalizedCode);

  if (!coupon || !coupon.code) {
    return buildCouponError("Cupom inválido ou indisponível no momento.");
  }

  if (coupon.status && coupon.status !== "publish") {
    return buildCouponError("Cupom inválido ou indisponível no momento.");
  }

  if (isCouponExpired(coupon)) {
    return buildCouponError("Esse cupom expirou e não pode mais ser usado.");
  }

  if (
    typeof coupon.usage_limit === "number" &&
    coupon.usage_limit >= 0 &&
    typeof coupon.usage_count === "number" &&
    coupon.usage_count >= coupon.usage_limit
  ) {
    return buildCouponError("Esse cupom atingiu o limite de uso.");
  }

  const subtotalAmount = readCartSubtotalAmount(cart);
  const minimumAmount = toMoneyAmount(coupon.minimum_amount);
  const maximumAmount = toMoneyAmount(coupon.maximum_amount);

  if (minimumAmount > 0 && subtotalAmount < minimumAmount) {
    return buildCouponError(
      `Esse cupom exige subtotal mínimo de ${formatCurrency(minimumAmount)}.`,
    );
  }

  if (maximumAmount > 0 && subtotalAmount > maximumAmount) {
    return buildCouponError(
      `O subtotal máximo para esse cupom é ${formatCurrency(maximumAmount)}.`,
    );
  }

  if (readCartQuantity(cart) <= 0) {
    return buildCouponError("Adicione itens válidos ao carrinho antes de aplicar um cupom.");
  }

  const discount = computeCouponDiscount(cart, coupon);

  if (discount <= 0 && !coupon.free_shipping) {
    return buildCouponError("Esse cupom não se aplica ao carrinho atual.");
  }

  return {
    ok: true,
    rawCoupon: coupon,
    coupon: {
      code: coupon.code,
      discount,
      type: coupon.discount_type ?? undefined,
      amount:
        coupon.amount !== undefined && coupon.amount !== null
          ? String(coupon.amount)
          : undefined,
      coupon_id:
        coupon.id !== undefined && coupon.id !== null ? Number(coupon.id) : undefined,
    },
  };
};

export async function readPersistedCheckoutCouponCode() {
  const cookieStore = await cookies();
  return cookieStore.get(CHECKOUT_COUPON_COOKIE)?.value?.trim() || null;
}

export async function writePersistedCheckoutCouponCode(couponCode: string) {
  const cookieStore = await cookies();
  cookieStore.set(CHECKOUT_COUPON_COOKIE, normalizeCouponCode(couponCode), cookieOptions);
}

export async function clearPersistedCheckoutCouponCode() {
  const cookieStore = await cookies();
  cookieStore.delete(CHECKOUT_COUPON_COOKIE);
}

export async function resolvePersistedCheckoutCouponForCart(
  cart: CoCartCartStateView,
): Promise<CheckoutAppliedCoupon | null> {
  const couponCode = await readPersistedCheckoutCouponCode();

  if (!couponCode) {
    return null;
  }

  const resolution = await validateCheckoutCouponForCart(cart, couponCode);
  return resolution.ok ? resolution.coupon : null;
}

export async function syncPersistedCheckoutCouponForCart(
  cart: CoCartCartStateView,
): Promise<CheckoutAppliedCoupon | null> {
  const resolvedCoupon = deriveCheckoutAppliedCouponFromCart(cart);

  if (!resolvedCoupon) {
    await clearPersistedCheckoutCouponCode();
    return null;
  }

  await writePersistedCheckoutCouponCode(resolvedCoupon.code);
  return resolvedCoupon;
}
