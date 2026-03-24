"use client";

import { ArrowRight, Package, User } from "lucide-react";
import type { AccountOrderSummaryView, AuthUserView } from "@site/shared";
import {
  EmptyState,
  MetricRow,
  SecondaryButton,
  StatusBadge,
  SurfaceCard,
} from "@site/shared";
import type { AccountMenu } from "../../lib/account.types";

interface WelcomeSectionProps {
  viewer: AuthUserView;
  orders: AccountOrderSummaryView[];
  onNavigate: (menu: AccountMenu) => void;
}

export function WelcomeSection({ viewer, orders, onNavigate }: WelcomeSectionProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const latestOrder = orders[0];

  const stats = [
    {
      label: "Total de Pedidos",
      value: orders.length,
      meta: "Histórico completo da conta",
    },
    {
      label: "Este Mês",
      value: orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      }).length,
      meta: "Compras recentes",
    },
    {
      label: "Perfil",
      value: viewer.roleLabels[0] || "Cliente",
      meta: "Nível atual da conta",
    },
    {
      label: "Último pedido",
      value: latestOrder ? `#${latestOrder.number}` : "Sem pedidos",
      meta: latestOrder
        ? new Date(latestOrder.createdAt).toLocaleDateString("pt-BR")
        : "Histórico ainda vazio",
    },
  ];

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="site-stack-section">
      <div className="site-stack-panel">
        <p className="site-eyebrow">Visão geral</p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="site-text-section-title">Bem-vindo de volta, {viewer.displayName}</h2>
            <p className="site-text-body mt-3">
              Aqui estão os principais atalhos da sua conta e um resumo rápido das compras recentes.
            </p>
          </div>
          <StatusBadge tone="info">
            <User className="h-3.5 w-3.5" />
            {viewer.roleLabels[0] || "Cliente"}
          </StatusBadge>
        </div>
      </div>

      <MetricRow items={stats} />

      {recentOrders.length > 0 ? (
        <SurfaceCard tone="soft" className="site-stack-section">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="site-text-card-title">Pedidos recentes</h3>
              <p className="site-text-body text-sm">Os últimos pedidos feitos na sua conta.</p>
            </div>
            <SecondaryButton
              size="sm"
              onClick={() => onNavigate("orders")}
              trailingIcon={<ArrowRight className="h-4 w-4" />}
            >
              Ver todos
            </SecondaryButton>
          </div>
          <div className="grid gap-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-3 rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="site-text-card-title text-base">Pedido #{order.number}</p>
                  <p className="site-text-meta mt-1 normal-case tracking-normal">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")} • {order.items.length} item(ns)
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                  <StatusBadge tone="neutral">{order.status.label}</StatusBadge>
                  <p className="site-text-card-title text-base">
                    {order.total.formatted || `R$ ${order.total.amount.toFixed(2)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      ) : (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="Você ainda não fez nenhum pedido"
          description="Assim que um pedido for finalizado, ele aparecerá aqui para acesso rápido."
          action={<SecondaryButton onClick={() => onNavigate("orders")}>Ir para pedidos</SecondaryButton>}
        />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <SurfaceCard tone="soft" padding="compact" className="site-stack-panel">
          <p className="site-text-card-title text-base">Pedidos</p>
          <p className="site-text-body text-sm">
            Acompanhe o histórico, o pagamento e o status de entrega.
          </p>
          <SecondaryButton size="sm" onClick={() => onNavigate("orders")}>
            Ver histórico
          </SecondaryButton>
        </SurfaceCard>
        <SurfaceCard tone="soft" padding="compact" className="site-stack-panel">
          <p className="site-text-card-title text-base">Conta</p>
          <p className="site-text-body text-sm">
            Atualize nome, e-mail e senha a partir de um fluxo único.
          </p>
          <SecondaryButton size="sm" onClick={() => onNavigate("account")}>
            Editar perfil
          </SecondaryButton>
        </SurfaceCard>
        <SurfaceCard tone="soft" padding="compact" className="site-stack-panel">
          <p className="site-text-card-title text-base">Endereços</p>
          <p className="site-text-body text-sm">
            Mantenha cobrança e entrega prontas para o próximo checkout.
          </p>
          <SecondaryButton size="sm" onClick={() => onNavigate("addresses")}>
            Gerenciar endereços
          </SecondaryButton>
        </SurfaceCard>
      </div>
    </div>
  );
}
