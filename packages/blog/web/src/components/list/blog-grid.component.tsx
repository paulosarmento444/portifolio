"use client";

import type { BlogPostSummaryView } from "@site/shared";
import { EmptyState, SecondaryButton, SectionShell, SurfaceCard } from "@site/shared";
import { BlogPostCard } from "../shared/blog-post-card.component";

interface BlogGridProps {
  posts: BlogPostSummaryView[];
  loading: boolean;
  error: string | null;
  getExcerpt: (excerpt?: string) => string;
  onRetry: () => void;
  onClearFilters: () => void;
}

export function BlogGrid({
  posts,
  loading,
  error,
  getExcerpt,
  onRetry,
  onClearFilters,
}: BlogGridProps) {
  return (
    <SectionShell container="commerce" spacing="compact" stack="page">
      {!loading && !error ? (
        <div className="rounded-[22px] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-page)] px-4 py-4 sm:px-5">
          <p className="text-sm leading-6 text-[color:var(--site-color-foreground-muted)]">
            {posts.length} artigo{posts.length === 1 ? "" : "s"} disponível{posts.length === 1 ? "" : "eis"} para leitura nesta combinação atual.
          </p>
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Não foi possível carregar os artigos"
          description={error}
          action={<SecondaryButton onClick={onRetry}>Tentar novamente</SecondaryButton>}
        />
      ) : posts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post, index) => (
            <BlogPostCard
              key={post.id ?? index}
              post={post}
              excerpt={getExcerpt(post.excerpt)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum artigo encontrado"
          description="Ajuste a busca ou limpe os filtros para ver mais conteúdo editorial."
          action={<SecondaryButton onClick={onClearFilters}>Limpar filtros</SecondaryButton>}
        />
      )}
    </SectionShell>
  );
}

function PostCardSkeleton() {
  return (
    <SurfaceCard tone="soft" padding="none" className="overflow-hidden">
      <div className="aspect-[16/11] animate-pulse bg-[color:var(--site-color-surface-inset)]" />
      <div className="grid gap-3 p-5 md:p-6">
        <div className="h-4 w-28 animate-pulse rounded-full bg-[color:var(--site-color-surface-inset)]" />
        <div className="h-6 w-5/6 animate-pulse rounded-md bg-[color:var(--site-color-surface-inset)]" />
        <div className="h-4 w-full animate-pulse rounded-md bg-[color:var(--site-color-surface-inset)]" />
        <div className="h-4 w-4/5 animate-pulse rounded-md bg-[color:var(--site-color-surface-inset)]" />
      </div>
    </SurfaceCard>
  );
}
