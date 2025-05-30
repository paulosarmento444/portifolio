"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Heart, Share2, Package, Truck, Shield, Zap, Sparkles } from "lucide-react"
import type { Product } from "@/models"
import { getProduct } from "@/app/service/ProductService"
import { ProductQuantityForm } from "./ProductQuantityForm"

interface ProductInfoProps {
  product: Product
  variations: Product[]
  setSelectedColor: (color: string) => void
  setSelectedSize: (size: string) => void
}

export function ProductInfo({ product, variations, setSelectedColor, setSelectedSize }: ProductInfoProps) {
  const [selectedColor, setSelectedColorState] = useState<string>("")
  const [selectedSize, setSelectedSizeState] = useState<string>("")
  const [stockQuantity, setStockQuantity] = useState<number | null>(null)
  const [stockStatus, setStockStatus] = useState<string>("")
  const [variableId, setVariableId] = useState<number | null>(null)
  const [productVariable, setProductVariable] = useState<Product>(product)
  const [isFavorite, setIsFavorite] = useState(false)

  // Calculate discount percentage
  const discountPercentage =
    productVariable.on_sale && productVariable.regular_price && productVariable.sale_price
      ? Math.round(
          ((Number.parseFloat(productVariable.regular_price) - Number.parseFloat(productVariable.sale_price)) /
            Number.parseFloat(productVariable.regular_price)) *
            100,
        )
      : 0

  const handleColorChange = (color: string) => {
    setSelectedColorState(color)
    setSelectedColor(color)
  }

  const handleSizeChange = (size: string) => {
    setSelectedSizeState(size)
    setSelectedSize(size)
  }

  useEffect(() => {
    const defaultColor = product.attributes.find((attr: any) => attr.name === "Cor")?.options[0] || ""
    const defaultSize = product.attributes.find((attr: any) => attr.name === "Tamanho")?.options[0] || ""
    setSelectedColorState(defaultColor)
    setSelectedSizeState(defaultSize)
    setSelectedColor(defaultColor)
    setSelectedSize(defaultSize)
  }, [product, setSelectedColor, setSelectedSize])

  const updateStock = useCallback(async () => {
    let stock = 0
    let status = "Sem estoque"
    let productId = product.id

    if (product.type === "variable") {
      const selectedVariation = variations.find((variation) =>
        variation.attributes.every(
          (attr) =>
            (attr.name === "Cor" && attr.option === selectedColor) ||
            (attr.name === "Tamanho" && attr.option === selectedSize),
        ),
      )
      if (selectedVariation) {
        stock = selectedVariation.stock_quantity
        productId = selectedVariation.id
        status = stock > 0 ? "Em estoque" : "Sem estoque"
        const productData = await getProduct(+selectedVariation.id)
        setProductVariable(productData)
        setVariableId(+selectedVariation.id)
      }
    } else if (product.manage_stock) {
      stock = product.stock_quantity
      status = stock > 0 ? "Em estoque" : "Sem estoque"
      setProductVariable(product)
    }

    setStockQuantity(stock)
    setStockStatus(status)
  }, [product, variations, selectedColor, selectedSize])

  useEffect(() => {
    updateStock()
  }, [updateStock])

  const colorOptions = product.attributes.find((attr) => attr.name === "Cor")?.options || []
  const sizeOptions = product.attributes.find((attr) => attr.name === "Tamanho")?.options || []

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Erro ao compartilhar:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const isOutOfStock = stockStatus !== "Em estoque"

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Title and Actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {product.name}
              </span>
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isFavorite
                  ? "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                  : "bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-400 hover:text-white hover:border-cyan-400/50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart size={20} className={isFavorite ? "fill-current" : ""} />
            </motion.button>
            <motion.button
              onClick={handleShare}
              className="p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-400 hover:text-white hover:border-cyan-400/50 rounded-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 size={20} />
            </motion.button>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-4">
          {productVariable.on_sale ? (
            <>
              <span className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                R$ {productVariable.sale_price}
              </span>
              <span className="text-2xl text-gray-500 line-through">R$ {productVariable.regular_price}</span>
              {discountPercentage > 0 && (
                <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                  -{discountPercentage}%
                </span>
              )}
            </>
          ) : (
            <span className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              R$ {productVariable.price || "Preço não disponível"}
            </span>
          )}
        </div>

        {/* Status and Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`px-4 py-2 rounded-full text-sm font-bold ${
              isOutOfStock
                ? "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                : "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
            }`}
          >
            {stockStatus === "Em estoque" ? "✓ Disponível" : "✗ Indisponível"}
          </span>

          {stockQuantity !== null && stockQuantity > 0 && (
            <span className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-300 rounded-full text-sm">
              Estoque: {stockQuantity} unidades
            </span>
          )}

          {product.featured && (
            <span className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full text-sm font-bold">
              <Sparkles size={12} className="inline mr-1" />
              Destaque
            </span>
          )}

          {product.type === "variable" && (
            <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-bold">
              <Package size={12} className="inline mr-1" />
              Variações
            </span>
          )}
        </div>
      </motion.div>

      {/* Variations */}
      {product.type === "variable" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Colors */}
          {colorOptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
                Cor:
              </h3>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map((color) => (
                  <motion.button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 font-medium ${
                      selectedColor === color
                        ? "border-cyan-400 bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25"
                        : "border-gray-600 bg-gray-800/50 backdrop-blur-sm text-gray-300 hover:border-cyan-400 hover:text-cyan-400"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {color}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizeOptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                Tamanho:
              </h3>
              <div className="flex flex-wrap gap-3">
                {sizeOptions.map((size) => (
                  <motion.button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 font-medium ${
                      selectedSize === size
                        ? "border-purple-400 bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                        : "border-gray-600 bg-gray-800/50 backdrop-blur-sm text-gray-300 hover:border-purple-400 hover:text-purple-400"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Quantity Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <ProductQuantityForm product={productVariable} stockQuantity={stockQuantity} />
      </motion.div>

      {/* Delivery Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl border border-gray-700/50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl"></div>

        <div className="relative p-6 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Informações de Entrega
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Truck size={16} className="text-white" />
              </div>
              <span>Frete grátis para compras acima de R$ 99</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <span>Garantia de 30 dias</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Package size={16} className="text-white" />
              </div>
              <span>Entrega em até 7 dias úteis</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
