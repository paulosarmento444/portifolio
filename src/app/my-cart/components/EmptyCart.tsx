"use client";

import { motion } from "framer-motion";
import { ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";

export function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-16"
    >
      <div className="max-w-md mx-auto">
        {/* Empty Cart Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center"
        >
          <ShoppingCart className="w-16 h-16 text-gray-400" />
        </motion.div>

        {/* Empty State Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Seu carrinho está vazio
            </h2>
            <p className="text-gray-300">
              Adicione produtos incríveis para começar sua compra
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link href="/store">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Explorar Produtos</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-green-400 text-xl">🚚</span>
              </div>
              <p className="text-sm text-gray-300">Frete Grátis</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-xl">🔒</span>
              </div>
              <p className="text-sm text-gray-300">Compra Segura</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-400 text-xl">⚡</span>
              </div>
              <p className="text-sm text-gray-300">Entrega Rápida</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
