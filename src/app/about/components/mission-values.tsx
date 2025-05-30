"use client"

import { motion } from "framer-motion"
import { Target, Heart, Zap, Shield, Users, Trophy } from "lucide-react"

export default function MissionValues() {
  const values = [
    {
      icon: Target,
      title: "Missão",
      description:
        "Equipar atletas com produtos de alta qualidade para superar seus limites e alcançar seus objetivos esportivos.",
      gradient: "from-cyan-400 to-blue-500",
    },
    {
      icon: Heart,
      title: "Paixão",
      description:
        "Vivemos e respiramos esporte. Nossa paixão pelo que fazemos se reflete em cada produto que oferecemos.",
      gradient: "from-purple-400 to-pink-500",
    },
    {
      icon: Shield,
      title: "Qualidade",
      description: "Selecionamos apenas as melhores marcas e produtos, garantindo durabilidade e performance superior.",
      gradient: "from-orange-400 to-red-500",
    },
    {
      icon: Users,
      title: "Comunidade",
      description: "Construímos uma comunidade de atletas que se apoiam mutuamente na busca pela excelência.",
      gradient: "from-green-400 to-emerald-500",
    },
    {
      icon: Zap,
      title: "Inovação",
      description: "Sempre em busca das últimas tecnologias e tendências para oferecer o que há de mais moderno.",
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      icon: Trophy,
      title: "Excelência",
      description: "Buscamos a perfeição em tudo que fazemos, desde o atendimento até a entrega dos produtos.",
      gradient: "from-indigo-400 to-purple-500",
    },
  ]

  return (
    <section className="relative py-20 px-6 bg-gray-950 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Nossos{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Valores
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Princípios que nos guiam na missão de transformar atletas em campeões
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Card Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 group-hover:border-gray-600/50 transition-all duration-500"></div>

              {/* Glow Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${value.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
              ></div>

              <div className="relative p-8 text-center">
                {/* Icon */}
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${value.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <value.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed">{value.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
