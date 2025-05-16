"use client";

import type React from "react";

import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useState } from "react";
import { Total } from "../Total";
import {
  clearCartAction,
  removeItemFromCartAction,
} from "@/app/server-actions/cart.action";
import { Delete as DeleteIcon } from "@mui/icons-material";
import type { Billing, Shipping } from "@/models";
import { createOrder } from "@/app/service/OrderService";
import { useRouter } from "next/navigation";
import { OrderConfirmation } from "../order-confirmation";
import { Button } from "../button/FormButton";
// Fix the import path for OrderConfirmation

export default function Checkout({
  user,
  cart,
  products,
  paymentMethods,
  billing,
  shipping,
}: {
  user: any;
  cart: any;
  products: any;
  paymentMethods: any;
  billing: Billing;
  shipping: Shipping;
}) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("asaas-pix");
  const router = useRouter();
  // Add a new state to track order creation
  const [createdOrder, setCreatedOrder] = useState<{ id: string } | null>(null);

  const handlePaymentMethodChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedPaymentMethod(event.target.value);
  };
  const steps = [
    {
      label: "Informações de Envio",
      description: (
        <Box sx={{ mb: 2 }}>
          <Typography>Rua: {billing?.address_1}</Typography>
          <Typography>Numero: {billing?.number}</Typography>
          <Typography>Cidade: {billing?.city}</Typography>
          <Typography>Estado: {billing?.state}</Typography>
          <Typography>CEP: {billing?.postcode}</Typography>
        </Box>
      ),
    },
    {
      label: "Informações de Pagamento",
      description: (
        <Box sx={{ mb: 2 }}>
          <RadioGroup
            aria-label="payment-method"
            name="payment-method"
            value={selectedPaymentMethod}
            onChange={handlePaymentMethodChange}
          >
            {paymentMethods.map((method: any) => {
              console.log(method);
              return (
                <FormControlLabel
                  key={method.id}
                  value={method.id}
                  control={<Radio />}
                  label={method.title}
                  sx={{ color: "black" }}
                />
              );
            })}
          </RadioGroup>
        </Box>
      ),
    },
    {
      label: "Revisão do Pedido",
      description: (
        <Box sx={{ mb: 2 }}>
          {cart.items.map((item: any, index: any) => {
            const product = products.find((p: any) => p.id === item.product_id);
            return (
              <Box key={item.product_id} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <ListItemAvatar>
                    <Avatar
                      src={product?.images?.[0]?.src}
                      alt={product?.name}
                      sx={{ width: 64, height: 64 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold" }}
                        >
                          {product?.name}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ color: "primary.main" }}
                        >
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(item.total)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mt: 1,
                        }}
                      >
                        <Typography>Quantidade: {item.quantity}</Typography>
                        <form
                          action={removeItemFromCartAction}
                          style={{ marginLeft: "auto" }}
                        >
                          <input type="hidden" name="index" value={index} />
                          <Button type="submit" variant="red">
                            Excluir
                            <DeleteIcon />
                          </Button>
                        </form>
                      </Box>
                    }
                  />
                </Box>
                <Divider />
              </Box>
            );
          })}
          <Box sx={{ mt: 2, justifyContent: "flex-end", display: "flex" }}>
            <Total total={cart.total} />
          </Box>
        </Box>
      ),
    },
  ];

  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  // Update the handleOrder function to set the created order
  async function handleOrder() {
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
      if (order) {
        await clearCartAction();
        setCreatedOrder(order); // Store the created order
        // If not PIX, redirect to orders page
        // if (selectedPaymentMethod !== "asaas-pix") {
        // router.push(`my-orders/${order.id}`);
        // }
      }
    } catch (error) {
      console.error(error);
    }
  }

  // In the return statement, add a condition to show the OrderConfirmation component
  return (
    <>
      {createdOrder ? (
        <OrderConfirmation
          total={cart.total}
          orderId={createdOrder.id}
          paymentMethod={selectedPaymentMethod}
        />
      ) : (
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2, color: "black" }}>{step.description}</Box>
                <Box
                  sx={{
                    mb: 2,
                    flexDirection: "row",
                    display: "flex",
                    gap: 2,
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    variant="secondary"
                    color="secondary"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={() => {
                      if (index === steps.length - 1) {
                        handleOrder();
                      } else {
                        handleNext();
                      }
                    }}
                    variant="primary"
                    color="primary"
                  >
                    {index === steps.length - 1 ? "Finalizar" : "Continuar"}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      )}
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
            Todos os passos foram concluídos - seu pedido está finalizado!
          </Typography>
          <Button onClick={handleReset} variant="primary" color="primary">
            Resetar
          </Button>
        </Paper>
      )}
    </>
  );
}
