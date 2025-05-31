"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, MapPin, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { AddressModal } from "./AddressModal";
import { QRCodeModal } from "./QRCodeModal";
import { PaymentMethodSelector } from "./PaymentMethodSelector";

interface CheckoutSectionProps {
  cart: any;
  products: any[];
  userId: string;
  billing: any;
  shipping: any;
  paymentMethods: any[];
  appliedCoupon?: any;
  onShowQRModal?: (modalContent: any) => void;
}

export function CheckoutSection({
  cart,
  products,
  userId,
  billing,
  shipping,
  paymentMethods,
  appliedCoupon,
  onShowQRModal,
}: CheckoutSectionProps) {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(billing);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("pix");

  const hasAddress =
    currentAddress?.address_1 &&
    currentAddress?.city &&
    currentAddress?.postcode;
  const canCheckout =
    cart.items.length > 0 && hasAddress && selectedPaymentMethod;

  const calculateTotal = () => {
    let total = cart.total;
    if (appliedCoupon?.discount) {
      total -= appliedCoupon.discount;
    }
    return Math.max(0, total);
  };

  const handleFinalizePurchase = () => {
    if (!canCheckout) return;

    // Criar o conteúdo do modal
    const modalContent = (
      <QRCodeModal
        userId={userId}
        isOpen={true}
        onClose={() => onShowQRModal?.(null)}
        cart={cart}
        products={products}
        address={currentAddress}
        paymentMethod={selectedPaymentMethod}
        appliedCoupon={appliedCoupon}
        total={calculateTotal()}
      />
    );

    // Mostrar o modal através do callback
    onShowQRModal?.(modalContent);
  };

  const handleAddressAdded = (address: any) => {
    setCurrentAddress(address);
  };

  return (
    <>
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Finalizar Compra</h3>
        </div>

        <div className="space-y-6">
          {/* Address Status */}
          <div
            className={`p-4 rounded-xl border ${
              hasAddress
                ? "bg-green-500/10 border-green-500/30"
                : "bg-yellow-500/10 border-yellow-500/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin
                  className={`w-5 h-5 ${
                    hasAddress ? "text-green-400" : "text-yellow-400"
                  }`}
                />
                <div>
                  <p
                    className={`font-medium ${
                      hasAddress ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    {hasAddress ? "Endereço confirmado" : "Endereço necessário"}
                  </p>
                  <p className="text-sm text-gray-300">
                    {hasAddress
                      ? `${currentAddress.address_1}, ${currentAddress.number} - ${currentAddress.city}`
                      : "Adicione um endereço para continuar"}
                  </p>
                </div>
              </div>
              {!hasAddress && (
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="w-8 h-8 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Payment Method Selection */}
          <PaymentMethodSelector
            paymentMethods={paymentMethods}
            selectedMethod={selectedPaymentMethod}
            onMethodChange={setSelectedPaymentMethod}
          />

          {/* Order Summary */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Subtotal:</span>
              <span className="text-white">R$ {cart.total.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm">
                <span className="text-green-400">
                  Desconto ({appliedCoupon.code}):
                </span>
                <span className="text-green-400">
                  -R$ {appliedCoupon.discount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="border-t border-white/10 pt-2">
              <div className="flex justify-between font-bold">
                <span className="text-white">Total:</span>
                <span className="text-white text-lg">
                  R$ {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Buttons */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: canCheckout ? 1.02 : 1 }}
              whileTap={{ scale: canCheckout ? 0.98 : 1 }}
              onClick={handleFinalizePurchase}
              disabled={!canCheckout}
              className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
                canCheckout
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span>Finalizar Compra</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <Link
              href="/store"
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center"
            >
              Continuar Comprando
            </Link>
          </div>

          {/* Security Info */}
          <div className="text-xs text-gray-400 text-center space-y-1">
            <p>🔒 Compra 100% segura e protegida</p>
            <p>📦 Frete grátis para compras acima de R$ 199</p>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onAddressAdded={handleAddressAdded}
        userId={userId}
      />
    </>
  );
}
