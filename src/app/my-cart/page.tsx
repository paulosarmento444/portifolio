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
  Alert,
  Paper,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Link from "next/link";
import { Total } from "../components/Total";
import { removeItemFromCartAction } from "../server-actions/cart.action";
import { getCart } from "../service/CartService";
import { getProductsByIds } from "../service/ProductService";
import Header from "../components/Header";
import Checkout from "../components/checkout/Checkout";
import { getCustomer } from "../service/MyAccountService";
import { getUserId } from "../server-actions/auth.action";
import { paymentMethod } from "../server-actions/checkout.action";

interface CartItemComponentProps {
  item: any;
  product: any;
  index: number;
}

function CartItemComponent({ item, product, index }: CartItemComponentProps) {
  if (!product) {
    return (
      <ListItem>
        <Alert severity="error" sx={{ width: "100%" }}>
          Produto não encontrado: {item.product_id}
        </Alert>
      </ListItem>
    );
  }

  return (
    <>
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
              <Typography variant="body2" color="white">
                Quantidade: {item.quantity}
              </Typography>
              <form action={removeItemFromCartAction}>
                <input type="hidden" name="index" value={index} />
                <Button
                  color="error"
                  startIcon={<DeleteIcon />}
                  type="submit"
                  size="small"
                  variant="outlined"
                >
                  Excluir
                </Button>
              </form>
            </Box>
          }
        />
      </ListItem>
      <Divider />
    </>
  );
}

async function MyCartPage() {
  try {
    const cart = getCart();
    const products = await getProductsByIds(
      cart.items.map((item) => item.product_id)
    );
    const userId = await getUserId();
    const { billing, shipping } = await getCustomer(userId);
    const paymentMethods = await paymentMethod();

    const hasItems = cart.items.length > 0;

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
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                {hasItems ? (
                  <List>
                    {cart.items.map((item, index) => (
                      <CartItemComponent
                        key={`${item.product_id}-${index}`}
                        item={item}
                        product={products.find(
                          (p: any) => p.id === item.product_id
                        )}
                        index={index}
                      />
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <ShoppingCartIcon
                      sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      Seu carrinho está vazio
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Adicione produtos para continuar com sua compra
                    </Typography>
                    <Button
                      variant="contained"
                      LinkComponent={Link}
                      href="/store"
                      size="large"
                    >
                      Ir às Compras
                    </Button>
                  </Box>
                )}
              </Paper>

              {hasItems && (
                <Box sx={{ display: "flex", justifyContent: "end" }}>
                  <Total total={+cart.total} />
                </Box>
              )}
            </Grid2>

            <Grid2 xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  bgcolor: "background.paper",
                  borderRadius: 2,
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
                {/* {hasItems ? (
                  <Checkout
                  user={userId}
                  cart={cart}
                  products={products}
                  paymentMethods={paymentMethods}
                  shipping={shipping}
                  billing={billing}
                />
                ) : (
                  <Alert severity="info">
                    Adicione produtos ao carrinho para continuar com o checkout.
                  </Alert>
                )} */}

                <Button
                  variant="outlined"
                  fullWidth
                  LinkComponent={Link}
                  href="/store"
                  sx={{ mt: 2 }}
                >
                  Continuar comprando
                </Button>
              </Paper>
            </Grid2>
          </Grid2>
        </Box>
      </Box>
    );
  } catch (error) {
    console.error("Erro ao carregar página do carrinho:", error);

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
          <Alert severity="error">
            Erro ao carregar o carrinho. Tente novamente mais tarde.
          </Alert>
        </Box>
      </Box>
    );
  }
}

export default MyCartPage;
