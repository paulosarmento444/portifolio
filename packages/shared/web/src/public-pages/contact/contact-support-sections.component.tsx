import { AlertCircle, Mail, PackageSearch, PhoneCall } from "lucide-react";
import { InstitutionalSupportBlock, StatusBadge, SurfaceCard } from "../../ui";

export function ContactSupportSections() {
  return (
    <div className="site-stack-section" id="contact-support">
      <InstitutionalSupportBlock
        title="Canais de suporte"
        description="Escolha o canal que faz mais sentido para o momento. O formulario continua sendo o melhor caminho para contexto completo."
        items={[
          {
            label: "Telefone",
            description: "+55 (11) 9999-9999",
            icon: <PhoneCall className="h-4 w-4" />,
            action: (
              <a href="tel:+5511999999999" className="site-button-secondary">
                Ligar
              </a>
            ),
          },
          {
            label: "E-mail",
            description: "contato@loja.com",
            icon: <Mail className="h-4 w-4" />,
            action: (
              <a href="mailto:contato@loja.com" className="site-button-secondary">
                Escrever
              </a>
            ),
          },
          {
            label: "Pedido e entrega",
            description: "Inclua numero do pedido e produto para acelerar a analise.",
            icon: <PackageSearch className="h-4 w-4" />,
          },
        ]}
      />

      <SurfaceCard tone="soft" className="site-stack-section">
        <div className="site-action-cluster">
          <StatusBadge tone="warning">
            <AlertCircle className="h-3.5 w-3.5" />
            Antes de enviar
          </StatusBadge>
        </div>
        <div className="site-stack-panel gap-2">
          <h3 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
            Quanto mais contexto, mais objetivo fica o retorno.
          </h3>
          <p className="site-text-body site-readable-sm text-sm">
            Para duvidas sobre pedidos, inclua numero da compra, produto e uma descricao curta do que aconteceu. Para orientacao antes da compra, descreva uso, tamanho, modalidade ou qualquer restricao importante.
          </p>
        </div>
        <ul className="grid gap-3 text-sm text-[color:var(--site-color-foreground)]">
          <li className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-4 py-3">
            Produto ou categoria sobre a qual voce precisa de ajuda.
          </li>
          <li className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-4 py-3">
            Numero do pedido, quando a duvida for de entrega, troca ou pos-venda.
          </li>
          <li className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-4 py-3">
            Janela de horario ou melhor forma de retorno, se voce precisar de contato ativo da equipe.
          </li>
        </ul>
      </SurfaceCard>
    </div>
  );
}
