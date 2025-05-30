"use client"

import { motion } from "framer-motion"
import { Settings, Award, Truck, Shield, Star, Zap } from "lucide-react"
import type { Product } from "@/models"

interface ProductSpecsProps {
  product: Product
}

export function ProductSpecs({ product }: ProductSpecsProps) {
  const specs = [
    {
      icon: Award,
      title: "Qualidade Premium",
      description: "Materiais de alta qualidade e durabilidade",
      color: "from-yellow-500 to-orange-600",
    },
    {
      icon: Shield,
      title: "Garantia Estendida",
      description: "30 dias de garantia total",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: Truck,
      title: "Entrega Rápida",
      description: "Receba em até 7 dias úteis",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: Star,
      title: "Avaliação 5 Estrelas",
      description: "Produto altamente recomendado",
      color: "from-purple-500 to-pink-600",
    },
  ]

  return (
    <section className="relative py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-purple-400/30 mb-6">
            <Settings className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-medium">Especificações</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Por que Escolher?
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {specs.map((spec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 group-hover:border-gray-600/50 transition-all duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Content */}
              <div className="relative p-6 text-center space-y-4">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${spec.color} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}
                >
                  <spec.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                  {spec.title}
                </h3>

                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {spec.description}
                </p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </motion.div>
          ))}
        </div>

        {/* Additional Product Info */}
        {product.attributes && product.attributes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 relative"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-red-500/5 to-pink-500/5 rounded-3xl"></div>

            <div className="relative p-8 md:p-12">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                Especificações Técnicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.attributes.map((attr, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="text-lg font-semibold text-cyan-400">{attr.name}:</h4>
                    <div className="flex flex-wrap gap-2">
                      {attr.options.map((option, optionIndex) => (
                        <span
                          key={optionIndex}
                          className="px-3 py-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-300 rounded-lg text-sm"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
