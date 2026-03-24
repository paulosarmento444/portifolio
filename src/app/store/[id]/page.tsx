import { addToCartAndRedirectAction } from "@site/checkout";
import { StoreProductPage } from "@site/store";

export default async function ProductPage({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <StoreProductPage
      productId={id}
      addToCartAction={addToCartAndRedirectAction}
    />
  );
}
