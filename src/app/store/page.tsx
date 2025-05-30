"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Header from "../components/Header";
import StoreHero from "./components/store-hero";
import StoreFilters from "./components/store-filters";
import StoreGrid from "./components/store-grid";
import { getProducts, getCategories } from "../service/ProductService";
import { Toaster } from "react-hot-toast";

export default function StorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const isInitialized = useRef(false);
  const isLoadingData = useRef(false);

  const [filters, setFilters] = useState({
    priceRange: [0, 1000] as [number, number],
    inStock: false,
    onSale: false,
    featured: false,
    sortBy: "" as "" | "name" | "price" | "rating" | "date",
    sortOrder: "" as "" | "asc" | "desc",
  });

  const productsPerPage = 12;

  const applyFilters = useCallback(
    (productsToFilter: any[]) => {
      let filtered = [...productsToFilter];

      if (selectedCategory && selectedCategory > 0) {
        filtered = filtered.filter((product) =>
          product.categories?.some((cat: any) => cat.id === selectedCategory)
        );
      }

      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(searchLower) ||
            product.short_description?.toLowerCase().includes(searchLower) ||
            product.categories?.some((cat: any) =>
              cat.name.toLowerCase().includes(searchLower)
            )
        );
      }

      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
        filtered = filtered.filter((product) => {
          const price = Number.parseFloat(product.price);
          return (
            price >= filters.priceRange[0] && price <= filters.priceRange[1]
          );
        });
      }

      if (filters.inStock) {
        filtered = filtered.filter(
          (product) => product.stock_status === "instock"
        );
      }

      if (filters.onSale) {
        filtered = filtered.filter((product) => product.on_sale);
      }

      if (filters.featured) {
        filtered = filtered.filter((product) => product.featured);
      }

      if (filters.sortBy && filters.sortOrder) {
        filtered.sort((a, b) => {
          let aValue, bValue;

          switch (filters.sortBy) {
            case "price":
              aValue = Number.parseFloat(a.price);
              bValue = Number.parseFloat(b.price);
              break;
            case "date":
              aValue = new Date(a.date_created).getTime();
              bValue = new Date(b.date_created).getTime();
              break;
            case "name":
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            default:
              return 0;
          }

          if (filters.sortOrder === "desc") {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }
        });
      }

      return filtered;
    },
    [selectedCategory, searchTerm, filters]
  );

  useEffect(() => {
    if (isInitialized.current || isLoadingData.current) {
      return;
    }

    isLoadingData.current = true;

    const initializeData = async () => {
      try {
        setLoading(true);
        setCategoriesLoading(true);
        setError(null);

        const [categoriesData, productsData] = await Promise.all([
          getCategories().catch(() => []),
          getProducts().catch(() => []),
        ]);

        if (!isInitialized.current) {
          setCategories([
            { id: 0, name: "Todas as Categorias", count: 0 },
            ...categoriesData,
          ]);
          setCategoriesLoading(false);
          setProducts(productsData);
          setFilteredProducts(productsData);
          isInitialized.current = true;
        }
      } catch (error) {
        if (!isInitialized.current) {
          console.error("Error initializing data:", error);
          setError("Erro ao carregar dados. Tente novamente.");
        }
      } finally {
        setLoading(false);
        isLoadingData.current = false;
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (!isInitialized.current || products.length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const filtered = applyFilters(products);
      setFilteredProducts(filtered);
      setCurrentPage(1);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchTerm, filters, products, applyFilters]);

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setFilters({
      priceRange: [0, 1000],
      inStock: false,
      onSale: false,
      featured: false,
      sortBy: "",
      sortOrder: "",
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    if (filters.featured) count++;
    if (filters.sortBy) count++;
    if (selectedCategory) count++;
    if (searchTerm) count++;
    return count;
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black overflow-hidden mt-20">
        {/* <StoreHero /> */}
        <StoreFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={handleCategoryChange}
          categories={categories}
          categoriesLoading={categoriesLoading}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filters={filters}
          handleFilterChange={handleFilterChange}
          getActiveFiltersCount={getActiveFiltersCount}
          clearFilters={clearFilters}
        />
        <StoreGrid
          products={currentProducts}
          loading={loading}
          error={error}
          viewMode={viewMode}
          filteredProducts={filteredProducts}
          searchTerm={searchTerm}
          clearFilters={clearFilters}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      </main>
      <Toaster />
    </>
  );
}
