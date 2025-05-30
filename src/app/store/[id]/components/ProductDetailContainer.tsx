"use client"

import { useEffect, useState, useCallback } from "react"
import DOMPurify from "dompurify"
import { getProduct, getProductVariation } from "@/app/service/ProductService"
import type { Product } from "@/models"
import { ProductHero } from "./ProductHero"
import { ProductDescription } from "./ProductDescription"
import { ProductSpecs } from "./ProductSpecs"
import { LoadingState } from "./LoadingState"
import { ErrorState } from "./ErrorState"
import { NotFoundState } from "./NotFoundState"

interface ProductDetailContainerProps {
  productId: string
}

export function ProductDetailContainer({ productId }: ProductDetailContainerProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [variations, setVariations] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const productData = await getProduct(Number(productId))
      setProduct(productData)

      if (productData.type === "variable") {
        const variationsData = await getProductVariation(Number(productId))
        setVariations(variationsData)
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      setError("Erro ao carregar produto. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchProductData()
  }, [fetchProductData])

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchProductData} />
  }

  if (!product) {
    return <NotFoundState />
  }

  const cleanDescription = DOMPurify.sanitize(product.description, {
    FORBID_TAGS: ["style"],
    FORBID_ATTR: ["style", "class"],
  })

  return (
    <div className="relative overflow-hidden bg-black min-h-screen">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "grid-move 20s linear infinite",
          }}
        ></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-1/4 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10">
        <ProductHero product={product} variations={variations} />

        {product.description && <ProductDescription description={cleanDescription} />}

        <ProductSpecs product={product} />
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  )
}
