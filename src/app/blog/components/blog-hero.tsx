"use client";

import { motion } from "framer-motion";
import { BookOpen, Zap, Star, Trophy, Target } from "lucide-react";

export default function BlogHero() {
  return (
    <section className="relative py-20 px-6 md:py-32 bg-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-20 animate-bounce">
          <div className="bg-cyan-400/20 backdrop-blur-sm rounded-full p-3 border border-cyan-400/30">
            <BookOpen className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
        <div className="absolute top-40 right-32 animate-bounce delay-500">
          <div className="bg-purple-400/20 backdrop-blur-sm rounded-full p-3 border border-purple-400/30">
            <Target className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <div className="absolute bottom-40 left-32 animate-bounce delay-1000">
          <div className="bg-pink-400/20 backdrop-blur-sm rounded-full p-3 border border-pink-400/30">
            <Zap className="w-6 h-6 text-pink-400" />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <motion.div
            className="text-white space-y-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-cyan-400/30">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-medium">Nosso Blog</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                CONHECIMENTO
              </span>
              <span className="block text-white">EM</span>
              <span className="block bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                MOVIMENTO
              </span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed">
              Descubra as últimas tendências em{" "}
              <span className="text-cyan-400 font-semibold">tecnologia</span>,
              dicas de{" "}
              <span className="text-purple-400 font-semibold">
                desenvolvimento
              </span>{" "}
              e insights sobre{" "}
              <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-semibold">
                inovação
              </span>
              .
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  100+
                </div>
                <div className="text-gray-400 text-sm">Artigos Publicados</div>
              </div>
              <div className="text-center p-4 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  50K+
                </div>
                <div className="text-gray-400 text-sm">Leitores Mensais</div>
              </div>
            </div>
          </motion.div>

          {/* Visual Side */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative group">
              {/* Glow Ring */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500 animate-pulse"></div>

              {/* Image Container */}
              <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 group-hover:border-cyan-400/50 transition-all duration-500">
                <img
                  src="/placeholder.svg?height=500&width=400"
                  alt="Blog de Tecnologia"
                  className="w-full h-auto rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />

                {/* Floating Stats */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl p-4 animate-float">
                  <Trophy className="w-8 h-8 text-white" />
                </div>

                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-4 animate-float delay-1000">
                  <Star className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
