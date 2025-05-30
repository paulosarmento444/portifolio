"use client"

import { motion } from "framer-motion"
import { Home, Package, FileText, User, MapPin, Calendar, ShoppingBag, LogOut, Sparkles } from "lucide-react"

interface AccountSidebarProps {
  selectedMenu: string
  onMenuClick: (menu: string) => void
  userName: string
}

const menuItems = [
  { id: "welcome", label: "Início", icon: Home, color: "from-cyan-500 to-blue-600" },
  { id: "orders", label: "Pedidos", icon: Package, color: "from-purple-500 to-pink-600" },
  { id: "posts", label: "Posts", icon: FileText, color: "from-green-500 to-emerald-600" },
  { id: "account", label: "Conta", icon: User, color: "from-orange-500 to-red-600" },
  { id: "addresses", label: "Endereços", icon: MapPin, color: "from-blue-500 to-cyan-600" },
  { id: "events", label: "Eventos", icon: Calendar, color: "from-purple-500 to-indigo-600" },
  { id: "products", label: "Produtos", icon: ShoppingBag, color: "from-pink-500 to-rose-600" },
  { id: "logout", label: "Sair", icon: LogOut, color: "from-red-500 to-pink-600" },
]

export function AccountSidebar({ selectedMenu, onMenuClick, userName }: AccountSidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>

      <div className="relative p-6 space-y-6">
        {/* User Info */}
        <div className="text-center pb-6 border-b border-gray-700/50">
          <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{userName}</h3>
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-400/30">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">Premium</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => onMenuClick(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group ${
                selectedMenu === item.id
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedMenu === item.id
                    ? `bg-gradient-to-r ${item.color}`
                    : "bg-gray-800/50 group-hover:bg-gray-700/50"
                }`}
              >
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">{item.label}</span>

              {selectedMenu === item.id && (
                <motion.div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full" layoutId="activeIndicator" />
              )}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Floating Element */}
      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl p-3 animate-float">
        <div className="w-4 h-4 bg-white rounded-lg"></div>
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
    </motion.div>
  )
}
