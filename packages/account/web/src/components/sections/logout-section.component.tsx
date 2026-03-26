"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, LogOut, Shield } from "lucide-react";
import { PrimaryButton, SecondaryButton, SurfaceCard } from "@site/shared";
import { logoutAccountAction } from "../../data/actions/account.actions";

interface LogoutSectionProps {
  onCancel: () => void;
}

export function LogoutSection({ onCancel }: LogoutSectionProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutAccountAction();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="site-stack-section">
      <div className="site-stack-panel">
        <p className="site-eyebrow">Sessão</p>
        <h2 className="site-text-section-title">Encerrar sessão</h2>
        <p className="site-text-body">
          Saia da conta com segurança quando terminar de revisar pedidos e dados pessoais.
        </p>
      </div>

      <SurfaceCard tone="soft" className="site-stack-panel">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--site-color-secondary-soft)] text-[color:var(--site-color-secondary)]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="site-text-card-title text-base">Atenção antes de sair</h3>
            <p className="site-text-body mt-2 text-sm">
              Você precisará entrar novamente para acessar pedidos, endereços e continuar compras em dispositivos compartilhados.
            </p>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard tone="soft" className="site-stack-section">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="site-text-card-title text-base">Boas práticas</h3>
            <p className="site-text-body text-sm">
              Proteja sua conta sempre que estiver usando equipamentos públicos ou compartilhados.
            </p>
          </div>
        </div>
        <ul className="site-stack-panel text-sm text-[color:var(--site-color-foreground-muted)]">
          <li>Sempre faça logout em computadores públicos.</li>
          <li>Evite salvar senhas em dispositivos que não são seus.</li>
        </ul>
      </SurfaceCard>

      <div className="flex flex-col gap-3 sm:flex-row">
        <PrimaryButton
          onClick={handleLogout}
          disabled={isLoggingOut}
          leadingIcon={<LogOut className="h-4 w-4" />}
        >
          {isLoggingOut ? "Saindo..." : "Confirmar logout"}
        </PrimaryButton>
        <SecondaryButton onClick={onCancel}>Voltar ao painel</SecondaryButton>
      </div>
    </div>
  );
}
