"use client";

import { Search, X } from "lucide-react";
import { ChipFilter, GhostButton, SurfaceCard, TextField } from "@site/shared";

interface BlogFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: string[];
  resultsCount: number;
}

export function BlogFilters({
  searchTerm,
  onSearchTermChange,
  selectedCategory,
  onCategoryChange,
  categories,
  resultsCount,
}: BlogFiltersProps) {
  const hasActiveFilters = Boolean(searchTerm.trim() || selectedCategory);

  return (
    <section id="blog-filter-section" className="site-section site-section-compact">
      <div className="site-container site-container-commerce">
        <SurfaceCard tone="soft" className="site-stack-section">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="site-stack-panel">
              <div className="site-stack-panel gap-2">
                <p className="site-text-meta uppercase tracking-[0.14em]">Descobrir por tema</p>
                <p className="site-text-body site-readable-sm text-sm">
                  Busque por assunto ou filtre por categoria para navegar pelo conteúdo editorial com mais foco.
                </p>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--site-color-foreground-soft)]" />
                <TextField
                  id="blog-search"
                  aria-label="Buscar artigos"
                  placeholder="Pesquisar por tema, assunto ou título"
                  value={searchTerm}
                  onChange={(event) => onSearchTermChange(event.target.value)}
                  fieldClassName="pl-11"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <div className="site-stack-panel gap-1 text-left lg:text-right" role="status" aria-live="polite">
                <p className="site-text-meta uppercase tracking-[0.14em]">Resultados</p>
                <p className="text-sm font-medium text-[color:var(--site-color-foreground-strong)]">
                  {resultsCount} artigo{resultsCount === 1 ? "" : "s"}
                </p>
                {selectedCategory ? (
                  <p className="site-text-meta normal-case tracking-normal">
                    Categoria ativa: {selectedCategory}
                  </p>
                ) : null}
              </div>
              {hasActiveFilters ? (
                <GhostButton
                  size="sm"
                  leadingIcon={<X className="h-4 w-4" />}
                  onClick={() => {
                    onSearchTermChange("");
                    onCategoryChange(null);
                  }}
                >
                  Limpar filtros
                </GhostButton>
              ) : null}
            </div>
          </div>

          <div
            aria-label="Filtrar artigos por categoria"
            className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <ChipFilter active={selectedCategory === null} onClick={() => onCategoryChange(null)}>
              Todos
            </ChipFilter>
            {categories.map((category) => (
              <ChipFilter
                key={category}
                active={selectedCategory === category}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </ChipFilter>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </section>
  );
}
