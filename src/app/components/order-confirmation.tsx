"use client";

import { Box, Paper, Typography } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Button } from "./button/FormButton";
import { PixQRCode } from "./pix-qr-code";
// Fix the import path to match your project structure
// Import the Button component from the same location as in your checkout component

interface OrderConfirmationProps {
  total: number;
  orderId: string;
  paymentMethod: string;
}

export function OrderConfirmation({
  total,
  orderId,
  paymentMethod,
}: OrderConfirmationProps) {
  const router = useRouter();
  const renderPaymentInstructions = (method: string) => {
    switch (method) {
      case "asaas-ticket":
        return (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Abaixo está o código de barras do boleto:
            </Typography>
            <PixQRCode orderId={orderId} total={total} />
          </>
        );
      case "asaas-credit-card":
        return (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              O pagamento foi processado com seu cartão de crédito. Você
              receberá a confirmação em breve.
            </Typography>
          </>
        );
      case "asaas-pix":
        return (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Para finalizar, escaneie o QR Code abaixo ou copie o código PIX:
            </Typography>
            <PixQRCode orderId={orderId} total={total} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 3, sm: 4 },
        backgroundColor: "white",
        color: "black",
        textAlign: "center",
        maxWidth: 600,
        mx: "auto",
        my: 6,
        borderRadius: 3,
      }}
    >
      <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
        <CheckCircle color="success" sx={{ fontSize: 60 }} />
      </Box>

      <Typography variant="h5" gutterBottom>
        Pedido Realizado com Sucesso!
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Seu pedido <strong>#{orderId}</strong> foi confirmado e está sendo
        processado.
      </Typography>

      {renderPaymentInstructions(paymentMethod)}

      <Box
        sx={{
          mt: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Button variant="secondary" onClick={() => router.push("/")}>
          Continuar Comprando
        </Button>

        <Button
          variant="primary"
          onClick={() => router.push("/my-account?menu=orders")}
        >
          Meus Pedidos
        </Button>
      </Box>
    </Paper>
  );
}
