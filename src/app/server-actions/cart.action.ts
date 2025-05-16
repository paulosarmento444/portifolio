"use server";

import { redirect } from "next/navigation";
import {
  addToCart,
  clearCart,
  removeItemFromCart,
} from "../service/CartService";

export type CartItem = {
  product_id: string;
  quantity: number;
  total: number;
};

export type Cart = {
  items: CartItem[];
  total: number;
};

export async function addToCartAction(formData: FormData) {
  await addToCart({
    product_id: parseInt(formData.get("product_id") as string),
    quantity: parseInt(formData.get("quantity") as string),
  });

  redirect("/my-cart");
}

export async function removeItemFromCartAction(formData: FormData) {
  const index = parseInt(formData.get("index") as string);
  removeItemFromCart(index);
}

export async function clearCartAction() {
  clearCart();
}
