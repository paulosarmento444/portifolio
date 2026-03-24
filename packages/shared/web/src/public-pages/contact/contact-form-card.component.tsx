"use client";

import { useEffect } from "react";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import ReactInputMask from "react-input-mask";
import { Clock3, Send, ShieldCheck } from "lucide-react";
import {
  Button,
  FieldShell,
  StatusBadge,
  SurfaceCard,
  TextAreaField,
  TextField,
} from "../../ui";

const contactFormSchema = z.object({
  name: z.string().min(3, "Informe seu nome completo.").max(100, "Nome muito longo."),
  email: z.string().email("Informe um e-mail valido."),
  phone: z.string(),
  message: z.string().min(1, "Escreva sua mensagem.").max(500, "Use ate 500 caracteres."),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const defaultValues: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

interface ContactFormCardProps {
  id?: string;
}

export function ContactFormCard({ id }: Readonly<ContactFormCardProps>) {
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { isSubmitting, errors, dirtyFields },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  });

  useEffect(() => {
    register("phone");
  }, [register]);

  const phoneFieldId = "contact-phone";
  const isInvalidPhone = Boolean(errors.phone && dirtyFields.phone);
  const phoneHintId = isInvalidPhone ? undefined : `${phoneFieldId}-hint`;
  const phoneErrorId = isInvalidPhone ? `${phoneFieldId}-error` : undefined;
  const phoneDescribedBy = phoneErrorId ?? phoneHintId;

  const onSubmit = async (data: ContactFormData) => {
    try {
      await axios.post("/api/contact", data);
      toast.success("Mensagem enviada com sucesso!");
      reset(defaultValues);
    } catch {
      toast.error("Ocorreu um erro ao enviar a mensagem. Tente novamente.");
    }
  };

  return (
    <SurfaceCard id={id} tone="strong" className="site-stack-section scroll-mt-28">
      <div className="site-stack-panel gap-3">
        <div className="site-action-cluster">
          <StatusBadge tone="success">
            <ShieldCheck className="h-3.5 w-3.5" />
            Atendimento humano
          </StatusBadge>
          <StatusBadge tone="info">
            <Clock3 className="h-3.5 w-3.5" />
            Resposta em horario comercial
          </StatusBadge>
        </div>
        <div className="site-stack-panel gap-2">
          <p className="site-text-meta uppercase tracking-[0.14em]">Enviar mensagem</p>
          <h2 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
            Conte o contexto e a equipe responde com mais rapidez.
          </h2>
          <p className="site-text-body site-readable-sm text-sm">
            Use o formulario para duvidas sobre produto, pedido, troca ou orientacao antes da compra.
          </p>
        </div>
      </div>

      <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting}>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Nome"
            placeholder="Seu nome completo"
            autoComplete="name"
            error={errors.name?.message}
            required
            {...register("name")}
          />

          <TextField
            label="E-mail"
            placeholder="voce@exemplo.com"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            required
            {...register("email")}
          />
        </div>

        <FieldShell
          label="Telefone"
          htmlFor={phoneFieldId}
          hint="Inclua DDD para facilitar o retorno, se necessario."
          hintId={phoneHintId}
          error={isInvalidPhone ? errors.phone?.message : undefined}
          errorId={phoneErrorId}
        >
          <ReactInputMask
            id={phoneFieldId}
            mask="+55 (99) 99999-9999"
            placeholder="+55 (11) 99999-9999"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={isInvalidPhone || undefined}
            aria-describedby={phoneDescribedBy}
            className="site-field"
            {...register("phone", {
              validate: (value) =>
                (value.trim() === "" || value.replace(/\D/g, "").length >= 10) ||
                "Telefone invalido.",
            })}
            onChange={(event) => {
              setValue("phone", event.target.value, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          />
        </FieldShell>

        <TextAreaField
          label="Mensagem"
          placeholder="Explique o que voce precisa: produto, pedido, troca, entrega ou orientacao antes da compra."
          autoComplete="off"
          error={errors.message?.message}
          hint="Se houver pedido, inclua numero, produto e o que precisa resolver."
          maxLength={500}
          rows={6}
          required
          {...register("message")}
        />

        <div className="flex flex-col gap-4 border-t border-[color:var(--site-color-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="site-stack-panel gap-1">
            <span className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
              Retorno em horario comercial
            </span>
            <span className="site-text-meta">Seg a sex, 8h as 18h.</span>
          </div>
          <Button type="submit" disabled={isSubmitting} variant="primary" size="lg">
            {isSubmitting ? "Enviando..." : "Enviar mensagem"}
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </SurfaceCard>
  );
}
