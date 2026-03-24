import { NextResponse } from "next/server";
import {
  cocartServerAdapter,
  readCoCartForwardHeaders,
  readCoCartAccessToken,
  verifyCoCartAccessToken,
} from "@site/integrations/cocart/server";
import { wordpressWooRestAdapter } from "@site/integrations/wordpress/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface OrderStatusRouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: Request, context: OrderStatusRouteContext) {
  const orderId = Number.parseInt(context.params.id, 10);

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return NextResponse.json(
      {
        error: "Invalid order id",
      },
      { status: 400 },
    );
  }

  const requestHeaders = await readCoCartForwardHeaders(request.headers);
  const accessToken = await readCoCartAccessToken(request.headers);
  const verifiedTokenUser = verifyCoCartAccessToken(accessToken);

  let sessionState:
    | Awaited<ReturnType<typeof cocartServerAdapter.getSessionState>>
    | null = null;

  if (!verifiedTokenUser?.id) {
    try {
      sessionState = await cocartServerAdapter.getSessionState(requestHeaders);
    } catch {
      sessionState = null;
    }
  }

  const customerId = Number(verifiedTokenUser?.id || sessionState?.session.user?.id);

  if (!Number.isFinite(customerId) || customerId <= 0) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }

  try {
    const order = await wordpressWooRestAdapter.getOrderByIdForCustomer(orderId, customerId);

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        order,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load order status",
      },
      { status: 500 },
    );
  }
}
