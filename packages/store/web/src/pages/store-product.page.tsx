import type { AddToCartAction } from "../data/store.types";
import { ProductErrorState } from "../components/product/product-error-state.component";
import { ProductNotFoundState } from "../components/product/product-not-found-state.component";
import { StoreProductClient } from "../components/product/store-product.client";
import { loadStoreProduct } from "../data/loaders/store-product.loader";

interface StoreProductPageProps {
  productId: string;
  addToCartAction: AddToCartAction;
}

export async function StoreProductPage({
  productId,
  addToCartAction,
}: StoreProductPageProps) {
  const result = await loadStoreProduct(productId);

  if (result.status === "not-found") {
    return <ProductNotFoundState />;
  }

  if (result.status === "error") {
    return <ProductErrorState error={result.error} />;
  }

  return (
    <StoreProductClient
      product={result.product}
      variations={result.variations}
      addToCartAction={addToCartAction}
    />
  );
}
