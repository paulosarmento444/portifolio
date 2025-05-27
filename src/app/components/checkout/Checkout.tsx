"use client";
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Button } from "../button/FormButton";
import { OrderConfirmation } from "../order-confirmation";
import { useCheckout } from "../../hooks/useCheckout";
import { ShippingInfo } from "./ShippingInfo";
import { PaymentInfo } from "./PaymentInfo";
import { OrderReview } from "./OrderReview";
import type { Cart, Product, PaymentMethod } from "../../types/checkout";
import type { Billing, Shipping } from "@/models";

interface CheckoutProps {
  user: string;
  cart: any;
  products: Product[];
  paymentMethods: PaymentMethod[];
  billing: Billing;
  shipping: Shipping;
}

export default function Checkout({
  user,
  cart,
  products,
  paymentMethods,
  billing,
  shipping,
}: CheckoutProps) {
  const {
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
  } = useCheckout({ user, cart, billing });

  const steps = [
    {
      label: "Informações de Envio",
      description: <ShippingInfo billing={billing} />,
      isValid: validateStep(0),
    },
    {
      label: "Informações de Pagamento",
      description: (
        <PaymentInfo
          paymentMethods={paymentMethods}
          selectedPaymentMethod={selectedPaymentMethod}
          onPaymentMethodChange={handlePaymentMethodChange}
        />
      ),
      isValid: validateStep(1),
    },
    {
      label: "Revisão do Pedido",
      description: <OrderReview cart={cart} products={products} />,
      isValid: validateStep(2),
    },
  ];

  // Show order confirmation if order was created
  if (createdOrder) {
    return (
      <OrderConfirmation
        total={cart.total}
        orderId={createdOrder.id}
        paymentMethod={selectedPaymentMethod}
      />
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              error={!step.isValid && activeStep > index}
              optional={
                !step.isValid && activeStep > index ? (
                  <Typography variant="caption" color="error">
                    Informações incompletas
                  </Typography>
                ) : null
              }
            >
              {step.label}
            </StepLabel>
            <StepContent>
              <Box sx={{ mb: 2, color: "black" }}>{step.description}</Box>

              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  gap: 2,
                  justifyContent: "space-between",
                }}
              >
                <Button
                  disabled={index === 0}
                  onClick={handleBack}
                  variant="secondary"
                >
                  Voltar
                </Button>

                <Button
                  disabled={!step.isValid || isLoading}
                  onClick={() => {
                    if (index === steps.length - 1) {
                      handleOrder();
                    } else {
                      handleNext();
                    }
                  }}
                  variant="primary"
                >
                  {isLoading ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Processando...
                    </>
                  ) : index === steps.length - 1 ? (
                    "Finalizar Pedido"
                  ) : (
                    "Continuar"
                  )}
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {activeStep === steps.length && !createdOrder && (
        <Paper
          square
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: "transparent",
            color: "black",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Todos os passos foram concluídos!
          </Typography>
          <Button onClick={handleReset} variant="primary">
            Resetar
          </Button>
        </Paper>
      )}
    </Box>
  );
}
