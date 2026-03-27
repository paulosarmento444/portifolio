"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Lock, Shield } from "lucide-react";
import type { AccountCustomerView, AuthUserView } from "@site/shared";
import {
  MetricRow,
  ModalShell,
  PrimaryButton,
  SecondaryButton,
  SurfaceCard,
  TextField,
} from "@site/shared";
import type {
  AccountCustomerChangeHandler,
  AccountPasswordFormErrors,
  AccountPasswordFormData,
  AccountProfileFormData,
} from "../../data/account.types";
import {
  changeAccountPasswordAction,
  updateAccountProfileAction,
} from "../../data/actions/account.actions";
import {
  accountPasswordChangeSchema,
  mapAccountPasswordFieldErrors,
} from "../../data/schemas/account-password-change.schema";

interface AccountSectionProps {
  viewer: AuthUserView;
  customer: AccountCustomerView | null;
  onCustomerChange: AccountCustomerChangeHandler;
}

const EMPTY_PASSWORD_FORM: AccountPasswordFormData = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

const EMPTY_PASSWORD_FORM_ERRORS: AccountPasswordFormErrors = {};

export function AccountSection({
  viewer,
  customer,
  onCustomerChange,
}: AccountSectionProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [profilePending, setProfilePending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordFieldErrors, setPasswordFieldErrors] =
    useState<AccountPasswordFormErrors>(EMPTY_PASSWORD_FORM_ERRORS);
  const [form, setForm] = useState<AccountProfileFormData>({
    first_name: customer?.billingAddress?.firstName || viewer.firstName || "",
    last_name: customer?.billingAddress?.lastName || viewer.lastName || "",
    email: customer?.email || viewer.email || "",
    phone: customer?.billingAddress?.phone || "",
    city: customer?.billingAddress?.city || "",
  });
  const [passwordForm, setPasswordForm] =
    useState<AccountPasswordFormData>(EMPTY_PASSWORD_FORM);

  useEffect(() => {
    setForm({
      first_name: customer?.billingAddress?.firstName || viewer.firstName || "",
      last_name: customer?.billingAddress?.lastName || viewer.lastName || "",
      email: customer?.email || viewer.email || "",
      phone: customer?.billingAddress?.phone || "",
      city: customer?.billingAddress?.city || "",
    });
  }, [
    customer?.billingAddress?.city,
    customer?.billingAddress?.firstName,
    customer?.billingAddress?.lastName,
    customer?.billingAddress?.phone,
    customer?.email,
    viewer.email,
    viewer.firstName,
    viewer.lastName,
  ]);

  const displayName = useMemo(
    () => customer?.displayName || viewer.displayName,
    [customer?.displayName, viewer.displayName],
  );

  const roleLabel = viewer.roleLabels[0] || "Cliente";

  const accountInfo = [
    {
      label: "Nome",
      value: displayName,
      meta: "Identificação principal da conta",
    },
    {
      label: "Email",
      value: customer?.email || viewer.email || "Não informado",
      meta: "Canal principal para pedidos e recuperação",
    },
    {
      label: "Telefone",
      value: customer?.billingAddress?.phone || "Não informado",
      meta: "Contato usado no checkout",
    },
    {
      label: "Cidade",
      value: customer?.billingAddress?.city || "Não informado",
      meta: "Base do endereço atual",
    },
    {
      label: "Tipo de Conta",
      value: roleLabel,
      meta: "Permissão atual da conta",
    },
  ];

  const closeProfileModal = () => {
    setProfileError(null);
    setIsEditOpen(false);
  };

  const openPasswordModal = () => {
    setPasswordError(null);
    setPasswordFieldErrors(EMPTY_PASSWORD_FORM_ERRORS);
    setPasswordSuccess(null);
    setIsPasswordOpen(true);
  };

  const closePasswordModal = () => {
    setPasswordError(null);
    setPasswordFieldErrors(EMPTY_PASSWORD_FORM_ERRORS);
    setPasswordForm(EMPTY_PASSWORD_FORM);
    setIsPasswordOpen(false);
  };

  const handlePasswordFieldChange =
    (field: keyof AccountPasswordFormData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      setPasswordForm((current) => ({
        ...current,
        [field]: nextValue,
      }));
      setPasswordFieldErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
      setPasswordError(null);
    };

  async function handleSaveProfile(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!customer?.id) {
      setProfileError("Não foi possível identificar a conta para salvar os dados.");
      return;
    }

    try {
      setProfileError(null);
      setProfilePending(true);
      const result = await updateAccountProfileAction(customer.id, form);
      if (!result.success || !result.customer) {
        throw new Error(result.error || "Erro ao atualizar perfil");
      }
      onCustomerChange(result.customer);
      closeProfileModal();
    } catch (error) {
      console.error(error);
      setProfileError("Falha ao salvar os dados. Tente novamente.");
    } finally {
      setProfilePending(false);
    }
  }

  async function handleChangePassword(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!customer?.id) {
      setPasswordError("Não foi possível identificar a conta para alterar a senha.");
      return;
    }

    const parsedPasswordForm = accountPasswordChangeSchema.safeParse(passwordForm);

    if (!parsedPasswordForm.success) {
      setPasswordError(null);
      setPasswordFieldErrors(
        mapAccountPasswordFieldErrors(parsedPasswordForm.error.flatten().fieldErrors),
      );
      return;
    }

    try {
      setPasswordError(null);
      setPasswordSuccess(null);
      setPasswordFieldErrors(EMPTY_PASSWORD_FORM_ERRORS);
      setPasswordPending(true);
      const result = await changeAccountPasswordAction({
        customerId: customer.id,
        currentPassword: parsedPasswordForm.data.current_password,
        newPassword: parsedPasswordForm.data.new_password,
        confirmPassword: parsedPasswordForm.data.confirm_password,
      });

      if (!result.success) {
        setPasswordFieldErrors(result.fieldErrors ?? EMPTY_PASSWORD_FORM_ERRORS);
        setPasswordError(result.fieldErrors ? null : result.error || "Erro ao alterar senha");
        return;
      }

      closePasswordModal();
      setPasswordSuccess("Senha alterada com sucesso.");
    } catch (error) {
      console.error(error);
      setPasswordError("Falha ao alterar a senha. Tente novamente.");
    } finally {
      setPasswordPending(false);
    }
  }

  return (
    <div className="site-stack-section">
      <div className="site-stack-panel">
        <p className="site-eyebrow">Conta</p>
        <h2 className="site-text-section-title">Dados pessoais e segurança</h2>
        <p className="site-text-body">
          Atualize suas informações principais e mantenha a senha da conta em dia.
        </p>
      </div>

      <MetricRow
        items={accountInfo}
        className="xl:grid-cols-3"
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
        <SurfaceCard tone="soft" className="site-stack-section">
          <div className="site-stack-panel">
            <h3 className="site-text-card-title">Perfil da conta</h3>
            <p className="site-text-body text-sm">
              Nome, e-mail e contato usados em comunicações e no checkout.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-4 py-3">
              <p className="site-text-meta">Nome</p>
              <p className="site-text-card-title mt-1 text-base">{form.first_name || "Não informado"}</p>
            </div>
            <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-4 py-3">
              <p className="site-text-meta">Sobrenome</p>
              <p className="site-text-card-title mt-1 text-base">{form.last_name || "Não informado"}</p>
            </div>
            <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-4 py-3 md:col-span-2">
              <p className="site-text-meta">E-mail</p>
              <p className="site-text-card-title mt-1 text-base">{form.email || "Não informado"}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <PrimaryButton onClick={() => setIsEditOpen(true)}>Editar dados</PrimaryButton>
            <SecondaryButton onClick={openPasswordModal}>
              Alterar senha
            </SecondaryButton>
          </div>
          {passwordSuccess ? <p className="site-helper-text">{passwordSuccess}</p> : null}
        </SurfaceCard>

        <SurfaceCard tone="soft" className="site-stack-section">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="site-text-card-title">Segurança</h3>
              <p className="site-text-body text-sm">
                Mantenha sua conta protegida com uma senha forte.
              </p>
            </div>
          </div>
          <div className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-4 py-3 text-sm text-[color:var(--site-color-foreground-muted)]">
            Perfil, senha e checkout compartilham os mesmos dados principais da conta.
          </div>
          <SecondaryButton
            leadingIcon={<Lock className="h-4 w-4" />}
            onClick={openPasswordModal}
          >
            Revisar senha
          </SecondaryButton>
        </SurfaceCard>
      </div>

      <ModalShell
        isOpen={isEditOpen}
        onClose={closeProfileModal}
        title="Editar dados da conta"
        description="Atualize as informações principais usadas pela sua conta e pelo checkout."
        size="md"
        contentClassName="pr-1"
      >
        <form onSubmit={handleSaveProfile} className="site-stack-section">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Nome"
              value={form.first_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, first_name: event.target.value }))
              }
            />
            <TextField
              label="Sobrenome"
              value={form.last_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, last_name: event.target.value }))
              }
            />
            <TextField
              label="E-mail"
              type="email"
              containerClassName="md:col-span-2"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
            <TextField
              label="Telefone"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
            />
            <TextField
              label="Cidade"
              value={form.city}
              onChange={(event) =>
                setForm((current) => ({ ...current, city: event.target.value }))
              }
            />
          </div>
          {profileError ? <p className="site-helper-text site-helper-text-danger">{profileError}</p> : null}
          <div className="sticky bottom-0 z-10 -mb-1 flex flex-col gap-3 border-t border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-strong)] pt-4 sm:flex-row sm:justify-end">
            <SecondaryButton onClick={closeProfileModal}>Cancelar</SecondaryButton>
            <PrimaryButton type="submit" disabled={profilePending}>
              {profilePending ? "Salvando..." : "Salvar alterações"}
            </PrimaryButton>
          </div>
        </form>
      </ModalShell>

      <ModalShell
        isOpen={isPasswordOpen}
        onClose={closePasswordModal}
        title="Alterar senha"
        description="Escolha uma nova senha para manter sua conta protegida."
        size="sm"
        contentClassName="pr-1"
      >
        <form onSubmit={handleChangePassword} className="site-stack-section">
          <div className="grid gap-4">
            <TextField
              label="Senha atual"
              type="password"
              value={passwordForm.current_password}
              error={passwordFieldErrors.current_password}
              onChange={handlePasswordFieldChange("current_password")}
            />
            <TextField
              label="Nova senha"
              type="password"
              hint="Use pelo menos 8 caracteres e evite repetir a senha atual."
              value={passwordForm.new_password}
              error={passwordFieldErrors.new_password}
              onChange={handlePasswordFieldChange("new_password")}
            />
            <TextField
              label="Confirmar nova senha"
              type="password"
              value={passwordForm.confirm_password}
              error={passwordFieldErrors.confirm_password}
              onChange={handlePasswordFieldChange("confirm_password")}
            />
          </div>
          {passwordError ? <p className="site-helper-text site-helper-text-danger">{passwordError}</p> : null}
          <div className="sticky bottom-0 z-10 -mb-1 flex flex-col gap-3 border-t border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-strong)] pt-4 sm:flex-row sm:justify-end">
            <SecondaryButton onClick={closePasswordModal}>Cancelar</SecondaryButton>
            <PrimaryButton type="submit" disabled={passwordPending}>
              {passwordPending ? "Alterando..." : "Salvar nova senha"}
            </PrimaryButton>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}
