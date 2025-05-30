"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import type { Product } from "@/models";
import { addToCartAction } from "@/app/server-actions/cart.action";

interface ProductQuantityFormProps {
  product: Product;
  stockQuantity: number | null;
}

export function ProductQuantityForm({
  product,
  stockQuantity,
}: ProductQuantityFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const maxQuantity = stockQuantity || 1;
  const isOutOfStock = !stockQuantity || stockQuantity <= 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await addToCartAction(formData);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quantity Selector */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
          Quantidade:
        </h3>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
            <motion.button
              type="button"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Minus size={18} />
            </motion.button>

            <div className="px-6 py-3 text-white font-bold text-lg min-w-[60px] text-center">
              {quantity}
            </div>

            <motion.button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity}
              className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus size={18} />
            </motion.button>
          </div>

          <span className="text-gray-400 text-sm">
            Máximo: {maxQuantity} unidades
          </span>
        </div>
      </div>

      {/* Add to Cart Form */}
      <form action={handleAddToCart}>
        <input type="hidden" name="product_id" value={product.id} />
        <input type="hidden" name="quantity" value={quantity} />

        <motion.button
          type="submit"
          disabled={isOutOfStock || isLoading}
          className="w-full relative bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-6 px-8 text-lg rounded-2xl border-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
          whileHover={{ scale: isOutOfStock ? 1 : 1.02 }}
          whileTap={{ scale: isOutOfStock ? 1 : 0.98 }}
        >
          {/* Button Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

          <span className="relative flex items-center justify-center gap-3">
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Adicionando...
              </>
            ) : isOutOfStock ? (
              <>
                <Zap className="w-6 h-6" />
                Produto Indisponível
              </>
            ) : (
              <>
                <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Adicionar ao Carrinho
                <span className="text-sm opacity-80">
                  R${" "}
                  {(Number.parseFloat(product.price || "0") * quantity).toFixed(
                    2
                  )}
                </span>
              </>
            )}
          </span>

          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
        </motion.button>
      </form>
    </div>
  );
}
