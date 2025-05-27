"use client";

import React from "react";

import type { ReactElement } from "react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import DOMPurify from "dompurify";
import {
  Search,
  ShoppingCart,
  Grid,
  List,
  Package,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { getProducts, getCategories } from "../service/ProductService";
import Link from "next/link";
import Image from "next/image";

export default function StorePage(): ReactElement {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Ref para controlar se já foi inicializado
  const isInitialized = useRef(false);
  const isLoadingData = useRef(false);

  // Estados dos filtros - REMOVIDOS os valores padrão de ordenação
  const [filters, setFilters] = useState({
    priceRange: [0, 1000] as [number, number],
    inStock: false,
    onSale: false,
    featured: false,
    sortBy: "" as "" | "name" | "price" | "rating" | "date",
    sortOrder: "" as "" | "asc" | "desc",
  });

  const productsPerPage = 12;

  // Função para aplicar filtros (memoizada para evitar recálculos desnecessários)
  const applyFilters = useCallback(
    (productsToFilter: any[]) => {
      let filtered = [...productsToFilter];

      // Filtro por categoria
      if (selectedCategory && selectedCategory > 0) {
        filtered = filtered.filter((product) =>
          product.categories?.some((cat: any) => cat.id === selectedCategory)
        );
      }

      // Filtro por busca
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(searchLower) ||
            product.short_description?.toLowerCase().includes(searchLower) ||
            product.categories?.some((cat: any) =>
              cat.name.toLowerCase().includes(searchLower)
            )
        );
      }

      // Filtro por preço
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
        filtered = filtered.filter((product) => {
          const price = Number.parseFloat(product.price);
          return (
            price >= filters.priceRange[0] && price <= filters.priceRange[1]
          );
        });
      }

      // Filtro por estoque
      if (filters.inStock) {
        filtered = filtered.filter(
          (product) => product.stock_status === "instock"
        );
      }

      // Filtro por promoção
      if (filters.onSale) {
        filtered = filtered.filter((product) => product.on_sale);
      }

      // Filtro por destaque
      if (filters.featured) {
        filtered = filtered.filter((product) => product.featured);
      }

      // Ordenação - APENAS se sortBy estiver definido
      if (filters.sortBy && filters.sortOrder) {
        filtered.sort((a, b) => {
          let aValue, bValue;

          switch (filters.sortBy) {
            case "price":
              aValue = Number.parseFloat(a.price);
              bValue = Number.parseFloat(b.price);
              break;
            case "date":
              aValue = new Date(a.date_created).getTime();
              bValue = new Date(b.date_created).getTime();
              break;
            case "name":
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            default:
              return 0;
          }

          if (filters.sortOrder === "desc") {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }
        });
      }

      return filtered;
    },
    [selectedCategory, searchTerm, filters]
  );

  // Carregar dados iniciais apenas uma vez - CORRIGIDO
  useEffect(() => {
    // Prevenir múltiplas execuções
    if (isInitialized.current || isLoadingData.current) {
      return;
    }

    isLoadingData.current = true;

    const initializeData = async () => {
      try {
        setLoading(true);
        setCategoriesLoading(true);
        setError(null);

        const [categoriesData, productsData] = await Promise.all([
          getCategories().catch(() => []),
          getProducts().catch(() => []),
        ]);

        // Verificar se o componente ainda está montado
        if (!isInitialized.current) {
          // Configurar categorias
          setCategories([
            { id: 0, name: "Todas as Categorias", count: 0 },
            ...categoriesData,
          ]);
          setCategoriesLoading(false);

          // Configurar produtos SEM aplicar filtros iniciais
          setProducts(productsData);
          setFilteredProducts(productsData); // Usar produtos originais sem filtros

          // Marcar como inicializado
          isInitialized.current = true;
        }
      } catch (error) {
        if (!isInitialized.current) {
          console.error("Error initializing data:", error);
          setError("Erro ao carregar dados. Tente novamente.");
        }
      } finally {
        setLoading(false);
        isLoadingData.current = false;
      }
    };

    initializeData();

    // Cleanup function
    return () => {
      // Não resetar isInitialized.current aqui para evitar re-inicialização
    };
  }, []); // Dependência vazia - executa apenas uma vez

  // Aplicar filtros quando mudarem - OTIMIZADO
  useEffect(() => {
    // Só aplicar filtros se já foi inicializado e tem produtos
    if (!isInitialized.current || products.length === 0) {
      return;
    }

    // Debounce para evitar muitas execuções
    const timeoutId = setTimeout(() => {
      const filtered = applyFilters(products);
      setFilteredProducts(filtered);
      setCurrentPage(1);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchTerm, filters, products, applyFilters]);

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setFilters({
      priceRange: [0, 1000],
      inStock: false,
      onSale: false,
      featured: false,
      sortBy: "",
      sortOrder: "",
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    if (filters.featured) count++;
    if (filters.sortBy) count++;
    if (selectedCategory) count++;
    if (searchTerm) count++;
    return count;
  };

  // Paginação
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Componente de skeleton - MEMOIZADO
  const ProductSkeleton = React.memo(
    ({ viewMode }: { viewMode: "grid" | "list" }) => {
      if (viewMode === "list") {
        return (
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 animate-pulse">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-80 h-64 bg-gray-700"></div>
              <div className="flex-1 p-6">
                <div className="h-6 bg-gray-700 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2 w-full"></div>
                <div className="h-4 bg-gray-700 rounded mb-4 w-2/3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-8 bg-gray-700 rounded w-24"></div>
                  <div className="h-6 bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 animate-pulse">
          <div className="h-64 bg-gray-700"></div>
          <div className="p-4">
            <div className="h-5 bg-gray-700 rounded mb-3 w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded mb-2 w-full"></div>
            <div className="h-4 bg-gray-700 rounded mb-4 w-1/2"></div>
            <div className="flex justify-between items-end">
              <div className="h-6 bg-gray-700 rounded w-20"></div>
              <div className="h-5 bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      );
    }
  );

  ProductSkeleton.displayName = "ProductSkeleton";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-900 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Nossa Loja
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Descubra produtos incríveis com os melhores preços
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="mb-10 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-12 py-4 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-lg placeholder-gray-400"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2">
              {categoriesLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-8 w-24 bg-gray-700 rounded-full animate-pulse"
                    ></div>
                  ))
                : categories.map((category) => (
                    <button
                      key={category.id}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category.id ||
                        (selectedCategory === null && category.id === 0)
                          ? "bg-lime-500 text-gray-900 shadow-lg scale-105"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                      onClick={() =>
                        handleCategoryChange(
                          category.id === 0 ? null : category.id
                        )
                      }
                    >
                      {category.name}
                      {category.count > 0 && (
                        <span className="ml-2 text-xs opacity-75">
                          ({category.count})
                        </span>
                      )}
                    </button>
                  ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${
                    showFilters
                      ? "bg-lime-500 text-gray-900"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <SlidersHorizontal size={18} />
                  Filtros
                  {getActiveFiltersCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>

                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-gray-400 hover:text-white text-sm underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "grid"
                        ? "bg-lime-500 text-gray-900"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "list"
                        ? "bg-lime-500 text-gray-900"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>

                <Link
                  href="/my-cart"
                  className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-gray-900 rounded-lg hover:bg-lime-600 transition-colors font-medium"
                >
                  <ShoppingCart size={18} />
                  Carrinho
                </Link>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Faixa de Preço */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-3">
                      Faixa de Preço
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-500"
                          placeholder="Mín"
                          value={filters.priceRange[0]}
                          onChange={(e) =>
                            handleFilterChange("priceRange", [
                              Number(e.target.value),
                              filters.priceRange[1],
                            ])
                          }
                        />
                        <span className="text-gray-400">até</span>
                        <input
                          type="number"
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-500"
                          placeholder="Máx"
                          value={filters.priceRange[1]}
                          onChange={(e) =>
                            handleFilterChange("priceRange", [
                              filters.priceRange[0],
                              Number(e.target.value),
                            ])
                          }
                        />
                      </div>
                      <div className="flex gap-2 text-xs text-gray-400">
                        <button
                          onClick={() =>
                            handleFilterChange("priceRange", [0, 50])
                          }
                          className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                        >
                          Até R$ 50
                        </button>
                        <button
                          onClick={() =>
                            handleFilterChange("priceRange", [50, 100])
                          }
                          className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                        >
                          R$ 50-100
                        </button>
                        <button
                          onClick={() =>
                            handleFilterChange("priceRange", [100, 500])
                          }
                          className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                        >
                          R$ 100-500
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Filtros Rápidos */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-3">
                      Filtros Rápidos
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.inStock}
                          onChange={(e) =>
                            handleFilterChange("inStock", e.target.checked)
                          }
                          className="mr-2 rounded"
                        />
                        <span className="text-gray-300">Apenas em estoque</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.onSale}
                          onChange={(e) =>
                            handleFilterChange("onSale", e.target.checked)
                          }
                          className="mr-2 rounded"
                        />
                        <span className="text-gray-300">Em promoção</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.featured}
                          onChange={(e) =>
                            handleFilterChange("featured", e.target.checked)
                          }
                          className="mr-2 rounded"
                        />
                        <span className="text-gray-300">
                          Produtos em destaque
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Ordenação */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-3">
                      Ordenar por
                    </label>
                    <div className="space-y-2">
                      <select
                        value={filters.sortBy}
                        onChange={(e) =>
                          handleFilterChange("sortBy", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-500"
                      >
                        <option value="">Sem ordenação</option>
                        <option value="name">Nome</option>
                        <option value="price">Preço</option>
                        <option value="date">Data de criação</option>
                      </select>
                      <select
                        value={filters.sortOrder}
                        onChange={(e) =>
                          handleFilterChange("sortOrder", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-500"
                        disabled={!filters.sortBy}
                      >
                        <option value="">Selecione a ordem</option>
                        <option value="asc">Crescente</option>
                        <option value="desc">Decrescente</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Results */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-400">
              {filteredProducts.length} produto
              {filteredProducts.length !== 1 ? "s" : ""} encontrado
              {filteredProducts.length !== 1 ? "s" : ""}
              {searchTerm && ` para "${searchTerm}"`}
            </p>
            {totalPages > 1 && (
              <p className="text-gray-400">
                Página {currentPage} de {totalPages}
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  : "space-y-6"
              }
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeleton key={index} viewMode={viewMode} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16 bg-red-900/20 border border-red-800 rounded-xl">
              <p className="text-red-400 text-xl mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Products Grid/List */}
          {!loading && !error && (
            <>
              {currentProducts.length > 0 ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                      : "space-y-6"
                  }
                >
                  {currentProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <ProductCard product={product} viewMode={viewMode} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-800/50 rounded-xl">
                  <Package size={64} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-xl mb-4">
                    Nenhum produto encontrado
                  </p>
                  <p className="text-gray-500 mb-6">
                    Tente ajustar seus filtros ou buscar por outros termos
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-lime-500 text-gray-900 rounded-lg hover:bg-lime-600 transition-colors font-medium"
                  >
                    Limpar todos os filtros
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center space-x-2">
                    {currentPage > 1 && (
                      <button
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Anterior
                      </button>
                    )}

                    {Array.from(
                      { length: Math.min(5, totalPages) },
                      (_, index) => {
                        const pageNumber = Math.max(1, currentPage - 2) + index;
                        if (pageNumber > totalPages) return null;

                        return (
                          <button
                            key={pageNumber}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              currentPage === pageNumber
                                ? "bg-lime-500 text-gray-900"
                                : "bg-gray-800 text-white hover:bg-gray-700"
                            }`}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                    )}

                    {currentPage < totalPages && (
                      <button
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Próximo
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

// Função utilitária para truncar texto e remover HTML
const truncateText = (html: string, maxLength: number): string => {
  if (!html) return "";

  // Remove tags HTML
  const textOnly = html.replace(/<[^>]*>/g, "");

  // Remove entidades HTML
  const decoded = textOnly
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Remove espaços extras
  const cleaned = decoded.replace(/\s+/g, " ").trim();

  // Trunca se necessário
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Encontra o último espaço antes do limite para não cortar palavras
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.8) {
    // Se o último espaço está próximo do limite, corta ali
    return truncated.substring(0, lastSpace) + "...";
  } else {
    // Senão, corta no limite mesmo
    return truncated + "...";
  }
};

// Componente do Card do Produto - MEMOIZADO COM DESCRIÇÃO TRUNCADA
const ProductCard = React.memo(
  ({ product, viewMode }: { product: any; viewMode: "grid" | "list" }) => {
    const imageUrl =
      product.images?.[0]?.src || "/placeholder.svg?height=300&width=400";

    const discountPercentage =
      product.on_sale && product.regular_price && product.sale_price
        ? Math.round(
            ((Number.parseFloat(product.regular_price) -
              Number.parseFloat(product.sale_price)) /
              Number.parseFloat(product.regular_price)) *
              100
          )
        : 0;

    const handleProductClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = `/store/${product.id}`;
      },
      [product.id]
    );

    // Sanitizar e truncar descrição baseado no modo de visualização
    const processedDescription = useMemo(() => {
      if (!product.short_description) return "";

      const cleanDescription = DOMPurify.sanitize(product.short_description, {
        FORBID_TAGS: ["style", "script"],
        FORBID_ATTR: ["style", "class", "onclick", "onload"],
      });

      // Diferentes limites para grid e list
      const maxLength = viewMode === "list" ? 150 : 80;
      return truncateText(cleanDescription, maxLength);
    }, [product.short_description, viewMode]);

    if (viewMode === "list") {
      return (
        <div
          className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-lime-500 transition-all group cursor-pointer"
          onClick={handleProductClick}
        >
          <div className="flex flex-col md:flex-row">
            <div className="relative md:w-80 h-64 md:h-auto">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 320px"
                loading="lazy"
              />

              <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
                {product.featured && (
                  <span className="bg-lime-500 text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                    Destaque
                  </span>
                )}
                {product.on_sale && discountPercentage > 0 && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    -{discountPercentage}%
                  </span>
                )}
              </div>

              {product.type === "variable" && (
                <div className="absolute bottom-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium pointer-events-none">
                  <Package size={12} className="inline mr-1" />
                  Variações
                </div>
              )}

              <div className="absolute bottom-3 right-3 pointer-events-none">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock_status === "instock"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {product.stock_status === "instock"
                    ? "Em estoque"
                    : "Fora de estoque"}
                </span>
              </div>
            </div>

            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-lime-400 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </div>

              {processedDescription && (
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  {processedDescription}
                </p>
              )}

              <div className="flex justify-between items-center mt-auto">
                <div>
                  {product.on_sale ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-lime-400">
                        R$ {product.sale_price}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        R$ {product.regular_price}
                      </span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-lime-400">
                      R$ {product.price}
                    </div>
                  )}
                </div>

                {product.categories && product.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 pointer-events-none">
                    {product.categories
                      .slice(0, 2)
                      .map((category: any, index: number) => (
                        <span
                          key={index}
                          className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          {category.name}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="group relative rounded-xl overflow-hidden bg-gray-800 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer border border-gray-700 hover:border-lime-500"
        onClick={handleProductClick}
      >
        <div className="relative h-64">
          <Image
            alt={product.name}
            src={imageUrl || "/placeholder.svg"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
            {product.featured && (
              <span className="bg-lime-500 text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                Destaque
              </span>
            )}
            {product.on_sale && discountPercentage > 0 && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {product.type === "variable" && (
            <div className="absolute bottom-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium pointer-events-none">
              <Package size={12} className="inline mr-1" />
              Variações
            </div>
          )}

          <div className="absolute bottom-3 right-3 pointer-events-none">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.stock_status === "instock"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {product.stock_status === "instock"
                ? "Disponível"
                : "Indisponível"}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-white group-hover:text-lime-400 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>

          {processedDescription && (
            <p className="text-gray-300 text-sm mb-3 leading-relaxed line-clamp-2">
              {processedDescription}
            </p>
          )}

          <div className="flex justify-between items-end mt-auto">
            <div>
              {product.on_sale ? (
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-lime-400">
                    R$ {product.sale_price}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    R$ {product.regular_price}
                  </span>
                </div>
              ) : (
                <div className="text-lg font-bold text-lime-400">
                  R$ {product.price}
                </div>
              )}
            </div>

            {product.categories && product.categories.length > 0 && (
              <div className="text-right pointer-events-none">
                <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                  {product.categories[0].name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ProductCard.displayName = "ProductCard";
