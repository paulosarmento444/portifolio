"use client";

import { useEffect, useMemo, useState } from "react";
import type { StoreProductDetail, StoreProductVariation } from "../store.types";
import {
  buildInitialVariationSelection,
  findMatchingVariation,
  getAttributeOptions,
  getCompatibleVariationOptions,
  reconcileVariationSelection,
} from "../store.utils";

type VariationOption = {
  value: string;
  disabled: boolean;
};

type UseProductVariationSelectionArgs = {
  product: StoreProductDetail;
  variations: StoreProductVariation[];
};

type UseProductVariationSelectionResult = {
  currentProduct: StoreProductDetail;
  selectedVariation: StoreProductVariation | null;
  selectedColor: string;
  selectedSize: string;
  colorOptions: VariationOption[];
  sizeOptions: VariationOption[];
  setSelectedColor: (color: string) => void;
  setSelectedSize: (size: string) => void;
};

export function useProductVariationSelection({
  product,
  variations,
}: UseProductVariationSelectionArgs): UseProductVariationSelectionResult {
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
  const [selectedColor, setSelectedColorState] = useState(initialSelection.Cor ?? "");
  const [selectedSize, setSelectedSizeState] = useState(initialSelection.Tamanho ?? "");
  const [lastChangedAttribute, setLastChangedAttribute] = useState<string | null>(null);

  useEffect(() => {
    setSelectedColorState(initialSelection.Cor ?? "");
    setSelectedSizeState(initialSelection.Tamanho ?? "");
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

  const updateSelection = (lockedAttributeName: "Cor" | "Tamanho", nextValue: string) => {
    setLastChangedAttribute(lockedAttributeName);
    const nextSelection = reconcileVariationSelection(
      variations,
      {
        Cor: lockedAttributeName === "Cor" ? nextValue : selectedColor,
        Tamanho: lockedAttributeName === "Tamanho" ? nextValue : selectedSize,
      },
      variationAttributeNames,
      lockedAttributeName,
    );

    setSelectedColorState(nextSelection.Cor ?? "");
    setSelectedSizeState(nextSelection.Tamanho ?? "");
  };

  return {
    currentProduct: selectedVariation ?? product,
    selectedVariation,
    selectedColor,
    selectedSize,
    colorOptions,
    sizeOptions,
    setSelectedColor: (color: string) => updateSelection("Cor", color),
    setSelectedSize: (size: string) => updateSelection("Tamanho", size),
  };
}
