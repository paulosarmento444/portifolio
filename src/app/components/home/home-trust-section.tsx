import { CreditCard, Headphones, Truck } from "lucide-react";
import { SectionShell } from "@site/shared";

const trustItems = [
  {
    title: "Entrega para todo o Brasil",
    description: "Cobertura nacional para continuar a jornada de compra sem ruído entre vitrine, carrinho e checkout.",
    icon: Truck,
  },
  {
    title: "Pagamento simples e seguro",
    description: "PIX e cartão como caminhos naturais de fechamento, com leitura clara desde a vitrine.",
    icon: CreditCard,
  },
  {
    title: "Suporte próximo",
    description: "Conteúdo, páginas institucionais e atendimento aparecem no momento certo para apoiar a decisão.",
    icon: Headphones,
  },
];

export default function HomeTrustSection() {
  return (
    <SectionShell container="marketing" spacing="compact" stack="page">
      <div className="grid gap-4 rounded-[2rem] bg-white/80 px-6 py-6 shadow-[var(--site-shadow-md)] sm:grid-cols-3 sm:gap-5 sm:px-8 dark:bg-[color:var(--site-color-surface-strong)]">
        {trustItems.map(({ title, description, icon: Icon }) => (
          <div key={title} className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]">
              <Icon className="h-5 w-5" />
            </span>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                {title}
              </p>
              <p className="site-text-meta text-xs leading-5">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
