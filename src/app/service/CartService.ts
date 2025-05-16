import { cookies } from "next/headers";
import { getProduct } from "./ProductService";
export type CartItem = {
  product_id: number;
  quantity: number;
  total: number;
};

export type Cart = {
  items: CartItem[];
  total: number;
};

const getCookieStore = () => cookies();

export const getCart = (): Cart => {
  const cookieStore = getCookieStore();
  const cartRaw = cookieStore.get("cart")?.value;
  const cart: Cart = cartRaw ? JSON.parse(cartRaw) : { items: [], total: 0 };
  return cart;
};

export const addToCart = async (input: {
  product_id: number;
  quantity: number;
}) => {
  const cookieStore = getCookieStore();
  let cart = getCart();

  const { product_id, quantity } = input;

  try {
    const product = await getProduct(product_id);

    // Verificar se o produto já está no carrinho
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product_id === product_id
    );

    if (existingItemIndex !== -1) {
      // Atualizar a quantidade do produto existente
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].total =
        product.price * cart.items[existingItemIndex].quantity;
    } else {
      // Adicionar novo produto ao carrinho
      const productPrice = product.price * quantity;
      cart.items.push({
        product_id,
        quantity,
        total: productPrice,
      });
    }

    // Atualizar o total do carrinho
    cart.total = cart.items.reduce((total, item) => total + item.total, 0);

    cookieStore.set("cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
};

export const removeItemFromCart = (index: number) => {
  const cookieStore = getCookieStore();
  let cart = getCart();
  console.log("cart", cart);

  if (cart.items[index]) {
    cart.total -= cart.items[index].total;
    cart.items.splice(index, 1);

    cookieStore.set("cart", JSON.stringify(cart));
  }
};

export const clearCart = () => {
  const cookieStore = getCookieStore();
  cookieStore.delete("cart");
};

export const createCartService = () => {
  return {
    getCart,
    addToCart: (input: { product_id: number; quantity: number }) =>
      addToCart(input),
    removeItemFromCart,
    clearCart,
  };
};
