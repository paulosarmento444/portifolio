"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Newspaper } from "lucide-react";
import {
  BreadcrumbTrail,
  EditorialIntro,
  MediaFrame,
  StatusBadge,
  SurfaceCard,
} from "@site/shared";

interface BlogHeroProps {
  postCount?: number;
  categoryCount?: number;
}

export function BlogHero({ postCount = 0, categoryCount = 0 }: BlogHeroProps) {
  return (
    <section className="site-section site-section-hero relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--site-color-primary-soft),transparent_42%),radial-gradient(circle_at_bottom_right,var(--site-color-secondary-soft),transparent_36%)]" />
      <div className="site-container site-container-marketing">
        <div className="site-stack-section">
          <BreadcrumbTrail
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", current: true },
            ]}
            renderLink={(item, className) => (
              <Link href={item.href || "/"} className={className}>
                {item.label}
              </Link>
            )}
          />

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_24rem] lg:gap-10">
          <div className="site-stack-section max-w-3xl">
            <EditorialIntro
              eyebrow={
                <>
                  <BookOpen className="h-4 w-4" />
                  Conteúdo da loja
                </>
              }
              title="Guias, novidades e leituras úteis para comprar melhor."
              description="O blog combina curadoria editorial com o contexto da loja para ajudar na descoberta de produtos, tendências e decisões de compra mais seguras."
              density="hero"
              contentWidth="lg"
              descriptionWidth="sm"
              actions={
                <>
                  <Link
                    href="#blog-filter-section"
                    className="site-button-primary"
                  >
                    Explorar artigos
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/store" className="site-button-secondary">
                    Voltar para a loja
                  </Link>
                </>
              }
              meta={
                <>
                  <span>{postCount} artigo{postCount === 1 ? "" : "s"} carregado{postCount === 1 ? "" : "s"}</span>
                  <span className="text-[color:var(--site-color-border-strong)]">•</span>
                  <span>{categoryCount} categoria{categoryCount === 1 ? "" : "s"} em destaque</span>
                </>
              }
            />

            <div className="site-action-cluster">
              <StatusBadge tone="accent">
                <Newspaper className="h-3.5 w-3.5" />
                Atualizado com conteúdo real do WordPress
              </StatusBadge>
              <StatusBadge tone="info">
                Jornada editorial alinhada à loja
              </StatusBadge>
            </div>
          </div>

          <SurfaceCard tone="strong" padding="none" className="overflow-hidden">
            <div className="grid gap-0">
              <MediaFrame aspect="wide" className="rounded-none border-0 shadow-none">
                <Image
                  src="/blog.png"
                  alt="Editorial do blog"
                  fill
                  className="object-cover"
                  priority
                />
              </MediaFrame>
              <div className="site-stack-panel p-5 md:p-6">
                <p className="site-text-meta uppercase tracking-[0.14em]">Assinatura editorial</p>
                <p className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
                  Conteúdo com a mesma clareza visual e comercial da storefront.
                </p>
                <p className="site-text-body text-sm">
                  Menos ruído visual, mais hierarquia de leitura e conexão mais natural com catálogo, páginas institucionais e decisão de compra.
                </p>
                <div className="site-action-cluster">
                  <StatusBadge tone="neutral">Leitura confortável</StatusBadge>
                  <StatusBadge tone="warning">Descoberta por tema</StatusBadge>
                </div>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
      </div>
    </section>
  );
}
