"use client"

import { motion } from "framer-motion"
import { Trash2, Plus, Minus } from "lucide-react"
import { removeItemFromCartAction } from "../../server-actions/cart.action"
import { useState } from "react"

interface CartItemProps {
  item: any
  product: any
  index: number
}

export function CartItem({ item, product, index }: CartItemProps) {
  const [isRemoving, setIsRemoving] = useState(false)

  if (!product) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6"
      >
        <div className="text-red-400 text-center">
          <p className="font-medium">Produto não encontrado</p>
          <p className="text-sm opacity-75">ID: {item.product_id}</p>
        </div>
      </motion.div>
    )
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    const formData = new FormData()
    formData.append("index", index.toString())
    await removeItemFromCartAction(formData)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: -100 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

      <div className="flex items-center space-x-6">
        {/* Product Image */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white/5">
          <img
            src={product.images?.[0]?.src || "/placeholder.svg?height=96&width=96"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-2 truncate">{product.name}</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Quantity Controls */}
              <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
                <button className="w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Minus className="w-4 h-4 text-white" />
                </button>
                <span className="w-8 text-center text-white font-medium">{item.quantity}</span>
                <button className="w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="text-sm text-gray-300">
                <span className="opacity-75">Preço unitário: </span>
                <span className="text-cyan-400 font-medium">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(product.price)}
                </span>
              </div>
            </div>

            {/* Price and Remove */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.total)}
                </div>
              </div>

              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="w-10 h-10 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
