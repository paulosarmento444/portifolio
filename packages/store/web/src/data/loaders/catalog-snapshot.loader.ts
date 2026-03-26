import "server-only";

import type {
  CatalogCategoryView,
  CatalogProductCardView,
} from "@site/shared";
import {
  cocartServerAdapter,
  type CoCartAdapter,
} from "@site/integrations/cocart/server";

const CATALOG_PAGE_SIZE = 100;

const dedupeProducts = (products: CatalogProductCardView[]) =>
  Array.from(new Map(products.map((product) => [product.id, product] as const)).values());

const dedupeCategories = (categories: CatalogCategoryView[]) =>
  Array.from(
    new Map(
      categories.map((category) => [
        category.id || category.slug,
        category,
      ] as const),
    ).values(),
  );

export async function loadCatalogSnapshotWithAdapter(
  adapter: Pick<CoCartAdapter, "listCatalogProducts"> = cocartServerAdapter,
) {
  const firstPage = await adapter.listCatalogProducts({
    page: 1,
    pageSize: CATALOG_PAGE_SIZE,
  });

  if (firstPage.pagination.totalPages <= 1) {
    return {
      products: firstPage.items,
      categories: firstPage.availableCategories,
    };
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.pagination.totalPages - 1 }, (_, index) =>
      adapter.listCatalogProducts({
        page: index + 2,
        pageSize: CATALOG_PAGE_SIZE,
      }),
    ),
  );

  return {
    products: dedupeProducts([
      ...firstPage.items,
      ...remainingPages.flatMap((page) => page.items),
    ]),
    categories: dedupeCategories([
      ...firstPage.availableCategories,
      ...remainingPages.flatMap((page) => page.availableCategories),
    ]),
  };
}

export async function loadCatalogSnapshot() {
  return loadCatalogSnapshotWithAdapter(cocartServerAdapter);
}
