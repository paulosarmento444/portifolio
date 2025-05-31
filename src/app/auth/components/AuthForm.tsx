"use client";
import { InputField } from "./InputField";
import type React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

interface AuthFormProps {
  formType: "login" | "register";
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error?: string;
  pending?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  formType,
  onSubmit,
  error,
  pending,
}) => {
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={onSubmit}
      className="flex w-full max-w-md rounded-2xl flex-col space-y-6 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl px-6 py-8 shadow-xl border border-gray-700/50"
    >
      <div className="flex flex-col items-center space-y-3">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          {formType === "login" ? "Entrar" : "Criar Conta"}
        </h1>
        <p className="text-sm text-gray-400">
          {formType === "login" ? "Novo por aqui?" : "Já tem uma conta?"}{" "}
          <a
            className="text-purple-400 hover:text-purple-300 hover:underline transition-colors"
            href={formType === "login" ? "register" : "login"}
          >
            {formType === "login" ? "Criar conta" : "Entrar"}
          </a>
        </p>
      </div>

      <div className="mt-6 flex flex-col space-y-5">
        {formType === "register" && (
          <InputField
            id="username"
            label="Nome de Usuário"
            type="text"
            placeholder="Digite seu nome de usuário"
          />
        )}
        <InputField
          id={formType === "login" ? "usernameEmail" : "email"}
          label={formType === "login" ? "Email ou Nome de Usuário" : "Email"}
          type="text"
          placeholder={
            formType === "login"
              ? "Digite seu email ou nome de usuário"
              : "Digite seu email"
          }
        />
        <InputField
          id="password"
          label="Senha"
          type="password"
          placeholder="Digite sua senha"
        />
        {formType === "register" && (
          <InputField
            id="confirmPassword"
            label="Confirmar Senha"
            type="password"
            placeholder="Confirme sua senha"
          />
        )}
      </div>

      {formType === "login" && (
        <div className="text-right">
          <a
            href="forgot-password"
            className="text-sm text-purple-400 hover:text-purple-300 hover:underline transition-colors"
          >
            Esqueceu a senha?
          </a>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="pt-2">
        <motion.button
          type="submit"
          disabled={pending}
          whileHover={{ scale: pending ? 1 : 1.02 }}
          whileTap={{ scale: pending ? 1 : 0.98 }}
          className={`flex w-full rounded-xl justify-center items-center gap-2 py-3 px-6 text-white font-semibold transition-all duration-200 ${
            pending
              ? "bg-gray-600 cursor-not-allowed opacity-70"
              : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          }`}
        >
          {pending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Carregando...</span>
            </>
          ) : (
            <>
              <span>{formType === "login" ? "Entrar" : "Criar Conta"}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>

      <div className="text-center text-xs text-gray-500">
        Ao continuar, você concorda com nossos{" "}
        <a href="#" className="text-purple-400 hover:underline">
          Termos de Serviço
        </a>{" "}
        e{" "}
        <a href="#" className="text-purple-400 hover:underline">
          Política de Privacidade
        </a>
      </div>
    </motion.form>
  );
};
