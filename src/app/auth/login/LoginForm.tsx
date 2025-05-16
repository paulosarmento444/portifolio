"use client";
import { FormEvent, useState } from "react";
import { AuthForm } from "@/app/components/AuthForm";
import { loginAction } from "@/app/server-actions/auth.action";

export default function LoginForm() {
  const [state, setState] = useState({ error: "", pending: false });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState({ ...state, pending: true });

    try {
      const res = await loginAction(state, new FormData(e.currentTarget));
      if (res?.error) {
        setState({ ...state, error: res.error, pending: false });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setState({
        ...state,
        error: "An unexpected error occurred",
        pending: false,
      });
    }
  };

  return (
    <>
      <AuthForm
        formType="login"
        onSubmit={handleSubmit}
        error={state.error}
        pending={state.pending}
      />
    </>
  );
}
