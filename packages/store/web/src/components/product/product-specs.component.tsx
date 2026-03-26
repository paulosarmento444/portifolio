import { PageHeader, SectionShell, SurfaceCard, StatusBadge } from "@site/shared";
import type { StoreProductDetail } from "../../data/store.types";

interface ProductSpecsProps {
  product: StoreProductDetail;
}

export function ProductSpecs({ product }: ProductSpecsProps) {
  const highlights = [
    {
      title: "Compra mais orientada",
      description: "Preço, disponibilidade e variações ocupam o primeiro plano da página.",
    },
    {
      title: "Informação em camadas",
      description: "Descrição e atributos técnicos aparecem abaixo, como apoio à decisão.",
    },
    {
      title: "Fluxo de compra direto",
      description: "Menos ornamento visual e mais foco na seleção e no CTA principal.",
    },
  ];

  return (
    <SectionShell container="commerce" spacing="compact" stack="page">
      <PageHeader
        container="commerce"
        compact
        eyebrow="Especificações"
        title="O que observar antes de fechar a compra"
        description="Blocos objetivos para manter apoio técnico e sinais de confiança sem competir com a área de compra."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {highlights.map((item) => (
          <SurfaceCard key={item.title} tone="soft" padding="compact" className="site-stack-panel">
            <h3 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
              {item.title}
            </h3>
            <p className="site-text-body text-sm">{item.description}</p>
          </SurfaceCard>
        ))}
      </div>

      {product.attributes.length > 0 ? (
        <SurfaceCard tone="default" className="site-stack-section">
          <div className="site-stack-panel">
            <h3 className="site-text-section-title text-[color:var(--site-color-foreground-strong)]">
              Atributos técnicos
            </h3>
            <p className="site-text-body">
              Informações organizadas para consulta rápida sem poluir a decisão principal de compra.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {product.attributes.map((attribute) => (
              <SurfaceCard
                key={`${attribute.id ?? attribute.name}`}
                tone="soft"
                padding="compact"
                className="site-stack-panel"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
                    {attribute.name}
                  </h4>
                  {attribute.type ? <StatusBadge tone="neutral">{attribute.type}</StatusBadge> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {attribute.options.map((option, optionIndex) => (
                    <StatusBadge key={`${attribute.name}-${optionIndex}`} tone="neutral">
                      {option}
                    </StatusBadge>
                  ))}
                  {!attribute.options.length && attribute.value ? (
                    <StatusBadge tone="neutral">{attribute.value}</StatusBadge>
                  ) : null}
                </div>
              </SurfaceCard>
            ))}
          </div>
        </SurfaceCard>
      ) : null}
    </SectionShell>
  );
}
