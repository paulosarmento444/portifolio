import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarIcon, Tag, UserIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { BlogPostDetailView } from "@site/shared";
import {
  BreadcrumbTrail,
  EditorialIntro,
  MediaFrame,
  StatusBadge,
  SurfaceCard,
} from "@site/shared";
import { cleanBlogExcerpt } from "../../lib/blog.utils";

interface PostHeroProps {
  post: BlogPostDetailView;
}

export function PostHero({ post }: PostHeroProps) {
  const excerpt = cleanBlogExcerpt(post.excerpt);
  const authorName = post.author?.name || "Equipe editorial";
  const primaryCategory = post.categories[0]?.name;

  return (
    <section className="site-section site-section-hero relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--site-color-primary-soft),transparent_36%),radial-gradient(circle_at_bottom_right,var(--site-color-secondary-soft),transparent_30%)]" />
      <div className="site-container site-container-content">
        <div className="site-stack-section">
          <BreadcrumbTrail
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.title, current: true },
            ]}
            renderLink={(item, className) => (
              <Link href={item.href || "/"} className={className}>
                {item.label}
              </Link>
            )}
          />

          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="info">
              <BookOpen className="h-3.5 w-3.5" />
              Leitura editorial
            </StatusBadge>
            <div className="flex flex-wrap gap-2">
              {post.categories.map((category, index) => (
                <StatusBadge key={`${category.slug}-${index}`} tone="accent">
                  {category.name}
                </StatusBadge>
              ))}
            </div>
          </div>

          <EditorialIntro
            title={post.title}
            description={excerpt}
            density="hero"
            contentWidth="lg"
            descriptionWidth="sm"
            actions={
              <>
                <Link href="/blog" className="site-button-secondary">
                  Voltar para o blog
                </Link>
                <Link href="/store" className="site-button-ghost">
                  Explorar a loja
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            }
            meta={
              <>
                <span className="inline-flex items-center gap-2">
                  {post.author?.avatar?.url ? (
                    <Image
                      src={post.author.avatar.url}
                      alt={authorName}
                      width={24}
                      height={24}
                      className="rounded-full"
                      unoptimized
                    />
                  ) : (
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]">
                      <UserIcon className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {authorName}
                </span>
                {post.publishedAt ? (
                  <>
                    <span className="text-[color:var(--site-color-border-strong)]">•</span>
                    <span className="inline-flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <time dateTime={post.publishedAt}>
                        {format(new Date(post.publishedAt), "d 'de' MMMM, yyyy", { locale: ptBR })}
                      </time>
                    </span>
                  </>
                ) : null}
              </>
            }
            aside={
              <SurfaceCard tone="soft" className="site-stack-panel">
                <div className="site-stack-panel gap-2">
                  <p className="site-text-meta uppercase tracking-[0.14em]">Em foco neste artigo</p>
                  {primaryCategory ? (
                    <div className="flex items-center gap-2 text-sm text-[color:var(--site-color-foreground-strong)]">
                      <Tag className="h-4 w-4 text-[color:var(--site-color-primary)]" />
                      <span>{primaryCategory}</span>
                    </div>
                  ) : null}
                  <p className="site-text-body text-sm">
                    Conteúdo editorial conectado à jornada de descoberta da loja, com leitura mais clara e navegação contextual.
                  </p>
                </div>
                <div className="site-action-cluster">
                  <StatusBadge tone="neutral">Hierarquia mais leve</StatusBadge>
                  <StatusBadge tone="warning">Relacionados abaixo</StatusBadge>
                </div>
              </SurfaceCard>
            }
          />

          <MediaFrame aspect="video" className="shadow-[var(--site-shadow-md)]">
            {post.featuredImage?.url ? (
              <Image
                src={post.featuredImage.url}
                alt={post.featuredImage.alt || post.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--site-color-primary-soft),transparent_72%)] text-[color:var(--site-color-primary)]">
                <span className="site-text-card-title">Artigo editorial</span>
              </div>
            )}
          </MediaFrame>
        </div>
      </div>
    </section>
  );
}
