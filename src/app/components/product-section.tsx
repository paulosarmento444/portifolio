"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Zap } from "lucide-react";
import { getProductsCategory } from "../service/ProductService";
import ProductCard from "../store/components/product-card";
import Link from "next/link";

interface ProductSectionProps {
  category: {
    id: number;
    name: string;
    slug: string;
    description: string;
    image?: { src: string };
  };
}

function ProductSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-64 bg-gray-700"></div>
      <div className="p-6">
        <div className="flex items-center mb-2">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="w-12 h-4 bg-gray-700 rounded ml-2"></div>
        </div>
        <div className="h-6 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
        <div className="h-8 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export default function ProductSection({ category }: ProductSectionProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const categoryProducts = await getProductsCategory(category.id);
        setProducts(categoryProducts.slice(0, 4)); // Mostrar apenas 4 produtos
      } catch (error) {
        console.error(
          `Erro ao carregar produtos da categoria ${category.name}:`,
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category.id, category.name]);

  if (loading) {
    return (
      <section className="py-16 relative overflow-hidden bg-gray-900/30">
        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header Skeleton */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gray-700 rounded-2xl animate-pulse"></div>
              <div>
                <div className="h-8 bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-96 animate-pulse"></div>
              </div>
            </div>
            <div className="w-32 h-12 bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>

          {/* Section Divider */}
          <div className="mt-16 flex justify-center">
            <div className="w-32 h-1 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 relative overflow-hidden bg-gray-900/30">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/40 via-purple-500/30 to-pink-500/40 opacity-5"></div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-2xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white mb-2">
                {category.name}
              </h2>
              {category.description && (
                <p
                  className="text-gray-300 max-w-2xl"
                  dangerouslySetInnerHTML={{ __html: category.description }}
                />
              )}
            </div>
          </div>

          <Link
            href={`/store?category=${category.id}`}
            className="group inline-flex items-center px-6 py-3 border-2 border-white/20 rounded-lg hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-500 hover:text-white hover:border-transparent transition-all duration-300 bg-transparent text-white"
          >
            Ver Todos
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} viewMode="grid" />
          ))}
        </div>

        {/* Section Divider */}
        <div className="mt-16 flex justify-center">
          <div className="w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
