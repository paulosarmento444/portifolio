"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import {
  PageHeader,
  PrimaryButton,
  SectionShell,
  StatusBadge,
  SurfaceCard,
  TextField,
  resetPasswordCredentialsSchema,
} from "@site/shared";
import {
  resetPasswordAction,
  validateResetPasswordTokenAction,
} from "../actions/auth.actions";

type ValidationState = "validating" | "ready" | "invalid" | "success";

export function AuthResetPasswordPage() {
  const searchParams = useSearchParams();
  const login = useMemo(() => searchParams.get("login")?.trim() ?? "", [searchParams]);
  const key = useMemo(() => searchParams.get("key")?.trim() ?? "", [searchParams]);
  const [state, setState] = useState<{
    status: ValidationState;
    pending: boolean;
    error: string;
    successMessage: string;
  }>({
    status: "validating",
    pending: false,
    error: "",
    successMessage: "",
  });

  useEffect(() => {
    let cancelled = false;

    const validateToken = async () => {
      if (!login || !key) {
        if (!cancelled) {
          setState({
            status: "invalid",
            pending: false,
            error: "O link de redefinicao esta incompleto ou expirou.",
            successMessage: "",
          });
        }
        return;
      }

      const result = await validateResetPasswordTokenAction({ login, key });

      if (cancelled) {
        return;
      }

      setState({
        status: result.valid ? "ready" : "invalid",
        pending: false,
        error: result.valid ? "" : result.message,
        successMessage: "",
      });
    };

    setState({
      status: "validating",
      pending: false,
      error: "",
      successMessage: "",
    });
    void validateToken();

    return () => {
      cancelled = true;
    };
  }, [key, login]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (state.status !== "ready") {
      return;
    }

    setState((current) => ({
      ...current,
      pending: true,
      error: "",
      successMessage: "",
    }));

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const parsedInput = resetPasswordCredentialsSchema.safeParse({
      login,
      key,
      password,
      confirmPassword,
    });

    if (!parsedInput.success) {
      setState((current) => ({
        ...current,
        pending: false,
        error:
          parsedInput.error.issues[0]?.message ||
          "Nao foi possivel validar a nova senha.",
      }));
      return;
    }

    try {
      const result = await resetPasswordAction(parsedInput.data);

      setState({
        status: "success",
        pending: false,
        error: "",
        successMessage: result.message,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        pending: false,
        error:
          error instanceof Error
            ? error.message
            : "Nao foi possivel redefinir a senha.",
      }));
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
                  <KeyRound className="h-4 w-4" />
                  Nova senha
                </>
              }
              title="Defina uma nova senha e volte para a conta sem depender do wp-login."
              description="O link recebido por e-mail valida o acesso aqui no storefront headless. Depois de redefinir a senha, basta voltar ao login normal da loja."
            />

            <div className="flex flex-wrap gap-3">
              <StatusBadge tone="success">
                <ShieldCheck className="h-3.5 w-3.5" />
                Link protegido
              </StatusBadge>
              <StatusBadge tone="info">Reset sem sair do frontend</StatusBadge>
            </div>
          </div>

          <div className="flex justify-center xl:justify-end">
            <SurfaceCard tone="strong" className="w-full max-w-[32rem]">
              <form onSubmit={handleSubmit} className="site-stack-section">
                <div className="site-stack-panel gap-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)] shadow-[var(--site-shadow-sm)]">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <h2 className="site-text-section-title !text-2xl">Escolha sua nova senha</h2>
                  <p className="site-text-body text-sm">
                    Use pelo menos 8 caracteres. Depois disso, o login volta a funcionar normalmente.
                  </p>
                </div>

                {state.status === "success" ? (
                  <div className="site-stack-panel">
                    <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-success-soft)] bg-[color:var(--site-color-success-soft)]/70 px-4 py-3 text-sm text-[color:var(--site-color-success-text)]">
                      {state.successMessage}
                    </div>
                    <Link
                      href="/auth/login"
                      className="site-button inline-flex min-h-11 w-full items-center justify-center gap-2 px-5 py-3 text-sm"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Ir para o login
                    </Link>
                  </div>
                ) : (
                  <>
                    <TextField
                      id="password"
                      name="password"
                      type="password"
                      label="Nova senha"
                      placeholder="Digite a nova senha"
                      required
                      autoComplete="new-password"
                    />
                    <TextField
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      label="Confirmar nova senha"
                      placeholder="Repita a nova senha"
                      required
                      autoComplete="new-password"
                    />

                    <div className="site-stack-panel">
                      <PrimaryButton
                        type="submit"
                        disabled={state.pending || state.status !== "ready"}
                        fullWidth
                        trailingIcon={<ArrowRight className="h-4 w-4" />}
                      >
                        {state.pending
                          ? "Salvando..."
                          : state.status === "validating"
                            ? "Validando link..."
                            : "Redefinir senha"}
                      </PrimaryButton>
                      <Link
                        href="/auth/login"
                        className="site-button site-button-secondary inline-flex min-h-11 w-full items-center justify-center gap-2 px-5 py-3 text-sm"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar para o login
                      </Link>
                    </div>
                  </>
                )}

                {state.error ? (
                  <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-danger-soft)] bg-[color:var(--site-color-danger-soft)]/70 px-4 py-3 text-sm text-[color:var(--site-color-danger-text)]">
                    {state.error}
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
