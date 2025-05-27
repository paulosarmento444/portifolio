import { Box, Typography, Alert } from "@mui/material";
import type { Billing } from "@/models";

interface ShippingInfoProps {
  billing: Billing;
}

export function ShippingInfo({ billing }: ShippingInfoProps) {
  const isComplete = billing?.address_1 && billing?.city && billing?.postcode;

  return (
    <Box sx={{ mb: 2 }}>
      {!isComplete && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Informações de envio incompletas. Verifique seus dados de endereço.
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        Endereço de Entrega
      </Typography>

      <Box sx={{ pl: 2 }}>
        <Typography>
          <strong>Rua:</strong> {billing?.address_1 || "Não informado"}
        </Typography>
        <Typography>
          <strong>Número:</strong> {billing?.number || "Não informado"}
        </Typography>
        <Typography>
          <strong>Cidade:</strong> {billing?.city || "Não informado"}
        </Typography>
        <Typography>
          <strong>Estado:</strong> {billing?.state || "Não informado"}
        </Typography>
        <Typography>
          <strong>CEP:</strong> {billing?.postcode || "Não informado"}
        </Typography>
      </Box>
    </Box>
  );
}
