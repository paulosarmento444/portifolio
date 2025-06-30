"use client";

<<<<<<< HEAD
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "./button/FormButton";

export default function SportsBanner() {
  return (
    <div className="relative overflow-hidden bg-black min-h-[700px] flex items-center">
      {/* Animated Background Grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20"></div>
=======
import { Zap, Trophy, Flame, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getProducts } from "../service/ProductService";

export default function SportsBanner() {
  const [bannerProducts, setBannerProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadBannerProducts = async () => {
      try {
        const products = await getProducts();
        // Pega 6 produtos aleatórios para um banner mais rico
        const shuffled = products.sort(() => 0.5 - Math.random());
        setBannerProducts(shuffled.slice(0, 6));
      } catch (error) {
        console.error("Erro ao carregar produtos para o banner:", error);
      }
    };

    loadBannerProducts();
  }, []);

  return (
    <div className="relative overflow-hidden bg-black min-h-[900px] flex items-center">
      {/* Intense Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/40 via-purple-500/30 to-pink-500/40"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-orange-500/30 via-transparent to-blue-500/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-transparent to-red-500/20"></div>
>>>>>>> 77c5e77 (First commit)
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
<<<<<<< HEAD
              linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "grid-move 20s linear infinite",
=======
              radial-gradient(circle at 25% 25%, rgba(0,255,255,0.2) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255,0,255,0.2) 0%, transparent 50%),
              linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,0,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "400px 400px, 400px 400px, 80px 80px, 80px 80px",
            animation:
              "grid-move 30s linear infinite, pulse-bg 8s ease-in-out infinite",
>>>>>>> 77c5e77 (First commit)
          }}
        ></div>
      </div>

<<<<<<< HEAD
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
=======
      {/* Massive Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-1/6 w-56 h-56 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-3xl opacity-80 animate-pulse"></div>
        <div className="absolute top-20 right-1/6 w-48 h-48 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-3xl opacity-80 animate-pulse delay-1000"></div>
        <div className="absolute bottom-16 left-1/5 w-64 h-64 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-3xl opacity-70 animate-pulse delay-2000"></div>
        <div className="absolute bottom-24 right-1/5 w-52 h-52 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-3xl opacity-80 animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-purple-600/40 to-cyan-600/40 rounded-full blur-3xl opacity-60 animate-pulse delay-1500"></div>
      </div>

      {/* Enhanced Geometric Chaos */}
      <div className="absolute inset-0">
        <div className="absolute top-16 left-12 w-24 h-24 border-3 border-cyan-400/70 rotate-45 animate-spin-slow opacity-80"></div>
        <div className="absolute top-32 right-16 w-20 h-20 border-3 border-purple-400/70 rotate-12 animate-bounce opacity-80"></div>
        <div className="absolute bottom-24 left-24 w-28 h-28 border-3 border-pink-400/70 rotate-45 animate-spin-slow-reverse opacity-80"></div>
        <div className="absolute top-1/4 right-1/8 w-16 h-16 border-3 border-orange-400/70 animate-pulse opacity-80"></div>
        <div className="absolute bottom-1/4 left-1/8 w-18 h-18 border-3 border-green-400/70 rotate-45 animate-spin-slow opacity-80"></div>
        <div className="absolute top-3/4 right-1/4 w-14 h-14 border-3 border-red-400/70 animate-bounce delay-500 opacity-80"></div>
        <div className="absolute top-1/6 left-1/3 w-22 h-22 border-3 border-yellow-400/70 rotate-12 animate-spin-slow-reverse opacity-80"></div>
      </div>

      {/* Lightning Storm */}
      <div className="absolute inset-0">
        <div className="absolute top-1/5 left-1/4 w-2 h-40 bg-gradient-to-b from-cyan-400 to-transparent opacity-80 animate-pulse"></div>
        <div className="absolute bottom-1/5 right-1/4 w-2 h-32 bg-gradient-to-t from-purple-400 to-transparent opacity-80 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/6 w-1 h-24 bg-gradient-to-b from-pink-400 to-transparent opacity-80 animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-1/6 w-1 h-28 bg-gradient-to-b from-orange-400 to-transparent opacity-80 animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-center items-center min-h-[800px]">
          {/* Pure Product Showcase */}
          <div className="relative w-full max-w-6xl">
            {/* Central Mega Product */}
            <div className="relative z-30 flex justify-center">
              <div className="relative group">
                {/* Mega Glow System */}
                <div className="absolute -inset-16 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-80 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse"></div>
                <div className="absolute -inset-12 bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 rounded-full blur-2xl opacity-70 group-hover:opacity-90 transition-opacity duration-1000 animate-pulse delay-500"></div>
                <div className="absolute -inset-8 bg-gradient-to-r from-orange-400 via-red-500 to-cyan-500 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-1000 animate-pulse delay-1000"></div>

                {/* Mega Product Container */}
                <div className="relative bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-3xl rounded-3xl p-12 border-3 border-gray-700/60 group-hover:border-cyan-400/80 transition-all duration-1000 shadow-2xl">
                  <img
                    src={
                      bannerProducts[0]?.images?.[0]?.src ||
                      "/placeholder.svg?height=600&width=500"
                    }
                    alt={bannerProducts[0]?.name || "Produto Premium"}
                    className="w-full max-w-md h-auto rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-1000 filter drop-shadow-2xl"
                  />

                  {/* Floating Icons Around Main Product */}
                  <div className="absolute -top-12 -right-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full p-8 animate-float shadow-2xl">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>

                  <div className="absolute -bottom-12 -left-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-8 animate-float delay-1000 shadow-2xl">
                    <Flame className="w-12 h-12 text-white" />
                  </div>

                  <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 bg-gradient-to-r from-pink-400 to-orange-500 rounded-full p-6 animate-float delay-2000 shadow-2xl">
                    <Star className="w-10 h-10 text-white" />
                  </div>

                  <div className="absolute top-1/2 -left-16 transform -translate-y-1/2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full p-6 animate-float delay-3000 shadow-2xl">
                    <Zap className="w-10 h-10 text-white" />
>>>>>>> 77c5e77 (First commit)
                  </div>
                </div>
              </div>
            </div>

<<<<<<< HEAD
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
=======
            {/* Orbiting Product Constellation */}
            <div className="absolute inset-0 animate-spin-very-slow">
              {bannerProducts.slice(1, 6).map((product, index) => {
                const positions = [
                  "absolute -top-20 left-1/2 transform -translate-x-1/2",
                  "absolute top-1/4 -right-24 transform -translate-y-1/2",
                  "absolute -bottom-20 right-1/3 transform translate-x-1/2",
                  "absolute -bottom-20 left-1/3 transform -translate-x-1/2",
                  "absolute top-1/4 -left-24 transform -translate-y-1/2",
                ];
                const gradients = [
                  "from-cyan-500/40 to-purple-500/40",
                  "from-purple-500/40 to-pink-500/40",
                  "from-pink-500/40 to-orange-500/40",
                  "from-orange-500/40 to-red-500/40",
                  "from-red-500/40 to-cyan-500/40",
                ];
                const borders = [
                  "border-cyan-400/60",
                  "border-purple-400/60",
                  "border-pink-400/60",
                  "border-orange-400/60",
                  "border-red-400/60",
                ];

                return (
                  <div key={product.id} className={positions[index]}>
                    <div
                      className={`bg-gradient-to-r ${gradients[index]} backdrop-blur-2xl rounded-3xl p-6 border-3 ${borders[index]} shadow-2xl hover:scale-125 transition-all duration-700 group`}
                    >
                      <img
                        src={
                          product.images?.[0]?.src ||
                          "/placeholder.svg?height=100&width=100"
                        }
                        alt={product.name}
                        className="w-24 h-24 rounded-2xl object-cover group-hover:rotate-12 transition-transform duration-500"
                      />
                      {/* Mini glow for each orbiting product */}
                      <div className="absolute -inset-2 bg-gradient-to-r from-white/20 to-transparent rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Massive Energy Wave System */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -inset-20 border-3 border-cyan-400/40 rounded-full animate-ping"></div>
              <div className="absolute -inset-16 border-3 border-purple-400/40 rounded-full animate-ping delay-1000"></div>
              <div className="absolute -inset-12 border-3 border-pink-400/40 rounded-full animate-ping delay-2000"></div>
              <div className="absolute -inset-8 border-3 border-orange-400/40 rounded-full animate-ping delay-3000"></div>
              <div className="absolute -inset-4 border-3 border-red-400/40 rounded-full animate-ping delay-4000"></div>
            </div>

            {/* Particle Effects */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-60 animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                  }}
                ></div>
              ))}
>>>>>>> 77c5e77 (First commit)
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
<<<<<<< HEAD
            transform: translateY(-15px) rotate(5deg);
=======
            transform: translateY(-25px) rotate(8deg);
>>>>>>> 77c5e77 (First commit)
          }
        }
        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
<<<<<<< HEAD
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
=======
            transform: translate(80px, 80px);
          }
        }
        @keyframes pulse-bg {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
>>>>>>> 77c5e77 (First commit)
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
<<<<<<< HEAD
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
=======
          animation: float 6s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 18s linear infinite;
        }
        .animate-spin-very-slow {
          animation: spin-very-slow 50s linear infinite;
        }
        .border-3 {
          border-width: 3px;
>>>>>>> 77c5e77 (First commit)
        }
      `}</style>
    </div>
  );
}
