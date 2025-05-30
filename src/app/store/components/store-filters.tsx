"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  X,
  SlidersHorizontal,
  Grid,
  List,
  ShoppingCart,
  Tag,
} from "lucide-react";

interface StoreFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: number | null;
  setSelectedCategory: (category: number | null) => void;
  categories: any[];
  categoriesLoading: boolean;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: any;
  handleFilterChange: (key: string, value: any) => void;
  getActiveFiltersCount: () => number;
  clearFilters: () => void;
}

export default function StoreFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  categoriesLoading,
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  filters,
  handleFilterChange,
  getActiveFiltersCount,
  clearFilters,
}: StoreFiltersProps) {
  return (
    <section className="relative py-12 px-6 bg-gray-950 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Search Bar */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-cyan-400" />
              </div>
              <input
                type="text"
                className="bg-transparent text-white w-full pl-12 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder-gray-400 text-lg"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {categoriesLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-10 w-24 bg-gray-700 rounded-full animate-pulse"
                ></div>
              ))
            : categories.map((category) => (
                <button
                  key={category.id}
                  className={`relative group px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center ${
                    selectedCategory === category.id ||
                    (selectedCategory === null && category.id === 0)
                      ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-cyan-500/25"
                      : "bg-gray-900/50 text-gray-300 hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50"
                  }`}
                  onClick={() =>
                    setSelectedCategory(category.id === 0 ? null : category.id)
                  }
                >
                  {(selectedCategory === category.id ||
                    (selectedCategory === null && category.id === 0)) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  )}
                  <Tag size={14} className="mr-2 relative" />
                  <span className="relative">
                    {category.name}
                    {category.count > 0 && (
                      <span className="ml-2 text-xs opacity-75">
                        ({category.count})
                      </span>
                    )}
                  </span>
                </button>
              ))}
        </motion.div>

        {/* Toolbar */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                showFilters
                  ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-cyan-500/25"
                  : "bg-gray-900/50 text-gray-300 hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50"
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
                className="text-gray-400 hover:text-white text-sm underline transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-900/50 rounded-full p-1 border border-gray-700/50">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-full transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-full transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <List size={18} />
              </button>
            </div>

            <Link
              href="/my-cart"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-full hover:from-cyan-500 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg shadow-cyan-500/25"
            >
              <ShoppingCart size={18} />
              Carrinho
            </Link>
          </div>
        </motion.div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Price Range */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-4">
                      Faixa de Preço
                    </label>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          className="w-full px-4 py-3 bg-gray-800/50 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
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
                          className="w-full px-4 py-3 bg-gray-800/50 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
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
                      <div className="flex gap-2 text-xs">
                        {[
                          { label: "Até R$ 50", range: [0, 50] },
                          { label: "R$ 50-100", range: [50, 100] },
                          { label: "R$ 100-500", range: [100, 500] },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() =>
                              handleFilterChange("priceRange", preset.range)
                            }
                            className="px-3 py-2 bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 hover:text-white transition-all border border-gray-600/50 hover:border-gray-500/50"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-4">
                      Filtros Rápidos
                    </label>
                    <div className="space-y-3">
                      {[
                        { key: "inStock", label: "Apenas em estoque" },
                        { key: "onSale", label: "Em promoção" },
                        { key: "featured", label: "Produtos em destaque" },
                      ].map((filter) => (
                        <label
                          key={filter.key}
                          className="flex items-center group cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={
                              filters[
                                filter.key as keyof typeof filters
                              ] as boolean
                            }
                            onChange={(e) =>
                              handleFilterChange(filter.key, e.target.checked)
                            }
                            className="mr-3 w-4 h-4 text-cyan-500 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                          />
                          <span className="text-gray-300 group-hover:text-white transition-colors">
                            {filter.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sorting */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-4">
                      Ordenar por
                    </label>
                    <div className="space-y-3">
                      <select
                        value={filters.sortBy}
                        onChange={(e) =>
                          handleFilterChange("sortBy", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-gray-800/50 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
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
                        className="w-full px-4 py-3 bg-gray-800/50 text-white rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                        disabled={!filters.sortBy}
                      >
                        <option value="">Selecione a ordem</option>
                        <option value="asc">Crescente</option>
                        <option value="desc">Decrescente</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
