"use client";
import React from "react";
import { gql, useMutation } from "@apollo/client";
import { AuthForm } from "@/app/components/AuthForm";
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
  const [registerUser, { data, loading, error }] = useMutation(REGISTER_USER, {
    client: apolloClient, // Utilize o apolloClient configurado
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const email = formData.get("email") as string;

    try {
      const { data } = await registerUser({
        variables: {
          username,
          password,
          email,
        },
      });

      console.log("User registered successfully:", data);
      alert("User registered successfully");
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Error registering user");
    }
  };

  return <AuthForm formType="register" onSubmit={handleSubmit} />;
}
