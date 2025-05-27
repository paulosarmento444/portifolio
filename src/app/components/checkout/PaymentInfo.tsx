"use client";
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Paper,
} from "@mui/material";
import type { PaymentMethod } from "../../types/checkout";

interface PaymentInfoProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

export function PaymentInfo({
  paymentMethods,
  selectedPaymentMethod,
  onPaymentMethodChange,
}: PaymentInfoProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Método de Pagamento
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Selecione como você gostaria de pagar seu pedido.
      </Alert>

      <RadioGroup
        aria-label="payment-method"
        name="payment-method"
        value={selectedPaymentMethod}
        onChange={(e) => onPaymentMethodChange(e.target.value)}
      >
        {paymentMethods.map((method) => (
          <Paper
            key={method.id}
            elevation={selectedPaymentMethod === method.id ? 2 : 0}
            sx={{
              p: 1,
              mb: 1,
              border: selectedPaymentMethod === method.id ? 2 : 1,
              borderColor:
                selectedPaymentMethod === method.id
                  ? "primary.main"
                  : "divider",
            }}
          >
            <FormControlLabel
              value={method.id}
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle1">{method.title}</Typography>
                  {method.description && (
                    <Typography variant="body2" color="text.secondary">
                      {method.description}
                    </Typography>
                  )}
                </Box>
              }
              sx={{ color: "black", width: "100%" }}
            />
          </Paper>
        ))}
      </RadioGroup>
    </Box>
  );
}
