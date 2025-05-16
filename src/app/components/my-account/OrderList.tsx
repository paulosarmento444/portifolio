import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@/models";
import { Button } from "../button/FormButton";

interface OrderListProps {
  orders: any[];
}

const OrderList: React.FC<OrderListProps> = ({ orders }) => {
  const router = useRouter();

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <Typography variant="h4" sx={{ color: "white" }}>
        Meus pedidos
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "white" }}>ID</TableCell>
            <TableCell sx={{ color: "white" }}>Data</TableCell>
            <TableCell sx={{ color: "white" }}>Valor</TableCell>
            <TableCell sx={{ color: "white" }}>Status</TableCell>
            <TableCell sx={{ color: "white" }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell sx={{ color: "white" }}>{order.id}</TableCell>
                <TableCell sx={{ color: "white" }}>
                  {order.date_created
                    ? new Date(order.date_created).toLocaleDateString("pt-BR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "Data inválida"}
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(order.total)}
                </TableCell>
                <TableCell>
                  {order.status === OrderStatus.PENDING ? (
                    <Typography variant="h5" sx={{ color: "white" }}>
                      ⏳
                    </Typography>
                  ) : order.status === OrderStatus.PAID ? (
                    <Typography variant="h5" sx={{ color: "white" }}>
                      ✔
                    </Typography>
                  ) : (
                    <Typography variant="h5" sx={{ color: "white" }}>
                      ✖
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Button onClick={() => router.push(`/my-orders/${order.id}`)}>
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                sx={{ color: "white", textAlign: "center" }}
              >
                <Typography>Nenhum pedido encontrado.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default OrderList;
