"use client"

import { motion } from "framer-motion"
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ErrorStateProps {
  error: string
  onRetry: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="relative overflow-hidden bg-black min-h-screen">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-pink-500/10"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <AlertCircle size={48} className="text-white" />
          </motion.div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-white mb-4">Ops! Algo deu errado</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">{error}</p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={onRetry}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              Tentar Novamente
            </motion.button>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/store"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white hover:border-cyan-400/50 rounded-2xl font-bold transition-all duration-300"
              >
                <ArrowLeft size={20} />
                Voltar à Loja
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
