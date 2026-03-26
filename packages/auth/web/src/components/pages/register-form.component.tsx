"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerCredentialsSchema } from "@site/shared";
import { registerUserAction } from "../../data/actions/auth.actions";
import { INITIAL_AUTH_FORM_STATE } from "../../data/auth-state";
import { AuthForm } from "../shared/auth-form.component";

export default function RegisterForm() {
  const router = useRouter();
  const [state, setState] = useState(INITIAL_AUTH_FORM_STATE);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState({ error: "", pending: true });

    const formData = new FormData(e.currentTarget);
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");
    const email = String(formData.get("email") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    const parseResult = registerCredentialsSchema.safeParse({
      username,
      password,
      email,
      confirmPassword,
    });

    if (!parseResult.success) {
      setState({
        error:
          parseResult.error.issues[0]?.message || "Dados de cadastro inválidos",
        pending: false,
      });
      return;
    }

    try {
      await registerUserAction({
        username,
        password,
        email,
        confirmPassword,
      });

      router.push("/auth/login");
    } catch (error: any) {
      setState({
        error: error?.message || "Erro ao registrar usuário",
        pending: false,
      });
      return;
    }

    setState({ error: "", pending: false });
  };

  return (
    <AuthForm
      formType="register"
      onSubmit={handleSubmit}
      error={state.error}
      pending={state.pending}
    />
  );
}
