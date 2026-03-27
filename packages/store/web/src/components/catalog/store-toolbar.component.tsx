import { Grid3X3, List, SlidersHorizontal } from "lucide-react";
import { IconButton, PrimaryButton, cn } from "@site/shared";
import type { StoreViewMode } from "../../data/store.types";

interface StoreToolbarProps {
  onOpenFilters: () => void;
  activeFiltersCount: number;
  showFilters: boolean;
  filterDrawerId: string;
  viewMode: StoreViewMode;
  onViewModeChange: (mode: StoreViewMode) => void;
}

export function StoreToolbar({
  onOpenFilters,
  activeFiltersCount,
  showFilters,
  filterDrawerId,
  viewMode,
  onViewModeChange,
}: Readonly<StoreToolbarProps>) {
  return (
    <div className="flex items-center justify-between gap-3">
      <PrimaryButton
        onClick={onOpenFilters}
        aria-controls={filterDrawerId}
        aria-expanded={showFilters}
        className="justify-center rounded-full border-0 bg-[color:var(--store-catalog-accent)] px-4 text-white shadow-[var(--site-shadow-sm)] hover:bg-[color:var(--store-catalog-accent-strong)]"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
        {activeFiltersCount > 0 ? (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{activeFiltersCount}</span>
        ) : null}
      </PrimaryButton>

      <div className="flex items-center gap-2 rounded-full bg-[color:var(--store-catalog-panel-card)] p-1 shadow-[var(--site-shadow-sm)]">
        <IconButton
          icon={<Grid3X3 className="h-4 w-4" />}
          label="Visualização em grade"
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="sm"
          className={cn(
            "h-10 w-10 rounded-full border border-transparent text-[color:var(--store-catalog-text)] shadow-none",
            viewMode === "grid"
              ? "bg-[color:var(--store-catalog-accent)] text-white hover:bg-[color:var(--store-catalog-accent)]"
              : "hover:bg-[color:var(--store-catalog-panel-soft)]",
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
              : "hover:bg-[color:var(--store-catalog-panel-soft)]",
          )}
          onClick={() => onViewModeChange("list")}
        />
      </div>
    </div>
  );
}
