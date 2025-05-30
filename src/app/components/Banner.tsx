"use client";

import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "./button/FormButton";

export default function SportsBanner() {
  return (
    <div className="relative overflow-hidden bg-black min-h-[700px] flex items-center">
      {/* Animated Background Grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20"></div>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "grid-move 20s linear infinite",
          }}
        ></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-1/4 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-xl opacity-60 animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-xl opacity-60 animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-60 animate-pulse delay-500"></div>
      </div>

      {/* Geometric Shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-32 left-20 w-16 h-16 border-2 border-cyan-400 rotate-45 animate-spin-slow opacity-40"></div>
        <div className="absolute top-60 right-32 w-12 h-12 border-2 border-purple-400 rotate-12 animate-bounce opacity-40"></div>
        <div className="absolute bottom-40 left-40 w-20 h-20 border-2 border-pink-400 rotate-45 animate-spin-slow-reverse opacity-40"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <div className="text-white space-y-10">
            {/* Sparkle Icon */}
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-500 p-3 rounded-2xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Main Title */}
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-8xl font-black leading-none tracking-tight">
                <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                  LIBERE
                </span>
                <span className="block text-white">SEU</span>
                <span className="block bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent animate-gradient delay-500">
                  POTENCIAL
                </span>
              </h1>
              <p className="text-2xl lg:text-3xl text-gray-300 font-light max-w-lg leading-relaxed">
                Equipamentos que transformam atletas em{" "}
                <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-semibold">
                  campeões
                </span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold px-10 py-8 text-xl rounded-2xl group transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-cyan-500/25">
                <Play className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform" />
                Comprar Agora
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button className="border-2 border-gray-600 text-white hover:bg-white hover:text-black font-bold px-10 py-8 text-xl rounded-2xl transition-all duration-500 hover:border-white backdrop-blur-sm">
                Ver Produtos
              </Button>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative">
            {/* Central Product Showcase */}
            <div className="relative z-20">
              <div className="relative group">
                {/* Glow Ring */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500 animate-pulse"></div>

                {/* Product Container */}
                <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 group-hover:border-cyan-400/50 transition-all duration-500">
                  <img
                    src="/placeholder.svg?height=450&width=350"
                    alt="Equipamento Esportivo Premium"
                    className="w-full h-auto rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Floating Elements */}
                  <div className="absolute -top-6 -right-6 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl p-4 animate-float">
                    <div className="w-8 h-8 bg-white rounded-lg"></div>
                  </div>

                  <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-4 animate-float delay-1000">
                    <div className="w-8 h-8 bg-white rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Orbiting Products */}
            <div className="absolute inset-0 animate-spin-very-slow">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-3 border border-cyan-400/30">
                  <img
                    src="/placeholder.svg?height=60&width=60"
                    alt="Tênis Esportivo"
                    className="w-15 h-15 rounded-xl"
                  />
                </div>
              </div>

              <div className="absolute top-1/2 -right-8 transform -translate-y-1/2">
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-3 border border-purple-400/30">
                  <img
                    src="/placeholder.svg?height=60&width=60"
                    alt="Equipamento Fitness"
                    className="w-15 h-15 rounded-xl"
                  />
                </div>
              </div>

              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-pink-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-3 border border-pink-400/30">
                  <img
                    src="/placeholder.svg?height=60&width=60"
                    alt="Acessório Esportivo"
                    className="w-15 h-15 rounded-xl"
                  />
                </div>
              </div>

              <div className="absolute top-1/2 -left-8 transform -translate-y-1/2">
                <div className="bg-gradient-to-r from-orange-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-3 border border-orange-400/30">
                  <img
                    src="/placeholder.svg?height=60&width=60"
                    alt="Roupa Esportiva"
                    className="w-15 h-15 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Energy Waves */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-full animate-ping"></div>
              <div className="absolute inset-4 border-2 border-purple-400/20 rounded-full animate-ping delay-1000"></div>
              <div className="absolute inset-8 border-2 border-pink-400/20 rounded-full animate-ping delay-2000"></div>
            </div>
          </div>
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
        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-slow-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes spin-very-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 10s linear infinite;
        }
        .animate-spin-very-slow {
          animation: spin-very-slow 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
