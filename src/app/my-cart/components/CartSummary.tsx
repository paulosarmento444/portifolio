"use client";
import { ShoppingBag, Package } from "lucide-react";

interface CartSummaryProps {
  cart: any;
  appliedCoupon?: any;
}

export function CartSummary({ cart, appliedCoupon }: CartSummaryProps) {
  const subtotal = cart.total;
  const shipping = 0; // Calcular frete aqui
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal + shipping - discount);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Resumo do Pedido</h3>
      </div>

      <div className="space-y-4">
        {/* Items Count */}
        <div className="flex items-center justify-between text-gray-300">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Itens ({cart.items.length})</span>
          </div>
          <span className="font-medium">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(subtotal)}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between text-gray-300">
          <span>Frete</span>
          <span className="font-medium text-green-400">
            {shipping === 0
              ? "Grátis"
              : new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(shipping)}
          </span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="flex items-center justify-between text-green-400">
            <span>Desconto ({appliedCoupon.code})</span>
            <span className="font-medium">
              -
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(discount)}
            </span>
          </div>
        )}

        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-white">Total</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
