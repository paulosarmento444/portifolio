import Link from "next/link";
import { ArrowRight, BookOpenText, Store, Users } from "lucide-react";
import { SectionShell, StatusBadge } from "@site/shared";

const editorialItems = [
  {
    title: "Explorar o catálogo completo",
    description: "Entre por categorias, compare produtos e siga para o PDP com o mesmo ritmo visual da Home.",
    href: "/store",
    label: "Abrir loja",
    icon: Store,
  },
  {
    title: "Ler guias e novidades",
    description: "Conteúdo editorial para comparar melhor, descobrir lançamentos e comprar com mais contexto.",
    href: "/blog",
    label: "Ler conteúdos",
    icon: BookOpenText,
  },
  {
    title: "Conhecer a Solar",
    description: "Veja a proposta da marca e os canais principais antes de seguir a jornada institucional.",
    href: "/about",
    label: "Ver sobre",
    icon: Users,
  },
];

export default function HomeEditorialSection() {
  return (
    <SectionShell container="marketing" spacing="default" stack="page">
      <div className="overflow-hidden rounded-[2.4rem] bg-[linear-gradient(135deg,rgba(48,83,255,0.08),rgba(255,255,255,0.92)_42%,rgba(244,240,232,0.92)_100%)] px-6 py-8 shadow-[var(--site-shadow-md)] sm:px-8 sm:py-10 dark:bg-[linear-gradient(135deg,rgba(79,108,255,0.16),rgba(29,44,68,0.92)_42%,rgba(21,31,47,0.94)_100%)]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start lg:gap-10">
          <div className="site-stack-section max-w-xl">
            <StatusBadge tone="accent">Continuar explorando</StatusBadge>
            <div className="site-page-intro site-page-intro-hero">
              <h2 className="site-text-section-title max-w-[15ch] text-[color:var(--site-color-foreground-strong)]">
                A vitrine abre a compra, mas também deixa conteúdo e marca mais fáceis de navegar.
              </h2>
              <p className="site-text-body site-readable-sm text-base">
                O fechamento da Home fica mais leve e mais útil: seguir para a loja, aprofundar a pesquisa no blog ou entender melhor a Solar sem sensação de bloco institucional pesado.
              </p>
            </div>
            <div className="site-action-cluster">
              <Link href="/store" className="site-button-primary">
                Ir para a loja
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/blog" className="site-button-secondary">
                Ler conteúdos
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {editorialItems.map(({ title, description, href, label, icon: Icon }) => (
              <div
                key={title}
                className="flex flex-col gap-4 rounded-[1.7rem] bg-white/78 p-5 shadow-[var(--site-shadow-sm)] sm:flex-row sm:items-center sm:justify-between dark:bg-white/5"
              >
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="space-y-1.5">
                    <p className="text-base font-semibold text-[color:var(--site-color-foreground-strong)]">
                      {title}
                    </p>
                    <p className="site-text-body text-sm">{description}</p>
                  </div>
                </div>
                <Link href={href} className="site-button-ghost justify-start sm:justify-center">
                  {label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
