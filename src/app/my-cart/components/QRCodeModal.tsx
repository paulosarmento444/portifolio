"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { X, Package, Loader2, Check } from "lucide-react";
import {
  createOrder,
  confirmOrderPayment,
} from "../../server-actions/order.action";
import { PixQRCode } from "./PixQRCode";

interface QRCodeModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  cart: any;
  products: any[];
  address: any;
  paymentMethod: string;
  appliedCoupon?: any;
  total: number;
}

export function QRCodeModal({
  userId,
  isOpen,
  onClose,
  cart,
  products,
  address,
  paymentMethod,
  appliedCoupon,
  total,
}: QRCodeModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    if (isOpen && !orderId) {
      generateOrder();
    }

    // Reset states quando modal abre/fecha
    if (!isOpen) {
      // Não resetar orderId para manter histórico, mas resetar outros estados se necessário
      setPaymentConfirmed(false);
    }
  }, [isOpen]);

  // Limpar carrinho após criar o pedido
  useEffect(() => {
    if (orderId) {
      confirmOrderPayment(orderId);
    }
  }, [orderId]);

  const generateOrder = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const orderData = {
        customer_id: userId,
        billing: address,
        shipping: address,
        line_items: cart.items.map((item: any) => {
          const product = products.find((p) => p.id === item.product_id);
          return {
            product_id: item.product_id,
            quantity: item.quantity,
            total: item.total.toString(),
          };
        }),
        coupon_lines: appliedCoupon
          ? [
              {
                code: appliedCoupon.code,
                discount: appliedCoupon.discount.toString(),
              },
            ]
          : [],
        payment_method: paymentMethod,
        payment_method_title:
          paymentMethod === "pix" ? "PIX" : "Cartão de Crédito",
        total: total.toString(),
        status: "pending",
      };

      const result = await createOrder(orderData);

      if (result.success && result.order) {
        setOrderId(result.order.id.toString());
      } else {
        setError(result.error || "Erro ao criar pedido");
      }
    } catch (error) {
      console.error("Erro ao gerar pedido:", error);
      setError("Erro ao processar pedido");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePaymentSuccess = () => {
    console.log("Pagamento confirmado com sucesso!");
    setPaymentConfirmed(true);
    // Opcional: atualizar status do pedido no banco de dados
    // updateOrderStatus(orderId, 'paid')
  };

  const handleClose = () => {
    console.log("Fechando modal - polling será interrompido");
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              paymentConfirmed
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-purple-500 to-pink-500"
            }`}
          >
            {paymentConfirmed ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <Package className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {paymentConfirmed ? "Pagamento Confirmado!" : "Pedido Criado!"}
            </h2>
            {orderId && (
              <p className="text-sm text-gray-400">Pedido #{orderId}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          title="Fechar (interrompe verificação de pagamento)"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Content */}
      {error ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 font-medium mb-2">
            Erro ao processar pedido
          </p>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors"
          >
            Fechar
          </button>
        </div>
      ) : isGenerating ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white font-medium">Criando seu pedido...</p>
          <p className="text-gray-400 text-sm">Aguarde um momento</p>
        </div>
      ) : orderId && paymentMethod === "pix" ? (
        <PixQRCode
          orderId={orderId}
          total={total}
          onClose={handleClose}
          onPaymentSuccess={handlePaymentSuccess}
          isModalOpen={isOpen} // Passa o estado da modal para controlar o polling
        />
      ) : orderId ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-white font-medium mb-2">
            Pedido criado com sucesso!
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Pedido #{orderId} foi registrado. Você receberá as instruções de
            pagamento por email.
          </p>
          <div className="space-y-3">
            <button
              onClick={() =>
                (window.location.href = `/order-confirmation/${orderId}`)
              }
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105"
            >
              Ver Confirmação do Pedido
            </button>
            <button
              onClick={handleClose}
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium rounded-xl transition-all duration-200"
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}

      {/* Order Summary - só mostrar se tiver orderId e não for erro */}
      {orderId && !error && (
        <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
          <h4 className="text-white font-medium mb-3">Resumo do Pedido</h4>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Subtotal:</span>
            <span className="text-white">R$ {cart.total.toFixed(2)}</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-sm">
              <span className="text-green-400">Desconto:</span>
              <span className="text-green-400">
                -R$ {appliedCoupon.discount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t border-white/10 pt-2">
            <div className="flex justify-between font-bold">
              <span className="text-white">Total:</span>
              <span
                className={`text-lg ${
                  paymentConfirmed ? "text-green-400" : "text-white"
                }`}
              >
                R$ {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - só mostrar se pagamento foi confirmado */}
      {orderId && !error && paymentConfirmed && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() =>
              (window.location.href = `/order-confirmation/${orderId}`)
            }
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 text-sm font-medium"
          >
            Ver Confirmação
          </button>
          <button
            onClick={() => (window.location.href = "/store")}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-all duration-200 text-sm font-medium"
          >
            Nova Compra
          </button>
        </div>
      )}
    </>
  );
}
