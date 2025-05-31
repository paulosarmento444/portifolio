"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CartSummary } from "./CartSummary";
import { CouponSection } from "./CouponSection";
import { CheckoutSection } from "./CheckoutSection";

interface CartSidebarProps {
  cart: any;
  products: any[];
  userId: string;
  billing: any;
  shipping: any;
  paymentMethods: any[];
  onShowQRModal?: (modalContent: any) => void;
}

export function CartSidebar({
  cart,
  products,
  userId,
  billing,
  shipping,
  paymentMethods,
  onShowQRModal,
}: CartSidebarProps) {
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const handleCouponChange = (coupon: any) => {
    setAppliedCoupon(coupon);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="space-y-6"
    >
      {/* Cart Summary */}
      <CartSummary cart={cart} appliedCoupon={appliedCoupon} />

      {/* Coupon Section */}
      <CouponSection
        appliedCoupon={appliedCoupon}
        onCouponChange={handleCouponChange}
      />

      {/* Checkout Section */}
      <CheckoutSection
        cart={cart}
        products={products}
        userId={userId}
        billing={billing}
        shipping={shipping}
        paymentMethods={paymentMethods}
        appliedCoupon={appliedCoupon}
        onShowQRModal={onShowQRModal}
      />
    </motion.div>
  );
}
