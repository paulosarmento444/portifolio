import { getOrder } from "../../service/OrderService";
import { OrderConfirmation } from "./components/OrderConfirmation";
import Header from "../../components/Header";

export default async function OrderConfirmationPage({
  params: { id },
}: {
  params: { id: string };
}) {
  try {
    const order = await getOrder(Number.parseInt(id));

    return (
      <>
        <Header />
        <div className="mt-20">
          <OrderConfirmation order={order} />
        </div>
      </>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Pedido não encontrado
          </h1>
          <p className="text-gray-300">
            Verifique o número do pedido e tente novamente.
          </p>
        </div>
      </div>
    );
  }
}
