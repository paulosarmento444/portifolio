"use client";

import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
} from "lucide-react";
import { useEffect, useState } from "react";
import { woocommerceClient } from "@/app/lib/wooCommerce";
import {
  updateCustomerProfile,
  changeCustomerPassword,
} from "@/app/server-actions/profile.action";

interface AccountSectionProps {
  username: string;
  billing: any;
  role: string;
  customerId: number | string;
}

export function AccountSection({
  username,
  billing,
  role,
  customerId,
}: AccountSectionProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [displayUsername, setDisplayUsername] = useState<string>(username);
  const [displayBilling, setDisplayBilling] = useState<any>(billing || {});
  const [form, setForm] = useState({
    first_name: billing?.first_name || "",
    last_name: billing?.last_name || "",
    email: billing?.email || "",
    phone: billing?.phone || "",
    city: billing?.city || "",
    cpf: billing?.cpf || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Reidrata dados de perfil ao montar (persistência similar a endereços)
  useEffect(() => {
    try {
      const key = `profile_${customerId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDisplayBilling((prev: any) => ({ ...prev, ...parsed }));
        setForm((prev) => ({ ...prev, ...parsed }));
        const composedName = `${parsed.first_name || ""}${
          parsed.first_name || parsed.last_name ? " " : ""
        }${parsed.last_name || ""}`.trim();
        if (composedName) setDisplayUsername(composedName);
      }
    } catch {}
  }, [customerId]);

  async function handleSaveProfile() {
    try {
      setPending(true);
      const res = await updateCustomerProfile(customerId, form);
      if (!res?.success) {
        throw new Error(res?.error || "Erro ao atualizar perfil");
      }
      // Atualiza estado local para refletir imediatamente na UI
      setDisplayBilling((prev: any) => ({ ...prev, ...form }));
      const composedName = `${form.first_name || ""}${
        form.first_name || form.last_name ? " " : ""
      }${form.last_name || ""}`.trim();
      if (composedName.length > 0) {
        setDisplayUsername(composedName);
      }
      try {
        localStorage.setItem(
          `profile_${customerId}`,
          JSON.stringify({ ...form })
        );
        // dispara evento global para o header atualizar
        window.dispatchEvent(new Event("profile-updated"));
      } catch {}
      setIsEditOpen(false);
    } catch (e) {
      alert("Falha ao salvar. Tente novamente.");
      console.error(e);
    } finally {
      setPending(false);
    }
  }

  async function handleChangePassword() {
    try {
      if (
        !passwordForm.new_password ||
        passwordForm.new_password !== passwordForm.confirm_password
      ) {
        alert("As senhas não coincidem");
        return;
      }
      setPending(true);
      const res = await changeCustomerPassword(
        customerId,
        passwordForm.current_password,
        passwordForm.new_password
      );
      if (!res?.success) {
        throw new Error(res?.error || "Erro ao alterar senha");
      }
      setIsPasswordOpen(false);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      alert("Senha alterada com sucesso. Faça login novamente se necessário.");
    } catch (e) {
      alert("Falha ao alterar senha. Tente novamente.");
      console.error(e);
    } finally {
      setPending(false);
    }
  }
  const accountInfo = [
    {
      icon: User,
      label: "Nome",
      value: displayUsername,
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: Mail,
      label: "Email",
      value: displayBilling?.email || "Não informado",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: Phone,
      label: "Telefone",
      value: displayBilling?.phone || "Não informado",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: MapPin,
      label: "Cidade",
      value: displayBilling?.city || "Não informado",
      color: "from-orange-500 to-red-600",
    },
    {
      icon: Calendar,
      label: "CPF",
      value: displayBilling?.cpf || "Não informado",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: Shield,
      label: "Tipo de Conta",
      value: role || "Cliente",
      color: "from-yellow-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Informações da Conta
          </span>
        </h2>
        <p className="text-gray-300 text-lg">
          Gerencie suas informações pessoais e configurações
        </p>
      </motion.div>

      {/* Account Info Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {accountInfo.map((info, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative group"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 group-hover:border-gray-600/50 transition-all duration-300"></div>

            <div className="relative p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <info.icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">
                    {info.label}
                  </h3>
                  <p className="text-lg font-semibold text-white truncate">
                    {info.value}
                  </p>
                </div>

                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50"></div>

        <div className="relative p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            Segurança da Conta
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
              <div>
                <h4 className="text-white font-medium">Alterar Senha</h4>
                <p className="text-gray-400 text-sm">
                  Última alteração há 30 dias
                </p>
              </div>
              <button
                onClick={() => setIsPasswordOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-lg text-cyan-400 hover:border-cyan-400/50 transition-all duration-300"
              >
                Alterar
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={() => setIsEditOpen(true)}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300"
        >
          Editar Dados
        </button>
        <button className="flex-1 px-6 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white hover:border-gray-600/50 rounded-2xl font-bold transition-all duration-300">
          Cancelar
        </button>
      </motion.div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsEditOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Editar Dados da Conta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                placeholder="Nome"
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
              />
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                placeholder="Sobrenome"
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
              />
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white md:col-span-2"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                placeholder="Telefone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                placeholder="Cidade"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white md:col-span-2"
                placeholder="CPF"
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={pending}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {isPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsPasswordOpen(false)}
          />
          <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Alterar Senha</h3>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="password"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                placeholder="Senha atual"
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    current_password: e.target.value,
                  })
                }
              />
              <input
                type="password"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                placeholder="Nova senha"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    new_password: e.target.value,
                  })
                }
              />
              <input
                type="password"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                placeholder="Confirmar nova senha"
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirm_password: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setIsPasswordOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                disabled={pending}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl"
              >
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
