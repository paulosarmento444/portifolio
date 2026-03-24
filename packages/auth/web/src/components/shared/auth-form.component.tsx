"use client";

import type React from "react";
import Link from "next/link";
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react";
import { PrimaryButton, StatusBadge, SurfaceCard, cn, ecommerceButtonStyles } from "@site/shared";
import { InputField } from "./input-field.component";

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
  const isLogin = formType === "login";

  return (
    <SurfaceCard tone="strong" className="w-full max-w-xl site-stack-section">
      <div className="site-stack-panel">
        <StatusBadge tone="accent">
          <LockKeyhole className="h-3.5 w-3.5" />
          {isLogin ? "Acesso da conta" : "Criar conta"}
        </StatusBadge>
        <div>
          <h1 className="site-text-section-title text-[color:var(--site-color-foreground-strong)]">
            {isLogin ? "Entrar para continuar sua compra" : "Criar conta para acompanhar seus pedidos"}
          </h1>
          <p className="site-text-body text-sm">
            {isLogin
              ? "Acesse histórico, endereços e pagamentos em um fluxo único e mais claro."
              : "Cadastre-se para salvar endereços, revisar pagamentos e acessar sua conta com mais rapidez."}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="site-stack-section">
        {formType === "register" ? (
          <InputField
            id="username"
            label="Nome de usuário"
            type="text"
            placeholder="Escolha um nome de usuário"
          />
        ) : null}

        <InputField
          id={isLogin ? "usernameEmail" : "email"}
          label={isLogin ? "Email ou nome de usuário" : "Email"}
          type={isLogin ? "text" : "email"}
          placeholder={
            isLogin
              ? "Digite seu email ou nome de usuário"
              : "Digite seu melhor email"
          }
        />

        <InputField
          id="password"
          label="Senha"
          type="password"
          placeholder="Digite sua senha"
        />

        {formType === "register" ? (
          <InputField
            id="confirmPassword"
            label="Confirmar senha"
            type="password"
            placeholder="Confirme a senha"
          />
        ) : null}

        {isLogin ? (
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="site-text-meta transition-colors hover:text-[color:var(--site-color-foreground-strong)]"
            >
              Esqueceu a senha?
            </Link>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-danger-soft)] bg-[color:var(--site-color-danger-soft)]/70 px-4 py-3 text-sm text-[color:var(--site-color-danger-text)]">
            {error}
          </div>
        ) : null}

        <PrimaryButton
          type="submit"
          disabled={pending}
          fullWidth
          className="justify-center"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {pending
            ? "Carregando..."
            : isLogin
              ? "Entrar na conta"
              : "Criar conta"}
        </PrimaryButton>
      </form>

      <div className="flex flex-col gap-3 border-t border-[color:var(--site-color-border)] pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="site-text-meta max-w-md">
          Ao continuar, você concorda com os termos de uso e com a política de privacidade da loja.
        </p>
        <Link
          href={isLogin ? "/auth/register" : "/auth/login"}
          className={cn(
            ecommerceButtonStyles.ghost,
            "min-h-10 w-full justify-center px-4 py-2.5 text-sm sm:w-auto",
          )}
        >
          {isLogin ? "Criar conta" : "Entrar"}
        </Link>
      </div>
    </SurfaceCard>
  );
};
