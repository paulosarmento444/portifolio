"use client";
import { type FormEvent, useState } from "react";
import { loginCredentialsSchema } from "@site/shared";
import { loginUserAction } from "../../data/actions/auth.actions";
import { INITIAL_AUTH_FORM_STATE } from "../../data/auth-state";
import { AuthForm } from "../shared/auth-form.component";

export default function LoginForm() {
  const [state, setState] = useState(INITIAL_AUTH_FORM_STATE);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState((current) => ({ ...current, error: "", pending: true }));

    const formData = new FormData(e.currentTarget);
    const parseResult = loginCredentialsSchema.safeParse({
      usernameOrEmail: String(formData.get("usernameEmail") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (!parseResult.success) {
      setState({
        error:
          parseResult.error.issues[0]?.message || "Dados de login inválidos",
        pending: false,
      });
      return;
    }

    try {
      const res = await loginUserAction(state, formData);
      if (res?.error) {
        setState({ error: res.error, pending: false });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setState({
        error: "Não foi possível entrar. Tente novamente.",
        pending: false,
      });
    }
  };

  return (
    <AuthForm
      formType="login"
      onSubmit={handleSubmit}
      error={state.error}
      pending={state.pending}
    />
  );
}
