"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CatalogCategoryView } from "@site/shared";
import {
  buildDefaultStoreFilters,
  buildStoreCategoryOptions,
  countActiveCatalogFilters,
  filterAndSortCatalogProducts,
  paginateProducts,
  resolveStorePriceBounds,
} from "../store.utils";
import {
  type StoreCatalogFilters,
  type StoreCatalogProduct,
  type StoreCategoryOption,
  type StoreViewMode,
} from "../store.types";
import { STORE_SORT_PRESETS } from "../store-sort-presets";

const PRODUCTS_PER_PAGE = 12;

type UseStoreCatalogStateArgs = {
  initialProducts: StoreCatalogProduct[];
  initialCategories: CatalogCategoryView[];
};

type UseStoreCatalogStateResult = {
  categories: StoreCategoryOption[];
  priceBounds: { min: number; max: number };
  searchTerm: string;
  selectedCategoryId: string | null;
  selectedCategoryName: string | null;
  viewMode: StoreViewMode;
  setViewMode: (mode: StoreViewMode) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  currentPage: number;
  filters: StoreCatalogFilters;
  filteredProducts: StoreCatalogProduct[];
  currentProducts: StoreCatalogProduct[];
  totalPages: number;
  activeFiltersCount: number;
  sortPreset: string;
  handleFilterChange: <TKey extends keyof StoreCatalogFilters>(
    key: TKey,
    value: StoreCatalogFilters[TKey],
  ) => void;
  clearFilters: () => void;
  handleCategoryChange: (categoryId: string | null) => void;
  handleSearchChange: (term: string) => void;
  handlePageChange: (pageNumber: number) => void;
  handleSortPresetChange: (value: string) => void;
};

export function useStoreCatalogState({
  initialProducts,
  initialCategories,
}: UseStoreCatalogStateArgs): UseStoreCatalogStateResult {
  const searchParams = useSearchParams();
  const priceBounds = useMemo(
    () => resolveStorePriceBounds(initialProducts),
    [initialProducts],
  );
  const categories = useMemo(
    () => buildStoreCategoryOptions(initialCategories, initialProducts),
    [initialCategories, initialProducts],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<StoreViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(() => buildDefaultStoreFilters(priceBounds));

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

  const activeFiltersCount = useMemo(
    () =>
      countActiveCatalogFilters(
        filters,
        priceBounds,
        searchTerm,
        selectedCategoryId,
      ),
    [filters, priceBounds, searchTerm, selectedCategoryId],
  );

  const selectedCategoryName = useMemo(
    () =>
      selectedCategoryId
        ? categories.find((category) => category.id === selectedCategoryId)?.name ?? null
        : null,
    [categories, selectedCategoryId],
  );

  const sortPreset = useMemo(
    () =>
      filters.sortBy && filters.sortOrder ? `${filters.sortBy}:${filters.sortOrder}` : "",
    [filters.sortBy, filters.sortOrder],
  );

  const handleFilterChange = <TKey extends keyof StoreCatalogFilters>(
    key: TKey,
    value: StoreCatalogFilters[TKey],
  ) => {
    setCurrentPage(1);
    setFilters((previous) => ({ ...previous, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategoryId(null);
    setCurrentPage(1);
    setShowFilters(false);
    setFilters(buildDefaultStoreFilters(priceBounds));
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

  return {
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
  };
}
