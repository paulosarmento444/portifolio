"use client";
import { motion } from "framer-motion";
import { InputField } from "@/app/auth/components/InputField";
import { ArrowRight, Mail } from "lucide-react";
import type React from "react";

export function ForgotPasswordForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    alert("forgot password...");
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-1/4 w-24 h-24 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-60"></div>

          {/* Form Container */}
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Esqueceu a Senha?
              </h2>
              <p className="text-gray-300">
                Digite seu email para receber as instruções de recuperação
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                id="email"
                type="email"
                label="Email"
                placeholder="Digite seu email"
              />

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full rounded-xl justify-center items-center gap-2 py-3 px-6 text-white font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                <span>Enviar Instruções</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <div className="text-center">
                <a
                  href="/auth/login"
                  className="text-sm text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                >
                  Voltar para o login
                </a>
              </div>
            </form>
          </div>

          {/* Floating Elements */}
          <div className="absolute -top-4 -right-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl p-3 animate-float">
            <div className="w-6 h-6 bg-white rounded-lg"></div>
          </div>
          <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-3 animate-float delay-1000">
            <div className="w-6 h-6 bg-white rounded-lg"></div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(3deg);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
