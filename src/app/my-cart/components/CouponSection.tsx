"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Check, X, Loader2 } from "lucide-react";
import {
  applyCouponAction,
  removeCouponAction,
} from "@/app/server-actions/cupom.action";

interface CouponSectionProps {
  appliedCoupon?: any;
  onCouponChange?: (coupon: any) => void;
}

export function CouponSection({
  appliedCoupon,
  onCouponChange,
}: CouponSectionProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplying(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("coupon_code", couponCode);

      const result = await applyCouponAction(formData);

      if (result.error) {
        setError(result.error);
      } else {
        setCouponCode("");
        onCouponChange?.(result);
      }
    } catch (err) {
      setError("Erro ao aplicar cupom");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCouponAction();
      onCouponChange?.(null);
    } catch (err) {
      setError("Erro ao remover cupom");
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
          <Tag className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Cupom de Desconto</h3>
      </div>

      {appliedCoupon ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-500/20 border border-green-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-green-400 font-medium">Cupom aplicado!</p>
                <p className="text-green-300 text-sm">{appliedCoupon.code}</p>
                <p className="text-green-200 text-xs">
                  Desconto: R$ {appliedCoupon.discount?.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Digite o código do cupom"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={isApplying || !couponCode.trim()}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
            >
              {isApplying && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isApplying ? "Aplicando..." : "Aplicar"}</span>
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
            >
              {error}
            </motion.div>
          )}

          <div className="text-xs text-gray-400">
            <p>• Cupons não podem ser combinados</p>
            <p>• Válido apenas para produtos elegíveis</p>
          </div>
        </div>
      )}
    </div>
  );
}
