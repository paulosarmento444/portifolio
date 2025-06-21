"use client";

import type React from "react";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingCart, Zap, Loader2 } from "lucide-react";
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
  const isProcessingRef = useRef(false);

  const maxQuantity = stockQuantity || 1;
  const isOutOfStock = !stockQuantity || stockQuantity <= 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity && !isLoading) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Previne múltiplos cliques
    if (isProcessingRef.current || isLoading) {
      return;
    }

    console.log("Iniciando adição ao carrinho..."); // Debug
    isProcessingRef.current = true;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("product_id", product.id.toString());
      formData.append("quantity", quantity.toString());

      await addToCartAction(formData);
      console.log("Produto adicionado com sucesso!"); // Debug
      // Mantém o loading ativo pois vai redirecionar
    } catch (error) {
      console.error("Error adding to cart:", error);
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  };

  const isButtonDisabled = isOutOfStock || isLoading || isProcessingRef.current;

  return (
    <div className="space-y-6">
      {/* Quantity Selector */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
          Quantidade:
        </h3>

        <div className="flex items-center gap-4">
          <div
            className={`flex items-center bg-gray-800/50 backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-300 ${
              isLoading ? "border-blue-500/50 opacity-60" : "border-gray-700/50"
            }`}
          >
            <motion.button
              type="button"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isLoading}
              className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              whileHover={{ scale: isLoading ? 1 : 1.1 }}
              whileTap={{ scale: isLoading ? 1 : 0.9 }}
            >
              <Minus size={18} />
            </motion.button>

            <div className="px-6 py-3 text-white font-bold text-lg min-w-[60px] text-center">
              {quantity}
            </div>

            <motion.button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity || isLoading}
              className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              whileHover={{ scale: isLoading ? 1 : 1.1 }}
              whileTap={{ scale: isLoading ? 1 : 0.9 }}
            >
              <Plus size={18} />
            </motion.button>
          </div>

          <span
            className={`text-sm transition-colors duration-300 ${
              isLoading ? "text-blue-400" : "text-gray-400"
            }`}
          >
            Máximo: {maxQuantity} unidades
          </span>
        </div>
      </div>

      {/* Add to Cart Form */}
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="product_id" value={product.id} />
        <input type="hidden" name="quantity" value={quantity} />

        <motion.button
          type="submit"
          disabled={isButtonDisabled}
          className="w-full relative font-bold py-6 px-8 text-lg rounded-2xl border-0 transition-all duration-300 disabled:cursor-not-allowed group overflow-hidden text-white"
          whileHover={{ scale: isButtonDisabled ? 1 : 1.02 }}
          whileTap={{ scale: isButtonDisabled ? 1 : 0.98 }}
          style={{
            pointerEvents: isButtonDisabled ? "none" : "auto",
          }}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 via-cyan-600 to-blue-600 bg-[length:300%_100%]"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />

                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />

                {/* Pulsing Glow */}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 rounded-2xl blur-lg opacity-60"
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                    scale: [0.98, 1.02, 0.98],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            ) : isOutOfStock ? (
              <motion.div
                key="outofstock"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 opacity-50"
              />
            ) : (
              <motion.div
                key="normal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 group-hover:from-cyan-600 group-hover:to-purple-700 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button Content */}
          <span className="relative flex items-center justify-center gap-3 z-10">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="w-6 h-6" />
                  </motion.div>
                  <motion.span
                    animate={{
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    Processando...
                  </motion.span>
                </motion.div>
              ) : isOutOfStock ? (
                <motion.div
                  key="outofstock-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3"
                >
                  <Zap className="w-6 h-6" />
                  Produto Indisponível
                </motion.div>
              ) : (
                <motion.div
                  key="normal-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3"
                >
                  <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Adicionar ao Carrinho
                  <span className="text-sm opacity-80">
                    R$ {(Number(product.price || 0) * quantity).toFixed(2)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </span>
        </motion.button>
      </form>

      {/* Processing Indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="text-center space-y-3 bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20"
          >
            <div className="flex items-center justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            <motion.p
              className="text-blue-300 text-sm font-medium"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              Adicionando produto ao carrinho...
            </motion.p>
            <div className="text-xs text-gray-400">
              Você será redirecionado em instantes
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
