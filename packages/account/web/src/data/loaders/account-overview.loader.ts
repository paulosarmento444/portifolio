import { headers } from "next/headers";
import {
  accountCustomerViewSchema,
  accountOverviewViewSchema,
  type AccountOverviewView,
} from "@site/shared";
import {
  cocartServerAdapter,
  isCoCartCompatibilityFallbackError,
  readCoCartForwardHeaders,
} from "@site/integrations/cocart/server";
import { wordpressWooRestAdapter } from "@site/integrations/wordpress/server";

const buildFallbackCustomer = (viewer: NonNullable<AccountOverviewView["viewer"]>) =>
  accountCustomerViewSchema.parse({
    id: String(viewer.id),
    email: viewer.email,
    displayName: viewer.displayName,
    billingAddress: null,
    shippingAddress: null,
  });

const buildCartDerivedCustomer = (
  viewer: NonNullable<AccountOverviewView["viewer"]>,
  cartCustomer: AccountOverviewView["customer"] | null | undefined,
) => {
  if (!cartCustomer) {
    return buildFallbackCustomer(viewer);
  }

  if (cartCustomer.id === "0") {
    return accountCustomerViewSchema.parse({
      ...cartCustomer,
      id: String(viewer.id),
      displayName:
        cartCustomer.displayName || viewer.displayName || cartCustomer.email || "Cliente",
    });
  }

  return cartCustomer;
};

const isCoCartJwtAuthConfigError = (error: unknown) =>
  error instanceof Error &&
  (error as { response?: { status?: number; data?: { code?: string } } }).response
    ?.status === 403 &&
  (error as { response?: { status?: number; data?: { code?: string } } }).response
    ?.data?.code === "cocart_jwt_auth_bad_config";

export async function loadAccountOverview(): Promise<AccountOverviewView | null> {
  const requestHeaders = await readCoCartForwardHeaders(await headers());

  try {
    const sessionState = await cocartServerAdapter.getSessionState(requestHeaders);
    const viewer = sessionState.session.user;

    if (sessionState.session.isAuthenticated && viewer) {
      const [cart, orders, wooCustomer] = await Promise.all([
        cocartServerAdapter.getCartState(undefined, requestHeaders).catch((error) => {
          if (isCoCartJwtAuthConfigError(error)) {
            return null;
          }

          throw error;
        }),
        wordpressWooRestAdapter.getOrdersByCustomer(Number(viewer.id)),
        wordpressWooRestAdapter.getAccountCustomer(Number(viewer.id)).catch(() => null),
      ]);

      const customer =
        wooCustomer || buildCartDerivedCustomer(viewer, cart?.customer || null);

      return accountOverviewViewSchema.parse({
        viewer,
        customer,
        orders,
        posts: [],
      });
    }
  } catch (error) {
    if (!isCoCartCompatibilityFallbackError(error)) {
      throw error;
    }
  }

  return null;
}
