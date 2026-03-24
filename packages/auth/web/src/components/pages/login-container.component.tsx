"use client";

import { LockKeyhole, ShieldCheck, ShoppingBag } from "lucide-react";
import { PageHeader, SectionShell, StatusBadge, TrustList } from "@site/shared";
import LoginForm from "./login-form.component";

export function LoginContainer() {
  return (
    <main className="site-page-shell site-page-shell-compact site-shell-background">
      <SectionShell container="utility" spacing="hero" stack="page" className="pb-16">
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(26rem,32rem)]">
          <div className="site-stack-section">
            <PageHeader
              container="utility"
              className="px-0 pt-0 pb-0"
              eyebrow={
                <>
                  <LockKeyhole className="h-4 w-4" />
                  Acesso da conta
                </>
              }
              title="Entre para retomar pedidos, pagamentos e endereços sem ruído visual."
              description="O acesso agora segue a mesma linguagem calma da vitrine: mais clareza, menos efeitos e mais foco no que importa."
            />

            <div className="flex flex-wrap gap-3">
              <StatusBadge tone="success">
                <ShieldCheck className="h-3.5 w-3.5" />
                Sessão protegida
              </StatusBadge>
              <StatusBadge tone="info">
                <ShoppingBag className="h-3.5 w-3.5" />
                Retome o checkout depois
              </StatusBadge>
            </div>

            <TrustList
              items={[
                {
                  label: "Pedidos e histórico",
                  description: "Acompanhe compras, pagamentos e confirmações em um painel único.",
                  tone: "info",
                },
                {
                  label: "Endereços salvos",
                  description: "Use seus dados anteriores para acelerar próximos checkouts.",
                  tone: "accent",
                },
                {
                  label: "Pagamento rastreável",
                  description: "Continue PIX ou cartão sem perder o vínculo com o pedido.",
                  tone: "success",
                },
              ]}
            />
          </div>

          <div className="flex justify-center xl:justify-end">
            <LoginForm />
          </div>
        </div>
      </SectionShell>
    </main>
  );
}
