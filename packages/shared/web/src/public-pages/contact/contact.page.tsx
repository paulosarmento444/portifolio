import Link from "next/link";
import { ArrowRight, Headphones, Mail, PhoneCall } from "lucide-react";
import { BreadcrumbTrail, EditorialIntro, InstitutionalSupportBlock, SectionShell } from "../../ui";
import { ContactFormCard } from "./contact-form-card.component";
import { ContactSupportSections } from "./contact-support-sections.component";

export function PublicContactPage() {
  return (
    <main className="site-page-shell site-page-shell-compact">
      <SectionShell container="marketing" spacing="hero" stack="page">
        <div className="site-stack-section">
          <BreadcrumbTrail
            items={[
              { label: "Home", href: "/" },
              { label: "Contato", current: true },
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
                <Headphones className="h-4 w-4" />
                Suporte da loja
              </>
            }
            title="Fale com a equipe para tirar duvidas antes da compra ou resolver o pos-venda com mais clareza."
            description="A pagina de contato agora organiza melhor canais, horario de atendimento e o formulario principal, para que cada pedido de ajuda chegue com mais contexto e menos ruido."
            density="hero"
            contentWidth="lg"
            descriptionWidth="sm"
            actions={
              <>
                <a href="#contact-form" className="site-button-primary">
                  Enviar mensagem
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#contact-support" className="site-button-secondary">
                  Ver canais de suporte
                </a>
              </>
            }
            aside={
              <InstitutionalSupportBlock
                compact
                title="Atendimento confiavel"
                description="Canais claros, horario definido e retorno humano para duvidas de compra, entrega e suporte."
                items={[
                  {
                    label: "Telefone",
                    description: "+55 (11) 9999-9999",
                    icon: <PhoneCall className="h-4 w-4" />,
                  },
                  {
                    label: "E-mail",
                    description: "contato@loja.com",
                    icon: <Mail className="h-4 w-4" />,
                  },
                ]}
              />
            }
          />
        </div>
      </SectionShell>

      <SectionShell container="utility" spacing="default" stack="page">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)] xl:gap-8">
          <ContactSupportSections />
          <ContactFormCard id="contact-form" />
        </div>
      </SectionShell>
    </main>
  );
}
