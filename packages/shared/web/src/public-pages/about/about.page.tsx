import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import {
  BreadcrumbTrail,
  EditorialIntro,
  MerchandisingFeature,
  MetricRow,
  SectionShell,
  StatusBadge,
  SurfaceCard,
} from "../../ui";
import { AboutTrustSection } from "./about-trust-section.component";
import { AboutValuesGrid } from "./about-values-grid.component";

export function PublicAboutPage() {
  return (
    <main className="site-page-shell site-page-shell-compact">
      <SectionShell container="marketing" spacing="hero" stack="page">
        <div className="site-stack-section">
          <BreadcrumbTrail
            items={[
              { label: "Home", href: "/" },
              { label: "Sobre", current: true },
            ]}
            renderLink={(item, className) => (
              <Link href={item.href || "/"} className={className}>
                {item.label}
              </Link>
            )}
          />

          <EditorialIntro
            eyebrow={
              <>
                <Compass className="h-4 w-4" />
                Sobre a marca
              </>
            }
            title="Uma loja feita para vender com mais contexto, menos ruido e mais confianca."
            description="A Solar Esportes conecta curadoria, conteudo e suporte para que a descoberta de produtos aconteca com a mesma clareza da decisao de compra."
            density="hero"
            contentWidth="lg"
            descriptionWidth="sm"
            actions={
              <>
                <Link href="/store" className="site-button-primary">
                  Explorar a loja
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="site-button-secondary">
                  Falar com a equipe
                </Link>
              </>
            }
            meta={
              <>
                <span>Curadoria, conteudo e suporte em uma so jornada</span>
                <span className="text-[color:var(--site-color-border-strong)]">•</span>
                <span>Leitura institucional alinhada ao storefront</span>
              </>
            }
            aside={
              <SurfaceCard tone="soft" className="site-stack-section">
                <MetricRow
                  className="xl:grid-cols-1"
                  items={[
                    {
                      label: "Experiencia",
                      value: "10+ anos",
                      meta: "Apoiando compra e pos-venda com clareza.",
                    },
                    {
                      label: "Clientes",
                      value: "50K+",
                      meta: "Compradores e atletas atendidos ao longo da jornada.",
                    },
                    {
                      label: "Catalogo",
                      value: "1000+",
                      meta: "Produtos organizados para leitura e comparacao rapida.",
                    },
                  ]}
                />
              </SurfaceCard>
            }
          />
        </div>
      </SectionShell>

      <SectionShell container="marketing" spacing="compact" stack="page">
        <MerchandisingFeature
          eyebrow="Nossa proposta"
          title="A vitrine melhora quando a marca organiza bem o que vende, o que explica e como responde."
          description="Esta pagina passa a contar a historia da marca de forma mais calma e util: menos blocos desconectados, mais coerencia entre o que a loja promete e o que o cliente encontra em cada etapa."
          highlights={
            <>
              <StatusBadge tone="accent">
                <Sparkles className="h-3.5 w-3.5" />
                Curadoria premium
              </StatusBadge>
              <StatusBadge tone="success">
                <ShieldCheck className="h-3.5 w-3.5" />
                Atendimento consultivo
              </StatusBadge>
            </>
          }
          media={
            <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(var(--site-radius-xl)+0.25rem)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-soft)] shadow-[var(--site-shadow-sm)]">
              <Image
                src="/loja.webp?height=500&width=400"
                alt="Interior da loja Solar Esportes"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
                unoptimized
              />
            </div>
          }
        />
      </SectionShell>

      <AboutValuesGrid />
      <AboutTrustSection />
    </main>
  );
}
