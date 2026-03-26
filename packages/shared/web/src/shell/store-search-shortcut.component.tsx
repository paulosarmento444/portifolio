"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "../ui";

export interface StoreSearchShortcutProps {
  className?: string;
  compact?: boolean;
  onNavigate?: () => void;
}

export function StoreSearchShortcut({
  className,
  compact = false,
  onNavigate,
}: Readonly<StoreSearchShortcutProps>) {
  return (
    <Link
      href="/store"
      onClick={onNavigate}
      aria-label="Buscar na loja"
      className={cn(
        "site-focus-ring group inline-flex min-h-11 items-center gap-3 rounded-full border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-3 py-2 text-left text-[color:var(--site-color-foreground-muted)] transition-all duration-200 hover:border-[color:var(--site-color-border-strong)] hover:bg-[color:var(--site-color-surface-strong)] hover:shadow-[var(--site-shadow-sm)]",
        compact ? "justify-start px-3.5" : "w-full sm:min-w-[16rem] sm:px-4",
        className,
      )}
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)] transition-transform duration-200 group-hover:scale-[1.03]">
        <Search className="h-4 w-4" />
      </span>

      <span className={cn("min-w-0 flex-1", compact && "max-w-[10rem]")}>
        <span className="block truncate text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
          Buscar produtos
        </span>
        {!compact ? (
          <span className="site-text-meta block truncate text-xs">
            Loja, categorias e conteúdo editorial
          </span>
        ) : null}
      </span>
    </Link>
  );
}
