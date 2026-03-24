import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarIcon, Clock3 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { BlogPostSummaryView } from "@site/shared";
import { MediaFrame, StatusBadge, SurfaceCard, cn } from "@site/shared";

interface BlogPostCardProps {
  post: BlogPostSummaryView;
  excerpt?: string;
  compact?: boolean;
  showExcerpt?: boolean;
}

export function BlogPostCard({
  post,
  excerpt,
  compact = false,
  showExcerpt = true,
}: BlogPostCardProps) {
  const primaryCategory = post.categories[0];

  return (
    <Link href={`/blog/${post.uri}`} className="block h-full">
      <SurfaceCard
        as="article"
        tone="default"
        padding="none"
        interactive
        className="flex h-full overflow-hidden"
      >
        <div className="flex h-full w-full flex-col">
          <MediaFrame
            aspect={compact ? "wide" : "video"}
            className="rounded-none border-0 shadow-none"
            contentClassName="overflow-hidden"
          >
            {post.featuredImage?.url ? (
              <Image
                src={post.featuredImage.url}
                alt={post.featuredImage.alt || post.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--site-color-primary-soft),transparent_72%)] text-[color:var(--site-color-primary)]">
                <span className="site-text-card-title text-base">Artigo</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            {primaryCategory ? (
              <div className="absolute left-4 top-4">
                <StatusBadge tone="accent">{primaryCategory.name}</StatusBadge>
              </div>
            ) : null}
          </MediaFrame>

          <div className="site-stack-panel flex-1 p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="site-text-meta inline-flex items-center gap-2 normal-case tracking-normal">
                <CalendarIcon className="h-3.5 w-3.5" />
                <time dateTime={post.publishedAt}>
                  {format(new Date(post.publishedAt), "d 'de' MMM yyyy", { locale: ptBR })}
                </time>
              </span>
              <span className="site-text-meta inline-flex items-center gap-2 normal-case tracking-normal">
                <Clock3 className="h-3.5 w-3.5" />
                Leitura editorial
              </span>
              {post.categories[1] ? (
                <span className="site-text-meta normal-case tracking-normal">
                  +{post.categories.length - 1} tema{post.categories.length - 1 === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>

            <div className="site-stack-panel flex-1 gap-3">
              <h3 className={cn("site-text-card-title leading-tight text-[color:var(--site-color-foreground-strong)]", compact ? "text-lg" : "text-xl")}>
                {post.title}
              </h3>
              {showExcerpt && excerpt ? (
                <p className={cn("site-text-body text-sm", compact ? "line-clamp-2" : "line-clamp-3")}>{excerpt}</p>
              ) : null}
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-[color:var(--site-color-border)] pt-4">
              <span className="text-sm font-medium text-[color:var(--site-color-foreground-muted)]">Ler artigo</span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-soft)] text-[color:var(--site-color-primary)]">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </SurfaceCard>
    </Link>
  );
}
