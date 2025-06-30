"use client";

import { useState, useEffect } from "react";
import ProductSection from "./product-section";
import { getProducts } from "../service/ProductService";

function CategorySkeleton() {
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
            <div
              key={i}
              className="bg-gray-800/50 rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="h-64 bg-gray-700"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
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

export default function CategoriesShowcase() {
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAvailableCategories = async () => {
      try {
        // Buscar todos os produtos para verificar quais categorias têm produtos
        const allProducts = await getProducts();

        // Extrair categorias únicas dos produtos
        const productCategories = new Set();
        allProducts.forEach((product: any) => {
          if (product.categories && product.categories.length > 0) {
            product.categories.forEach((cat: any) => {
              productCategories.add(
                JSON.stringify({ id: cat.id, name: cat.name, slug: cat.slug })
              );
            });
          }
        });

        // Converter de volta para array de objetos
        const categoriesArray = Array.from(productCategories).map(
          (catStr: any) => JSON.parse(catStr)
        );

        // Filtrar apenas categorias que não sejam "Sem categoria" e que tenham nome válido
        const validCategories = categoriesArray
          .filter(
            (cat: any) =>
              cat.name &&
              cat.name !== "Sem categoria" &&
              cat.name !== "Uncategorized" &&
              cat.id
          )
          .slice(0, 6); // Limitar a 6 categorias

        setAvailableCategories(validCategories);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAvailableCategories();
  }, []);

  const gradientCombinations = [
    { from: "from-cyan-500", to: "to-blue-500", iconColor: "text-white" },
    { from: "from-purple-500", to: "to-pink-500", iconColor: "text-white" },
    { from: "from-orange-500", to: "to-red-500", iconColor: "text-white" },
    { from: "from-green-500", to: "to-emerald-500", iconColor: "text-white" },
    { from: "from-indigo-500", to: "to-purple-500", iconColor: "text-white" },
    { from: "from-pink-500", to: "to-rose-500", iconColor: "text-white" },
  ];

  if (loading) {
    return (
      <div className="bg-black">
        {/* Hero Section for Categories */}
        <section className="py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="h-16 bg-gray-700 rounded w-2/3 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>
        </section>

        {/* Loading Categories */}
        {[...Array(3)].map((_, i) => (
          <CategorySkeleton key={i} />
        ))}
      </div>
    );
  }

  if (availableCategories.length === 0) {
    return (
      <div className="bg-black py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-400">
            Nenhuma categoria encontrada
          </h2>
          <p className="text-gray-500 mt-2">
            Verifique se existem produtos cadastrados com categorias.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black mt-10">
      {/* Hero Section for Categories */}
      <section className="py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            NOSSAS CATEGORIAS
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Descubra nossa seleção completa de equipamentos esportivos
            organizados por categoria. Qualidade premium para atletas de todos
            os níveis.
          </p>
        </div>
      </section>

      {/* Categories Sections */}
      {availableCategories.map((category, index) => (
        <ProductSection key={category.id} category={category} />
      ))}
    </div>
  );
}
