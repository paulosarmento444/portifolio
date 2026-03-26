import type {
  CatalogCategoryView,
  CatalogProductCardView,
  CatalogProductDetailView,
} from "@site/shared";

export type StoreViewMode = "grid" | "list";

export type StoreSortBy = "" | "name" | "price" | "rating" | "date";
export type StoreSortOrder = "" | "asc" | "desc";

export type StoreCatalogFilters = {
  priceRange: [number, number];
  inStock: boolean;
  onSale: boolean;
  featured: boolean;
  sortBy: StoreSortBy;
  sortOrder: StoreSortOrder;
};

export type StorePriceBounds = {
  min: number;
  max: number;
};

export type StoreCategoryOption = CatalogCategoryView & {
  count: number;
};

export type StoreCatalogProduct = CatalogProductCardView;
export type StoreProductDetail = CatalogProductDetailView;
export type StoreProductVariation = CatalogProductDetailView;

export type AddToCartActionResult =
  | {
      success: true;
      redirectTo?: string;
    }
  | {
      success: false;
      reason: "limit_reached" | "unknown";
      message: string;
    };

export type AddToCartAction = (
  formData: FormData,
) => Promise<AddToCartActionResult | void>;

export const DEFAULT_STORE_FILTERS: StoreCatalogFilters = {
  priceRange: [0, 1000],
  inStock: false,
  onSale: false,
  featured: false,
  sortBy: "",
  sortOrder: "",
};
