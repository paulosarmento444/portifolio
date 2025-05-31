"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Cart } from "../types/checkout";
import { createOrder } from "../server-actions/order.action";

interface UseCheckoutProps {
  user: string;
  cart: Cart;
  billing: any;
}

export function useCheckout({ user, cart, billing }: UseCheckoutProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("asaas-pix");
  const [createdOrder, setCreatedOrder] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleNext = useCallback(() => {
    setActiveStep((prev) => prev + 1);
    setError(null);
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  }, []);

  const handleReset = useCallback(() => {
    setActiveStep(0);
    setCreatedOrder(null);
    setError(null);
  }, []);

  const handlePaymentMethodChange = useCallback((method: string) => {
    setSelectedPaymentMethod(method);
    setError(null);
  }, []);

  const validateStep = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 0: // Shipping info
          return !!(billing?.address_1 && billing?.city && billing?.postcode);
        case 1: // Payment info
          return !!selectedPaymentMethod;
        case 2: // Order review
          return cart.items.length > 0;
        default:
          return true;
      }
    },
    [billing, selectedPaymentMethod, cart.items]
  );

  const handleOrder = useCallback(async () => {
    if (!validateStep(2)) {
      setError("Por favor, verifique se todos os dados estão corretos.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const order = await createOrder({
        customer_id: user,
        billing,
        line_items: cart.items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        payment_method: selectedPaymentMethod,
      });
    } catch (err) {
      console.error("Erro ao criar pedido:", err);
      setError("Erro ao processar o pedido. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [user, billing, cart.items, selectedPaymentMethod, validateStep]);

  return {
    activeStep,
    selectedPaymentMethod,
    createdOrder,
    isLoading,
    error,
    handleNext,
    handleBack,
    handleReset,
    handlePaymentMethodChange,
    handleOrder,
    validateStep,
  };
}
