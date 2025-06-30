"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface BlogPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function BlogPagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
}: BlogPaginationProps) {
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  return (
    <section className="relative py-16 px-6 bg-gray-950 overflow-hidden">
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

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPreviousPage}
            className={`relative group p-3 rounded-xl transition-all duration-300 ${
              hasPreviousPage
                ? "bg-gray-900/50 text-gray-300 hover:bg-gray-800/50 border border-gray-700/50 hover:border-cyan-400/50 hover:text-white"
                : "bg-gray-900/30 text-gray-600 border border-gray-800/50 cursor-not-allowed"
            }`}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Page Numbers */}
          {getVisiblePages().map((page, index) => (
            <div key={index}>
              {page === "..." ? (
                <span className="px-4 py-3 text-gray-500">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`relative group px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    currentPage === page
                      ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-cyan-500/25"
                      : "bg-gray-900/50 text-gray-300 hover:bg-gray-800/50 border border-gray-700/50 hover:border-cyan-400/50 hover:text-white"
                  }`}
                >
                  {currentPage === page && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl blur opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  )}
                  <span className="relative">{page}</span>
                </button>
              )}
            </div>
          ))}

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className={`relative group p-3 rounded-xl transition-all duration-300 ${
              hasNextPage
                ? "bg-gray-900/50 text-gray-300 hover:bg-gray-800/50 border border-gray-700/50 hover:border-cyan-400/50 hover:text-white"
                : "bg-gray-900/30 text-gray-600 border border-gray-800/50 cursor-not-allowed"
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </motion.div>

        {/* Page Info */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 text-sm">
            Página {currentPage} de {totalPages}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
