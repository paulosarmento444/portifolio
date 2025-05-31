"use client"

import { motion } from "framer-motion"
import { Check, Package, MapPin, CreditCard, Calendar } from "lucide-react"
import Link from "next/link"

interface OrderConfirmationProps {
  order: any
}

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Pedido Confirmado!
            </h1>
            <p className="text-gray-300 text-lg">Seu pedido #{order.number} foi criado com sucesso</p>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-medium mb-1">Pedido</h3>
                <p className="text-gray-400 text-sm">#{order.number}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-medium mb-1">Data</h3>
                <p className="text-gray-400 text-sm">{new Date(order.date_created).toLocaleDateString("pt-BR")}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-medium mb-1">Pagamento</h3>
                <p className="text-gray-400 text-sm">{order.payment_method_title}</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-medium mb-1">Entrega</h3>
                <p className="text-gray-400 text-sm">7-10 dias úteis</p>
              </div>
            </div>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Itens do Pedido</h2>
            <div className="space-y-4">
              {order.line_items.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{item.name}</h3>
                      <p className="text-gray-400 text-sm">Quantidade: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">R$ {item.total}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 mt-6 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-white">Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  R$ {order.total}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/my-account?menu=orders"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 text-center"
            >
              Ver Meus Pedidos
            </Link>
            <Link
              href="/store"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 text-center"
            >
              Continuar Comprando
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
