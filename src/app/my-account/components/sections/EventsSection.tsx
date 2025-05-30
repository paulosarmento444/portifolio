"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Users, Star } from "lucide-react"

export function EventsSection() {
  const events = [
    {
      id: 1,
      title: "Campeonato de Futebol",
      date: "2024-02-15",
      time: "14:00",
      location: "Estádio Municipal",
      participants: 24,
      status: "confirmed",
    },
    {
      id: 2,
      title: "Torneio de Tênis",
      date: "2024-02-20",
      time: "09:00",
      location: "Clube de Tênis",
      participants: 16,
      status: "pending",
    },
    {
      id: 3,
      title: "Maratona da Cidade",
      date: "2024-03-01",
      time: "06:00",
      location: "Centro da Cidade",
      participants: 150,
      status: "registered",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-400/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
      case "registered":
        return "bg-blue-500/20 text-blue-400 border-blue-400/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400/30"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado"
      case "pending":
        return "Pendente"
      case "registered":
        return "Inscrito"
      default:
        return "Desconhecido"
    }
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
            Meus Eventos
          </span>
        </h2>
        <p className="text-gray-300 text-lg">Acompanhe seus eventos esportivos e competições</p>
      </motion.div>

      {/* Events List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative group"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 group-hover:border-gray-600/50 transition-all duration-300"></div>

            <div className="relative p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Event Info */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-white">{event.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(event.status)}`}
                      >
                        {getStatusText(event.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{new Date(event.date).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{event.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-300">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{event.participants} participantes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Actions */}
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">Evento Premium</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-lg text-cyan-400 hover:border-cyan-400/50 transition-all duration-300 text-sm">
                      Ver Detalhes
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-lg text-orange-400 hover:border-orange-400/50 transition-all duration-300 text-sm">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Add New Event */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center"
      >
        <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl font-bold transition-all duration-300">
          Participar de Novo Evento
        </button>
      </motion.div>
    </div>
  )
}
