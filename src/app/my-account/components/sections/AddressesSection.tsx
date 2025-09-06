"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Home,
  Building,
  Plus,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  updateBillingAddress,
  updateShippingAddress,
} from "@/app/server-actions/address.action";

interface AddressesSectionProps {
  viewer: any;
  billing: any;
  shipping: any;
}

export function AddressesSection({
  viewer,
  billing,
  shipping,
}: AddressesSectionProps) {
  const [currentBilling, setCurrentBilling] = useState<any>(billing);
  const [currentShipping, setCurrentShipping] = useState<any>(shipping);
  const [isModalOpen, setIsModalOpen] = useState<null | "billing" | "shipping">(
    null
  );
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<any>({
    first_name: "",
    last_name: "",
    address_1: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    postcode: "",
    phone: "",
    email: viewer?.email || "",
  });
  const addresses = [
    {
      id: 1,
      type: "billing",
      title: "Endereço de Cobrança",
      icon: Building,
      color: "from-cyan-500 to-blue-600",
      data: currentBilling,
    },
    {
      id: 2,
      type: "shipping",
      title: "Endereço de Entrega",
      icon: Home,
      color: "from-purple-500 to-pink-600",
      data: currentShipping,
    },
  ];

  const formatAddress = (address: any) => {
    if (!address || !address.address_1) {
      return "Endereço não cadastrado";
    }

    return `${address.address_1}, ${address.number || "S/N"} - ${
      address.neighborhood || ""
    }, ${address.city || ""} - ${address.state || ""}, ${
      address.postcode || ""
    }`;
  };

  const openModal = (type: "billing" | "shipping", data?: any) => {
    setForm({
      first_name: data?.first_name || "",
      last_name: data?.last_name || "",
      address_1: data?.address_1 || "",
      number: data?.number || "",
      neighborhood: data?.neighborhood || "",
      city: data?.city || "",
      state: data?.state || "",
      postcode: data?.postcode || "",
      phone: data?.phone || "",
      email: viewer?.email || data?.email || "",
    });
    setIsModalOpen(type);
  };

  const handleSubmit = async () => {
    if (!isModalOpen) return;
    try {
      setPending(true);
      const res =
        isModalOpen === "billing"
          ? await updateBillingAddress(String(viewer.databaseId), form)
          : await updateShippingAddress(String(viewer.databaseId), form);
      if (!res?.success)
        throw new Error(res?.error || "Erro ao salvar endereço");
      if (isModalOpen === "billing") {
        setCurrentBilling({ ...form });
        try {
          localStorage.setItem(
            `address_billing_${viewer?.databaseId}`,
            JSON.stringify(form)
          );
        } catch {}
      } else {
        setCurrentShipping({ ...form });
        try {
          localStorage.setItem(
            `address_shipping_${viewer?.databaseId}`,
            JSON.stringify(form)
          );
        } catch {}
      }
      setIsModalOpen(null);
    } catch (e) {
      console.error(e);
      alert("Falha ao salvar endereço");
    } finally {
      setPending(false);
    }
  };

  // Reidratar de localStorage quando a seção montar (navegação entre menus)
  useEffect(() => {
    try {
      const b = localStorage.getItem(`address_billing_${viewer?.databaseId}`);
      if (b) setCurrentBilling(JSON.parse(b));
      const s = localStorage.getItem(`address_shipping_${viewer?.databaseId}`);
      if (s) setCurrentShipping(JSON.parse(s));
    } catch {}
  }, [viewer?.databaseId]);

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
            Meus Endereços
          </span>
        </h2>
        <p className="text-gray-300 text-lg">
          Gerencie seus endereços de cobrança e entrega
        </p>
      </motion.div>

      {/* Addresses Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {addresses.map((address, index) => (
          <motion.div
            key={address.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative group"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 group-hover:border-gray-600/50 transition-all duration-300"></div>

            <div className="relative p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${address.color} rounded-xl flex items-center justify-center`}
                  >
                    <address.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {address.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(address.type as any, address.data)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openModal(address.type as any)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Address Info */}
              <div className="space-y-4">
                {address.data && address.data.address_1 ? (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">
                        Nome
                      </h4>
                      <p className="text-white">
                        {address.data.first_name} {address.data.last_name}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">
                        Endereço
                      </h4>
                      <p className="text-white text-sm leading-relaxed">
                        {formatAddress(address.data)}
                      </p>
                    </div>

                    {address.data.phone && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">
                          Telefone
                        </h4>
                        <p className="text-white">{address.data.phone}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">
                      Nenhum endereço cadastrado
                    </p>
                    <button
                      onClick={() => openModal(address.type as any)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-lg text-cyan-400 hover:border-cyan-400/50 transition-all duration-300 text-sm"
                    >
                      Adicionar Endereço
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-lg bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">
              {isModalOpen === "billing"
                ? "Endereço de Cobrança"
                : "Endereço de Entrega"}
            </h3>
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
                placeholder="Endereço"
                value={form.address_1}
                onChange={(e) =>
                  setForm({ ...form, address_1: e.target.value })
                }
              />
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                placeholder="Número"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
              />
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                placeholder="Bairro"
                value={form.neighborhood}
                onChange={(e) =>
                  setForm({ ...form, neighborhood: e.target.value })
                }
              />
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                placeholder="Cidade"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                placeholder="Estado"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                placeholder="CEP"
                value={form.postcode}
                onChange={(e) => setForm({ ...form, postcode: e.target.value })}
              />
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white md:col-span-2"
                placeholder="Telefone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setIsModalOpen(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={pending}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl inline-flex items-center gap-2"
              >
                {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
