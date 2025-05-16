import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log(
      "Enviando requisição para Asaas com os seguintes dados:",
      JSON.stringify(body, null, 2)
    );

    // Verificar se a API key está disponível
    const apiKey =
      process.env.ASAAS_API_KEY || process.env.NEXT_PUBLIC_ASAAS_API_KEY;

    if (!apiKey) {
      console.error(
        "API key do Asaas não encontrada nas variáveis de ambiente"
      );
      return NextResponse.json(
        { error: "API key não configurada" },
        { status: 500 }
      );
    }

    console.log("Usando API key:", apiKey.substring(0, 5) + "...");

    // Endpoint da API do Asaas - usando sandbox
    const endpoint = "https://api-sandbox.asaas.com/v3/pix/qrCodes/static";

    console.log("Enviando requisição para:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        access_token:
          "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmMyZTY2NjFhLWQxZDctNDRjZi1iMzFjLTdjYTcyNGFlZGNhNDo6JGFhY2hfMzQ4NjkxNzgtNjVjNC00MDgxLWFhNDYtMWE0NGE3MzEzY2Ey",
      },
      body: JSON.stringify(body),
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
    console.error("Erro ao processar pagamento:", error);
    return NextResponse.json(
      {
        error: "Failed to process payment",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
