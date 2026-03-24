import { Heart, Shield, Target, Trophy, Users, Zap } from "lucide-react";
import { PageHeader, SectionShell, SurfaceCard } from "../../ui";

const values = [
  {
    icon: Target,
    title: "Curadoria com criterio",
    description:
      "O catalogo prioriza utilidade real, marcas confiaveis e leitura clara para comparar melhor.",
    accentClassName:
      "bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]",
  },
  {
    icon: Heart,
    title: "Atendimento humano",
    description:
      "A orientacao continua depois da compra, com suporte proximo para reduzir atrito e retrabalho.",
    accentClassName:
      "bg-[color:var(--site-color-danger-soft)] text-[color:var(--site-color-danger-text)]",
  },
  {
    icon: Shield,
    title: "Confianca operacional",
    description:
      "Entrega, pagamento e comunicacao seguem a mesma expectativa de clareza da vitrine.",
    accentClassName:
      "bg-[color:var(--site-color-info-soft)] text-[color:var(--site-color-info-text)]",
  },
  {
    icon: Users,
    title: "Compra com contexto",
    description:
      "Loja, blog e paginas institucionais trabalham juntas para responder perguntas antes que elas virem friccao.",
    accentClassName:
      "bg-[color:var(--site-color-secondary-soft)] text-[color:var(--site-color-secondary)]",
  },
  {
    icon: Zap,
    title: "Selecao atualizada",
    description:
      "Novidades entram quando fazem sentido para o cliente, nao apenas para encher prateleira.",
    accentClassName:
      "bg-[color:var(--site-color-success-soft)] text-[color:var(--site-color-success-text)]",
  },
  {
    icon: Trophy,
    title: "Experiencia completa",
    description:
      "Performance comercial e suporte pos-venda sao tratados como partes da mesma jornada.",
    accentClassName:
      "bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]",
  },
] as const;

export function AboutValuesGrid() {
  return (
    <SectionShell container="marketing" spacing="default" stack="page">
      <PageHeader
        container="marketing"
        align="center"
        eyebrow="Principios da marca"
        title="A marca existe para organizar melhor a descoberta, a compra e o suporte."
        description="Cada principio abaixo conecta curadoria, linguagem visual e atendimento em uma experiencia mais clara para quem compra."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {values.map((value) => (
          <SurfaceCard key={value.title} tone="default" className="site-stack-section">
            <div
              className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${value.accentClassName}`}
            >
              <value.icon className="h-5 w-5" />
            </div>
            <div className="site-stack-panel">
              <h3 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
                {value.title}
              </h3>
              <p className="site-text-body">{value.description}</p>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </SectionShell>
  );
}
