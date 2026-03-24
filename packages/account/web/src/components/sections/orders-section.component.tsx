"use client";

import { Calendar, CreditCard, Package, Receipt, Truck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AccountOrderSummaryView } from "@site/shared";
import {
  EmptyState,
  MetricRow,
  SecondaryButton,
  StatusBadge,
  SurfaceCard,
} from "@site/shared";

interface OrdersSectionProps {
  orders: AccountOrderSummaryView[];
}

export function OrdersSection({ orders }: OrdersSectionProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil((orders?.length || 0) / pageSize));
  const pagedOrders = (orders || []).slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const getStatusTone = (status: string) => {
    switch (status) {
      case "completed":
        return "success" as const;
      case "processing":
        return "warning" as const;
      case "shipped":
        return "info" as const;
      case "pending":
      case "on-hold":
        return "neutral" as const;
      default:
        return "neutral" as const;
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + order.total.amount, 0);
  const latestOrder = orders[0];

  return (
    <div className="site-stack-section">
      <div className="site-stack-panel">
        <p className="site-eyebrow">Pedidos</p>
        <h2 className="site-text-section-title">Histórico de compras</h2>
        <p className="site-text-body">
          Consulte status, total e forma de pagamento sem precisar percorrer telas densas.
        </p>
      </div>

      {orders.length > 0 ? (
        <MetricRow
          items={[
            {
              label: "Pedidos",
              value: orders.length,
              meta: "Histórico disponível",
            },
            {
              label: "Investimento",
              value: `R$ ${totalSpent.toFixed(2)}`,
              meta: "Soma aproximada dos pedidos",
            },
            {
              label: "Último pedido",
              value: latestOrder ? `#${latestOrder.number}` : "—",
              meta: latestOrder
                ? new Date(latestOrder.createdAt).toLocaleDateString("pt-BR")
                : "Sem compras",
            },
            {
              label: "Pagamentos",
              value: latestOrder?.paymentMethodTitle || "Variado",
              meta: "Método mais recente",
            },
          ]}
        />
      ) : null}

      {orders.length > 0 ? (
        <div className="site-stack-panel">
          {pagedOrders.map((order) => (
            <SurfaceCard key={order.id} tone="soft" className="site-stack-panel">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="site-text-card-title text-base">Pedido #{order.number}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <StatusBadge tone={getStatusTone(order.status.code)}>
                          {order.status.label}
                        </StatusBadge>
                        <span className="site-text-meta normal-case tracking-normal">
                          {order.items.length} item(ns)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-[color:var(--site-color-foreground-muted)]">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {order.paymentMethodTitle || "Pagamento não informado"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      {order.status.label}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:min-w-[12rem] lg:items-end">
                  <p className="site-text-card-title text-xl">
                    {order.total.formatted || `R$ ${order.total.amount.toFixed(2)}`}
                  </p>
                  <SecondaryButton
                    size="sm"
                    fullWidth
                    onClick={() => router.push(`/order-confirmation/${order.id}`)}
                  >
                    Ver detalhes
                  </SecondaryButton>
                </div>
              </div>

              {order.items.length > 0 ? (
                <div className="grid gap-3 border-t border-[color:var(--site-color-border)] pt-4 md:grid-cols-2">
                  {order.items.slice(0, 4).map((item, index) => (
                    <div
                      key={`${item.id ?? item.productId ?? index}`}
                      className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="site-text-card-title text-sm">{item.productName}</p>
                          <p className="site-text-meta mt-1 normal-case tracking-normal">
                            Quantidade {item.quantity}
                          </p>
                        </div>
                        <StatusBadge tone="neutral">
                          <Receipt className="h-3.5 w-3.5" />
                          {item.total.formatted || `R$ ${item.total.amount.toFixed(2)}`}
                        </StatusBadge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </SurfaceCard>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="Nenhum pedido encontrado"
          description="Quando uma compra for concluída, ela ficará listada aqui com status, forma de pagamento e itens."
          action={
            <SecondaryButton onClick={() => router.push("/store")}>
              Explorar produtos
            </SecondaryButton>
          }
        />
      )}
      {orders.length > pageSize && (
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <SecondaryButton
            size="sm"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </SecondaryButton>
          <span className="site-text-meta normal-case tracking-normal">
            Página {currentPage} de {totalPages}
          </span>
          <SecondaryButton
            size="sm"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </SecondaryButton>
        </div>
      )}
    </div>
  );
}
