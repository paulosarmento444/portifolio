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

    // Endpoint da API do Asaas para QR Code estático
    const endpoint = "https://api.asaas.com/v3/pix/qrCodes/static";

    // Configuração do payload para o QR Code
    const payload = {
      addressKey: "paulo.cesar.sarmento@hotmail.com", // Substitua pela sua chave PIX
      description: description || `Pagamento do pedido #${orderId}`,
      value: value,
      expirationDate: expirationDate,
      additionalInfo: [
        {
          key: "Pedido",
          value: orderId,
        },
      ],
    };

    console.log("DESCRICAO:", body.description);

    console.log("Enviando requisição para:", endpoint);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        access_token:
          process.env.ASAAS_API_KEY ||
          "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjZmNjJjOWQ0LWU4N2ItNGNjZi04ZWI3LTFlMmFjMWFiZmMyMDo6JGFhY2hfZjI4NWU1MjYtOTdhOC00MDVkLTljOTItZjg4OTZmMTAyNjNh",
      },
      body: JSON.stringify(payload),
    });

    console.log("Status da resposta:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Erro na resposta da API do Asaas:",
        response.status,
        errorText
      );
      return NextResponse.json(
        {
          error: `API do Asaas retornou erro: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Resposta da API do Asaas:", JSON.stringify(data, null, 2));

    return NextResponse.json(data);
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
