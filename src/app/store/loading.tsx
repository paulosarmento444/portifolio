"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import {
  Search,
  ShoppingCart,
  Star,
  Filter,
  Grid,
  List,
  Package,
} from "lucide-react";
import {
  getProducts,
  getCategories,
  getProductsCategory,
  searchProducts,
} from "../service/ProductService";
import Link from "next/link";
import Image from "next/image";

export default function StorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState<any>({ items: [], total: 0 });

  const productsPerPage = 12;

  // Carregar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories([{ id: 0, name: "Todos", count: 0 }, ...categoriesData]);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Erro ao carregar categorias");
      }
    };

    fetchCategories();
  }, []);

  // Carregar produtos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        let productsData: any[];

        if (searchTerm) {
          productsData = await searchProducts(searchTerm);
        } else if (selectedCategory && selectedCategory > 0) {
          productsData = await getProductsCategory(selectedCategory);
        } else {
          productsData = await getProducts();
        }

        // Filtrar por preço
        if (priceRange[0] > 0 || priceRange[1] < 1000) {
          productsData = productsData.filter((product) => {
            const price = Number.parseFloat(product.price);
            return price >= priceRange[0] && price <= priceRange[1];
          });
        }

        setProducts(productsData);
        setCurrentPage(1); // Reset para primeira página
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Erro ao carregar produtos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchTerm, priceRange]);

  // Carregar carrinho
  useEffect(() => {
    const loadCart = () => {
      try {
        // Simular carregamento do carrinho do servidor
        setCart({ items: [], total: 0 }); // Placeholder
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    };

    loadCart();
  }, []);

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setPriceRange([0, 1000]);
  };

  // Paginação
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
                className="w-full pl-12 pr-4 py-4 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-lg"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Categories and View Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id ||
                      (selectedCategory === null && category.id === 0)
                        ? "bg-lime-500 text-gray-900"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                    onClick={() =>
                      handleCategoryChange(
                        category.id === 0 ? null : category.id
                      )
                    }
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/my-cart"
                  className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-gray-900 rounded-lg hover:bg-lime-600 transition-colors font-medium"
                >
                  <ShoppingCart size={18} />
                  Carrinho ({cart.items.length})
                </Link>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Filter size={18} />
                  Filtros
                </button>

                <div className="flex bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${
                      viewMode === "grid"
                        ? "bg-lime-500 text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${
                      viewMode === "list"
                        ? "bg-lime-500 text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Faixa de Preço
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-500"
                        placeholder="Mín"
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([Number(e.target.value), priceRange[1]])
                        }
                      />
                      <span className="text-gray-400">até</span>
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-500"
                        placeholder="Máx"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([priceRange[0], Number(e.target.value)])
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Results */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-400">
              {products.length} produtos encontrados
            </p>
            {totalPages > 1 && (
              <p className="text-gray-400">
                Página {currentPage} de {totalPages}
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
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
                      ? "grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8"
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
                  <p className="text-gray-400 text-xl mb-4">
                    Nenhum produto encontrado
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
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === index + 1
                            ? "bg-lime-500 text-gray-900"
                            : "bg-gray-800 text-white hover:bg-gray-700"
                        }`}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}
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

// Componente do Card do Produto (mantendo apenas uma imagem)
const ProductCard = ({
  product,
  viewMode,
}: {
  product: any;
  viewMode: "grid" | "list";
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const imageUrl = imageError
    ? "/placeholder.svg?height=300&width=400"
    : product.images?.[0]?.src || "/placeholder.svg?height=300&width=400";

  if (viewMode === "list") {
    return (
      <Link href={`/store/${product.id}`}>
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-lime-500 transition-all group cursor-pointer">
          <div className="flex flex-col md:flex-row">
            <div className="relative md:w-80 h-64 md:h-auto">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                onError={handleImageError}
              />
              {product.featured && (
                <div className="absolute top-3 left-3 bg-lime-500 text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                  Destaque
                </div>
              )}
              {product.on_sale && (
                <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Promoção
                </div>
              )}
              {product.type === "variable" && (
                <div className="absolute bottom-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  <Package size={12} className="inline mr-1" />
                  Variações
                </div>
              )}
            </div>

            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-lime-400 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-current" />
                  <span className="text-white font-medium">
                    {product.average_rating}
                  </span>
                  <span className="text-gray-400">
                    ({product.rating_count})
                  </span>
                </div>
              </div>

              <p
                className="text-gray-300 mb-4 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />

              <div className="flex justify-between items-center">
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

                <div className="text-sm text-gray-400">
                  {product.stock_status === "instock"
                    ? "✅ Em estoque"
                    : "❌ Fora de estoque"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/store/${product.id}`}>
      <div className="group relative rounded-lg overflow-hidden bg-gray-800 transform transition-transform duration-300 hover:scale-105 hover:z-10 cursor-pointer border border-gray-700 hover:border-lime-500">
        <div className="relative h-60">
          <Image
            alt={product.name}
            src={imageUrl || "/placeholder.svg"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            onError={handleImageError}
          />

          {product.featured && (
            <div className="absolute top-3 left-3 bg-lime-500 text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
              Destaque
            </div>
          )}
          {product.on_sale && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Promoção
            </div>
          )}
          {product.type === "variable" && (
            <div className="absolute bottom-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              <Package size={12} className="inline mr-1" />
              Variações
            </div>
          )}

          {/* Rating no canto superior direito */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-gray-900/80 px-2 py-1 rounded-full">
            <Star size={14} className="text-yellow-500 fill-current" />
            <span className="text-white text-sm font-medium">
              {product.average_rating}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-white group-hover:text-lime-400 transition-colors line-clamp-1 mb-2">
            {product.name}
          </h3>

          <p
            className="text-gray-300 text-sm mb-3 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: product.short_description }}
          />

          <div className="flex justify-between items-center">
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

            <div className="text-xs text-gray-400">
              {product.stock_status === "instock"
                ? "✅ Disponível"
                : "❌ Indisponível"}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
