"use client"

import { motion } from "framer-motion"
import { FileText, Sparkles } from "lucide-react"

interface ProductDescriptionProps {
  description: string
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <section className="relative py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-cyan-400/30 mb-6">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-medium">Descrição</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Detalhes do Produto
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>

          {/* Content */}
          <div className="relative p-8 md:p-12">
            <div
              className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl p-3 animate-float">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
