import type {
  CatalogCategoryView,
  CatalogProductAttributeView,
  MediaAssetView,
  MoneyValueView,
} from "@site/shared";
import type {
  StoreCatalogFilters,
  StoreCatalogProduct,
  StoreCategoryOption,
  StorePriceBounds,
  StoreProductDetail,
  StoreProductVariation,
} from "./store.types";

export const buildStoreCategoryOptions = (
  categories: CatalogCategoryView[],
  products: StoreCatalogProduct[],
): StoreCategoryOption[] => {
  const categoryCountMap = products.reduce<Record<string, number>>((acc, product) => {
    product.categories.forEach((category) => {
      acc[category.id] = (acc[category.id] ?? 0) + 1;
    });
    return acc;
  }, {});

  return [
    {
      id: "0",
      name: "Todas as Categorias",
      slug: "todas-as-categorias",
      description: undefined,
      image: null,
      count: products.length,
    },
    ...categories.map((category) => ({
      ...category,
      count: categoryCountMap[category.id] ?? 0,
    })),
  ];
};

export const filterAndSortCatalogProducts = (
  products: StoreCatalogProduct[],
  selectedCategoryId: string | null,
  searchTerm: string,
  filters: StoreCatalogFilters,
  priceBounds: StorePriceBounds,
): StoreCatalogProduct[] => {
  let filtered = [...products];

  if (selectedCategoryId && selectedCategoryId !== "0") {
    filtered = filtered.filter((product) =>
      product.categories.some((category) => category.id === selectedCategoryId),
    );
  }

  if (searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter((product) => {
      const matchesName = product.name.toLowerCase().includes(searchLower);
      const matchesDescription = (product.shortDescription ?? "")
        .toLowerCase()
        .includes(searchLower);
      const matchesCategory = product.categories.some((category) =>
        category.name.toLowerCase().includes(searchLower),
      );

      return matchesName || matchesDescription || matchesCategory;
    });
  }

  if (
    filters.priceRange[0] > priceBounds.min ||
    filters.priceRange[1] < priceBounds.max
  ) {
    filtered = filtered.filter((product) => {
      const price = product.price.amount;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });
  }

  if (filters.inStock) {
    filtered = filtered.filter((product) => product.stockStatus === "instock");
  }

  if (filters.onSale) {
    filtered = filtered.filter((product) => product.onSale);
  }

  if (filters.featured) {
    filtered = filtered.filter((product) => product.featured);
  }

  if (filters.sortBy && filters.sortOrder) {
    filtered.sort((left, right) => {
      let leftValue: number | string;
      let rightValue: number | string;

      switch (filters.sortBy) {
        case "price":
          leftValue = left.price.amount;
          rightValue = right.price.amount;
          break;
        case "rating":
          leftValue = left.ratingAverage;
          rightValue = right.ratingAverage;
          break;
        case "date":
          leftValue = new Date(left.createdAt).getTime();
          rightValue = new Date(right.createdAt).getTime();
          break;
        case "name":
          leftValue = left.name.toLowerCase();
          rightValue = right.name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === "desc") {
        return leftValue > rightValue ? -1 : leftValue < rightValue ? 1 : 0;
      }

      return leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
    });
  }

  return filtered;
};

export const resolveStorePriceBounds = (
  products: StoreCatalogProduct[],
): StorePriceBounds => {
  if (!products.length) {
    return {
      min: 0,
      max: 1000,
    };
  }

  const highestPrice = Math.max(...products.map((product) => product.price.amount));
  const roundedMax = Math.ceil(highestPrice / 50) * 50;

  return {
    min: 0,
    max: Math.max(roundedMax, 1000),
  };
};

export const paginateProducts = (
  products: StoreCatalogProduct[],
  currentPage: number,
  pageSize: number,
) => {
  const indexOfLastProduct = currentPage * pageSize;
  const indexOfFirstProduct = indexOfLastProduct - pageSize;

  return {
    items: products.slice(indexOfFirstProduct, indexOfLastProduct),
    totalPages: Math.ceil(products.length / pageSize),
  };
};

export const truncatePlainText = (value: string | undefined, maxLength: number) => {
  if (!value) {
    return "";
  }

  const cleaned = value.replace(/\s+/g, " ").trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.8) {
    return `${truncated.substring(0, lastSpace)}...`;
  }

  return `${truncated}...`;
};

export const formatMoney = (value: MoneyValueView) =>
  value.formatted ??
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: value.currencyCode || "BRL",
  }).format(value.amount);

export const getAttributeOptions = (
  attributes: CatalogProductAttributeView[],
  attributeName: string,
) => attributes.find((attribute) => attribute.name === attributeName)?.options ?? [];

const normalizeAttributeValue = (value?: string | null) => value?.trim() || "";

export const getVariationAttributeValue = (
  variation: StoreProductVariation,
  attributeName: string,
) =>
  normalizeAttributeValue(
    variation.attributes.find((attribute) => attribute.name === attributeName)?.value,
  );

export const isVariationSelectable = (variation: StoreProductVariation) => {
  if (!variation.purchasable || variation.stockStatus !== "instock") {
    return false;
  }

  if (!variation.manageStock) {
    return true;
  }

  return variation.stockQuantity === null || variation.stockQuantity > 0;
};

export const getSelectableVariations = (
  variations: StoreProductVariation[],
) => variations.filter(isVariationSelectable);

export const getCompatibleVariationOptions = (
  variations: StoreProductVariation[],
  attributeName: string,
  selectedAttributes: Record<string, string>,
) => {
  const compatible = getSelectableVariations(variations).filter((variation) =>
    Object.entries(selectedAttributes).every(([selectedAttributeName, selectedValue]) => {
      if (!selectedValue || selectedAttributeName === attributeName) {
        return true;
      }

      return getVariationAttributeValue(variation, selectedAttributeName) === selectedValue;
    }),
  );

  return Array.from(
    new Set(
      compatible
        .map((variation) => getVariationAttributeValue(variation, attributeName))
        .filter(Boolean),
    ),
  );
};

export const buildInitialVariationSelection = (
  variations: StoreProductVariation[],
  attributeNames: string[],
) => {
  const initialVariation = getSelectableVariations(variations)[0] ?? null;

  return attributeNames.reduce<Record<string, string>>((selection, attributeName) => {
    selection[attributeName] = initialVariation
      ? getVariationAttributeValue(initialVariation, attributeName)
      : "";

    return selection;
  }, {});
};

export const reconcileVariationSelection = (
  variations: StoreProductVariation[],
  nextSelection: Record<string, string>,
  attributeNames: string[],
  lockedAttributeName?: string,
) => {
  const reconciledSelection = { ...nextSelection };

  for (const attributeName of attributeNames) {
    if (attributeName === lockedAttributeName) {
      continue;
    }

    const compatibleOptions = getCompatibleVariationOptions(
      variations,
      attributeName,
      reconciledSelection,
    );

    if (!compatibleOptions.length) {
      reconciledSelection[attributeName] = "";
      continue;
    }

    if (!compatibleOptions.includes(reconciledSelection[attributeName])) {
      reconciledSelection[attributeName] = compatibleOptions[0] ?? "";
    }
  }

  return reconciledSelection;
};

export const findMatchingVariation = (
  variations: StoreProductVariation[],
  selectedColor: string,
  selectedSize: string,
): StoreProductVariation | null => {
  const selectableVariations = getSelectableVariations(variations);

  if (!selectableVariations.length) {
    return null;
  }

  const hasColorSelection = Boolean(selectedColor);
  const hasSizeSelection = Boolean(selectedSize);

  const variation = selectableVariations.find((candidate) => {
    const colorValue = getVariationAttributeValue(candidate, "Cor");
    const sizeValue = getVariationAttributeValue(candidate, "Tamanho");

    const matchesColor =
      !colorValue || (hasColorSelection && colorValue === normalizeAttributeValue(selectedColor));
    const matchesSize =
      !sizeValue || (hasSizeSelection && sizeValue === normalizeAttributeValue(selectedSize));

    return matchesColor && matchesSize;
  });

  return variation ?? null;
};

export const getInitialAttributeSelection = (
  product: StoreProductDetail,
  attributeName: string,
) => getAttributeOptions(product.attributes, attributeName)[0] ?? "";

export const resolveGallery = (
  product: StoreProductDetail,
  variation: StoreProductVariation | null,
) => {
  const dedupeImages = (images: MediaAssetView[]) => {
    const seen = new Set<string>();

    return images.filter((image) => {
      const normalizedUrl = image.url.trim().toLowerCase();
      const normalizedId = image.id?.trim().toLowerCase();
      const dedupeKey = normalizedUrl || normalizedId;

      if (!dedupeKey || seen.has(dedupeKey)) {
        return false;
      }

      seen.add(dedupeKey);
      return true;
    });
  };

  const productGallery = dedupeImages(product.gallery);

  if (!variation) {
    return productGallery;
  }

  const variationGallery = dedupeImages(variation.gallery);

  if (!variationGallery.length) {
    return productGallery;
  }

  return dedupeImages([...variationGallery, ...productGallery]);
};

export const resolveStockLabel = (stockStatus: string) =>
  stockStatus === "instock" ? "Em estoque" : "Sem estoque";
