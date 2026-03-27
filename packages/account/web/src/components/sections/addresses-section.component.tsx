"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Building, Home, MapPin } from "lucide-react";
import type { AccountCustomerView, AuthUserView } from "@site/shared";
import {
  EmptyState,
  MetricRow,
  ModalShell,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  SurfaceCard,
  TextField,
} from "@site/shared";
import type {
  AccountAddressFormData,
  AccountAddressFormErrors,
  AccountAddressType,
  AccountCustomerChangeHandler,
} from "../../data/account.types";
import { saveAccountAddressAction } from "../../data/actions/account.actions";
import { normalizeBrazilianStateValue } from "../../data/brazilian-states";
import {
  accountAddressSchema,
  mapAccountAddressFieldErrors,
} from "../../data/schemas/account-address.schema";
import { StateSelect } from "../fields/state-select.component";

interface AddressesSectionProps {
  viewer: AuthUserView;
  customer: AccountCustomerView | null;
  onCustomerChange: AccountCustomerChangeHandler;
}

const EMPTY_ADDRESS_FORM: AccountAddressFormData = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  postcode: "",
  country: "BR",
  phone: "",
  email: "",
};

export function AddressesSection({
  viewer,
  customer,
  onCustomerChange,
}: AddressesSectionProps) {
  const [currentType, setCurrentType] = useState<AccountAddressType | null>(null);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AccountAddressFormErrors>({});
  const [form, setForm] = useState<AccountAddressFormData>(EMPTY_ADDRESS_FORM);

  const billing = customer?.billingAddress ?? null;
  const shipping = customer?.shippingAddress ?? null;

  const addresses = useMemo(
    () => [
      {
        id: "billing",
        type: "billing" as const,
        title: "Endereço de cobrança",
        icon: Building,
        data: billing,
      },
      {
        id: "shipping",
        type: "shipping" as const,
        title: "Endereço de entrega",
        icon: Home,
        data: shipping,
      },
    ],
    [billing, shipping],
  );

  const formatAddress = (address: typeof billing) => {
    if (!address?.addressLine1) {
      return "Endereço não cadastrado";
    }

    return [
      address.addressLine1,
      address.addressLine2,
      `${address.city || ""} - ${address.state || ""}`.trim(),
      address.postcode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const openModal = (type: AccountAddressType) => {
    const source = type === "billing" ? billing : shipping;
    setErrorMessage(null);
    setFieldErrors({});
    setForm({
      first_name: source?.firstName || "",
      last_name: source?.lastName || "",
      address_1: source?.addressLine1 || "",
      address_2: source?.addressLine2 || "",
      city: source?.city || "",
      state: normalizeBrazilianStateValue(source?.state) || "",
      postcode: source?.postcode || "",
      country: source?.country || "BR",
      phone: source?.phone || "",
      email: source?.email || customer?.email || viewer.email || "",
    });
    setCurrentType(type);
  };

  const closeModal = () => {
    setErrorMessage(null);
    setFieldErrors({});
    setCurrentType(null);
  };

  const handleFieldChange =
    (field: keyof AccountAddressFormData) =>
    (
      event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>,
    ) => {
      const nextValue = event.target.value;

      setForm((current) => ({
        ...current,
        [field]: nextValue,
      }));
      setFieldErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
      setErrorMessage(null);
    };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!currentType || !customer?.id) {
      setErrorMessage("Não foi possível identificar a conta para salvar o endereço.");
      return;
    }

    const parsedForm = accountAddressSchema.safeParse(form);

    if (!parsedForm.success) {
      setErrorMessage(null);
      setFieldErrors(
        mapAccountAddressFieldErrors(parsedForm.error.flatten().fieldErrors),
      );
      return;
    }

    try {
      setErrorMessage(null);
      setFieldErrors({});
      setPending(true);
      const result = await saveAccountAddressAction(
        customer.id,
        currentType,
        parsedForm.data,
      );
      if (!result.success) {
        setFieldErrors(result.fieldErrors ?? {});
        setErrorMessage(result.fieldErrors ? null : result.error || "Erro ao salvar endereco");
        return;
      }
      onCustomerChange(result.customer);
      closeModal();
    } catch (error) {
      console.error(error);
      setErrorMessage("Falha ao salvar o endereço. Tente novamente.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="site-stack-section">
      <div className="site-stack-panel">
        <p className="site-eyebrow">Endereços</p>
        <h2 className="site-text-section-title">Cobrança e entrega</h2>
        <p className="site-text-body">
          Revise e edite os endereços usados no checkout para acelerar próximas compras.
        </p>
      </div>

      <MetricRow
        items={[
          {
            label: "Cobrança",
            value: billing?.city || "Não cadastrado",
            meta: billing?.addressLine1 ? "Pronto para checkout" : "Pendente",
          },
          {
            label: "Entrega",
            value: shipping?.city || "Não cadastrado",
            meta: shipping?.addressLine1 ? "Pronto para entrega" : "Pendente",
          },
          {
            label: "Contato",
            value: customer?.email || viewer.email || "Não informado",
            meta: "E-mail principal da conta",
          },
        ]}
        className="xl:grid-cols-3"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {addresses.map((address) => (
          <SurfaceCard key={address.id} tone="soft" className="site-stack-section">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]">
                  <address.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="site-text-card-title">{address.title}</h3>
                  <p className="site-text-body text-sm">
                    {address.type === "billing"
                      ? "Dados usados na cobrança e no cadastro."
                      : "Destino padrão para entrega dos pedidos."}
                  </p>
                </div>
              </div>
              <StatusBadge tone={address.type === "billing" ? "info" : "accent"}>
                {address.type === "billing" ? "Cobrança" : "Entrega"}
              </StatusBadge>
            </div>

            {address.data?.addressLine1 ? (
              <div className="grid gap-3">
                <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-4 py-3">
                  <p className="site-text-meta">Nome</p>
                  <p className="site-text-card-title mt-1 text-base">
                    {address.data.firstName} {address.data.lastName}
                  </p>
                </div>
                <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-4 py-3">
                  <p className="site-text-meta">Endereço</p>
                  <p className="site-text-body mt-1 text-sm">{formatAddress(address.data)}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-4 py-3">
                    <p className="site-text-meta">Telefone</p>
                    <p className="site-text-card-title mt-1 text-base">
                      {address.data.phone || "Não informado"}
                    </p>
                  </div>
                  <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-4 py-3">
                    <p className="site-text-meta">
                      {address.type === "billing" ? "E-mail" : "Complemento"}
                    </p>
                    <p className="site-text-card-title mt-1 text-base">
                      {address.type === "billing"
                        ? address.data.email || customer?.email || viewer.email || "Não informado"
                        : address.data.addressLine2 || "Não informado"}
                    </p>
                  </div>
                </div>
                <SecondaryButton size="sm" onClick={() => openModal(address.type)}>
                  Editar endereço
                </SecondaryButton>
              </div>
            ) : (
              <EmptyState
                icon={<MapPin className="h-6 w-6" />}
                title="Nenhum endereço cadastrado"
                description="Adicione este endereço para agilizar o checkout."
                action={
                  <SecondaryButton size="sm" onClick={() => openModal(address.type)}>
                    Adicionar endereço
                  </SecondaryButton>
                }
              />
            )}
          </SurfaceCard>
        ))}
      </div>

      <ModalShell
        isOpen={Boolean(currentType)}
        onClose={closeModal}
        title={
          currentType === "billing"
            ? "Editar endereço de cobrança"
            : "Editar endereço de entrega"
        }
        description="Mantenha seus dados de endereço prontos para o checkout."
        size="md"
        contentClassName="pr-1"
      >
        <form noValidate onSubmit={handleSubmit} className="site-stack-section">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Nome"
              value={form.first_name}
              onChange={handleFieldChange("first_name")}
            />
            <TextField
              label="Sobrenome"
              value={form.last_name}
              onChange={handleFieldChange("last_name")}
            />
            <TextField
              label="Endereço"
              hint="Inclua rua e número neste campo."
              containerClassName="md:col-span-2"
              value={form.address_1}
              onChange={handleFieldChange("address_1")}
            />
            <TextField
              label="Complemento"
              containerClassName="md:col-span-2"
              value={form.address_2}
              onChange={handleFieldChange("address_2")}
            />
            <TextField
              label="Cidade"
              value={form.city}
              onChange={handleFieldChange("city")}
            />
            <StateSelect
              label="Estado"
              placeholder="Selecione o estado"
              error={fieldErrors.state}
              value={form.state}
              onChange={handleFieldChange("state")}
            />
            <TextField
              label="CEP"
              value={form.postcode}
              onChange={handleFieldChange("postcode")}
            />
            <TextField
              label="Telefone"
              value={form.phone}
              onChange={handleFieldChange("phone")}
            />
            {currentType === "billing" ? (
              <TextField
                label="E-mail"
                type="email"
                containerClassName="md:col-span-2"
                value={form.email}
                onChange={handleFieldChange("email")}
              />
            ) : null}
          </div>
          {errorMessage ? <p className="site-helper-text site-helper-text-danger">{errorMessage}</p> : null}
          <div className="sticky bottom-0 z-10 -mb-1 flex flex-col gap-3 border-t border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-strong)] pt-4 sm:flex-row sm:justify-end">
            <SecondaryButton onClick={closeModal}>Cancelar</SecondaryButton>
            <PrimaryButton type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar endereço"}
            </PrimaryButton>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}
