"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Header from "../../components/Header"
import { CartContent } from "./CartContent"
import { CartSidebar } from "./CartSidebar"
import { EmptyCart } from "./EmptyCart"

interface CartContainerProps {
  cart: any
  products: any[]
  userId: string
  billing: any
  shipping: any
  paymentMethods: any[]
}

export function CartContainer({ cart, products, userId, billing, shipping, paymentMethods }: CartContainerProps) {
  const [showQRModal, setShowQRModal] = useState(false)
  const [modalData, setModalData] = useState<any>(null)

  const hasItems = cart.items.length > 0

  const handleShowQRModal = (data: any) => {
    setModalData(data)
    setShowQRModal(true)
  }

  const handleCloseQRModal = () => {
    setShowQRModal(false)
    setModalData(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <Header />

      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Meu Carrinho
            </h1>
            <p className="text-gray-300 text-lg">
              {hasItems
                ? `${cart.items.length} ${cart.items.length === 1 ? "item" : "itens"} no seu carrinho`
                : "Seu carrinho está vazio"}
            </p>
          </motion.div>

          {hasItems ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <CartContent cart={cart} products={products} />
              </div>

              {/* Sidebar with Summary and Checkout */}
              <div className="lg:col-span-1">
                <CartSidebar
                  cart={cart}
                  products={products}
                  userId={userId}
                  billing={billing}
                  shipping={shipping}
                  paymentMethods={paymentMethods}
                  onShowQRModal={handleShowQRModal}
                />
              </div>
            </div>
          ) : (
            <EmptyCart />
          )}
        </div>
      </div>

      {/* QR Modal - sempre renderizado se showQRModal for true */}
      {showQRModal && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            {modalData}
          </motion.div>
        </div>
      )}
    </div>
  )
}
