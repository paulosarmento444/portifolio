"use client";

import { ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { PageHeader, SectionShell, StatusBadge, TrustList } from "@site/shared";
import RegisterForm from "./register-form.component";

export function RegisterContainer() {
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
                  <UserPlus className="h-4 w-4" />
                  Cadastro
                </>
              }
              title="Crie sua conta para acompanhar compras e voltar ao checkout com contexto."
              description="O cadastro agora segue a linguagem premium da loja, com superfícies mais leves, contraste melhor e foco total na criação da conta."
            />

            <div className="flex flex-wrap gap-3">
              <StatusBadge tone="accent">
                <Sparkles className="h-3.5 w-3.5" />
                Conta pronta para checkout
              </StatusBadge>
              <StatusBadge tone="success">
                <ShieldCheck className="h-3.5 w-3.5" />
                Fluxo protegido
              </StatusBadge>
            </div>

            <TrustList
              items={[
                {
                  label: "Endereços e perfil",
                  description: "Salve seus dados uma vez e reutilize nos próximos pedidos.",
                  tone: "info",
                },
                {
                  label: "Histórico unificado",
                  description: "Todos os pedidos e estados de pagamento ficam acessíveis na conta.",
                  tone: "success",
                },
                {
                  label: "Menos fricção",
                  description: "Cadastro enxuto para chegar mais rápido ao catálogo e ao checkout.",
                  tone: "accent",
                },
              ]}
            />
          </div>

          <div className="flex justify-center xl:justify-end">
            <RegisterForm />
          </div>
        </div>
      </SectionShell>
    </main>
  );
}
