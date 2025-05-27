"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import Header from "@/app/components/Header";
import { getProduct, getProductVariation } from "@/app/service/ProductService";
import type { Product } from "@/models";
import { ProductInfo } from "./ProductInfo";
import { ProductGallery } from "@/app/components/product/ProductGallery";
import { ArrowLeft, Package, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage({
  params: { id },
}: Readonly<{
  params: { id: string };
}>) {
  const [product, setProduct] = useState<Product | null>(null);
  const [variations, setVariations] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");

  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const productData = await getProduct(Number(id));
      setProduct(productData);

      if (productData.type === "variable") {
        const variationsData = await getProductVariation(Number(id));
        setVariations(variationsData);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Erro ao carregar produto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const ProductSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <div className="space-y-4">
        <div className="aspect-square bg-gray-700 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square bg-gray-700 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-700 rounded animate-pulse w-3/4"></div>
          <div className="h-6 bg-gray-700 rounded animate-pulse w-1/2"></div>
          <div className="h-12 bg-gray-700 rounded animate-pulse w-1/3"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-700 rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-gray-700 rounded animate-pulse w-4/6"></div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-700 rounded animate-pulse w-1/4"></div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-10 bg-gray-700 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
        <div className="h-12 bg-gray-700 rounded animate-pulse w-full"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-900 pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="h-10 bg-gray-700 rounded animate-pulse w-32"></div>
            </div>
            <ProductSkeleton />
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-900 pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <AlertCircle size={64} className="text-red-500 mb-6" />
              <h1 className="text-2xl font-bold text-white mb-4">
                Erro ao carregar produto
              </h1>
              <p className="text-gray-400 mb-8 max-w-md">{error}</p>
              <div className="flex gap-4">
                <button
                  onClick={fetchProductData}
                  className="px-6 py-3 bg-lime-500 text-gray-900 rounded-lg hover:bg-lime-600 transition-colors font-medium"
                >
                  Tentar novamente
                </button>
                <Link
                  href="/store"
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Voltar à loja
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-900 pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <Package size={64} className="text-gray-600 mb-6" />
              <h1 className="text-2xl font-bold text-white mb-4">
                Produto não encontrado
              </h1>
              <p className="text-gray-400 mb-8 max-w-md">
                O produto que você está procurando não existe ou foi removido.
              </p>
              <Link
                href="/store"
                className="px-6 py-3 bg-lime-500 text-gray-900 rounded-lg hover:bg-lime-600 transition-colors font-medium"
              >
                Voltar à loja
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const cleanDescription = DOMPurify.sanitize(product.description, {
    FORBID_TAGS: ["style"],
    FORBID_ATTR: ["style", "class"],
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-900 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft size={18} />
              Voltar à loja
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="order-2 lg:order-1">
              <ProductGallery
                product={product}
                variations={variations}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
              />
            </div>

            <div className="order-1 lg:order-2">
              <ProductInfo
                product={product}
                variations={variations}
                setSelectedColor={setSelectedColor}
                setSelectedSize={setSelectedSize}
              />
            </div>
          </motion.div>

          {product.description && (
            <motion.div
              className="mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Descrição do Produto
                </h2>
                <div
                  className="prose prose-invert max-w-none text-gray-300"
                  dangerouslySetInnerHTML={{ __html: cleanDescription }}
                />
              </div>
            </motion.div>
          )}

          {/* Especificações aqui (igual ao original) */}
        </div>
      </main>
    </>
  );
}
