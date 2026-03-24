import { cocartServerAdapter } from "@site/integrations/cocart/server";
import type { AddToCartAction } from "../lib/store.types";
import { ProductErrorState } from "../components/product/product-error-state.component";
import { ProductNotFoundState } from "../components/product/product-not-found-state.component";
import { StoreProductClient } from "../components/product/store-product.client";

interface StoreProductPageProps {
  productId: string;
  addToCartAction: AddToCartAction;
}

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

export async function StoreProductPage({
  productId,
  addToCartAction,
}: StoreProductPageProps) {
  const parsedProductId = Number(productId);

  if (!Number.isFinite(parsedProductId) || parsedProductId <= 0) {
    return <ProductNotFoundState />;
  }

  try {
    const product = await cocartServerAdapter.getCatalogProductDetail(parsedProductId);
    const variations =
      product.type === "variable"
        ? await cocartServerAdapter.listCatalogProductVariations(parsedProductId)
        : [];

    return (
      <StoreProductClient
        product={product}
        variations={variations}
        addToCartAction={addToCartAction}
      />
    );
  } catch (error) {
    console.error("Error loading store product:", error);

    if (isResponseStatus(error, 404)) {
      return <ProductNotFoundState />;
    }

    return <ProductErrorState error="Erro ao carregar produto. Tente novamente." />;
  }
}
