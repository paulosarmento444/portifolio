"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import type { CoCartCartStateView } from "@site/integrations/cocart";
import type { AccountCustomerView } from "@site/shared";
import {
  ModalShell,
  PrimaryButton,
  SecondaryButton,
  SelectField,
  TextField,
} from "@site/shared";
import type { CheckoutAddressFormData } from "../data/checkout.types";
import { saveCheckoutAddressAction } from "../data/actions/checkout.actions";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  initialAddress: CheckoutAddressFormData;
  onAddressSaved: (payload: {
    customer: AccountCustomerView;
    cart?: CoCartCartStateView | null;
  }) => void;
}

const BRAZIL_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export function AddressModal({
  isOpen,
  onClose,
  customerId,
  initialAddress,
  onAddressSaved,
}: AddressModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CheckoutAddressFormData>(initialAddress);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialAddress);
      setError(null);
    }
  }, [initialAddress, isOpen]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    if (name === "phone") {
      const phoneValue = value.replace(/\D/g, "").slice(0, 11);
      const formattedPhone =
        phoneValue.length > 7
          ? `(${phoneValue.slice(0, 2)}) ${phoneValue.slice(2, 7)}-${phoneValue.slice(7)}`
          : phoneValue.length > 2
            ? `(${phoneValue.slice(0, 2)}) ${phoneValue.slice(2)}`
            : phoneValue;

      setFormData((current) => ({ ...current, phone: formattedPhone }));
      return;
    }

    if (name === "postcode") {
      const postcodeValue = value.replace(/\D/g, "").slice(0, 8);
      const formattedPostcode =
        postcodeValue.length > 5
          ? `${postcodeValue.slice(0, 5)}-${postcodeValue.slice(5)}`
          : postcodeValue;

      setFormData((current) => ({ ...current, postcode: formattedPostcode }));
      return;
    }

    setFormData((current) => ({ ...current, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields: Array<keyof CheckoutAddressFormData> = [
      "first_name",
      "last_name",
      "address_1",
      "city",
      "state",
      "postcode",
      "phone",
      "email",
    ];

    const missingField = requiredFields.find((field) => !String(formData[field] ?? "").trim());
    if (missingField) {
      return "Preencha todos os campos obrigatórios.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Informe um e-mail válido.";
    }

    if (formData.phone.replace(/\D/g, "").length < 10) {
      return "Informe um telefone com DDD válido.";
    }

    if (formData.postcode.replace(/\D/g, "").length !== 8) {
      return "Informe um CEP válido com 8 dígitos.";
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await saveCheckoutAddressAction(customerId, formData);
    if (!result.success || !result.customer) {
      setError(result.error || "Erro ao salvar endereço.");
      setIsLoading(false);
      return;
    }

    onAddressSaved({
      customer: result.customer,
      cart: result.cart ?? null,
    });
    setIsLoading(false);
    onClose();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Endereço de entrega"
      description="Preencha os dados de entrega e cobrança usados no pedido."
    >
      <div className="site-stack-section">
        <div className="flex items-center gap-3 rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] px-4 py-3 text-sm text-[color:var(--site-color-foreground-muted)]">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]">
            <MapPin className="h-4 w-4" />
          </div>
          <p>
            Seus dados serão usados para entrega, contato e histórico do pedido na sua conta.
          </p>
        </div>

        {error ? (
          <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-danger-soft)] bg-[color:var(--site-color-danger-soft)] px-4 py-3 text-sm text-[color:var(--site-color-danger-text)]">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="site-stack-section">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              name="first_name"
              label="Nome"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <TextField
              name="last_name"
              label="Sobrenome"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <TextField
            name="address_1"
            label="Endereço"
            hint="Inclua rua e número neste campo."
            value={formData.address_1}
            onChange={handleChange}
            required
          />

          <TextField
            name="address_2"
            label="Complemento"
            value={formData.address_2}
            onChange={handleChange}
            placeholder="Apartamento, bloco, referência"
          />

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
            <TextField
              name="city"
              label="Cidade"
              value={formData.city}
              onChange={handleChange}
              required
            />
            <SelectField
              name="state"
              label="Estado"
              value={formData.state}
              onChange={handleChange}
              required
            >
              <option value="">Selecione</option>
              {BRAZIL_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <TextField
              name="postcode"
              label="CEP"
              value={formData.postcode}
              onChange={handleChange}
              placeholder="00000-000"
              required
            />
            <TextField
              name="phone"
              label="Telefone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              required
            />
            <TextField
              name="email"
              type="email"
              label="E-mail"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-[color:var(--site-color-border)] pt-2 sm:flex-row sm:justify-end">
            <SecondaryButton type="button" onClick={onClose} className="justify-center">
              Cancelar
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={isLoading} className="justify-center sm:min-w-48">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Salvando..." : "Salvar endereço"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}
