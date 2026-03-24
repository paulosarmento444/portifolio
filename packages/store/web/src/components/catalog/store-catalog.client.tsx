"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CatalogCategoryView } from "@site/shared";
import { SectionShell } from "@site/shared";
import {
  buildStoreCategoryOptions,
  filterAndSortCatalogProducts,
  paginateProducts,
  resolveStorePriceBounds,
} from "../../lib/store.utils";
import {
  DEFAULT_STORE_FILTERS,
  type StoreCatalogProduct,
  type StoreViewMode,
} from "../../lib/store.types";
import { StoreBreadcrumbs } from "./store-breadcrumbs.component";
import { StoreCatalogHeader } from "./store-catalog-header.component";
import {
  StoreFilterSidebarDesktop,
  StoreFilterSidebarMobile,
} from "./store-filter-sidebar.component";
import { StoreGrid } from "./store-grid.component";
import { STORE_SORT_PRESETS, StoreToolbar } from "./store-toolbar.component";

interface StoreCatalogClientProps {
  initialProducts: StoreCatalogProduct[];
  initialCategories: CatalogCategoryView[];
  initialError?: string | null;
}

const STORE_FILTER_DRAWER_ID = "store-filter-drawer";
const PRODUCTS_PER_PAGE = 12;

export function StoreCatalogClient({
  initialProducts,
  initialCategories,
  initialError = null,
}: StoreCatalogClientProps) {
  const searchParams = useSearchParams();
  const priceBounds = useMemo(
    () => resolveStorePriceBounds(initialProducts),
    [initialProducts],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<StoreViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_STORE_FILTERS,
    priceRange: [priceBounds.min, priceBounds.max] as [number, number],
  }));

  const categories = useMemo(
    () => buildStoreCategoryOptions(initialCategories, initialProducts),
    [initialCategories, initialProducts],
  );

  useEffect(() => {
    const queryCategory = searchParams.get("category");
    const querySearch = searchParams.get("search");

    setSelectedCategoryId(
      queryCategory && categories.some((category) => category.id === queryCategory)
        ? queryCategory
        : null,
    );
    setSearchTerm(querySearch ?? "");
    setCurrentPage(1);
  }, [searchParams, categories]);

  const filteredProducts = useMemo(
    () =>
      filterAndSortCatalogProducts(
        initialProducts,
        selectedCategoryId,
        searchTerm,
        filters,
        priceBounds,
      ),
    [initialProducts, selectedCategoryId, searchTerm, filters, priceBounds],
  );

  const { items: currentProducts, totalPages } = useMemo(
    () => paginateProducts(filteredProducts, currentPage, PRODUCTS_PER_PAGE),
    [filteredProducts, currentPage],
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (
      filters.priceRange[0] > priceBounds.min ||
      filters.priceRange[1] < priceBounds.max
    ) {
      count += 1;
    }

    if (filters.inStock) count += 1;
    if (filters.onSale) count += 1;
    if (filters.featured) count += 1;
    if (filters.sortBy) count += 1;
    if (selectedCategoryId) count += 1;
    if (searchTerm) count += 1;

    return count;
  }, [filters, priceBounds, searchTerm, selectedCategoryId]);

  const selectedCategoryName = selectedCategoryId
    ? categories.find((category) => category.id === selectedCategoryId)?.name ?? null
    : null;

  const sortPreset =
    filters.sortBy && filters.sortOrder ? `${filters.sortBy}:${filters.sortOrder}` : "";

  const handleFilterChange = <TKey extends keyof typeof DEFAULT_STORE_FILTERS>(
    key: TKey,
    value: (typeof DEFAULT_STORE_FILTERS)[TKey],
  ) => {
    setCurrentPage(1);
    setFilters((previous) => ({ ...previous, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategoryId(null);
    setCurrentPage(1);
    setShowFilters(false);
    setFilters({
      ...DEFAULT_STORE_FILTERS,
      priceRange: [priceBounds.min, priceBounds.max] as [number, number],
    });
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setCurrentPage(1);
    setSelectedCategoryId(categoryId);
  };

  const handleSearchChange = (term: string) => {
    setCurrentPage(1);
    setSearchTerm(term);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortPresetChange = (value: string) => {
    const selectedPreset = STORE_SORT_PRESETS.find((preset) => preset.value === value);
    handleFilterChange("sortBy", selectedPreset?.sortBy ?? "");
    handleFilterChange("sortOrder", selectedPreset?.sortOrder ?? "");
  };

  const sidebarProps = {
    searchTerm,
    onSearchChange: handleSearchChange,
    sortPreset,
    onSortPresetChange: handleSortPresetChange,
    selectedCategoryId,
    setSelectedCategoryId: handleCategoryChange,
    categories,
    categoriesLoading: false,
    filters,
    priceBounds,
    handleFilterChange,
    clearFilters,
    activeFiltersCount,
    viewMode,
    onViewModeChange: setViewMode,
  };

  return (
    <main
      className="site-page-shell site-page-shell-compact site-catalog-shell site-stack-page pb-10"
    >
      <SectionShell container="commerce" spacing="compact" stack="page" className="pt-5 sm:pt-6">
        <StoreBreadcrumbs />
        <StoreCatalogHeader
          resultCount={filteredProducts.length}
          activeFiltersCount={activeFiltersCount}
          selectedCategoryName={selectedCategoryName}
          searchTerm={searchTerm}
        />

        <div className="grid gap-8 lg:grid-cols-[21rem_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-[22rem_minmax(0,1fr)] xl:gap-12">
          <StoreFilterSidebarDesktop {...sidebarProps} />

          <div className="min-w-0 site-stack-page gap-6 lg:gap-7">
            <div className="lg:hidden site-stack-panel">
              <StoreToolbar
                onOpenFilters={() => setShowFilters(true)}
                activeFiltersCount={activeFiltersCount}
                showFilters={showFilters}
                filterDrawerId={STORE_FILTER_DRAWER_ID}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              <StoreFilterSidebarMobile
                {...sidebarProps}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                resultCount={filteredProducts.length}
                panelId={STORE_FILTER_DRAWER_ID}
              />
            </div>

            <StoreGrid
              products={currentProducts}
              loading={false}
              error={initialError}
              viewMode={viewMode}
              filteredProducts={filteredProducts}
              searchTerm={searchTerm}
              clearFilters={clearFilters}
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          </div>
        </div>
      </SectionShell>
    </main>
  );
}
