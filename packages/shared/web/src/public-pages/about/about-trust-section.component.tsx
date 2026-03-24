import Link from "next/link";
import { ArrowRight, CircleHelp, PackageCheck, ShieldCheck } from "lucide-react";
import { InstitutionalSupportBlock, SectionShell, SurfaceCard, TrustList } from "../../ui";

export function AboutTrustSection() {
  return (
    <SectionShell container="marketing" spacing="default" stack="page">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]">
        <InstitutionalSupportBlock
          title="Por que essa loja inspira mais confianca"
          description="A experiencia institucional agora reforca as mesmas promessas que o cliente encontra no catalogo e no checkout."
          items={[
            {
              label: "Suporte antes e depois da compra",
              description: "O contato continua disponivel para comparacao, entrega, troca e acompanhamento.",
              icon: <CircleHelp className="h-4 w-4" />,
            },
            {
              label: "Fluxo comercial mais legivel",
              description: "Informacao, produto e acao aparecem em uma ordem mais natural para decidir sem pressa.",
              icon: <PackageCheck className="h-4 w-4" />,
            },
            {
              label: "Confianca no pagamento e no pos-venda",
              description: "Pagamento, pedido e atendimento seguem a mesma linguagem clara em toda a loja.",
              icon: <ShieldCheck className="h-4 w-4" />,
            },
          ]}
        />

        <div className="site-stack-section">
          <SurfaceCard tone="strong" className="site-stack-section">
            <div className="site-stack-panel gap-2">
              <p className="site-text-meta uppercase tracking-[0.14em]">Proximo passo</p>
              <h3 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
                Precisa de ajuda para escolher, comparar ou acompanhar um pedido?
              </h3>
              <p className="site-text-body text-sm">
                A pagina de contato agora esta mais organizada e preparada para receber o contexto certo da sua duvida.
              </p>
            </div>
            <div className="site-action-cluster">
              <Link href="/contact" className="site-button-primary">
                Falar com a equipe
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/store" className="site-button-secondary">
                Explorar a loja
              </Link>
            </div>
          </SurfaceCard>

          <TrustList
            items={[
              {
                label: "Leitura mais clara",
                description: "Textos com largura melhor controlada e blocos mais consistentes entre paginas.",
                tone: "info",
              },
              {
                label: "Jornada conectada",
                description: "Home, loja, blog e paginas institucionais agora falam a mesma lingua visual.",
                tone: "accent",
              },
            ]}
          />
        </div>
      </div>
    </SectionShell>
  );
}
