"use client";

import type React from "react";
import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation"; // ✅ Importação adicionada
import { AuthForm } from "@/app/auth/components/AuthForm";
import { apolloClient } from "@/app/lib/apolloClient";

const REGISTER_USER = gql`
  mutation registerUser(
    $username: String!
    $password: String!
    $email: String!
  ) {
    registerUser(
      input: { username: $username, password: $password, email: $email }
    ) {
      clientMutationId
      user {
        name
        slug
      }
    }
  }
`;

export default function RegisterForm() {
  const router = useRouter(); // ✅ Hook adicionado
  const [state, setState] = useState({ error: "", pending: false });
  const [registerUser] = useMutation(REGISTER_USER, {
    client: apolloClient,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState({ ...state, pending: true });

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const email = formData.get("email") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setState({ error: "As senhas não coincidem", pending: false });
      return;
    }

    try {
      const { data } = await registerUser({
        variables: {
          username,
          password,
          email,
        },
      });

      console.log("User registered successfully:", data);
      alert("Usuário registrado com sucesso!");

      // ✅ Redirecionar para a página de login
      router.push("login");
    } catch (error: any) {
      console.error("Error registering user:", error);
      setState({
        error: error.message || "Erro ao registrar usuário",
        pending: false,
      });
    }
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
