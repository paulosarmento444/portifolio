"use client";

import { useEffect, useMemo, useState } from "react";
import createDOMPurify from "dompurify";
import type {
  AddToCartAction,
  StoreProductDetail,
  StoreProductVariation,
} from "../../data/store.types";
import {
  buildInitialVariationSelection,
  findMatchingVariation,
  getCompatibleVariationOptions,
  getAttributeOptions,
  reconcileVariationSelection,
} from "../../data/store.utils";
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
  const variationAttributeNames = useMemo(
    () =>
      product.attributes
        .filter((attribute) => attribute.type === "variation")
        .map((attribute) => attribute.name),
    [product.attributes],
  );
  const initialSelection = useMemo(
    () => buildInitialVariationSelection(variations, variationAttributeNames),
    [variationAttributeNames, variations],
  );
  const [selectedColor, setSelectedColor] = useState(initialSelection.Cor ?? "");
  const [selectedSize, setSelectedSize] = useState(initialSelection.Tamanho ?? "");
  const [lastChangedAttribute, setLastChangedAttribute] = useState<string | null>(null);

  useEffect(() => {
    setSelectedColor(initialSelection.Cor ?? "");
    setSelectedSize(initialSelection.Tamanho ?? "");
    setLastChangedAttribute(null);
  }, [initialSelection]);

  const rawColorOptions = useMemo(
    () => getAttributeOptions(product.attributes, "Cor"),
    [product.attributes],
  );
  const rawSizeOptions = useMemo(
    () => getAttributeOptions(product.attributes, "Tamanho"),
    [product.attributes],
  );
  const globallySelectableColors = useMemo(
    () => getCompatibleVariationOptions(variations, "Cor", {}),
    [variations],
  );
  const globallySelectableSizes = useMemo(
    () => getCompatibleVariationOptions(variations, "Tamanho", {}),
    [variations],
  );
  const compatibleColorsForCurrentSize = useMemo(
    () =>
      getCompatibleVariationOptions(variations, "Cor", {
        Cor: selectedColor,
        Tamanho: selectedSize,
      }),
    [selectedColor, selectedSize, variations],
  );
  const compatibleSizesForCurrentColor = useMemo(
    () =>
      getCompatibleVariationOptions(variations, "Tamanho", {
        Cor: selectedColor,
        Tamanho: selectedSize,
      }),
    [selectedColor, selectedSize, variations],
  );
  const colorOptions = useMemo(
    () =>
      rawColorOptions.map((value) => ({
        value,
        disabled:
          !globallySelectableColors.includes(value) ||
          (lastChangedAttribute === "Tamanho" &&
            !compatibleColorsForCurrentSize.includes(value)),
      })),
    [
      compatibleColorsForCurrentSize,
      globallySelectableColors,
      lastChangedAttribute,
      rawColorOptions,
    ],
  );
  const sizeOptions = useMemo(
    () =>
      rawSizeOptions.map((value) => ({
        value,
        disabled:
          !globallySelectableSizes.includes(value) ||
          (lastChangedAttribute === "Cor" &&
            !compatibleSizesForCurrentColor.includes(value)),
      })),
    [
      compatibleSizesForCurrentColor,
      globallySelectableSizes,
      lastChangedAttribute,
      rawSizeOptions,
    ],
  );

  const selectedVariation = useMemo(
    () => findMatchingVariation(variations, selectedColor, selectedSize),
    [variations, selectedColor, selectedSize],
  );

  const currentProduct = selectedVariation ?? product;

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
        setSelectedColor={(color) => {
          setLastChangedAttribute("Cor");
          const nextSelection = reconcileVariationSelection(
            variations,
            {
              Cor: color,
              Tamanho: selectedSize,
            },
            variationAttributeNames,
            "Cor",
          );

          setSelectedColor(nextSelection.Cor ?? "");
          setSelectedSize(nextSelection.Tamanho ?? "");
        }}
        setSelectedSize={(size) => {
          setLastChangedAttribute("Tamanho");
          const nextSelection = reconcileVariationSelection(
            variations,
            {
              Cor: selectedColor,
              Tamanho: size,
            },
            variationAttributeNames,
            "Tamanho",
          );

          setSelectedColor(nextSelection.Cor ?? "");
          setSelectedSize(nextSelection.Tamanho ?? "");
        }}
        addToCartAction={addToCartAction}
      />

      {product.description ? <ProductDescription description={cleanDescription} /> : null}

      <ProductSpecs product={currentProduct} />
    </div>
  );
}
