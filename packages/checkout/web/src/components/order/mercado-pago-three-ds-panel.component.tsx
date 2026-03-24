"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import type { MercadoPagoThreeDSState } from "@site/integrations/payments";
import { OverlaySection, StatusBadge, SurfaceCard } from "@site/shared";

interface MercadoPagoThreeDSPanelProps {
  state: MercadoPagoThreeDSState;
  isFinalizing: boolean;
  error?: string | null;
  onFinalize: () => Promise<void>;
}

export function MercadoPagoThreeDSPanel({
  state,
  isFinalizing,
  error,
  onFinalize,
}: MercadoPagoThreeDSPanelProps) {
  const iframeName = useMemo(
    () => `pharmacore-mp-3ds-${Math.random().toString(36).slice(2)}`,
    [],
  );
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const hasSubmittedRef = useRef(false);
  const hasFinalizedRef = useRef(false);
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);

  useEffect(() => {
    hasSubmittedRef.current = false;
    hasFinalizedRef.current = false;
    setIsFrameLoaded(false);
  }, [state.creq, state.url]);

  useEffect(() => {
    if (!state.required || !state.url || !state.creq || hasSubmittedRef.current) {
      return;
    }

    hasSubmittedRef.current = true;
    const form = document.createElement("form");
    form.method = "POST";
    form.action = state.url;
    form.target = iframeName;
    form.style.display = "none";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "creq";
    input.value = state.creq;
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
    form.remove();
  }, [iframeName, state.creq, state.required, state.url]);

  useEffect(() => {
    if (!state.required) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      const payload = event.data;

      if (
        hasFinalizedRef.current ||
        !payload ||
        typeof payload !== "object" ||
        !("status" in payload) ||
        (payload as { status?: string }).status !== "COMPLETE"
      ) {
        return;
      }

      hasFinalizedRef.current = true;
      void onFinalize();
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onFinalize, state.required]);

  return (
    <SurfaceCard tone="strong" className="site-stack-section">
      <OverlaySection
        title="Autenticação adicional do cartão"
        description="O banco emissor pediu uma confirmação extra. Conclua o desafio abaixo para finalizar o pagamento sem sair da loja."
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone="warning">
            <ShieldCheck className="h-3.5 w-3.5" />
            3DS em andamento
          </StatusBadge>
          {state.lastFourDigits ? (
            <p className="site-text-meta">Cartão final {state.lastFourDigits}</p>
          ) : null}
          {isFinalizing ? <p className="site-text-meta">Finalizando confirmação...</p> : null}
        </div>
      </OverlaySection>

      <div className="relative overflow-hidden rounded-[var(--site-radius-xl)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] shadow-[var(--site-shadow-sm)]">
        {!isFrameLoaded || isFinalizing ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[color:var(--site-color-surface)]/90">
            <div className="site-stack-panel items-center text-center">
              <Loader2 className="h-5 w-5 animate-spin text-[color:var(--site-color-primary)]" />
              <p className="site-text-meta">
                {isFinalizing
                  ? "Confirmando o resultado do desafio 3DS..."
                  : "Carregando a autenticação do emissor..."}
              </p>
            </div>
          </div>
        ) : null}

        <iframe
          ref={iframeRef}
          name={iframeName}
          title="Autenticação 3DS do Mercado Pago"
          className="h-[680px] w-full"
          onLoad={() => setIsFrameLoaded(true)}
          sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation-by-user-activation"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      {error ? (
        <p className="site-text-meta text-[color:var(--site-color-danger-text)]">{error}</p>
      ) : null}
    </SurfaceCard>
  );
}
