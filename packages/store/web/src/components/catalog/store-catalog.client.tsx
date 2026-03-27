"use client";

import { SectionShell } from "@site/shared";
import type { CatalogCategoryView } from "@site/shared";
import type { StoreCatalogProduct } from "../../data/store.types";
import { useStoreCatalogState } from "../../data/hooks/use-store-catalog-state.hook";
import { StoreBreadcrumbs } from "./store-breadcrumbs.component";
import { StoreCatalogHeader } from "./store-catalog-header.component";
import {
  StoreFilterSidebarDesktop,
  StoreFilterSidebarMobile,
} from "./store-filter-sidebar.component";
import { StoreGrid } from "./store-grid.component";
import { StoreToolbar } from "./store-toolbar.component";

interface StoreCatalogClientProps {
  initialProducts: StoreCatalogProduct[];
  initialCategories: CatalogCategoryView[];
  initialError?: string | null;
}

const STORE_FILTER_DRAWER_ID = "store-filter-drawer";

export function StoreCatalogClient({
  initialProducts,
  initialCategories,
  initialError = null,
}: StoreCatalogClientProps) {
  const {
    categories,
    priceBounds,
    searchTerm,
    selectedCategoryId,
    selectedCategoryName,
    viewMode,
    setViewMode,
    showFilters,
    setShowFilters,
    currentPage,
    filters,
    filteredProducts,
    currentProducts,
    totalPages,
    activeFiltersCount,
    sortPreset,
    handleFilterChange,
    clearFilters,
    handleCategoryChange,
    handleSearchChange,
    handlePageChange,
    handleSortPresetChange,
  } = useStoreCatalogState({
    initialProducts,
    initialCategories,
  });

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
