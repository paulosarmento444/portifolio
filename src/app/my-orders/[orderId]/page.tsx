import Header from "@/app/components/Header";
import { Total } from "@/app/components/Total";
import { getOrder } from "@/app/service/MyAccountService";
import { OrderStatus } from "@/models";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import Image from "next/image";

async function MyOrderDetail({ params }: { params: { orderId: number } }) {
  const order = await getOrder(params.orderId);
  // console.log("Order:", order);
  return (
    <>
      <Header />
      <Box
        sx={{
          height: "100vh",
          mt: "120px",
        }}
      >
        <Grid2 container spacing={2}>
          <Grid2 xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {order.status === OrderStatus.PENDING ? (
                  <Typography variant="h1" sx={{ color: "warning.main" }}>
                    ⏳
                  </Typography>
                ) : order.status === OrderStatus.PAID ? (
                  <Typography variant="h1" sx={{ color: "success.main" }}>
                    ✔
                  </Typography>
                ) : (
                  <Typography variant="h1" sx={{ color: "error.main" }}>
                    ✖
                  </Typography>
                )}
              </Box>
              <Typography
                variant="h4"
                sx={{ textAlign: "center", color: "white" }}
              >
                {order.status === OrderStatus.PENDING
                  ? "Pedido pendente"
                  : order.status === OrderStatus.PAID
                  ? "Pedido pago"
                  : "Pedido cancelado"}
              </Typography>
            </Box>
          </Grid2>
          <Grid2 xs={12} md={6}>
            <Typography variant="h4" sx={{ color: "white" }}>
              Resumo do pedido
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "white" }}>Produto</TableCell>
                  <TableCell sx={{ color: "white" }}>Qtd.</TableCell>
                  <TableCell sx={{ color: "white" }}>Preço</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.line_items?.map((item: any, key: any) => {
                  return (
                    <TableRow key={key}>
                      <TableCell sx={{ color: "white" }}>
                        {item ? (
                          <Box display={"flex"} alignItems={"center"} gap={2}>
                            <Image
                              src={item.image.src}
                              alt={item.name}
                              width={44}
                              height={44}
                              style={{ marginRight: 8 }}
                            />
                            {item.name}
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: 50,
                              height: 50,
                              backgroundColor: "grey",
                              marginRight: 8,
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ color: "white" }}>
                        {item.quantity}
                      </TableCell>
                      <TableCell sx={{ color: "white" }}>
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(item.price)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell colSpan={3}>
                    <Box sx={{ display: "flex", justifyContent: "end" }}>
                      <Total total={order.total} />
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid2>
        </Grid2>
      </Box>
    </>
  );
}

export default MyOrderDetail;
