import { EditorialSurface, PageHeader, SectionShell } from "@site/shared";

interface ProductDescriptionProps {
  description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <SectionShell container="content" spacing="compact" stack="page">
      <PageHeader
        container="content"
        compact
        eyebrow="Descrição"
        title="Detalhes do produto"
        description="Informações complementares organizadas em um bloco editorial simples e legível."
      />

      <EditorialSurface compact>
        <div
          className="prose max-w-none text-[color:var(--site-color-foreground-muted)] prose-headings:text-[color:var(--site-color-foreground-strong)] prose-p:text-[color:var(--site-color-foreground-muted)] prose-li:text-[color:var(--site-color-foreground-muted)] prose-strong:text-[color:var(--site-color-foreground-strong)]"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </EditorialSurface>
    </SectionShell>
  );
}
