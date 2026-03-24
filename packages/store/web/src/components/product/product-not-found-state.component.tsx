import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { EmptyState, SectionShell } from "@site/shared";

export function ProductNotFoundState() {
  return (
    <div className="site-page-shell">
      <SectionShell container="utility" spacing="hero" stack="page">
        <EmptyState
          icon={<PackageSearch className="h-6 w-6" />}
          eyebrow="Produto não encontrado"
          title="Este item não está mais disponível no catálogo."
          description="Você pode continuar navegando pela loja e abrir outra categoria ou produto sem sair do fluxo principal."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/store" className="site-button-primary">Explorar catálogo</Link>
              <Link href="/" className="site-button-secondary">Voltar para a home</Link>
            </div>
          }
        />
      </SectionShell>
    </div>
  );
}
