"use client";

import { Home, LogOut, MapPin, Package, Shield, User } from "lucide-react";
import { StatusBadge, SurfaceCard, cn } from "@site/shared";
import type { AccountMenu } from "../data/account.types";

interface AccountSidebarProps {
  selectedMenu: AccountMenu;
  onMenuClick: (menu: AccountMenu) => void;
  userName: string;
  userEmail?: string | null;
  roleLabel: string;
  orderCount: number;
  mobile?: boolean;
}

const menuItems: Array<{
  id: AccountMenu;
  label: string;
  icon: typeof Home;
  description: string;
}> = [
  {
    id: "welcome",
    label: "Início",
    icon: Home,
    description: "Resumo da conta e atalhos principais.",
  },
  {
    id: "orders",
    label: "Pedidos",
    icon: Package,
    description: "Histórico, status e acompanhamento dos pedidos.",
  },
  {
    id: "account",
    label: "Conta",
    icon: User,
    description: "Dados pessoais, e-mail e segurança da conta.",
  },
  {
    id: "addresses",
    label: "Endereços",
    icon: MapPin,
    description: "Cobrança e entrega para próximas compras.",
  },
  {
    id: "logout",
    label: "Sair",
    icon: LogOut,
    description: "Encerrar a sessão atual com segurança.",
  },
];

export function AccountSidebar({
  selectedMenu,
  onMenuClick,
  userName,
  userEmail,
  roleLabel,
  orderCount,
  mobile = false,
}: AccountSidebarProps) {
  return (
    <SurfaceCard
      tone="strong"
      className={cn("site-stack-section", !mobile && "sticky top-28")}
    >
      <div className="site-stack-panel border-b border-[color:var(--site-color-border)] pb-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="site-text-card-title text-base">{userName}</p>
            <p className="site-text-meta truncate">{userEmail || "Conta do cliente"}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <StatusBadge tone="info">
          <Shield className="h-3.5 w-3.5" />
          {roleLabel}
        </StatusBadge>
        <StatusBadge tone="neutral">
          <Package className="h-3.5 w-3.5" />
          {orderCount} pedido{orderCount === 1 ? "" : "s"}
        </StatusBadge>
      </div>
      <nav className="site-stack-panel" aria-label="Seções da conta">
        {menuItems.map((item) => {
          const isActive = selectedMenu === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onMenuClick(item.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-[var(--site-radius-lg)] border text-left transition-colors",
                mobile ? "px-4 py-3.5" : "px-4 py-3",
                isActive
                  ? "border-[color:var(--site-color-primary-soft)] bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-foreground-strong)]"
                  : "border-transparent bg-transparent text-[color:var(--site-color-foreground)] hover:border-[color:var(--site-color-border)] hover:bg-[color:var(--site-color-surface-inset)]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex shrink-0 items-center justify-center rounded-full border",
                  mobile ? "h-11 w-11" : "h-10 w-10",
                  isActive
                    ? "border-[color:var(--site-color-primary-soft)] bg-[color:var(--site-color-surface)] text-[color:var(--site-color-primary)] shadow-[var(--site-shadow-sm)]"
                    : "border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] text-[color:var(--site-color-foreground-muted)]",
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block site-text-card-title text-base">{item.label}</span>
                <span className="mt-1 block site-text-meta normal-case tracking-normal">
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </SurfaceCard>
  );
}
