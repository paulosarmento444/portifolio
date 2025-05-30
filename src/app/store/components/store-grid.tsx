"use client"

import { motion } from "framer-motion"
import { Package, RefreshCw } from "lucide-react"
import ProductCard from "./product-card"

interface StoreGridProps {
  products: any[]
  loading: boolean
  error: string | null
  viewMode: "grid" | "list"
  filteredProducts: any[]
  searchTerm: string
  clearFilters: () => void
  currentPage: number
  totalPages: number
  handlePageChange: (page: number) => void
}

export default function StoreGrid({
  products,
  loading,
  error,
  viewMode,
  filteredProducts,
  searchTerm,
  clearFilters,
  currentPage,
  totalPages,
  handlePageChange,
}: StoreGridProps) {
  return (
    <section className="relative py-20 px-6 bg-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Results Info */}
        <div className="mb-8 flex justify-between items-center">
          <p className="text-gray-400 text-lg">
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? "s" : ""} encontrado
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
              viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8" : "space-y-8"
            }
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && <ErrorMessage message={error} />}

        {/* Products Grid/List */}
        {!loading && !error && (
          <>
            {products.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
                    : "space-y-8"
                }
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <ProductCard product={product} viewMode={viewMode} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <NoProductsMessage onClearFilters={clearFilters} />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="flex justify-center mt-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2">
                  {currentPage > 1 && (
                    <button
                      className="px-6 py-3 bg-gray-900/50 text-white rounded-full hover:bg-gray-800/50 transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Anterior
                    </button>
                  )}

                  {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                    const pageNumber = Math.max(1, currentPage - 2) + index
                    if (pageNumber > totalPages) return null

                    return (
                      <button
                        key={pageNumber}
                        className={`px-4 py-3 rounded-full transition-all duration-300 ${
                          currentPage === pageNumber
                            ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-cyan-500/25"
                            : "bg-gray-900/50 text-white hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50"
                        }`}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}

                  {currentPage < totalPages && (
                    <button
                      className="px-6 py-3 bg-gray-900/50 text-white rounded-full hover:bg-gray-800/50 transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Próximo
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

const ProductSkeleton = ({ viewMode }: { viewMode: "grid" | "list" }) => {
  if (viewMode === "list") {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50"></div>
        <div className="relative h-full flex flex-col md:flex-row overflow-hidden rounded-3xl animate-pulse">
          <div className="md:w-80 h-64 bg-gray-700"></div>
          <div className="flex-1 p-6">
            <div className="h-7 bg-gray-700 rounded-md w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-700 rounded-md w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded-md w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded-md w-2/3 mb-4"></div>
            <div className="mt-auto flex items-center justify-between">
              <div className="h-8 bg-gray-700 rounded-md w-24"></div>
              <div className="h-6 bg-gray-700 rounded-md w-20"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50"></div>
      <div className="relative h-full flex flex-col overflow-hidden rounded-3xl animate-pulse">
        <div className="h-64 bg-gray-700"></div>
        <div className="p-6">
          <div className="h-6 bg-gray-700 rounded-md w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-700 rounded-md w-full mb-2"></div>
          <div className="h-4 bg-gray-700 rounded-md w-2/3 mb-4"></div>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-700 rounded-md w-20"></div>
            <div className="h-5 bg-gray-700 rounded-md w-16"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ErrorMessage = ({ message }: { message: string }) => (
  <motion.div
    className="relative max-w-md mx-auto"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-500/20 rounded-3xl blur-xl"></div>
    <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-red-500/30 p-8 text-center">
      <h2 className="text-2xl font-semibold text-red-400 mb-2">Oops!</h2>
      <p className="text-red-300 mb-6">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-medium"
      >
        <RefreshCw size={16} />
        Tentar novamente
      </button>
    </div>
  </motion.div>
)

const NoProductsMessage = ({ onClearFilters }: { onClearFilters: () => void }) => (
  <motion.div
    className="relative max-w-md mx-auto"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
    <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 text-center">
      <Package size={64} className="text-gray-600 mx-auto mb-6" />
      <p className="text-gray-400 text-xl mb-4">Nenhum produto encontrado</p>
      <p className="text-gray-500 mb-6">Tente ajustar seus filtros ou buscar por outros termos</p>
      <button
        onClick={onClearFilters}
        className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-full hover:from-cyan-500 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg shadow-cyan-500/25"
      >
        Limpar todos os filtros
      </button>
    </div>
  </motion.div>
)
