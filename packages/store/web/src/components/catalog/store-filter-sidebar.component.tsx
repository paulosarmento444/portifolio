import { useId } from "react";
import {
  Check,
  ChevronDown,
  Grid3X3,
  List,
  Search,
  SlidersVertical,
} from "lucide-react";
import {
  DrawerShell,
  GhostButton,
  IconButton,
  PrimaryButton,
  TextField,
  cn,
} from "@site/shared";
import type {
  StoreCatalogFilters,
  StoreCategoryOption,
  StorePriceBounds,
  StoreViewMode,
} from "../../lib/store.types";
import { STORE_SORT_PRESETS } from "./store-toolbar.component";

interface StoreFilterSidebarContentProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortPreset: string;
  onSortPresetChange: (value: string) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (categoryId: string | null) => void;
  categories: StoreCategoryOption[];
  categoriesLoading: boolean;
  filters: StoreCatalogFilters;
  priceBounds: StorePriceBounds;
  handleFilterChange: <TKey extends keyof StoreCatalogFilters>(
    key: TKey,
    value: StoreCatalogFilters[TKey],
  ) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
  viewMode: StoreViewMode;
  onViewModeChange: (mode: StoreViewMode) => void;
}

interface StoreFilterSidebarMobileProps extends StoreFilterSidebarContentProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  resultCount: number;
  panelId: string;
}

const sectionTitleClassName =
  "text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--store-catalog-soft)]";

const sectionClassName =
  "space-y-4 border-t border-[color:var(--store-catalog-sidebar-border)] pt-6 first:border-t-0 first:pt-0";

const inputClassName =
  "min-h-[3.5rem] rounded-[1.2rem] border border-[color:var(--store-catalog-sidebar-border)] bg-[color:var(--store-catalog-sidebar-surface-soft)] px-4 text-sm text-[color:var(--store-catalog-text)] transition-all duration-200 placeholder:text-[color:var(--store-catalog-soft)] focus:border-[color:var(--store-catalog-accent)] focus:outline-none focus:shadow-[var(--site-shadow-focus)]";

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const formatCompactMoney = (value: number) => moneyFormatter.format(value);

function FilterCheckboxRow({
  active,
  label,
  count,
  onClick,
}: Readonly<{
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group flex w-full items-center gap-3 rounded-[1.15rem] border border-transparent px-3 py-3 text-left transition-all duration-200",
        active
          ? "bg-[color:var(--store-catalog-accent-soft)] shadow-[var(--site-shadow-sm)]"
          : "bg-[color:var(--store-catalog-sidebar-surface-soft)] hover:border-[color:var(--store-catalog-border-strong)] hover:bg-[color:var(--store-catalog-sidebar-surface)]",
      )}
    >
      <span
        className={cn(
          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition-all duration-200",
          active
            ? "border-[color:var(--store-catalog-accent)] bg-[color:var(--store-catalog-accent)] text-white"
            : "border-[color:var(--store-catalog-border-strong)] bg-transparent text-transparent group-hover:border-[color:var(--store-catalog-accent)]",
        )}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm transition-colors",
            active
              ? "font-semibold text-[color:var(--store-catalog-text)]"
              : "text-[color:var(--store-catalog-muted)] group-hover:text-[color:var(--store-catalog-text)]",
          )}
        >
          {label}
        </span>
        {typeof count === "number" ? (
          <span className="mt-0.5 block text-xs text-[color:var(--store-catalog-soft)]">
            {count} produto{count !== 1 && "s"}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function SidebarSearchField({
  id,
  value,
  onChange,
}: Readonly<{
  id: string;
  value: string;
  onChange: (value: string) => void;
}>) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="site-label mb-0">
        Buscar produtos
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--store-catalog-soft)]" />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Busque por produto, categoria ou palavra-chave"
          className={cn(inputClassName, "pl-11 pr-4")}
        />
      </div>
    </div>
  );
}

function SidebarSortField({
  id,
  value,
  onChange,
}: Readonly<{
  id: string;
  value: string;
  onChange: (value: string) => void;
}>) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="site-label mb-0">
        Organizar resultados
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Organizar por"
          className={cn(inputClassName, "appearance-none pr-11 font-semibold")}
        >
          {STORE_SORT_PRESETS.map((preset) => (
            <option key={preset.value || "default"} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--store-catalog-soft)]" />
      </div>
    </div>
  );
}

function StoreFilterSidebarContent({
  searchTerm,
  onSearchChange,
  sortPreset,
  onSortPresetChange,
  selectedCategoryId,
  setSelectedCategoryId,
  categories,
  categoriesLoading,
  filters,
  priceBounds,
  handleFilterChange,
  clearFilters,
  activeFiltersCount,
  viewMode,
  onViewModeChange,
}: Readonly<StoreFilterSidebarContentProps>) {
  const uid = useId();

  return (
    <div className="space-y-6 rounded-[2rem] border border-[color:var(--store-catalog-sidebar-border)] bg-[color:var(--store-catalog-sidebar-surface)] p-6 shadow-[var(--store-catalog-sidebar-shadow)] ring-1 ring-white/35 backdrop-blur-[14px] dark:ring-white/5">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--store-catalog-accent-soft)] text-[color:var(--store-catalog-accent)]">
              <SlidersVertical className="h-4 w-4" />
            </div>
            <div>
              <p className={sectionTitleClassName}>Filtros da loja</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--store-catalog-muted)]">
                Use a coluna lateral para buscar, organizar e refinar a vitrine antes de comparar os produtos.
              </p>
            </div>
          </div>
          {activeFiltersCount > 0 ? (
            <GhostButton
              onClick={clearFilters}
              size="sm"
              className="rounded-full border border-[color:var(--store-catalog-sidebar-border)] text-[color:var(--store-catalog-muted)] hover:border-[color:var(--store-catalog-border-strong)] hover:bg-[color:var(--store-catalog-sidebar-surface-soft)]"
            >
              Limpar
            </GhostButton>
          ) : null}
        </div>

        {activeFiltersCount > 0 ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--store-catalog-sidebar-surface-soft)] px-3 py-1.5 text-xs font-medium text-[color:var(--store-catalog-text)]">
            {activeFiltersCount} filtro{activeFiltersCount !== 1 && "s"} ativo{activeFiltersCount !== 1 && "s"}
          </div>
        ) : null}
      </div>

      <section className={sectionClassName}>
        <div className="space-y-1.5">
          <h3 className={sectionTitleClassName}>Categorias</h3>
          <p className="text-xs leading-5 text-[color:var(--store-catalog-soft)]">
            Selecione a categoria principal do catálogo para reorganizar os resultados.
          </p>
        </div>
        <div className="space-y-2.5">
          {categoriesLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-[1rem] bg-[color:var(--store-catalog-sidebar-surface-soft)]"
                />
              ))
            : categories.map((category) => {
                const active =
                  selectedCategoryId === category.id ||
                  (!selectedCategoryId && category.id === "0");

                return (
                  <FilterCheckboxRow
                    key={category.id}
                    active={active}
                    label={category.name}
                    count={category.count}
                    onClick={() => setSelectedCategoryId(category.id === "0" ? null : category.id)}
                  />
                );
              })}
        </div>
      </section>

      <section className={sectionClassName}>
        <div className="space-y-1.5">
          <h3 className={sectionTitleClassName}>Busca</h3>
          <p className="text-xs leading-5 text-[color:var(--store-catalog-soft)]">
            Procure produtos por nome, categoria ou palavras-chave da vitrine.
          </p>
        </div>
        <SidebarSearchField
          id={`${uid}-search`}
          value={searchTerm}
          onChange={onSearchChange}
        />
      </section>

      <section className={sectionClassName}>
        <div className="space-y-1.5">
          <h3 className={sectionTitleClassName}>Ordenação</h3>
          <p className="text-xs leading-5 text-[color:var(--store-catalog-soft)]">
            Escolha como os produtos aparecem antes de comparar preços e disponibilidade.
          </p>
        </div>
        <SidebarSortField
          id={`${uid}-sort`}
          value={sortPreset}
          onChange={onSortPresetChange}
        />
      </section>

      <section className={sectionClassName}>
        <div className="space-y-1.5">
          <h3 className={sectionTitleClassName}>Visualização</h3>
          <p className="text-xs leading-5 text-[color:var(--store-catalog-soft)]">
            Ajuste como os produtos aparecem na vitrine.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[color:var(--store-catalog-sidebar-surface-soft)] p-1.5">
          <IconButton
            icon={<Grid3X3 className="h-4 w-4" />}
            label="Visualização em grade"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-10 w-10 rounded-full border border-transparent text-[color:var(--store-catalog-text)] shadow-none",
              viewMode === "grid"
                ? "bg-[color:var(--store-catalog-accent)] text-white hover:bg-[color:var(--store-catalog-accent)]"
                : "hover:bg-[color:var(--store-catalog-sidebar-surface)]",
            )}
            onClick={() => onViewModeChange("grid")}
          />
          <IconButton
            icon={<List className="h-4 w-4" />}
            label="Visualização em lista"
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-10 w-10 rounded-full border border-transparent text-[color:var(--store-catalog-text)] shadow-none",
              viewMode === "list"
                ? "bg-[color:var(--store-catalog-accent)] text-white hover:bg-[color:var(--store-catalog-accent)]"
                : "hover:bg-[color:var(--store-catalog-sidebar-surface)]",
            )}
            onClick={() => onViewModeChange("list")}
          />
        </div>
      </section>

      <section className={sectionClassName}>
        <h3 className={sectionTitleClassName}>Preço</h3>
        <p className="text-xs leading-5 text-[color:var(--store-catalog-soft)]">
          Defina a faixa desejada usando os campos abaixo.
        </p>

        <div className="flex items-center justify-between rounded-[1.1rem] bg-[color:var(--store-catalog-sidebar-surface-soft)] px-4 py-3 text-xs font-medium text-[color:var(--store-catalog-muted)]">
          <span>{formatCompactMoney(filters.priceRange[0])}</span>
          <span>{formatCompactMoney(filters.priceRange[1])}</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <TextField
            label="Mínimo"
            type="number"
            min={priceBounds.min}
            max={filters.priceRange[1]}
            value={filters.priceRange[0]}
            onChange={(event) => {
              const nextMin = Number(event.target.value) || priceBounds.min;
              handleFilterChange("priceRange", [
                Math.max(priceBounds.min, Math.min(nextMin, filters.priceRange[1])),
                filters.priceRange[1],
              ] as [number, number]);
            }}
            fieldClassName="rounded-[1rem] border-[color:var(--store-catalog-sidebar-border)] bg-[color:var(--store-catalog-sidebar-surface-soft)] text-[color:var(--store-catalog-text)]"
          />
          <TextField
            label="Máximo"
            type="number"
            min={filters.priceRange[0]}
            max={priceBounds.max}
            value={filters.priceRange[1]}
            onChange={(event) => {
              const nextMax = Number(event.target.value) || priceBounds.max;
              handleFilterChange("priceRange", [
                filters.priceRange[0],
                Math.min(priceBounds.max, Math.max(nextMax, filters.priceRange[0])),
              ] as [number, number]);
            }}
            fieldClassName="rounded-[1rem] border-[color:var(--store-catalog-sidebar-border)] bg-[color:var(--store-catalog-sidebar-surface-soft)] text-[color:var(--store-catalog-text)]"
          />
        </div>
      </section>

      <section className={sectionClassName}>
        <h3 className={sectionTitleClassName}>Atalhos</h3>
        <div className="space-y-2.5">
          <FilterCheckboxRow
            active={filters.inStock}
            label="Em estoque"
            onClick={() => handleFilterChange("inStock", !filters.inStock)}
          />
          <FilterCheckboxRow
            active={filters.onSale}
            label="Em oferta"
            onClick={() => handleFilterChange("onSale", !filters.onSale)}
          />
          <FilterCheckboxRow
            active={filters.featured}
            label="Destaques"
            onClick={() => handleFilterChange("featured", !filters.featured)}
          />
        </div>
      </section>
    </div>
  );
}

export function StoreFilterSidebarDesktop(
  props: Readonly<StoreFilterSidebarContentProps>,
) {
  return (
    <aside className="hidden lg:block lg:w-[21rem] lg:min-w-[21rem] xl:w-[22rem] xl:min-w-[22rem]">
      <div className="sticky top-28">
        <StoreFilterSidebarContent {...props} />
      </div>
    </aside>
  );
}

export function StoreFilterSidebarMobile({
  showFilters,
  setShowFilters,
  resultCount,
  panelId,
  ...props
}: Readonly<StoreFilterSidebarMobileProps>) {
  return (
    <DrawerShell
      isOpen={showFilters}
      onClose={() => setShowFilters(false)}
      side="bottom"
      panelId={panelId}
      title="Filtros da loja"
      description="Ajuste categoria, busca, ordenação e disponibilidade sem perder a leitura da vitrine."
      contentClassName="pb-4"
    >
      <div className="space-y-4">
        <StoreFilterSidebarContent {...props} />
        <div className="grid gap-3 border-t border-[color:var(--store-catalog-sidebar-border)] pt-4 sm:grid-cols-2">
          <GhostButton
            onClick={props.clearFilters}
            className="justify-center rounded-full border border-[color:var(--store-catalog-sidebar-border)] text-[color:var(--store-catalog-muted)]"
          >
            Limpar tudo
          </GhostButton>
          <PrimaryButton
            onClick={() => setShowFilters(false)}
            className="justify-center rounded-full border-0 bg-[color:var(--store-catalog-accent)] text-white hover:bg-[color:var(--store-catalog-accent-strong)]"
          >
            Ver {resultCount} produto{resultCount !== 1 && "s"}
          </PrimaryButton>
        </div>
      </div>
    </DrawerShell>
  );
}
