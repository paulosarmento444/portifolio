"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CheckCircle2, Clipboard, Loader2, QrCode, RefreshCw } from "lucide-react";
import type { MercadoPagoOrderPaymentState } from "@site/integrations/payments";
import {
  GhostButton,
  OverlaySection,
  PrimaryButton,
  StatusBadge,
  SurfaceCard,
} from "@site/shared";

interface MercadoPagoPixPanelProps {
  paymentState: MercadoPagoOrderPaymentState | null;
  isProcessing: boolean;
  error?: string | null;
  onGenerate: () => void;
  onRefresh: () => void;
}

const formatExpiration = (expiresAt?: string | null) => {
  if (!expiresAt) {
    return null;
  }

  const date = new Date(expiresAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

export function MercadoPagoPixPanel({
  paymentState,
  isProcessing,
  error,
  onGenerate,
  onRefresh,
}: MercadoPagoPixPanelProps) {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const pix = paymentState?.pix ?? null;
  const expirationLabel = useMemo(
    () => formatExpiration(pix?.expiresAt),
    [pix?.expiresAt],
  );
  const qrCodeImage = pix?.qrCodeBase64
    ? `data:image/png;base64,${pix.qrCodeBase64}`
    : null;

  const handleCopy = async () => {
    if (!pix?.qrCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(pix.qrCode);
      setCopyFeedback("Código copiado.");
      window.setTimeout(() => setCopyFeedback(null), 2500);
    } catch {
      setCopyFeedback("Não foi possível copiar o código.");
      window.setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  if (!pix?.qrCode && !qrCodeImage) {
    return (
      <SurfaceCard tone="strong" className="site-stack-section min-w-0">
        <OverlaySection
          title="Gerar QR Code PIX"
          description="O pedido já está criado. Gere agora o QR Code oficial do Mercado Pago para concluir o pagamento sem sair da loja."
          actions={
            <PrimaryButton onClick={onGenerate} disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="h-4 w-4" />
              )}
              Gerar QR Code
            </PrimaryButton>
          }
        >
          <div className="flex items-center gap-3 rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] px-4 py-3 text-sm text-[color:var(--site-color-foreground-muted)]">
            <StatusBadge tone="warning">Aguardando pagamento</StatusBadge>
            <p>Assim que o QR Code for emitido, ele ficará disponível aqui na mesma página.</p>
          </div>
        </OverlaySection>
        {error ? (
          <p className="site-text-meta text-[color:var(--site-color-danger-text)]">{error}</p>
        ) : null}
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard tone="strong" className="site-stack-section min-w-0">
      <OverlaySection
        title="Pague com PIX"
        description="Escaneie o QR Code abaixo no app do banco ou copie o código para concluir o pagamento."
        actions={
          <div className="flex flex-wrap gap-3">
            <GhostButton onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
              Atualizar status
            </GhostButton>
            <PrimaryButton onClick={handleCopy} disabled={!pix?.qrCode}>
              <Clipboard className="h-4 w-4" />
              Copiar código
            </PrimaryButton>
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone={paymentState?.isPaid ? "success" : "warning"}>
            {paymentState?.isPaid ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
            {paymentState?.orderStatusLabel || "Aguardando pagamento"}
          </StatusBadge>
          {expirationLabel ? <p className="site-text-meta">Expira em {expirationLabel}</p> : null}
          {copyFeedback ? <p className="site-text-meta">{copyFeedback}</p> : null}
        </div>
      </OverlaySection>

      <div className="grid min-w-0 gap-4" data-testid="mercado-pago-pix-layout">
        <div className="mx-auto w-full max-w-[280px] rounded-[var(--site-radius-xl)] border border-[color:var(--site-color-border)] bg-white p-4 shadow-[var(--site-shadow-sm)]">
          {qrCodeImage ? (
            <Image
              src={qrCodeImage}
              alt="QR Code PIX do Mercado Pago"
              width={240}
              height={240}
              unoptimized
              className="mx-auto aspect-square w-full max-w-[240px] rounded-[var(--site-radius-lg)] object-contain"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-[var(--site-radius-lg)] border border-dashed border-[color:var(--site-color-border)] text-[color:var(--site-color-foreground-muted)]">
              <QrCode className="h-12 w-12" />
            </div>
          )}
        </div>

        <div className="site-stack-section min-w-0 rounded-[var(--site-radius-xl)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] p-5">
          <div>
            <h3 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
              Código copia e cola
            </h3>
            <p className="site-text-body text-sm">
              Se preferir, copie o código abaixo e pague pelo app do seu banco.
            </p>
          </div>
          <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] p-4">
            <code className="block break-all text-sm leading-6 text-[color:var(--site-color-foreground-strong)]">
              {pix?.qrCode || "Código PIX indisponível."}
            </code>
          </div>
          <ul className="space-y-2 text-sm text-[color:var(--site-color-foreground-muted)]">
            <li>1. Abra o app do banco e escolha pagar com PIX.</li>
            <li>2. Escaneie o QR Code ou cole o código acima.</li>
            <li>3. Depois do pagamento, esta página atualiza o status automaticamente.</li>
          </ul>
          {error ? (
            <p className="site-text-meta text-[color:var(--site-color-danger-text)]">{error}</p>
          ) : null}
        </div>
      </div>
    </SurfaceCard>
  );
}
