"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Loader2, RefreshCw } from "lucide-react";

interface PixQRCodeProps {
  orderId: string;
  total: number;
  onClose?: () => void;
}

export function PixQRCode({ orderId, total, onClose }: PixQRCodeProps) {
  const [qrCodeData, setQrCodeData] = useState<{
    encodedImage?: string;
    payload?: string;
    expirationDate?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/pix/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          value: total,
          expirationDate: new Date(
            Date.now() + 24 * 60 * 60 * 1000
          ).toISOString(), // 24 hours
          description: `Pagamento do pedido #${orderId}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate QR code: ${response.status}`);
      }

      const data = await response.json();
      setQrCodeData(data);
    } catch (err) {
      console.error("Error fetching QR code:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate QR code"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchQRCode();
    }
  }, [orderId, total]);

  const copyPixCode = async () => {
    if (qrCodeData?.payload) {
      try {
        await navigator.clipboard.writeText(qrCodeData.payload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Erro ao copiar:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
        <p className="text-white font-medium">Gerando QR Code PIX...</p>
        <p className="text-gray-400 text-sm">Aguarde um momento</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-red-400 font-medium mb-4">
          Erro ao gerar QR Code: {error}
        </p>
        <button
          onClick={fetchQRCode}
          className="px-6 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 rounded-xl text-red-400 hover:border-red-400/50 transition-all duration-300"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Pagamento via PIX</h3>
        <p className="text-gray-400">
          Escaneie o QR Code ou copie o código abaixo
        </p>
      </div>

      {/* QR Code */}
      {qrCodeData?.encodedImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-2xl mx-auto max-w-xs"
        >
          <img
            src={`data:image/png;base64,${qrCodeData.encodedImage}`}
            alt="QR Code PIX"
            className="w-full h-auto"
          />
        </motion.div>
      )}

      {/* PIX Code */}
      {qrCodeData?.payload && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3"
        >
          <p className="text-white font-medium text-center">
            Código PIX Copia e Cola:
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-gray-300 text-xs font-mono break-all text-center">
              {qrCodeData.payload}
            </p>
          </div>
          <button
            onClick={copyPixCode}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{copied ? "Código Copiado!" : "Copiar Código PIX"}</span>
          </button>
        </motion.div>
      )}

      {/* Expiration */}
      {qrCodeData?.expirationDate && (
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Este QR Code expira em:{" "}
            <span className="text-yellow-400 font-medium">
              {new Date(qrCodeData.expirationDate).toLocaleString("pt-BR")}
            </span>
          </p>
        </div>
      )}

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
      >
        <h4 className="text-blue-400 font-medium mb-3 text-center">
          Como pagar:
        </h4>
        <ol className="text-sm text-gray-300 space-y-2">
          <li className="flex items-start space-x-2">
            <span className="text-blue-400 font-bold">1.</span>
            <span>Abra o app do seu banco</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-400 font-bold">2.</span>
            <span>Escaneie o QR Code ou copie o código</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-400 font-bold">3.</span>
            <span>Confirme o pagamento</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-400 font-bold">4.</span>
            <span>Feche esta janela quando terminar</span>
          </li>
        </ol>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center"
      >
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <p className="text-green-400 font-medium">
            Pedido Criado com Sucesso!
          </p>
        </div>
        <p className="text-gray-400 text-sm">
          Seu pedido #{orderId} foi registrado. Você pode fechar esta janela a
          qualquer momento.
        </p>
      </motion.div>
    </div>
  );
}
