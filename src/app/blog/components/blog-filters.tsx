"use client"

import { motion } from "framer-motion"
import { Search, Tag } from "lucide-react"

interface BlogFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: string | null
  setSelectedCategory: (category: string | null) => void
  allCategories: string[]
}

export default function BlogFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  allCategories,
}: BlogFiltersProps) {
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

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          className="flex flex-col md:flex-row gap-6 justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-cyan-400" />
              </div>
              <input
                type="text"
                className="bg-transparent text-white w-full pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder-gray-400"
                placeholder="Pesquisar artigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center md:justify-end">
            <button
              className={`relative group px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === null
                  ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-cyan-500/25"
                  : "bg-gray-900/50 text-gray-300 hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50"
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              {selectedCategory === null && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur opacity-60 group-hover:opacity-80 transition-opacity"></div>
              )}
              <span className="relative">Todos</span>
            </button>

            {allCategories.map((category) => (
              <button
                key={category}
                className={`relative group px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 flex items-center ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-gray-900/50 text-gray-300 hover:bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {selectedCategory === category && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur opacity-60 group-hover:opacity-80 transition-opacity"></div>
                )}
                <Tag size={14} className="mr-2 relative" />
                <span className="relative">{category}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
