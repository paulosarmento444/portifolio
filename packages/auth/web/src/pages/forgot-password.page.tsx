"use client";

import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Mail, ShieldCheck } from "lucide-react";
import {
  forgotPasswordRequestSchema,
  PageHeader,
  PrimaryButton,
  SectionShell,
  StatusBadge,
  SurfaceCard,
  TextField,
  TrustList,
} from "@site/shared";
import { forgotPasswordAction } from "../data/actions/auth.actions";

export function AuthForgotPasswordPage() {
  const [state, setState] = useState<{
    pending: boolean;
    error: string;
    successMessage: string;
  }>({
    pending: false,
    error: "",
    successMessage: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState({ pending: true, error: "", successMessage: "" });

    const formData = new FormData(event.currentTarget);
    const usernameOrEmail = String(formData.get("email") ?? "").trim();
    const parsedInput = forgotPasswordRequestSchema.safeParse({
      usernameOrEmail,
    });

    if (!parsedInput.success) {
      setState({
        pending: false,
        error:
          parsedInput.error.issues[0]?.message ||
          "Informe um e-mail ou usuario valido.",
        successMessage: "",
      });
      return;
    }

    try {
      const result = await forgotPasswordAction(parsedInput.data);

      setState({
        pending: false,
        error: "",
        successMessage: result.message,
      });
    } catch (error) {
      setState({
        pending: false,
        error:
          error instanceof Error
            ? error.message
            : "Nao foi possivel solicitar a redefinicao de senha.",
        successMessage: "",
      });
    }
  };

  return (
    <main className="site-page-shell site-page-shell-compact site-shell-background">
      <SectionShell container="utility" spacing="hero" stack="page" className="pb-16">
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(26rem,32rem)]">
          <div className="site-stack-section">
            <PageHeader
              container="utility"
              className="px-0 pt-0 pb-0"
              eyebrow={
                <>
                  <Mail className="h-4 w-4" />
                  Recuperacao de acesso
                </>
              }
              title="Recupere o acesso sem ruído visual e volte para a conta com contexto."
              description="Envie o e-mail da conta para receber as instrucoes de recuperacao. O fluxo continua simples, com a mesma linguagem premium aplicada ao restante da loja."
            />

            <div className="flex flex-wrap gap-3">
              <StatusBadge tone="success">
                <ShieldCheck className="h-3.5 w-3.5" />
                Fluxo protegido
              </StatusBadge>
              <StatusBadge tone="info">Resposta enviada por e-mail</StatusBadge>
            </div>

            <TrustList
              items={[
                {
                  label: "Recuperacao por e-mail",
                  description: "Use o e-mail principal da conta para receber as instrucoes.",
                  tone: "info",
                },
                {
                  label: "Retorno ao checkout",
                  description: "Depois do login, seus pedidos e dados continuam disponiveis.",
                  tone: "accent",
                },
                {
                  label: "Menos friccao",
                  description: "Fluxo enxuto para resolver o acesso e voltar ao catalogo.",
                  tone: "success",
                },
              ]}
            />
          </div>

          <div className="flex justify-center xl:justify-end">
            <SurfaceCard tone="strong" className="w-full max-w-[32rem]">
              <form onSubmit={handleSubmit} className="site-stack-section">
                <div className="site-stack-panel">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)] shadow-[var(--site-shadow-sm)]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="site-stack-panel gap-2">
                    <h2 className="site-text-section-title !text-2xl">Esqueceu sua senha?</h2>
                    <p className="site-text-body text-sm">
                      Digite o e-mail usado na conta para receber as instrucoes de recuperacao.
                    </p>
                  </div>
                </div>

                <TextField
                  id="email"
                  name="email"
                  type="email"
                  label="E-mail"
                  placeholder="voce@exemplo.com"
                  required
                  autoComplete="email"
                  hint="Use o mesmo e-mail cadastrado na loja."
                />

                <div className="site-stack-panel">
                  <PrimaryButton
                    type="submit"
                    disabled={state.pending}
                    fullWidth
                    trailingIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    {state.pending ? "Enviando..." : "Enviar instrucoes"}
                  </PrimaryButton>
                  <Link
                    href="/auth/login"
                    className="site-button site-button-secondary inline-flex min-h-11 w-full items-center justify-center gap-2 px-5 py-3 text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para o login
                  </Link>
                </div>

                {state.error ? (
                  <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-danger-soft)] bg-[color:var(--site-color-danger-soft)]/70 px-4 py-3 text-sm text-[color:var(--site-color-danger-text)]">
                    {state.error}
                  </div>
                ) : null}

                {state.successMessage ? (
                  <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-success-soft)] bg-[color:var(--site-color-success-soft)]/70 px-4 py-3 text-sm text-[color:var(--site-color-success-text)]">
                    {state.successMessage}
                  </div>
                ) : null}
              </form>
            </SurfaceCard>
          </div>
        </div>
      </SectionShell>
    </main>
  );
}
