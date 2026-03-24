import Link from "next/link";
import { ArrowLeft, LogIn, ShoppingCart, UserPlus } from "lucide-react";
import { SectionShell, SurfaceCard, cn, ecommerceButtonStyles } from "@site/shared";

export function CartLoginError() {
  return (
    <div className="site-shell-background">
      <SectionShell
        container="utility"
        spacing="hero"
        stack="section"
        className="min-h-[calc(100vh-12rem)] justify-center"
        contentClassName="max-w-xl"
      >
        <SurfaceCard tone="strong" className="site-stack-section text-center">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--site-color-border)] bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <div className="site-stack-panel">
            <h1 className="site-text-section-title">Entre para acessar seu carrinho</h1>
            <p className="site-text-body">
              O checkout precisa de uma conta ativa para salvar endereço, acompanhar pagamentos e registrar seus pedidos com segurança.
            </p>
          </div>
          <div className="grid gap-3">
            <Link href="/auth/login" className={cn(ecommerceButtonStyles.primary, "w-full justify-center")}>
              <LogIn className="h-4 w-4" />
              Fazer login
            </Link>
            <Link href="/auth/register" className={cn(ecommerceButtonStyles.secondary, "w-full justify-center")}>
              <UserPlus className="h-4 w-4" />
              Criar conta
            </Link>
            <Link href="/store" className={cn(ecommerceButtonStyles.ghost, "w-full justify-center")}>
              <ArrowLeft className="h-4 w-4" />
              Voltar às compras
            </Link>
          </div>
        </SurfaceCard>
      </SectionShell>
    </div>
  );
}
