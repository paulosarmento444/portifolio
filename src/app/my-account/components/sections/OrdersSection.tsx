"use client"

import { motion } from "framer-motion"
import { Package, Calendar, CreditCard, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface OrdersSectionProps {
  orders: any[]
}

export function OrdersSection({ orders }: OrdersSectionProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-400" />
      case "shipped":
        return <Truck className="w-5 h-5 text-blue-400" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-400/30"
      case "processing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
      case "shipped":
        return "bg-blue-500/20 text-blue-400 border-blue-400/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400/30"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Meus Pedidos
          </span>
        </h2>
        <p className="text-gray-300 text-lg">Acompanhe o status e histórico dos seus pedidos</p>
      </motion.div>

      {/* Orders List */}
      {orders.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 group-hover:border-gray-600/50 transition-all duration-300"></div>

              <div className="relative p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Order Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-8 h-8 text-white" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white">Pedido #{order.number}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-2 capitalize">{order.status}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{new Date(order.date_created).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          <span className="text-sm">{order.payment_method_title || "Cartão"}</span>
                        </div>
                      </div>

                      <div className="text-gray-300">
                        <span className="text-sm">{order.line_items?.length || 0} item(s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      R$ {order.total}
                    </div>
                    <button className="mt-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-lg text-cyan-400 hover:border-cyan-400/50 transition-all duration-300 text-sm">
                      Ver Detalhes
                    </button>
                  </div>
                </div>

                {/* Order Items Preview */}
                {order.line_items && order.line_items.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.line_items.slice(0, 3).map((item: any, itemIndex: number) => (
                        <div key={itemIndex} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
                          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm truncate">{item.name}</h4>
                            <p className="text-gray-400 text-xs">
                              Qtd: {item.quantity} • R$ {item.total}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.line_items.length > 3 && (
                        <div className="flex items-center justify-center p-3 bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-600">
                          <span className="text-gray-400 text-sm">+{order.line_items.length - 3} mais</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Nenhum pedido encontrado</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Você ainda não fez nenhum pedido. Que tal explorar nossos produtos?
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300">
            Explorar Produtos
          </button>
        </motion.div>
      )}
    </div>
  )
}
