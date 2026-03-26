import { cocartServerAdapter } from "@site/integrations/cocart/server";
import type {
  StoreProductDetail,
  StoreProductVariation,
} from "../store.types";

type StoreProductLoadResult =
  | {
      status: "ready";
      product: StoreProductDetail;
      variations: StoreProductVariation[];
    }
  | {
      status: "not-found";
    }
  | {
      status: "error";
      error: string;
    };

const isResponseStatus = (error: unknown, status: number) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  return (
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response &&
    error.response.status === status
  );
};

export async function loadStoreProduct(
  productId: string,
): Promise<StoreProductLoadResult> {
  const parsedProductId = Number(productId);

  if (!Number.isFinite(parsedProductId) || parsedProductId <= 0) {
    return {
      status: "not-found",
    };
  }

  try {
    const product = await cocartServerAdapter.getCatalogProductDetail(parsedProductId);
    const variations =
      product.type === "variable"
        ? await cocartServerAdapter.listCatalogProductVariations(parsedProductId)
        : [];

    return {
      status: "ready",
      product,
      variations,
    };
  } catch (error) {
    console.error("Error loading store product:", error);

    if (isResponseStatus(error, 404)) {
      return {
        status: "not-found",
      };
    }

    return {
      status: "error",
      error: "Erro ao carregar produto. Tente novamente.",
    };
  }
}
