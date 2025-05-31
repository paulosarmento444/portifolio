"use server";

import { validateCoupon, applyCouponToCart } from "../service/CouponService";
import { getCart } from "../service/CartService";
import { cookies } from "next/headers";

export async function applyCouponAction(formData: FormData) {
  const couponCode = formData.get("coupon_code") as string;

  if (!couponCode) {
    return { error: "Código do cupom é obrigatório" };
  }

  try {
    // Validar cupom
    const coupon = await validateCoupon(couponCode);

    if (!coupon) {
      return { error: "Cupom inválido ou não encontrado" };
    }

    // Obter carrinho atual
    const cart = getCart();

    if (cart.items.length === 0) {
      return { error: "Carrinho vazio" };
    }

    // Aplicar desconto
    const discount = applyCouponToCart(coupon, cart.total);

    // Salvar cupom aplicado nos cookies
    const cookieStore = await cookies();
    cookieStore.set(
      "applied_coupon",
      JSON.stringify({
        code: coupon.code,
        discount: discount,
        type: coupon.discount_type,
        amount: coupon.amount,
        coupon_id: coupon.id,
      }),
      {
        maxAge: 60 * 60 * 24, // 24 horas
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
      }
    );

    return {
      success: true,
      code: coupon.code,
      discount: discount,
      type: coupon.discount_type,
      amount: coupon.amount,
      message: `Cupom ${coupon.code} aplicado com sucesso!`,
    };
  } catch (error: any) {
    return { error: error.message || "Erro ao aplicar cupom" };
  }
}

export async function removeCouponAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("applied_coupon");

    return { success: true, message: "Cupom removido com sucesso!" };
  } catch (error) {
    return { error: "Erro ao remover cupom" };
  }
}

export async function getAppliedCoupon() {
  try {
    const cookieStore = await cookies();
    const couponData = cookieStore.get("applied_coupon")?.value;

    if (!couponData) {
      return null;
    }

    return JSON.parse(couponData);
  } catch (error) {
    return null;
  }
}
