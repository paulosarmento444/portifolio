import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CatalogProductCardView } from "@site/shared";
import { SectionShell, StatusBadge } from "@site/shared";
import { formatProductPrice, stripHtml } from "./home.utils";
import type { HomeCategoryHighlight } from "./home.types";

interface HomeHeroSectionProps {
  product: CatalogProductCardView | null;
  productCount: number;
  categoryCount: number;
  featuredCategories: HomeCategoryHighlight[];
}

export default function HomeHeroSection({
  product,
  productCount,
  categoryCount,
  featuredCategories,
}: Readonly<HomeHeroSectionProps>) {
  const summary = stripHtml(product?.shortDescription);
  const leadingCategory = featuredCategories[0] ?? null;

  return (
    <SectionShell container="marketing" spacing="hero" stack="page" className="overflow-hidden pt-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(22rem,0.98fr)] lg:items-center lg:gap-12 xl:gap-16">
        <div className="site-stack-section">
          <span className="site-eyebrow">Nova curadoria Solar</span>

          <div className="site-page-intro site-page-intro-hero max-w-[42rem]">
            <h1 className="site-text-display max-w-[11ch] text-[color:var(--site-color-foreground-strong)]">
              Escolhas certas para treinar, competir e comprar melhor.
            </h1>
            <p className="site-text-body site-readable-md text-lg">
              Produtos reais do catálogo, categorias bem resolvidas e uma vitrine pensada para deixar imagem, preço e próxima ação no lugar certo.
            </p>
          </div>

          <div className="site-action-cluster">
            <Link href="#featured-products" className="site-button-primary">
              Ver destaques
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/store" className="site-button-secondary">
              Abrir loja completa
            </Link>
          </div>

          <div className="site-action-cluster">
            {featuredCategories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/store?category=${category.id}`}
                className="site-button-ghost rounded-full bg-white/70 px-4 py-2 shadow-[var(--site-shadow-sm)] dark:bg-white/5"
              >
                {category.name}
                <span className="rounded-full bg-[color:var(--site-color-primary-soft)] px-2 py-0.5 text-[11px] font-semibold text-[color:var(--site-color-primary)]">
                  {category.count}
                </span>
              </Link>
            ))}
          </div>

          <dl className="grid gap-5 sm:grid-cols-3 sm:gap-6">
            <div>
              <dt className="site-text-meta uppercase tracking-[0.14em]">Catálogo ativo</dt>
              <dd className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[color:var(--site-color-foreground-strong)]">
                {productCount}+
              </dd>
            </div>
            <div>
              <dt className="site-text-meta uppercase tracking-[0.14em]">Categorias</dt>
              <dd className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[color:var(--site-color-foreground-strong)]">
                {categoryCount}
              </dd>
            </div>
            <div>
              <dt className="site-text-meta uppercase tracking-[0.14em]">Pagamento</dt>
              <dd className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[color:var(--site-color-foreground-strong)]">
                PIX e cartão
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-x-[12%] top-8 h-56 rounded-full bg-[radial-gradient(circle,var(--site-color-glow-primary-strong),transparent_68%)] blur-3xl" />
          <div className="overflow-hidden rounded-[2rem] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-strong)] shadow-[var(--site-shadow-lg)]">
            <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--site-color-surface-inset)]">
              <Image
                src={product?.image?.url || "/placeholder.svg"}
                alt={product?.image?.alt || product?.name || "Produto em destaque"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.22))]" />
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                <StatusBadge tone="accent">Escolha da semana</StatusBadge>
                {product?.featured ? <StatusBadge tone="info">Mais procurado</StatusBadge> : null}
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="site-text-meta uppercase tracking-[0.14em]">
                    {product?.categories[0]?.name || "Seleção Solar"}
                  </p>
                  <h2 className="mt-2 text-[clamp(1.7rem,2.6vw,2.4rem)] font-semibold leading-tight tracking-[-0.05em] text-[color:var(--site-color-foreground-strong)]">
                    {product?.name || "Destaques prontos para abrir a jornada de compra"}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="site-text-meta uppercase tracking-[0.14em]">Preço atual</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--site-color-foreground-strong)]">
                    {product ? formatProductPrice(product) : "Catálogo ativo"}
                  </p>
                </div>
              </div>

              <p className="site-text-body line-clamp-2 text-base">
                {summary ||
                  "Uma entrada mais aspiracional para a loja: imagem forte, leitura rápida e acesso direto ao produto real no catálogo."}
              </p>

              <div className="site-action-cluster">
                {(product?.categories ?? []).slice(0, 3).map((category) => (
                  <span
                    key={category.id}
                    className="rounded-full bg-[color:var(--site-color-interactive-muted)] px-3 py-1 text-xs font-medium text-[color:var(--site-color-foreground-muted)]"
                  >
                    {category.name}
                  </span>
                ))}
              </div>

              <div className="site-action-cluster pt-1">
                <Link href={product ? `/store/${product.id}` : "/store"} className="site-button-primary">
                  Ver produto
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={leadingCategory ? `/store?category=${leadingCategory.id}` : "/store"}
                  className="site-button-ghost"
                >
                  {leadingCategory ? `Explorar ${leadingCategory.name}` : "Explorar catálogo"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
