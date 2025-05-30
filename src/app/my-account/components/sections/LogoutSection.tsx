"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { LogOut, AlertTriangle, Shield } from "lucide-react"
import { logoutAction } from "@/app/server-actions/auth.action"

interface LogoutSectionProps {
  router: any
}

export function LogoutSection({ router }: LogoutSectionProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      localStorage.clear()
      await logoutAction()
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogOut className="w-12 h-12 text-white" />
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Sair da Conta</span>
        </h2>
        <p className="text-gray-300 text-lg">Tem certeza de que deseja sair da sua conta?</p>
      </motion.div>

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-yellow-500/10 backdrop-blur-sm rounded-2xl border border-yellow-400/30"></div>

        <div className="relative p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">Atenção</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Ao sair da sua conta, você precisará fazer login novamente para acessar suas informações, pedidos e
              configurações. Certifique-se de que salvou todas as alterações antes de continuar.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Security Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50"></div>

        <div className="relative p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            Dicas de Segurança
          </h3>

          <ul className="space-y-3 text-gray-300 text-sm">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Sempre faça logout em computadores públicos ou compartilhados</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Mantenha sua senha segura e não a compartilhe com ninguém</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Ative a autenticação em duas etapas para maior segurança</span>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex-1 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isLoggingOut ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saindo...
            </>
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              Confirmar Logout
            </>
          )}
        </button>

        <button
          onClick={() => window.history.back()}
          className="flex-1 px-8 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white hover:border-gray-600/50 rounded-2xl font-bold transition-all duration-300"
        >
          Cancelar
        </button>
      </motion.div>
    </div>
  )
}
