"use client"

import { motion } from "framer-motion"
import { Package, Search, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function NotFoundState() {
  return (
    <div className="relative overflow-hidden bg-black min-h-screen">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 via-blue-500/10 to-purple-500/10"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          {/* Not Found Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-r from-gray-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <Package size={48} className="text-white" />
          </motion.div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-white mb-4">Produto não encontrado</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            O produto que você está procurando não existe ou foi removido do nosso catálogo.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/store"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300"
              >
                <Search size={20} />
                Explorar Produtos
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white hover:border-cyan-400/50 rounded-2xl font-bold transition-all duration-300"
              >
                <ArrowLeft size={20} />
                Página Inicial
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
