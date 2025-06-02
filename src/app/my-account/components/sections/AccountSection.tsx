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

interface AccountSectionProps {
  username: string;
  billing: any;
  role: string;
}

export function AccountSection({
  username,
  billing,
  role,
}: AccountSectionProps) {
  const accountInfo = [
    {
      icon: User,
      label: "Nome",
      value: username,
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: Mail,
      label: "Email",
      value: billing?.email || "Não informado",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: Phone,
      label: "Telefone",
      value: billing?.phone || "Não informado",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: MapPin,
      label: "Cidade",
      value: billing?.city || "Não informado",
      color: "from-orange-500 to-red-600",
    },
    {
      icon: Calendar,
      label: "CPF",
      value: billing?.cpf || "Não informado",
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
              <button className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-lg text-cyan-400 hover:border-cyan-400/50 transition-all duration-300">
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
        <button className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-2xl font-bold transition-all duration-300">
          Salvar Alterações
        </button>
        <button className="flex-1 px-6 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white hover:border-gray-600/50 rounded-2xl font-bold transition-all duration-300">
          Cancelar
        </button>
      </motion.div>
    </div>
  );
}
