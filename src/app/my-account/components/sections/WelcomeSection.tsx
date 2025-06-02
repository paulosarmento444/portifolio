"use client";

import { motion } from "framer-motion";
import { Package, TrendingUp, Star, Calendar, ArrowRight } from "lucide-react";
import { useState } from "react";

interface WelcomeSectionProps {
  viewer: any;
  orders: any[];
}

export function WelcomeSection({ viewer, orders }: WelcomeSectionProps) {
  const [selectedMenu, setSelectedMenu] = useState<string>("welcome");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleMenuClick = (menu: string) => {
    setSelectedMenu(menu);
    setIsMobileMenuOpen(false);

    // Update URL without page reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("menu", menu);
    window.history.pushState({}, "", newUrl.toString());
  };

  const stats = [
    {
      icon: Package,
      label: "Total de Pedidos",
      value: orders.length,
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: TrendingUp,
      label: "Este Mês",
      value: orders.filter((order) => {
        const orderDate = new Date(order.date_created);
        const currentMonth = new Date().getMonth();
        return orderDate.getMonth() === currentMonth;
      }).length,
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: Star,
      label: "Status",
      value: "Premium",
      color: "from-yellow-500 to-orange-600",
    },
    {
      icon: Calendar,
      label: "Membro desde",
      value: new Date(viewer.date || Date.now()).getFullYear(),
      color: "from-green-500 to-emerald-600",
    },
  ];

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          Bem-vindo de volta,{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {viewer.name}
          </span>
          !
        </h2>
        <p className="text-gray-300 text-lg">
          Aqui está um resumo da sua conta e atividades recentes
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            className="relative group"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 group-hover:border-gray-600/50 transition-all duration-300"></div>

            <div className="relative p-6 text-center">
              <div
                className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {stat.value}
              </h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Pedidos Recentes</h3>
            <button
              onClick={() => {
                handleMenuClick("orders");
              }}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Ver todos
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {recentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      Pedido #{order.number}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {new Date(order.date_created).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">R$ {order.total}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : order.status === "processing"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <button
          onClick={() => handleMenuClick("orders")}
          className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-2xl text-left hover:border-cyan-400/50 transition-all duration-300 group"
        >
          <Package className="w-8 h-8 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
          <h4 className="text-white font-bold mb-2">Ver Pedidos</h4>
          <p className="text-gray-400 text-sm">
            Acompanhe seus pedidos e histórico
          </p>
        </button>

        <button className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-2xl text-left hover:border-purple-400/50 transition-all duration-300 group">
          <Star className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
          <h4 className="text-white font-bold mb-2">Avaliar Produtos</h4>
          <p className="text-gray-400 text-sm">Compartilhe sua experiência</p>
        </button>

        <button className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-2xl text-left hover:border-orange-400/50 transition-all duration-300 group">
          <TrendingUp className="w-8 h-8 text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
          <h4 className="text-white font-bold mb-2">Ofertas Especiais</h4>
          <p className="text-gray-400 text-sm">Descubra promoções exclusivas</p>
        </button>
      </motion.div>
    </div>
  );
}
