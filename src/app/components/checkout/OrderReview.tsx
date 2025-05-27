import {
  Box,
  Typography,
  Avatar,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  Paper,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { Total } from "../Total";
import { Button } from "../button/FormButton";
import { removeItemFromCartAction } from "@/app/server-actions/cart.action";
import type { Cart, Product } from "../../types/checkout";

interface OrderReviewProps {
  cart: Cart;
  products: Product[];
}

export function OrderReview({ cart, products }: OrderReviewProps) {
  if (cart.items.length === 0) {
    return (
      <Alert severity="warning">
        Seu carrinho está vazio. Adicione produtos antes de finalizar o pedido.
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Revisão do Pedido
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Revise todos os itens antes de finalizar seu pedido.
      </Alert>

      {cart.items.map((item, index) => {
        const product = products.find((p) => p.id === item.product_id);

        if (!product) {
          return (
            <Alert key={item.product_id} severity="error" sx={{ mb: 1 }}>
              Produto não encontrado: {item.product_id}
            </Alert>
          );
        }

        return (
          <Paper key={item.product_id} elevation={1} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <ListItemAvatar>
                <Avatar
                  src={product.images?.[0]?.src}
                  alt={product.name}
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
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {product.name}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "primary.main", fontWeight: "bold" }}
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
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <Typography color="text.secondary">
                      Quantidade: {item.quantity}
                    </Typography>
                    <form action={removeItemFromCartAction}>
                      <input type="hidden" name="index" value={index} />
                      <Button type="submit" variant="red">
                        <DeleteIcon sx={{ mr: 1 }} />
                        Excluir
                      </Button>
                    </form>
                  </Box>
                }
              />
            </Box>
          </Paper>
        );
      })}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Total total={cart.total} />
      </Box>
    </Box>
  );
}
