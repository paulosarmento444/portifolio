import React from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import Link from "next/link";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Total } from "../components/Total";
import { removeItemFromCartAction } from "../server-actions/cart.action";
import { getCart } from "../service/CartService";
import { getProductsByIds } from "../service/ProductService";
import Header from "../components/Header";
import Checkout from "../components/checkout";
import { getCustomer } from "../service/MyAccountService";
import { getUserId } from "../server-actions/auth.action";
import { paymentMethod } from "../server-actions/checkout.action";

const steps = [
  {
    label: "Informações de Envio",
    description: <></>,
  },
  {
    label: "Informações de Pagamento",
    description: <></>,
  },
  {
    label: "Revisão do Pedido",
    description: `Revise todos os detalhes do seu pedido antes de concluir. Certifique-se de que todas as informações estejam corretas.`,
  },
];

async function MyCartPage() {
  const cart = getCart();
  const products = await getProductsByIds(
    cart.items.map((item) => item.product_id)
  );
  const userId = await getUserId();

  const { billing, shipping } = await getCustomer(userId);

  const paymentMethods = await paymentMethod();

  return (
    <Box>
      <Header />
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          py: 4,
          px: 2,
          mt: 12,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            display: "flex",
            alignItems: "center",
            color: "white",
          }}
        >
          <ShoppingCartIcon sx={{ mr: 1 }} />
          Meu Carrinho
        </Typography>

        <Grid2 container spacing={4}>
          <Grid2 xs={12} md={6}>
            <List>
              {cart.items.map((item, index) => {
                const product = products.find(
                  (product: any) => product.id === item.product_id
                );

                if (!product) return null;

                return (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start" sx={{ p: 2 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={product.images?.[0]?.src}
                          alt={product.name}
                          sx={{ width: 64, height: 64, mr: 2 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: "bold" }}
                              >
                                {product.name}
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
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mt: 1,
                              }}
                            >
                              <Typography variant="body2" color="white">
                                Quantidade: {item.quantity}
                              </Typography>
                              <form
                                action={removeItemFromCartAction}
                                style={{ marginLeft: "auto" }}
                              >
                                <input
                                  type="hidden"
                                  name="index"
                                  value={index}
                                />
                                <Button
                                  color="error"
                                  startIcon={<DeleteIcon />}
                                  type="submit"
                                  size="small"
                                >
                                  Excluir
                                </Button>
                              </form>
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                    {index < cart.items.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
              {!cart.items.length && (
                <ListItem>
                  <ListItemText primary="Nenhum item no carrinho" />
                </ListItem>
              )}
            </List>
            <Box
              sx={{
                display: "flex",
                justifyContent: "end",
              }}
            >
              <Total total={+cart.total} />
            </Box>
          </Grid2>

          <Grid2 xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <Checkout
                user={userId}
                cart={cart}
                products={products}
                paymentMethods={paymentMethods}
                shipping={shipping}
                billing={billing}
              />

              <Button
                variant="outlined"
                fullWidth
                LinkComponent={Link}
                href="/store"
              >
                Continuar comprando
              </Button>
            </Box>
          </Grid2>
        </Grid2>
      </Box>
    </Box>
  );
}

export default MyCartPage;
