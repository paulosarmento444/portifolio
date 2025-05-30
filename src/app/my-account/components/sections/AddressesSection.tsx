"use client"

import { motion } from "framer-motion"
import { MapPin, Home, Building, Plus, Edit, Trash2 } from "lucide-react"

interface AddressesSectionProps {
  viewer: any
  billing: any
  shipping: any
}

export function AddressesSection({ viewer, billing, shipping }: AddressesSectionProps) {
  const addresses = [
    {
      id: 1,
      type: "billing",
      title: "Endereço de Cobrança",
      icon: Building,
      color: "from-cyan-500 to-blue-600",
      data: billing,
    },
    {
      id: 2,
      type: "shipping",
      title: "Endereço de Entrega",
      icon: Home,
      color: "from-purple-500 to-pink-600",
      data: shipping,
    },
  ]

  const formatAddress = (address: any) => {
    if (!address || !address.address_1) {
      return "Endereço não cadastrado"
    }

    return `${address.address_1}, ${address.number || "S/N"} - ${address.neighborhood || ""}, ${address.city || ""} - ${address.state || ""}, ${address.postcode || ""}`
  }

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
        <p className="text-gray-300 text-lg">Gerencie seus endereços de cobrança e entrega</p>
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
                  <h3 className="text-xl font-bold text-white">{address.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Address Info */}
              <div className="space-y-4">
                {address.data && address.data.address_1 ? (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Nome</h4>
                      <p className="text-white">
                        {address.data.first_name} {address.data.last_name}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Endereço</h4>
                      <p className="text-white text-sm leading-relaxed">{formatAddress(address.data)}</p>
                    </div>

                    {address.data.phone && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Telefone</h4>
                        <p className="text-white">{address.data.phone}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Nenhum endereço cadastrado</p>
                    <button className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-lg text-cyan-400 hover:border-cyan-400/50 transition-all duration-300 text-sm">
                      Adicionar Endereço
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Add New Address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gray-800/30 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-600 hover:border-gray-500 transition-all duration-300"></div>

        <button className="relative w-full p-8 text-center group">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Adicionar Novo Endereço</h3>
          <p className="text-gray-400">Cadastre um novo endereço para facilitar suas compras</p>
        </button>
      </motion.div>
    </div>
  )
}
