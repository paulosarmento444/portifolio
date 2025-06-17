import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, value, expirationDate, description } = body;

    if (!orderId || !value) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Endpoint da API do Mercado Pago
    const endpoint = "https://api.mercadopago.com/v1/orders";

    // Configuração do payload seguindo o formato que funcionou no curl
    const payload = {
      type: "online",
      external_reference: `ext_ref_${orderId}`,
      total_amount: value.toString(),
      payer: {
        email: "paulo.cesar.sarmento@hotmail.com",
        first_name: "Paulo",
      },
      transactions: {
        payments: [
          {
            amount: value.toString(),
            payment_method: {
              id: "pix",
              type: "bank_transfer",
            },
          },
        ],
      },
    };

    console.log("Enviando requisição para:", endpoint);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization:
          "Bearer APP_USR-4592896543217568-052118-d2bc930d8d03e4d1f51a3a607c8e0ba9-179353811",
        "X-Idempotency-Key": `idempotency_${orderId}_${Date.now()}`,
      },
      body: JSON.stringify(payload),
    });

    console.log("Status da resposta:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Erro na resposta da API do Mercado Pago:",
        response.status,
        errorText
      );
      return NextResponse.json(
        {
          error: `API do Mercado Pago retornou erro: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      "Resposta da API do Mercado Pago:",
      JSON.stringify(data, null, 2)
    );

    // Extrair dados do QR Code da resposta
    const payment = data.transactions?.payments?.[0];
    const qrCodeData = {
      orderId: data.id,
      qr_code: payment?.payment_method?.qr_code,
      qr_code_base64: payment?.payment_method?.qr_code_base64,
      ticket_url: payment?.payment_method?.ticket_url,
      expiration_date: payment?.date_of_expiration,
      status: data.status,
      total_amount: data.total_amount,
    };

    return NextResponse.json(qrCodeData);
  } catch (error) {
    console.error("Erro ao gerar QR Code PIX:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PIX QR Code",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
