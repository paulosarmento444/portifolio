import { woocommerceClient } from "../lib/wooCommerce";

export interface Coupon {
  id: number;
  code: string;
  amount: string;
  discount_type: "percent" | "fixed_cart" | "fixed_product";
  description: string;
  date_expires: string | null;
  minimum_amount: string;
  maximum_amount: string;
  individual_use: boolean;
  exclude_sale_items: boolean;
  free_shipping: boolean;
}

export const validateCoupon = async (code: string): Promise<Coupon | null> => {
  try {
    const response = await woocommerceClient.get("/coupons", {
      params: {
        code: code,
        per_page: 1,
        status: "publish",
      },
    });

    if (response.data.length === 0) {
      throw new Error("Cupom não encontrado");
    }

    const coupon = response.data[0];

    // Verificar se o cupom não expirou
    if (coupon.date_expires && new Date(coupon.date_expires) < new Date()) {
      throw new Error("Cupom expirado");
    }

    // Verificar limite de uso
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      throw new Error("Cupom esgotado");
    }

    return coupon;
  } catch (error: any) {
    console.error("Erro ao validar cupom:", error);
    throw new Error(
      error.response?.data?.message || error.message || "Erro ao validar cupom"
    );
  }
};

export const applyCouponToCart = (
  coupon: Coupon,
  cartTotal: number
): number => {
  let discount = 0;

  // Verificar valor mínimo
  if (
    coupon.minimum_amount &&
    cartTotal < Number.parseFloat(coupon.minimum_amount)
  ) {
    throw new Error(`Valor mínimo de R$ ${coupon.minimum_amount} não atingido`);
  }

  // Verificar valor máximo
  if (
    coupon.maximum_amount &&
    cartTotal > Number.parseFloat(coupon.maximum_amount)
  ) {
    throw new Error(`Valor máximo de R$ ${coupon.maximum_amount} excedido`);
  }

  // Calcular desconto
  switch (coupon.discount_type) {
    case "percent":
      discount = (cartTotal * Number.parseFloat(coupon.amount)) / 100;
      break;
    case "fixed_cart":
      discount = Number.parseFloat(coupon.amount);
      break;
    case "fixed_product":
      // Para produtos específicos - implementar lógica específica
      discount = Number.parseFloat(coupon.amount);
      break;
  }

  // Garantir que o desconto não seja maior que o total
  return Math.min(discount, cartTotal);
};
