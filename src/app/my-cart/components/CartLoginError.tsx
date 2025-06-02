import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Container,
  Divider,
} from "@mui/material";
import { Login, ShoppingCart, ArrowBack, PersonAdd } from "@mui/icons-material";
import Header from "@/app/components/Header";

export function CartLoginError() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Header />
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card
          sx={{
            bgcolor: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            maxWidth: 400,
            mx: "auto",
          }}
        >
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            {/* Icon */}
            <Box sx={{ position: "relative", mb: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "rgba(124,58,237,0.2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <ShoppingCart sx={{ fontSize: 40, color: "#a855f7" }} />
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  top: -8,
                  right: "calc(50% - 48px)",
                  width: 32,
                  height: 32,
                  bgcolor: "#ef4444",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Login sx={{ fontSize: 16, color: "white" }} />
              </Box>
            </Box>

            {/* Title and Message */}
            <Typography
              variant="h4"
              component="h1"
              sx={{ color: "white", fontWeight: "bold", mb: 2 }}
            >
              Login Necessário
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "rgba(255,255,255,0.7)", mb: 4, lineHeight: 1.6 }}
            >
              Para acessar seu carrinho e finalizar suas compras, você precisa
              estar logado em sua conta.
            </Typography>

            {/* Action Buttons */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Button
                href="/auth/login"
                variant="contained"
                fullWidth
                startIcon={<Login />}
                sx={{
                  bgcolor: "#7c3aed",
                  "&:hover": { bgcolor: "#6d28d9" },
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                Fazer Login
              </Button>

              <Button
                href="/auth/register"
                variant="outlined"
                fullWidth
                startIcon={<PersonAdd />}
                sx={{
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                Criar Conta
              </Button>
            </Stack>

            {/* Back Button */}
            <Button
              href="/store"
              startIcon={<ArrowBack />}
              sx={{
                color: "rgba(255,255,255,0.6)",
                "&:hover": {
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.05)",
                },
              }}
            >
              Voltar às Compras
            </Button>

            {/* Additional Info */}
            <Box sx={{ mt: 4, pt: 3 }}>
              <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 3 }} />
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.5)" }}
              >
                Já tem uma conta? Faça login para ver seus itens salvos.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
