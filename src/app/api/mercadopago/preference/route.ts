import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, total, items } = body || {};

    const endpoint = "https://api.mercadopago.com/checkout/preferences";
    const token =
      process.env.MERCADO_PAGO_API_KEY ||
      "APP_USR-4592896543217568-052118-d2bc930d8d03e4d1f51a3a607c8e0ba9-179353811";
    if (!token) {
      return NextResponse.json(
        { error: "Missing MERCADO_PAGO_API_KEY env var" },
        { status: 500 }
      );
    }

    // Garantir URL absoluta para back_urls (ordem de prioridade de envs)
    let baseUrl =
      process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
    try {
      if (!baseUrl) {
        const url = new URL(request.url);
        baseUrl = `${url.protocol}//${url.host}`;
      }
    } catch {
      baseUrl = "http://localhost:3000";
    }
    if (!baseUrl) baseUrl = "http://localhost:3000";
    // Sanitizar barra final
    if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);
    // Garantir esquema http/https explícito
    if (!/^https?:\/\//i.test(baseUrl)) {
      baseUrl = `https://${baseUrl}`;
    }
    // Para localhost, force http (evita https://localhost)
    if (/localhost|127\.0\.0\.1/i.test(baseUrl)) {
      baseUrl = baseUrl.replace(/^https:\/\//i, "http://");
    }

    const preferencePayload: any = {
      items:
        Array.isArray(items) && items.length > 0
          ? items.map((it: any, idx: number) => ({
              title: it.title || `Item ${idx + 1}`,
              quantity: Number(it.quantity || 1),
              unit_price: Number(it.unit_price || 0),
              picture_url: it.picture_url,
            }))
          : [
              {
                title: `Pedido #${orderId}`,
                quantity: 1,
                unit_price: Number(total || 0),
              },
            ],
      external_reference: `order_${orderId}`,
      back_urls: {
        success: `${baseUrl}/order-confirmation/${orderId || "success"}`,
        failure: `${baseUrl}/my-cart?status=failure`,
        pending: `${baseUrl}/my-cart?status=pending`,
      },
      // auto_return apenas se success for https (MP exige URL válida)
      ...(/^https:\/\//i.test(`${baseUrl}`) ? { auto_return: "approved" } : {}),
    };

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferencePayload),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json(
        {
          error: data?.message || "Failed to create preference",
          details: data,
        },
        { status: resp.status }
      );
    }

    return NextResponse.json({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
