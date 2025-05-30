"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import type { Product } from "@/models"
import { ProductGallery } from "./ProductGallery"
import { ProductInfo } from "./ProductInfo"

interface ProductHeroProps {
  product: Product
  variations: Product[]
}

export function ProductHero({ product, variations }: ProductHeroProps) {
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedSize, setSelectedSize] = useState<string>("")

  return (
    <section className="relative py-12 px-4 md:py-20">
      <div className="container mx-auto max-w-7xl">
        {/* Back Button */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/store"
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 text-gray-300 hover:text-white hover:border-cyan-400/50 transition-all duration-300 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar à loja</span>
          </Link>
        </motion.div>

        {/* Product Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-cyan-400/30 mb-6">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-medium">Produto Premium</span>
          </div>
        </motion.div>

        {/* Product Content */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Gallery */}
          <div className="order-2 lg:order-1">
            <ProductGallery
              product={product}
              variations={variations}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
            />
          </div>

          {/* Product Info */}
          <div className="order-1 lg:order-2">
            <ProductInfo
              product={product}
              variations={variations}
              setSelectedColor={setSelectedColor}
              setSelectedSize={setSelectedSize}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
