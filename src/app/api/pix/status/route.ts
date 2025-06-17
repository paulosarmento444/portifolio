import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId parameter" },
        { status: 400 }
      );
    }

    const endpoint = `https://api.mercadopago.com/v1/orders/${orderId}`;
    const mercadoPagoApiKey = process.env.MERCADO_PAGO_API_KEY;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + mercadoPagoApiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `Erro ao consultar status: ${response.status}`,
          details: errorText,
          orderId: orderId,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const payment = data.transactions?.payments?.[0];

    // Melhorar a detecção de pagamento aprovado
    const isPaid =
      data.status === "paid" ||
      data.status === "approved" ||
      payment?.status === "approved" ||
      payment?.status === "paid" ||
      payment?.status_detail === "accredited";

    const isPending =
      (data.status === "action_required" &&
        payment?.status === "action_required") ||
      payment?.status_detail === "waiting_transfer";

    const isProcessing =
      payment?.status === "in_process" ||
      payment?.status === "pending" ||
      payment?.status_detail === "pending_waiting_transfer";

    const statusInfo = {
      // IDs
      mercadoPagoOrderId: data.id,
      paymentId: payment?.id,

      // Status originais
      orderStatus: data.status,
      paymentStatus: payment?.status,
      statusDetail: payment?.status_detail,

      // Valores
      totalAmount: data.total_amount,
      paidAmount: payment?.amount,

      // Datas
      createdDate: data.created_date,
      lastUpdated: data.last_updated_date,
      expirationDate: payment?.date_of_expiration,

      // Estados calculados
      isPaid,
      isPending,
      isProcessing,
      isExpired:
        payment?.status === "cancelled" || payment?.status === "expired",
      isRejected: payment?.status === "rejected",

      // Informações adicionais
      paymentMethod: payment?.payment_method?.id,
      qrCode: payment?.payment_method?.qr_code,
      ticketUrl: payment?.payment_method?.ticket_url,
    };

    return NextResponse.json(statusInfo);
  } catch (error) {
    console.error("Erro ao consultar status do pagamento:", error);
    return NextResponse.json(
      {
        error: "Failed to check payment status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
