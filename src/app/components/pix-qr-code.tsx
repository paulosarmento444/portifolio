"use client";

import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import Image from "next/image";

interface PixQRCodeProps {
  orderId: string;
  total: number;
}

export function PixQRCode({ orderId, total }: PixQRCodeProps) {
  const [qrCodeData, setQrCodeData] = useState<{
    encodedImage?: string;
    payload?: string;
    expirationDate?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        setLoading(true);
        // Assuming you'll create an endpoint that generates the QR code for a specific order
        const response = await fetch("/api/pix/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            // Add any other required parameters for your Asaas integration
            value: total, // This should come from your order total
            expirationDate: new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ).toISOString(), // 24 hours from now
            description: `Pagamento do pedido #${orderId}`,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate QR code: ${response.status}`);
        }

        const data = await response.json();
        setQrCodeData(data);
      } catch (err) {
        console.error("Error fetching QR code:", err);
        setError(
          err instanceof Error ? err.message : "Failed to generate QR code"
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchQRCode();
    }
  }, [orderId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center", color: "error.main" }}>
        <Typography variant="body1">Erro ao gerar QR Code: {error}</Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{ p: 4, textAlign: "center", maxWidth: 400, mx: "auto", my: 3 }}
    >
      <Typography variant="h6" gutterBottom>
        Pagamento via PIX
      </Typography>

      {qrCodeData?.encodedImage && (
        <Box sx={{ my: 3 }}>
          <Image
            src={`data:image/png;base64,${qrCodeData.encodedImage}`}
            alt="QR Code PIX"
            width={200}
            height={200}
            style={{ margin: "0 auto" }}
          />
        </Box>
      )}

      {qrCodeData?.payload && (
        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Código PIX Copia e Cola:
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              wordBreak: "break-all",
              backgroundColor: "#f5f5f5",
              cursor: "pointer",
              "&:hover": { backgroundColor: "#eeeeee" },
            }}
            onClick={() => {
              navigator.clipboard.writeText(qrCodeData.payload || "");
              alert("Código PIX copiado!");
            }}
          >
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
              {qrCodeData.payload}
            </Typography>
          </Paper>
          <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
            Clique no código para copiar
          </Typography>
        </Box>
      )}

      {qrCodeData?.expirationDate && (
        <Typography variant="caption" color="text.secondary">
          Este QR Code expira em:{" "}
          {new Date(qrCodeData.expirationDate).toLocaleString()}
        </Typography>
      )}
    </Paper>
  );
}
