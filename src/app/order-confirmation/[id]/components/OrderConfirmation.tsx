"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  Percent,
} from "lucide-react";
import Link from "next/link";
import { QRCodeModal } from "@/app/my-cart/components/QRCodeModal";

interface OrderConfirmationProps {
  order: any;
}

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  const [payMethod, setPayMethod] = useState<null | "pix" | "card">(null);

  const cartFromOrder = useMemo(() => {
    return {
      items: (order?.line_items || []).map((it: any) => ({
        product_id: it.product_id,
        quantity: it.quantity,
        total: Number(it.total || 0),
        name: it.name,
      })),
      total: Number(order?.total || 0),
    };
  }, [order]);

  const productsMinimal: any[] = useMemo(() => [], []);
  const shippingAddress = order?.shipping || {};
  const billingAddress = order?.billing || {};
  const appliedCoupon =
    order?.coupon_lines && order.coupon_lines.length > 0
      ? {
          code: order.coupon_lines[0]?.code,
          discount: Number(order.coupon_lines[0]?.discount || 0),
        }
      : null;

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
            <p className="text-gray-300 text-lg">
              Seu pedido #{order.number} foi criado com sucesso
            </p>
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
                <p className="text-gray-400 text-sm">
                  {new Date(order.date_created).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-medium mb-1">Pagamento</h3>
                <p className="text-gray-400 text-sm">
                  {order.payment_method_title}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-medium mb-1">Entrega</h3>
                <p className="text-gray-400 text-sm">7-10 dias úteis</p>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h4 className="text-white font-semibold mb-2">
                  Endereço de Entrega
                </h4>
                <div className="text-gray-300 text-sm space-y-1">
                  <p>
                    {shippingAddress.first_name} {shippingAddress.last_name}
                  </p>
                  <p>
                    {shippingAddress.address_1} {shippingAddress.number}
                  </p>
                  <p>{shippingAddress.neighborhood}</p>
                  <p>
                    {shippingAddress.city} - {shippingAddress.state}
                  </p>
                  <p>{shippingAddress.postcode}</p>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">
                  Endereço de Cobrança
                </h4>
                <div className="text-gray-300 text-sm space-y-1">
                  <p>
                    {billingAddress.first_name} {billingAddress.last_name}
                  </p>
                  <p>
                    {billingAddress.address_1} {billingAddress.number}
                  </p>
                  <p>{billingAddress.neighborhood}</p>
                  <p>
                    {billingAddress.city} - {billingAddress.state}
                  </p>
                  <p>{billingAddress.postcode}</p>
                  <p>{billingAddress.email}</p>
                  <p>{billingAddress.phone}</p>
                </div>
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
            <h2 className="text-2xl font-bold text-white mb-6">
              Itens do Pedido
            </h2>
            <div className="space-y-4">
              {order.line_items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{item.name}</h3>
                      <p className="text-gray-400 text-sm">
                        Quantidade: {item.quantity}
                      </p>
                      {item.sku && (
                        <p className="text-gray-500 text-xs">SKU: {item.sku}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">R$ {item.total}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 mt-6 pt-6 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Subtotal</span>
                <span className="text-white">R$ {order.total}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-400 inline-flex items-center gap-2">
                    <Percent className="w-4 h-4" /> Cupom ({appliedCoupon.code})
                  </span>
                  <span className="text-green-400">
                    - R$ {appliedCoupon.discount.toFixed(2)}
                  </span>
                </div>
              )}
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
            className="flex flex-col lg:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => setPayMethod("pix")}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 text-center"
            >
              Gerar QR Code PIX novamente
            </button>
            <button
              onClick={() => setPayMethod("card")}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 text-center"
            >
              Pagar com Cartão de Crédito
            </button>
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

      {payMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setPayMethod(null)}
          />
          <div className="relative w-full max-w-lg bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <QRCodeModal
              userId={String(order?.customer_id || "0")}
              isOpen={true}
              onClose={() => setPayMethod(null)}
              cart={cartFromOrder}
              products={productsMinimal}
              address={billingAddress}
              paymentMethod={payMethod}
              appliedCoupon={appliedCoupon}
              total={Number(order?.total || 0)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
