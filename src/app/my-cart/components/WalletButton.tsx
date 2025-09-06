"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Wallet } from "lucide-react";

interface WalletButtonProps {
  orderId: string;
  total: number;
  items?: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    picture_url?: string;
  }>;
}

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

export function WalletButton({ orderId, total, items }: WalletButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const PUBLIC_KEY =
    process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ||
    "APP_USR-c77c9be7-8dbd-4bb6-9dd0-d6ecf1984426";

  useEffect(() => {
    const loadSdk = async () => {
      try {
        if (!window.MercadoPago) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://sdk.mercadopago.com/js/v2";
            s.async = true;
            s.onload = () => resolve();
            s.onerror = () =>
              reject(new Error("Falha ao carregar SDK do Mercado Pago"));
            document.body.appendChild(s);
          });
        }
      } catch (e: any) {
        setError(e?.message || "Erro ao carregar SDK");
      }
    };
    loadSdk();
  }, []);

  useEffect(() => {
    const renderWallet = async () => {
      if (!window.MercadoPago || !containerRef.current) return;
      try {
        setLoading(true);
        setError(null);

        // 1) Criar preferência no backend
        const prefRes = await fetch("/api/mercadopago/preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, total, items }),
        });
        const prefData = await prefRes.json();
        if (!prefRes.ok || !prefData.id) {
          throw new Error(prefData?.error || "Falha ao criar preferência");
        }

        // 2) Inicializar SDK e Wallet Brick
        const mp = new window.MercadoPago(PUBLIC_KEY, { locale: "pt-BR" });
        const bricksBuilder = mp.bricks();

        // Limpar container (evitar duplicação em hot reload)
        containerRef.current.innerHTML = "";

        await bricksBuilder.create("wallet", "walletBrick_container", {
          initialization: {
            preferenceId: prefData.id,
          },
        });

        setLoading(false);
      } catch (e: any) {
        setError(e?.message || "Erro ao inicializar Wallet");
        setLoading(false);
      }
    };
    renderWallet();
  }, [PUBLIC_KEY, orderId, total, JSON.stringify(items)]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold">
            Pagamento com Mercado Pago
          </h3>
          <p className="text-gray-400 text-sm">
            Total: R$ {Number(total || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          {error}
        </div>
      )}

      <div ref={containerRef}>
        <div id="walletBrick_container" />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-3 text-gray-300 text-sm">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Preparando
          checkout...
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl p-3">
        <p className="text-xs text-gray-400">
          Ao clicar no botão, você será redirecionado para o ambiente seguro do
          Mercado Pago.
        </p>
      </div>
    </div>
  );
}
