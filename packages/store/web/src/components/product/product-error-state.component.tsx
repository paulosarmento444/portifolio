import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { EmptyState, SectionShell } from "@site/shared";

interface ProductErrorStateProps {
  error: string;
}

export function ProductErrorState({ error }: ProductErrorStateProps) {
  return (
    <div className="site-page-shell">
      <SectionShell container="utility" spacing="hero" stack="page">
        <EmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          eyebrow="Falha de carregamento"
          title="Não foi possível abrir este produto agora."
          description={error}
          action={<Link href="/store" className="site-button-primary">Voltar para a loja</Link>}
        />
      </SectionShell>
    </div>
  );
}
