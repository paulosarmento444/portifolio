"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  Loader2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Clock,
  CreditCard,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface PixQRCodeProps {
  orderId: string;
  total: number;
  onClose?: () => void;
  onPaymentSuccess?: () => void;
  isModalOpen?: boolean;
}

interface PaymentStatus {
  mercadoPagoOrderId: string;
  paymentId: string;
  orderStatus: string;
  paymentStatus: string;
  statusDetail: string;
  isPaid: boolean;
  isPending: boolean;
  isProcessing: boolean;
  isExpired: boolean;
  isRejected: boolean;
  totalAmount: string;
  paidAmount: string;
  lastUpdated: string;
  expirationDate: string;
  paymentMethod: string;
  qrCode: string;
  ticketUrl: string;
}

export function PixQRCode({
  orderId,
  total,
  onClose,
  onPaymentSuccess,
  isModalOpen = true,
}: PixQRCodeProps) {
  const [qrCodeData, setQrCodeData] = useState<{
    qr_code?: string;
    qr_code_base64?: string;
    ticket_url?: string;
    expiration_date?: string;
    orderId?: string;
    status?: string;
  } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    {} as PaymentStatus
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [paymentApproved, setPaymentApproved] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const maxAutoChecks = 24; // 2 minutos (24 * 5 segundos)

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
          ).toISOString(),
          description: `Pagamento do pedido #${orderId}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to generate QR code: ${response.status}`
        );
      }

      const data = await response.json();

      if (isMountedRef.current) {
        setQrCodeData(data);

        // Iniciar verificação automática por 2 minutos assim que o QR Code for gerado
        if (data.orderId && isModalOpen) {
          // Iniciar verificação automática por 2 minutos assim que o QR Code for gerado
          setTimeout(() => {
            if (isMountedRef.current) {
              // Forçar a atualização do qrCodeData antes de iniciar
              setQrCodeData(data);

              // Iniciar verificação com o orderId correto
              console.log("🎯 Iniciando auto-check para:", data.orderId);

              setAutoCheckEnabled(true);
              setCheckCount(0);

              // Verificar imediatamente
              checkPaymentStatus(data.orderId);

              let currentCount = 0;

              // Configurar verificação automática
              intervalRef.current = setInterval(async () => {
                if (!isMountedRef.current || !isModalOpen) {
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                  }
                  setAutoCheckEnabled(false);
                  return;
                }

                // Verificar se já foi pago antes de continuar
                if (paymentStatus?.isPaid) {
                  console.log("🛑 Pagamento já aprovado, parando interval");
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                  }
                  setAutoCheckEnabled(false);
                  return;
                }

                currentCount += 1;
                setCheckCount(currentCount);

                if (currentCount >= maxAutoChecks) {
                  console.log("⏰ Tempo limite de 2 minutos atingido");
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                  }
                  setAutoCheckEnabled(false);
                  return;
                }

                const shouldStop = await checkPaymentStatus(data.orderId);
                if (shouldStop) {
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                  }
                  setAutoCheckEnabled(false);
                }
              }, 5000);
            }
          }, 2000); // Aguardar 2 segundos para garantir que tudo foi renderizado
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(
          err instanceof Error ? err.message : "Failed to generate QR code"
        );
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const checkPaymentStatus = useCallback(
    async (mercadoPagoOrderId: string) => {
      if (!isMountedRef.current || !isModalOpen) {
        return false;
      }

      // Se já foi aprovado, não verificar mais e não mudar estado
      if (paymentApproved) {
        console.log(
          "✅ Pagamento já aprovado anteriormente, ignorando verificação"
        );
        return true;
      }

      // Se já foi pago, não verificar mais
      if (paymentStatus?.isPaid) {
        console.log("✅ Já foi pago, parando verificação");
        stopAutoCheck();
        return true;
      }

      try {
        setIsCheckingPayment(true);

        const response = await fetch("/api/pix/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId: mercadoPagoOrderId }),
        });

        if (response.ok && isMountedRef.current) {
          const status = await response.json();
          setPaymentStatus(status);

          if (status.isPaid) {
            console.log("🎉 PAGAMENTO APROVADO! Parando verificação...");
            setPaymentApproved(true); // Estado permanente
            stopAutoCheck();
            onPaymentSuccess?.();
            return true; // Pagamento encontrado - PARAR
          } else if (status.isExpired || status.isRejected) {
            console.log("❌ Pagamento expirado/rejeitado");
            stopAutoCheck();
            return true; // Status final - PARAR
          }
        }
        return false; // Continuar verificando
      } catch (error) {
        console.error("Erro ao verificar status:", error);
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsCheckingPayment(false);
        }
      }
    },
    [isModalOpen, onPaymentSuccess, paymentStatus?.isPaid, paymentApproved]
  );

  const startAutoCheck = useCallback(() => {
    if (!qrCodeData?.orderId || intervalRef.current || paymentStatus?.isPaid) {
      return;
    }

    console.log("🚀 Iniciando verificação automática por 2 minutos");
    setAutoCheckEnabled(true);
    setCheckCount(0);

    // Verificar imediatamente
    checkPaymentStatus(qrCodeData.orderId);

    let currentCount = 0;

    // Configurar verificação automática a cada 5 segundos por 2 minutos
    intervalRef.current = setInterval(async () => {
      if (!isMountedRef.current || !isModalOpen) {
        stopAutoCheck();
        return;
      }

      currentCount += 1;
      setCheckCount(currentCount);

      if (currentCount >= maxAutoChecks) {
        console.log("⏰ Tempo limite de 2 minutos atingido");
        stopAutoCheck();
        return;
      }

      if (qrCodeData?.orderId) {
        const shouldStop = await checkPaymentStatus(qrCodeData.orderId);
        if (shouldStop) {
          stopAutoCheck();
        }
      }
    }, 5000);
  }, [
    qrCodeData?.orderId,
    paymentStatus?.isPaid,
    checkPaymentStatus,
    isModalOpen,
  ]);

  const stopAutoCheck = useCallback(() => {
    console.log("⏹️ Parando verificação automática");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isMountedRef.current) {
      setAutoCheckEnabled(false);
      setIsCheckingPayment(false);
    }
  }, []);

  const manualCheck = async () => {
    if (qrCodeData?.orderId) {
      await checkPaymentStatus(qrCodeData.orderId);
    }
  };

  useEffect(() => {
    if (!isModalOpen) {
      stopAutoCheck();
    }
  }, [isModalOpen, stopAutoCheck]);

  useEffect(() => {
    if (orderId && isModalOpen) {
      fetchQRCode();
    }
  }, [orderId, total, isModalOpen]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const copyPixCode = async () => {
    if (qrCodeData?.qr_code) {
      try {
        await navigator.clipboard.writeText(qrCodeData.qr_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Erro ao copiar:", error);
      }
    }
  };

  // Parar verificação quando pagamento for aprovado
  useEffect(() => {
    if (paymentStatus?.isPaid) {
      console.log(
        "🛑 Pagamento aprovado detectado, parando todas as verificações"
      );
      stopAutoCheck();
    }
  }, [paymentStatus?.isPaid, stopAutoCheck]);

  useEffect(() => {
    if (paymentApproved) {
      console.log("🛑 Estado permanente de aprovação ativo");
      stopAutoCheck();
    }
  }, [paymentApproved, stopAutoCheck]);

  // Tela de sucesso - usar estado permanente
  if (paymentApproved || paymentStatus?.isPaid) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12 text-green-400" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h3 className="text-2xl font-bold text-white">Pagamento Aprovado!</h3>
          <p className="text-gray-300">
            Seu pagamento PIX foi processado com sucesso.
          </p>

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">ID do Pagamento:</span>
              <span className="text-green-400 font-mono text-xs">
                {paymentStatus.paymentId}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Valor Pago:</span>
              <span className="text-white font-bold">
                R$ {total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Status:</span>
              <span className="text-green-400 font-medium">Aprovado</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Processado em:</span>
              <span className="text-gray-300 text-xs">
                {new Date(paymentStatus.lastUpdated).toLocaleString("pt-BR")}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={() =>
                (window.location.href = `/order-confirmation/${orderId}`)
              }
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105"
            >
              Ver Confirmação do Pedido
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium rounded-xl transition-all duration-200"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Tela de erro - pagamento rejeitado ou expirado
  if (paymentStatus?.isRejected || paymentStatus?.isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-8"
      >
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">
            {paymentStatus.isExpired
              ? "QR Code Expirado"
              : "Pagamento Rejeitado"}
          </h3>
          <p className="text-gray-300">
            {paymentStatus.isExpired
              ? "O QR Code PIX expirou. Gere um novo para continuar."
              : "O pagamento foi rejeitado. Tente novamente."}
          </p>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Status:</span>
              <span className="text-red-400 font-medium">
                {paymentStatus.statusDetail}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Valor:</span>
              <span className="text-white">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={fetchQRCode}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105"
            >
              Gerar Novo QR Code
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium rounded-xl transition-all duration-200"
            >
              Fechar
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

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
      {/* Header com Status */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Pagamento via PIX</h3>
        <p className="text-gray-400">
          Escaneie o QR Code ou copie o código abaixo
        </p>

        {/* Controles de Verificação */}
        {qrCodeData?.orderId && !paymentApproved && !paymentStatus?.isPaid && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={manualCheck}
                disabled={isCheckingPayment}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isCheckingPayment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>
                  {isCheckingPayment ? "Verificando..." : "Verificar Agora"}
                </span>
              </button>

              {autoCheckEnabled && (
                <button
                  onClick={stopAutoCheck}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Parar Verificação</span>
                </button>
              )}
            </div>

            {autoCheckEnabled && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-400 text-xs font-medium">
                    Verificando automaticamente... ({checkCount}/{maxAutoChecks}
                    )
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Tempo restante:{" "}
                  {Math.max(
                    0,
                    Math.ceil(((maxAutoChecks - checkCount) * 5) / 60)
                  )}{" "}
                  minutos
                </p>
              </div>
            )}
          </div>
        )}

        {/* Status do Pagamento */}
        <AnimatePresence>
          {paymentStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3"
            >
              <div
                className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${
                  paymentStatus.isProcessing
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : paymentStatus.isPending
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    : paymentStatus.isExpired
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                }`}
              >
                {paymentStatus.isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : paymentStatus.isPending ? (
                  <Clock className="w-4 h-4" />
                ) : paymentStatus.isExpired ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                <span>
                  {paymentStatus.isProcessing
                    ? "Processando Pagamento..."
                    : paymentStatus.isPending
                    ? "Aguardando Pagamento"
                    : paymentStatus.isExpired
                    ? "QR Code Expirado"
                    : paymentStatus.statusDetail || paymentStatus.orderStatus}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* QR Code */}
      {qrCodeData?.qr_code_base64 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-2xl mx-auto max-w-xs relative"
        >
          <img
            src={`data:image/png;base64,${qrCodeData.qr_code_base64}`}
            alt="QR Code PIX"
            className="w-full h-auto"
          />

          {/* Overlay de processamento */}
          <AnimatePresence>
            {paymentStatus?.isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-blue-500/20 rounded-2xl flex items-center justify-center"
              >
                <div className="bg-white/90 rounded-full p-3">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* PIX Code */}
      {qrCodeData?.qr_code && (
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
              {qrCodeData.qr_code}
            </p>
          </div>
          <button
            onClick={copyPixCode}
            disabled={paymentStatus?.isPaid || paymentStatus?.isExpired}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2"
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

      {/* Ticket URL */}
      {qrCodeData?.ticket_url && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <a
            href={qrCodeData.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 hover:border-blue-500/50 transition-all duration-300 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ver Comprovante Online</span>
          </a>
        </motion.div>
      )}

      {/* Expiration */}
      {qrCodeData?.expiration_date && !paymentStatus?.isPaid && (
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Este QR Code expira em:{" "}
            <span className="text-yellow-400 font-medium">
              {new Date(qrCodeData.expiration_date).toLocaleString("pt-BR")}
            </span>
          </p>
        </div>
      )}

      {/* Instructions */}
      {!paymentApproved &&
        !paymentStatus?.isPaid &&
        !paymentStatus?.isExpired && (
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
                <span>Clique em "Verificar Pagamento" após pagar</span>
              </li>
            </ol>
          </motion.div>
        )}

      {/* Status Message */}
      {!paymentApproved &&
        !paymentStatus?.isPaid &&
        !paymentStatus?.isExpired && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <p className="text-yellow-400 font-medium">
                Aguardando Pagamento
              </p>
            </div>
            <p className="text-gray-400 text-sm">
              Valor: R$ {total.toFixed(2)} • Clique em "Verificar Pagamento"
              após efetuar o PIX
            </p>
          </motion.div>
        )}
    </div>
  );
}
