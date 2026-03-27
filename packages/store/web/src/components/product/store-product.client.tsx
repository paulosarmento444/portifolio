"use client";

import { useMemo } from "react";
import createDOMPurify from "dompurify";
import type {
  AddToCartAction,
  StoreProductDetail,
  StoreProductVariation,
} from "../../data/store.types";
import { useProductVariationSelection } from "../../data/hooks/use-product-variation-selection.hook";
import { ProductDescription } from "./product-description.component";
import { ProductHero } from "./product-hero.component";
import { ProductSpecs } from "./product-specs.component";

interface StoreProductClientProps {
  product: StoreProductDetail;
  variations: StoreProductVariation[];
  addToCartAction: AddToCartAction;
}

export function StoreProductClient({
  product,
  variations,
  addToCartAction,
}: StoreProductClientProps) {
  const {
    currentProduct,
    selectedVariation,
    selectedColor,
    selectedSize,
    colorOptions,
    sizeOptions,
    setSelectedColor,
    setSelectedSize,
  } = useProductVariationSelection({
    product,
    variations,
  });

  const cleanDescription = useMemo(
    () => {
      if (!product.description) {
        return "";
      }

      if (typeof window === "undefined") {
        return product.description;
      }

      return createDOMPurify(window).sanitize(product.description, {
        FORBID_TAGS: ["style"],
        FORBID_ATTR: ["style", "class"],
      });
    },
    [product.description],
  );

  return (
    <div className="site-page-shell site-stack-page">
      <ProductHero
        product={product}
        currentProduct={currentProduct}
        selectedVariation={selectedVariation}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        colorOptions={colorOptions}
        sizeOptions={sizeOptions}
        setSelectedColor={setSelectedColor}
        setSelectedSize={setSelectedSize}
        addToCartAction={addToCartAction}
      />

      {product.description ? <ProductDescription description={cleanDescription} /> : null}

      <ProductSpecs product={currentProduct} />
    </div>
  );
}
