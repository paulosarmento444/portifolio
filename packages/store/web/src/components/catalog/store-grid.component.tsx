"use client";

import { Package, RefreshCw } from "lucide-react";
import { EmptyState, PrimaryButton } from "@site/shared";
import type { StoreCatalogProduct, StoreViewMode } from "../../data/store.types";
import { ProductCard } from "./product-card.component";
import { StorePagination } from "./store-pagination.component";

interface StoreGridProps {
  products: StoreCatalogProduct[];
  loading: boolean;
  error: string | null;
  viewMode: StoreViewMode;
  filteredProducts: StoreCatalogProduct[];
  searchTerm: string;
  clearFilters: () => void;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

export function StoreGrid({
  products,
  loading,
  error,
  viewMode,
  filteredProducts,
  searchTerm,
  clearFilters,
  currentPage,
  totalPages,
  handlePageChange,
}: StoreGridProps) {
  return (
    <div className="space-y-8">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-wrap items-center justify-between gap-3 px-1"
      >
        <p className="text-sm leading-6 text-[color:var(--store-catalog-muted)]">
          {filteredProducts.length} produto{filteredProducts.length !== 1 && "s"}
          {searchTerm ? ` • busca: ${searchTerm}` : ""}
        </p>
        {totalPages > 1 ? (
          <p className="text-sm font-medium text-[color:var(--store-catalog-soft)]">
            Página {currentPage} de {totalPages}
          </p>
        ) : null}
      </div>

      {loading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6"
              : "grid gap-5"
          }
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[1.8rem] bg-[color:var(--store-catalog-panel-card)] shadow-[var(--site-shadow-sm)]"
            >
              <div
                className={
                  viewMode === "grid"
                    ? "aspect-[4/5] animate-pulse bg-white/90"
                    : "grid gap-4 p-4 md:grid-cols-[15rem_minmax(0,1fr)]"
                }
              >
                {viewMode === "list" ? (
                  <>
                    <div className="aspect-[4/3] animate-pulse rounded-2xl bg-[color:var(--store-catalog-panel-soft)]" />
                    <div className="grid gap-3">
                      <div className="h-6 w-2/3 animate-pulse rounded bg-[color:var(--store-catalog-panel-soft)]" />
                      <div className="h-4 w-full animate-pulse rounded bg-[color:var(--store-catalog-panel-soft)]" />
                      <div className="h-4 w-4/5 animate-pulse rounded bg-[color:var(--store-catalog-panel-soft)]" />
                    </div>
                  </>
                ) : (
                  <div className="grid gap-3 p-5">
                    <div className="h-5 w-1/3 animate-pulse rounded bg-[color:var(--store-catalog-panel-soft)]" />
                    <div className="h-5 w-4/5 animate-pulse rounded bg-[color:var(--store-catalog-panel-soft)]" />
                    <div className="h-4 w-full animate-pulse rounded bg-[color:var(--store-catalog-panel-soft)]" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <CatalogErrorState message={error} /> : null}

      {!loading && !error ? (
        <>
          {products.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6"
                  : "grid gap-5"
              }
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Package className="h-6 w-6" />}
              eyebrow="Sem resultados"
              title="Nenhum produto combina com os filtros atuais."
              description="Revise categoria, faixa de preço ou termos de busca para voltar a explorar o catálogo."
              action={
                <PrimaryButton
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full border-0 bg-[color:var(--store-catalog-accent)] text-white hover:bg-[color:var(--store-catalog-accent-strong)]"
                >
                  Limpar filtros
                </PrimaryButton>
              }
              className="bg-[color:var(--store-catalog-panel)]"
            />
          )}

          <StorePagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        </>
      ) : null}
    </div>
  );
}

function CatalogErrorState({ message }: Readonly<{ message: string }>) {
  return (
    <EmptyState
      eyebrow="Falha de carregamento"
      title="Não foi possível montar o catálogo agora."
      description={message}
      action={
        <PrimaryButton
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full border-0 bg-[color:var(--store-catalog-accent)] text-white hover:bg-[color:var(--store-catalog-accent-strong)]"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </PrimaryButton>
      }
      className="bg-[color:var(--store-catalog-panel)]"
    />
  );
}
