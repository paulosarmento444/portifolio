"use client"

import { motion } from "framer-motion"
import { Star, Heart, Eye, Plus } from "lucide-react"

export function ProductsSection() {
  const products = [
    {
      id: 1,
      name: "Tênis de Corrida Pro",
      price: "R$ 299,90",
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.8,
      reviews: 124,
      status: "available",
    },
    {
      id: 2,
      name: "Camisa de Futebol Premium",
      price: "R$ 149,90",
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.6,
      reviews: 89,
      status: "sale",
    },
    {
      id: 3,
      name: "Shorts de Treino",
      price: "R$ 79,90",
      image: "/placeholder.svg?height=200&width=200",
      rating: 4.7,
      reviews: 156,
      status: "new",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sale":
        return (
          <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
            OFERTA
          </span>
        )
      case "new":
        return (
          <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
            NOVO
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Meus Produtos
          </span>
        </h2>
        <p className="text-gray-300 text-lg">Produtos favoritos e lista de desejos</p>
      </motion.div>

      {/* Products Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative group"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 group-hover:border-gray-600/50 transition-all duration-300"></div>

            <div className="relative p-6 space-y-4">
              {/* Product Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-700">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {getStatusBadge(product.status)}

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white line-clamp-2">{product.name}</h3>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {product.price}
                  </span>
                  <button className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-lg text-cyan-400 hover:border-cyan-400/50 transition-all duration-300 text-sm">
                    Ver Produto
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Add to Wishlist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center"
      >
        <button className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300 flex items-center gap-3 mx-auto">
          <Plus className="w-5 h-5" />
          Adicionar à Lista de Desejos
        </button>
      </motion.div>
    </div>
  )
}
