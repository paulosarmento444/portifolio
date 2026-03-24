import { NextResponse } from "next/server";
import {
  cocartServerAdapter,
  readCoCartForwardHeaders,
  readCoCartAccessToken,
  verifyCoCartAccessToken,
} from "@site/integrations/cocart/server";
import { mercadoPagoHeadlessServer } from "@site/integrations/payments/server";
import type { MercadoPagoCardPaymentInput } from "@site/integrations/payments";
import { wordpressWooRestAdapter } from "@site/integrations/wordpress/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface OrderPaymentRouteContext {
  params: {
    id: string;
  };
}

type PaymentActionBody =
  | { action: "pix" }
  | { action: "3ds_finalize" }
  | { action: "card"; payment: MercadoPagoCardPaymentInput };

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

const jsonError = (error: string, status: number) =>
  NextResponse.json(
    {
      error,
    },
    {
      status,
      headers: noStoreHeaders,
    },
  );

async function getAuthorizedOrderContext(request: Request, orderId: number) {
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
    return {
      error: jsonError("Unauthorized", 401),
    };
  }

  try {
    const orderContext =
      await wordpressWooRestAdapter.getOrderPaymentContextForCustomer(orderId, customerId);

    if (!orderContext) {
      return {
        error: jsonError("Order not found", 404),
      };
    }

    return {
      customerId,
      orderContext,
    };
  } catch (error) {
    return {
      error: jsonError(
        error instanceof Error ? error.message : "Failed to load order context",
        500,
      ),
    };
  }
}

export async function GET(request: Request, context: OrderPaymentRouteContext) {
  const orderId = Number.parseInt(context.params.id, 10);

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return jsonError("Invalid order id", 400);
  }

  const authorizedContext = await getAuthorizedOrderContext(request, orderId);

  if ("error" in authorizedContext) {
    return authorizedContext.error;
  }

  const { customerId, orderContext } = authorizedContext;
  const sync = new URL(request.url).searchParams.get("sync") === "true";

  try {
    const [paymentState, config, refreshedOrder] = await Promise.all([
      mercadoPagoHeadlessServer.getOrderPaymentState({
        orderId,
        orderKey: orderContext.orderKey,
        sync,
      }),
      mercadoPagoHeadlessServer.getConfig().catch(() => null),
      wordpressWooRestAdapter
        .getOrderByIdForCustomer(orderId, customerId)
        .catch(() => orderContext.order),
    ]);

    return NextResponse.json(
      {
        order: refreshedOrder || orderContext.order,
        paymentState,
        config,
      },
      {
        headers: noStoreHeaders,
      },
    );
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to load payment state",
      500,
    );
  }
}

export async function POST(request: Request, context: OrderPaymentRouteContext) {
  const orderId = Number.parseInt(context.params.id, 10);

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return jsonError("Invalid order id", 400);
  }

  const authorizedContext = await getAuthorizedOrderContext(request, orderId);

  if ("error" in authorizedContext) {
    return authorizedContext.error;
  }

  const { customerId, orderContext } = authorizedContext;

  let body: PaymentActionBody;

  try {
    body = (await request.json()) as PaymentActionBody;
  } catch {
    return jsonError("Invalid request body", 400);
  }

  if (!body || typeof body !== "object" || !("action" in body)) {
    return jsonError("Invalid request body", 400);
  }

  try {
    const result =
      body.action === "pix"
        ? await mercadoPagoHeadlessServer.processPixPayment({
            orderId,
            orderKey: orderContext.orderKey,
          })
        : body.action === "3ds_finalize"
          ? await mercadoPagoHeadlessServer.finalizeThreeDS({
              orderId,
              orderKey: orderContext.orderKey,
            })
          : await mercadoPagoHeadlessServer.processCardPayment({
              orderId,
              orderKey: orderContext.orderKey,
              payment: body.payment,
            });

    const refreshedOrder = await wordpressWooRestAdapter
      .getOrderByIdForCustomer(orderId, customerId)
      .catch(() => orderContext.order);

    return NextResponse.json(
      {
        order: refreshedOrder || orderContext.order,
        paymentState: result.paymentState,
        outcome: result.outcome,
      },
      {
        headers: noStoreHeaders,
      },
    );
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Failed to process payment",
      500,
    );
  }
}
