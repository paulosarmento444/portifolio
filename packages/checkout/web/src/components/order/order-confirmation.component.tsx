"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    AlertCircle,
    Check,
    Clock3,
    Copy,
    CreditCard,
    History,
    MapPin,
    MessageSquareText,
    Package,
    PackageSearch,
    Percent,
} from "lucide-react";
import type {
    MercadoPagoHeadlessConfig,
    MercadoPagoOrderPaymentState,
} from "@site/integrations/payments";
import type {
    CheckoutOrderConfirmationView,
    CheckoutOrderTrackingState,
} from "@site/shared";
import {
    MetricRow,
    OverlaySection,
    PageHeader,
    ProgressStepper,
    SectionShell,
    StatusBadge,
    SurfaceCard,
    TrustList,
    cn,
    ecommerceButtonStyles,
} from "@site/shared";
import { OrderPaymentPanel } from "./order-payment-panel.component";

interface OrderConfirmationViewProps {
    order: CheckoutOrderConfirmationView;
    paymentConfig: MercadoPagoHeadlessConfig | null;
    initialPaymentState: MercadoPagoOrderPaymentState | null;
}

const resolveOrderTone = (statusCode: string) => {
    if (["completed", "processing"].includes(statusCode)) {
        return "success" as const;
    }

    if (["cancelled", "refunded", "failed"].includes(statusCode)) {
        return "danger" as const;
    }

    return "warning" as const;
};

const renderAddress = (
    address: CheckoutOrderConfirmationView["shippingAddress"],
) =>
    [
        `${address.firstName} ${address.lastName}`.trim(),
        address.addressLine1,
        address.addressLine2,
        `${address.city} - ${address.state}`.trim(),
        address.postcode,
        address.email,
        address.phone,
    ].filter(Boolean);

const formatTrackingDateTime = (value?: string) => {
    if (!value) {
        return undefined;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return undefined;
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(parsedDate);
};

const resolveTrackingTone = (
    state: CheckoutOrderTrackingState,
) => {
    switch (state) {
        case "available":
            return "success" as const;
        case "ineligible":
            return "warning" as const;
        case "error":
            return "danger" as const;
        default:
            return "info" as const;
    }
};

export function OrderConfirmationView({
    order,
    paymentConfig,
    initialPaymentState,
}: OrderConfirmationViewProps) {
    const [currentOrder, setCurrentOrder] = useState(order);
    const [copiedTracking, setCopiedTracking] = useState(false);

    useEffect(() => {
        setCurrentOrder(order);
    }, [order]);

    useEffect(() => {
        if (!copiedTracking) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setCopiedTracking(false);
        }, 1800);

        return () => window.clearTimeout(timeoutId);
    }, [copiedTracking]);

    const statusTone = resolveOrderTone(currentOrder.status.code);
    const paymentResolved = ["completed", "processing"].includes(
        currentOrder.status.code,
    );
    const trackingCode = currentOrder.trackingCode?.trim() || undefined;
    const trackingUrl = currentOrder.trackingUrl?.trim() || undefined;
    const tracking = currentOrder.tracking ?? null;
    const customerNote = currentOrder.customerNote?.trim() || undefined;
    const hasTrackingHistory =
        tracking?.state === "available" && tracking.history.length > 0;
    const latestTrackingUpdateLabel = formatTrackingDateTime(
        tracking?.lastUpdatedAt,
    );
    const hasOrderUpdates = Boolean(trackingCode || customerNote || tracking);

    const handleCopyTracking = async () => {
        if (!trackingCode || !navigator.clipboard?.writeText) {
            return;
        }

        try {
            await navigator.clipboard.writeText(trackingCode);
            setCopiedTracking(true);
        } catch {
            setCopiedTracking(false);
        }
    };

    return (
        <div className="site-shell-background">
            <PageHeader
                container="commerce"
                className="pt-28 pb-4"
                eyebrow={
                    <StatusBadge tone={statusTone}>
                        Pedido #{currentOrder.orderNumber}
                    </StatusBadge>
                }
                title="Pedido confirmado"
                description={`Seu pedido foi registrado com status ${currentOrder.status.label.toLowerCase()}. Você pode acompanhar o andamento, revisar o pagamento e consultar os detalhes abaixo.`}
                actions={
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/my-account?menu=orders"
                            className={cn(
                                ecommerceButtonStyles.secondary,
                                "justify-center",
                            )}
                        >
                            Ver meus pedidos
                        </Link>
                        <Link
                            href="/store"
                            className={cn(
                                ecommerceButtonStyles.ghost,
                                "justify-center",
                            )}
                        >
                            Continuar comprando
                        </Link>
                    </div>
                }
            />

            <SectionShell
                container="commerce"
                spacing="compact"
                stack="page"
                className="pb-16"
            >
                <ProgressStepper
                    steps={[
                        {
                            label: "Pedido recebido",
                            description: `#${currentOrder.orderNumber}`,
                            status: "complete",
                        },
                        {
                            label: "Pagamento",
                            description: paymentResolved
                                ? "Confirmado"
                                : "Aguardando ação",
                            status: paymentResolved ? "complete" : "current",
                        },
                        {
                            label: "Acompanhamento",
                            description: "Disponível na sua conta",
                            status: paymentResolved ? "current" : "upcoming",
                        },
                    ]}
                />

                <MetricRow
                    items={[
                        {
                            label: "Pedido",
                            value: `#${currentOrder.orderNumber}`,
                            meta: "Registrado com sucesso",
                        },
                        {
                            label: "Data",
                            value: new Date(
                                currentOrder.createdAt,
                            ).toLocaleDateString("pt-BR"),
                            meta: "Criação do pedido",
                        },
                        {
                            label: "Pagamento",
                            value:
                                currentOrder.paymentMethodTitle ||
                                "Pagamento pendente",
                            meta: paymentResolved
                                ? "Confirmado pelo WooCommerce"
                                : "Aguardando conclusão",
                        },
                        {
                            label: "Status",
                            value: currentOrder.status.label,
                            meta: "Atualização mais recente",
                        },
                    ]}
                />

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,1fr)] xl:items-start">
                    <div
                        className="site-stack-section min-w-0"
                        data-testid="order-confirmation-primary-column"
                    >
                        <SurfaceCard tone="strong" className="site-stack-section">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="site-text-section-title text-[color:var(--site-color-foreground-strong)]">
                                        Itens do pedido
                                    </h2>
                                    <p className="site-text-body text-sm">
                                        Revise os produtos registrados no pedido e o
                                        valor total cobrado.
                                    </p>
                                </div>
                                <StatusBadge tone="accent">
                                    {currentOrder.items.length} itens
                                </StatusBadge>
                            </div>

                            <div className="site-stack-section">
                                {currentOrder.items.map((item, index) => (
                                    <div
                                        key={`${item.productId ?? index}`}
                                        className="flex flex-col gap-4 rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 overflow-hidden rounded-[var(--site-radius-lg)] bg-[color:var(--site-color-surface)]">
                                                {item.image?.url ? (
                                                    <div className="relative h-full w-full">
                                                        <Image
                                                            src={item.image.url}
                                                            alt={item.name}
                                                            fill
                                                            sizes="64px"
                                                            unoptimized
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-[color:var(--site-color-foreground-muted)]">
                                                        <Package className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="site-stack-panel">
                                                <h3 className="text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                                                    {item.name}
                                                </h3>
                                                <p className="site-text-meta">
                                                    Quantidade: {item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="site-text-meta">
                                                Total do item
                                            </p>
                                            <p className="text-base font-semibold text-[color:var(--site-color-foreground-strong)]">
                                                {item.total.formatted}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <OverlaySection
                                title="Resumo financeiro"
                                description="Total final do pedido e eventual cupom aplicado."
                            >
                                <div className="flex items-center justify-between text-sm text-[color:var(--site-color-foreground-muted)]">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-[color:var(--site-color-foreground)]">
                                        {currentOrder.total.formatted}
                                    </span>
                                </div>
                                {currentOrder.couponCode &&
                                currentOrder.couponDiscount ? (
                                    <div className="flex items-center justify-between text-sm text-[color:var(--site-color-success)]">
                                        <span className="inline-flex items-center gap-2">
                                            <Percent className="h-4 w-4" /> Cupom (
                                            {currentOrder.couponCode})
                                        </span>
                                        <span className="font-medium">
                                            -{" "}
                                            {currentOrder.couponDiscount.formatted}
                                        </span>
                                    </div>
                                ) : null}
                                <div className="site-divider" />
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-semibold text-[color:var(--site-color-foreground-strong)]">
                                        Total do pedido
                                    </span>
                                    <span className="text-2xl font-semibold text-[color:var(--site-color-foreground-strong)]">
                                        {currentOrder.total.formatted}
                                    </span>
                                </div>
                            </OverlaySection>
                        </SurfaceCard>

                        <SurfaceCard
                            tone="soft"
                            className="site-stack-section min-w-0 overflow-hidden"
                            data-testid="order-confirmation-payment-card"
                        >
                            <div>
                                <h2 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
                                    Pagamento e acompanhamento
                                </h2>
                                <p className="site-text-body text-sm">
                                    O pagamento abaixo acontece 100% dentro do
                                    storefront, usando componentes próprios
                                    conectados ao WooCommerce/Mercado Pago como
                                    backend e fonte de verdade. O status do
                                    pedido é relido automaticamente enquanto a
                                    confirmação acontece.
                                </p>
                            </div>

                            <div className="rounded-[var(--site-radius-xl)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] p-4">
                                <div className="flex flex-wrap items-end justify-between gap-3">
                                    <div className="site-stack-panel">
                                        <p className="site-text-meta">
                                            Total do pedido
                                        </p>
                                        <p className="text-2xl font-semibold text-[color:var(--site-color-foreground-strong)]">
                                            {currentOrder.total.formatted}
                                        </p>
                                    </div>
                                    <StatusBadge
                                        tone={
                                            paymentResolved
                                                ? "success"
                                                : "warning"
                                        }
                                    >
                                        {paymentResolved
                                            ? "Pagamento confirmado"
                                            : "Pagamento pendente"}
                                    </StatusBadge>
                                </div>
                                <p className="site-text-meta mt-2">
                                    O QR Code PIX ou o checkout transparente
                                    aparecem logo abaixo, dentro desta mesma
                                    coluna.
                                </p>
                            </div>

                            <OrderPaymentPanel
                                order={currentOrder}
                                paymentConfig={paymentConfig}
                                initialPaymentState={initialPaymentState}
                                onOrderChange={setCurrentOrder}
                            />

                            <TrustList
                                items={[
                                    {
                                        label: "Histórico preservado",
                                        description:
                                            "Você pode revisar este pedido a qualquer momento em “Meus pedidos”.",
                                        tone: "info",
                                    },
                                    {
                                        label: "Status atualizado",
                                        description: paymentResolved
                                            ? "WooCommerce e Mercado Pago já confirmaram a evolução deste pedido."
                                            : "Enquanto o pagamento acontece, a página continua consultando o status real no WooCommerce.",
                                        tone: paymentResolved
                                            ? "success"
                                            : "warning",
                                    },
                                ]}
                                className="xl:grid-cols-1"
                            />
                        </SurfaceCard>
                    </div>

                    <div
                        className="site-stack-section min-w-0"
                        data-testid="order-confirmation-sidebar"
                    >
                        {hasOrderUpdates ? (
                            <SurfaceCard
                                tone="strong"
                                className="site-stack-section"
                                data-testid="order-confirmation-updates-card"
                            >
                                <div>
                                    <h2 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
                                        Acompanhamento do pedido
                                    </h2>
                                    <p className="site-text-body text-sm">
                                        Código de rastreio e comunicação
                                        visível ao cliente, conforme o pedido
                                        foi salvo no WooCommerce.
                                    </p>
                                </div>

                                <div className="grid gap-4">
                                    {trackingCode ? (
                                        <div
                                            className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] p-4"
                                            data-testid="order-confirmation-tracking-card"
                                        >
                                            <div className="mb-3 flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <PackageSearch className="mt-0.5 h-4 w-4 text-[color:var(--site-color-primary)]" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                                                            Código de rastreio
                                                        </p>
                                                        <p className="site-text-meta normal-case tracking-normal">
                                                            Fácil de copiar e
                                                            localizar.
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handleCopyTracking}
                                                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--site-color-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--site-color-foreground-strong)] transition-colors hover:border-[color:var(--site-color-border-strong)] hover:bg-[color:var(--site-color-surface)]"
                                                >
                                                    {copiedTracking ? (
                                                        <Check className="h-3.5 w-3.5 text-[color:var(--site-color-success)]" />
                                                    ) : (
                                                        <Copy className="h-3.5 w-3.5" />
                                                    )}
                                                    {copiedTracking
                                                        ? "Copiado"
                                                        : "Copiar"}
                                                </button>
                                            </div>

                                            <div className="rounded-[var(--site-radius-md)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-3 py-3">
                                                <p className="break-all font-mono text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--site-color-foreground-strong)]">
                                                    {trackingCode}
                                                </p>
                                            </div>

                                            {tracking ? (
                                                <div className="mt-4 space-y-4">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <StatusBadge
                                                            tone={resolveTrackingTone(
                                                                tracking.state,
                                                            )}
                                                        >
                                                            {tracking.state ===
                                                            "available"
                                                                ? tracking.currentStatus ||
                                                                  "Histórico disponível"
                                                                : tracking.state ===
                                                                    "ineligible"
                                                                  ? "Consulta indisponível para o objeto"
                                                                  : tracking.state ===
                                                                      "error"
                                                                    ? "Erro temporário"
                                                                    : "Consulta não disponível"}
                                                        </StatusBadge>
                                                        {latestTrackingUpdateLabel ? (
                                                            <span className="site-text-meta inline-flex items-center gap-1.5 normal-case tracking-normal">
                                                                <Clock3 className="h-3.5 w-3.5" />
                                                                Última
                                                                atualização em{" "}
                                                                {
                                                                    latestTrackingUpdateLabel
                                                                }
                                                            </span>
                                                        ) : null}
                                                    </div>

                                                    {tracking.state ===
                                                    "available" ? (
                                                        <div
                                                            className="grid gap-3 sm:grid-cols-2"
                                                            data-testid="order-confirmation-tracking-summary"
                                                        >
                                                            <div className="rounded-[var(--site-radius-md)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-3 py-3">
                                                                <p className="site-text-meta normal-case tracking-normal">
                                                                    Status atual
                                                                </p>
                                                                <p className="mt-2 text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                                                                    {tracking.currentStatus ||
                                                                        "Acompanhando movimentação"}
                                                                </p>
                                                            </div>
                                                            <div className="rounded-[var(--site-radius-md)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-3 py-3">
                                                                <p className="site-text-meta normal-case tracking-normal">
                                                                    Local mais recente
                                                                </p>
                                                                <p className="mt-2 text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                                                                    {tracking.latestLocation ||
                                                                        "Localização não informada"}
                                                                </p>
                                                            </div>
                                                            <div className="rounded-[var(--site-radius-md)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-3 py-3 sm:col-span-2">
                                                                <p className="site-text-meta normal-case tracking-normal">
                                                                    Evento mais recente
                                                                </p>
                                                                <p className="mt-2 text-sm leading-6 text-[color:var(--site-color-foreground)]">
                                                                    {tracking.latestEvent ||
                                                                        tracking.currentStatus ||
                                                                        "Sem detalhe adicional."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="rounded-[var(--site-radius-md)] border border-dashed border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-3 py-3"
                                                            data-testid="order-confirmation-tracking-fallback"
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                <AlertCircle className="mt-0.5 h-4 w-4 text-[color:var(--site-color-warning)]" />
                                                                <p className="text-sm leading-6 text-[color:var(--site-color-foreground)]">
                                                                    {tracking.message ||
                                                                        "Ainda não foi possível exibir o histórico oficial deste objeto dentro do sistema."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {hasTrackingHistory ? (
                                                        <div
                                                            className="rounded-[var(--site-radius-md)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-3 py-3"
                                                            data-testid="order-confirmation-tracking-history"
                                                        >
                                                            <div className="mb-3 flex items-center gap-2">
                                                                <History className="h-4 w-4 text-[color:var(--site-color-info)]" />
                                                                <p className="text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                                                                    Histórico de rastreamento
                                                                </p>
                                                            </div>

                                                            <div className="space-y-3">
                                                                {tracking.history
                                                                    .slice(0, 4)
                                                                    .map((event, index) => (
                                                                        <div
                                                                            key={`${event.occurredAt}-${index}`}
                                                                            className="rounded-[var(--site-radius-sm)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] px-3 py-2.5"
                                                                        >
                                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                                <p className="text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                                                                                    {event.status}
                                                                                </p>
                                                                                <span className="site-text-meta normal-case tracking-normal">
                                                                                    {formatTrackingDateTime(
                                                                                        event.occurredAt,
                                                                                    ) ||
                                                                                        event.occurredAt}
                                                                                </span>
                                                                            </div>
                                                                            {event.location ? (
                                                                                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[color:var(--site-color-foreground-muted)]">
                                                                                    <MapPin className="h-3.5 w-3.5 text-[color:var(--site-color-primary)]" />
                                                                                    {event.location}
                                                                                </p>
                                                                            ) : null}
                                                                            {event.detail ? (
                                                                                <p className="mt-1 text-sm leading-6 text-[color:var(--site-color-foreground)]">
                                                                                    {event.detail}
                                                                                </p>
                                                                            ) : null}
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ) : null}

                                            {trackingUrl ? (
                                                <Link
                                                    href={trackingUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-3 inline-flex text-sm font-medium text-[color:var(--site-color-primary)] transition-colors hover:text-[color:var(--site-color-primary-strong)]"
                                                >
                                                    Abrir link de rastreio
                                                </Link>
                                            ) : tracking?.state === "available" ? (
                                                <p className="site-text-meta mt-3 normal-case tracking-normal">
                                                    O histórico oficial dos
                                                    Correios já está disponível
                                                    nesta página.
                                                </p>
                                            ) : (
                                                <p className="site-text-meta mt-3 normal-case tracking-normal">
                                                    Use o código acima no
                                                    serviço de entrega para
                                                    consultar a movimentação.
                                                </p>
                                            )}

                                            <p
                                                aria-live="polite"
                                                className="sr-only"
                                            >
                                                {copiedTracking
                                                    ? "Código de rastreio copiado."
                                                    : ""}
                                            </p>
                                        </div>
                                    ) : null}

                                    {customerNote ? (
                                        <div
                                            className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] p-4"
                                            data-testid="order-confirmation-customer-note-card"
                                        >
                                            <div className="mb-3 flex items-center gap-2">
                                                <MessageSquareText className="h-4 w-4 text-[color:var(--site-color-info)]" />
                                                <p className="text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                                                    Observação para o cliente
                                                </p>
                                            </div>
                                            <p className="text-sm leading-6 text-[color:var(--site-color-foreground)] whitespace-pre-line">
                                                {customerNote}
                                            </p>
                                        </div>
                                    ) : null}
                                </div>
                            </SurfaceCard>
                        ) : null}

                        <SurfaceCard
                            tone="strong"
                            className="site-stack-section"
                        >
                            <div>
                                <h2 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
                                    Endereços do pedido
                                </h2>
                                <p className="site-text-body text-sm">
                                    Dados usados na entrega e na cobrança deste
                                    pedido.
                                </p>
                            </div>
                            <div className="grid gap-4">
                                <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-[color:var(--site-color-primary)]" />
                                        <p className="text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                                            Entrega
                                        </p>
                                    </div>
                                    <div className="space-y-1 text-sm text-[color:var(--site-color-foreground-muted)]">
                                        {renderAddress(
                                            currentOrder.shippingAddress,
                                        ).map((line) => (
                                            <p key={line}>{line}</p>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-[color:var(--site-color-info)]" />
                                        <p className="text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                                            Cobrança
                                        </p>
                                    </div>
                                    <div className="space-y-1 text-sm text-[color:var(--site-color-foreground-muted)]">
                                        {renderAddress(
                                            currentOrder.billingAddress,
                                        ).map((line) => (
                                            <p key={line}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SurfaceCard>
                    </div>
                </div>
            </SectionShell>
        </div>
    );
}
