"use client";
import { Box, CardContent, Typography, Chip, Stack, Card } from "@mui/material";
import { QrCode, CheckCircle, Speed, Security } from "@mui/icons-material";
import { motion } from "framer-motion";

const MotionCard = motion(Card);
const MotionBox = motion(Box);
interface PaymentMethodSelectorProps {
  selected: "pix" | "card";
  onChange: (method: "pix" | "card") => void;
}

export function PaymentMethodSelector({
  selected,
  onChange,
}: PaymentMethodSelectorProps) {
  const pixBenefits = [
    {
      icon: <Speed sx={{ fontSize: 20 }} />,
      title: "Instantâneo",
      description: "Pagamento processado em segundos",
    },
    {
      icon: <Security sx={{ fontSize: 20 }} />,
      title: "Seguro",
      description: "Tecnologia do Banco Central",
    },
    {
      icon: <CheckCircle sx={{ fontSize: 20 }} />,
      title: "Aprovação Imediata",
      description: "Sem espera para confirmação",
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ color: "white", fontWeight: 600, mb: 1 }}
        >
          Método de Pagamento
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
          Selecione o método de pagamento desejado
        </Typography>
      </Box>

      {/* PIX Card */}
      <MotionCard
        sx={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          border: "2px solid rgba(16,185,129,0.3)",
          position: "relative",
          overflow: "hidden",
          outline:
            selected === "pix" ? "3px solid rgba(16,185,129,0.6)" : "none",
          cursor: "pointer",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => onChange("pix")}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 100,
            height: 100,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          }}
        />

        <CardContent sx={{ p: 3, position: "relative" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <MotionBox
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "rgba(255,255,255,0.2)",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 3,
                }}
              >
                <QrCode sx={{ fontSize: 28, color: "white" }} />
              </MotionBox>

              <Box>
                <Typography
                  variant="h5"
                  sx={{ color: "white", fontWeight: "bold", mb: 0.5 }}
                >
                  PIX
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  Pagamento instantâneo
                </Typography>
              </Box>
            </Box>

            <Chip
              label={selected === "pix" ? "SELECIONADO" : "PIX"}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          </Box>

          {/* Benefits */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            {pixBenefits.map((benefit, index) => (
              <MotionBox
                key={benefit.title}
                sx={{
                  flex: 1,
                  textAlign: "center",
                  p: 1.5,
                  bgcolor: "rgba(255,255,255,0.1)",
                  borderRadius: 1.5,
                  backdropFilter: "blur(10px)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Box sx={{ color: "white", mb: 1 }}>{benefit.icon}</Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  {benefit.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.7rem" }}
                >
                  {benefit.description}
                </Typography>
              </MotionBox>
            ))}
          </Stack>
        </CardContent>
      </MotionCard>

      {/* CARD (Credito) */}
      <MotionCard
        sx={{
          mt: 2,
          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          border: "2px solid rgba(59,130,246,0.3)",
          position: "relative",
          overflow: "hidden",
          outline:
            selected === "card" ? "3px solid rgba(59,130,246,0.6)" : "none",
          cursor: "pointer",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => onChange("card")}
      >
        <CardContent sx={{ p: 3, position: "relative" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <MotionBox
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "rgba(255,255,255,0.2)",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Using QrCode icon for consistency; in real UI, use a Card icon */}
                <QrCode sx={{ fontSize: 28, color: "white" }} />
              </MotionBox>

              <Box>
                <Typography
                  variant="h5"
                  sx={{ color: "white", fontWeight: "bold", mb: 0.5 }}
                >
                  Cartão de Crédito
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  Mercado Pago Checkout Pro
                </Typography>
              </Box>
            </Box>

            <Chip
              label={selected === "card" ? "SELECIONADO" : "CARTÃO"}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.9)" }}
            >
              Pague em cartão, com segurança do Mercado Pago
            </Typography>
          </Stack>
        </CardContent>
      </MotionCard>

      {/* Info Box */}
      <MotionBox
        sx={{
          mt: 2,
          p: 2,
          bgcolor: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            bgcolor: "rgba(59,130,246,0.2)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CheckCircle sx={{ fontSize: 18, color: "#3b82f6" }} />
        </Box>
        <Box>
          <Typography
            variant="body2"
            sx={{ color: "white", fontWeight: 500, mb: 0.5 }}
          >
            Sobre os métodos de pagamento
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}
          >
            PIX: aprovação rápida e sem taxas adicionais. Cartão:
            redirecionamento para Checkout Pro do Mercado Pago, com segurança e
            parcelamento conforme disponível.
          </Typography>
        </Box>
      </MotionBox>
    </Box>
  );
}
