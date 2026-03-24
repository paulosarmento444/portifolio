import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@site/shared";

interface StorePaginationProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

function buildPageWindow(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push(-1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) pages.push(-2);

  pages.push(totalPages);

  return pages;
}

export function StorePagination({
  currentPage,
  totalPages,
  handlePageChange,
}: Readonly<StorePaginationProps>) {
  if (totalPages <= 1) {
    return null;
  }

  const pageItems = buildPageWindow(currentPage, totalPages);

  return (
    <nav
      aria-label="Paginação da loja"
      className="flex flex-wrap items-center justify-center gap-2 pt-4"
    >
      <button
        type="button"
        aria-label="Página anterior"
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--store-catalog-panel-card)] text-[color:var(--store-catalog-text)] shadow-[var(--site-shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--site-shadow-md)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pageItems.map((pageItem, index) =>
        pageItem < 0 ? (
          <span key={`ellipsis-${index}`} className="px-1 text-sm text-[color:var(--store-catalog-soft)]">
            ...
          </span>
        ) : (
          <button
            key={pageItem}
            type="button"
            aria-current={currentPage === pageItem ? "page" : undefined}
            aria-label={
              currentPage === pageItem
                ? `Página ${pageItem}, atual`
                : `Ir para página ${pageItem}`
            }
            className={cn(
              "inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-semibold transition-all",
              currentPage === pageItem
                ? "bg-[color:var(--store-catalog-accent)] text-white shadow-[0_12px_28px_rgba(48,83,255,0.22)]"
                : "bg-[color:var(--store-catalog-panel-card)] text-[color:var(--store-catalog-text)] shadow-[var(--site-shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--site-shadow-md)]",
            )}
            onClick={() => handlePageChange(pageItem)}
          >
            {pageItem}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Próxima página"
        disabled={currentPage >= totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--store-catalog-panel-card)] text-[color:var(--store-catalog-text)] shadow-[var(--site-shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--site-shadow-md)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
