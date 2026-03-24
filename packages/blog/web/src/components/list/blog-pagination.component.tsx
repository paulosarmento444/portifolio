"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { ChipFilter, SecondaryButton, SectionShell } from "@site/shared";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function BlogPagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
}: BlogPaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: Array<number | string> = [];

    for (
      let page = Math.max(2, currentPage - delta);
      page <= Math.min(totalPages - 1, currentPage + delta);
      page += 1
    ) {
      range.push(page);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return Array.from(new Set(rangeWithDots));
  };

  return (
    <SectionShell container="commerce" spacing="compact" stack="section">
      <nav
        aria-label="Paginação do blog"
        className="flex flex-col items-center gap-4 rounded-[24px] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-page)] px-4 py-5"
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          <SecondaryButton
            size="sm"
            leadingIcon={<ChevronLeft className="h-4 w-4" />}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPreviousPage}
          >
            Anterior
          </SecondaryButton>

          {getVisiblePages().map((page, index) =>
            page === "..." ? (
              <span
                key={`${page}-${index}`}
                className="site-text-meta px-2 normal-case tracking-normal"
              >
                ...
              </span>
            ) : (
              <ChipFilter
                key={`${page}-${index}`}
                active={currentPage === page}
                aria-label={
                  currentPage === page
                    ? `Página ${page}, atual`
                    : `Ir para página ${page}`
                }
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </ChipFilter>
            ),
          )}

          <SecondaryButton
            size="sm"
            trailingIcon={<ChevronRight className="h-4 w-4" />}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
          >
            Próxima
          </SecondaryButton>
        </div>
        <p className="site-text-meta normal-case tracking-normal">
          Página {currentPage} de {totalPages}
        </p>
      </nav>
    </SectionShell>
  );
}
