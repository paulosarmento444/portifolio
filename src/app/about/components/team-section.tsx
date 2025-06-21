"use client";

import { motion } from "framer-motion";
import { Linkedin, Instagram, Mail } from "lucide-react";

export default function TeamSection() {
  const team = [
    {
      name: "Paulo César Sarmento",
      role: "Representante Comercial Senior",
      description: "Vendedor e especialista em atendimento personalizado.",
      image: "/representante.jpg?height=300&width=300",
      social: {
        linkedin: "#",
        instagram: "#",
        email: "carlos@loja.com",
      },
    },
    {
      name: "Maria Helena da Silva",
      role: "Diretora Comercial",
      description:
        "Especialista em equipamentos esportivos e tendências do mercado fitness.",
      image: "/ceo.png?height=300&width=300",
      social: {
        linkedin: "#",
        instagram: "#",
        email: "ana@loja.com",
      },
    },
    {
      name: "Paulo César Sarmento Júnior",
      role: "Gerente de Tecnologia",
      description:
        "Apaixonado por tecnologia e especialista em atendimento personalizado.",
      image: "/tecnico.jpeg?height=300&width=300",
      social: {
        linkedin: "#",
        instagram: "#",
        email: "roberto@loja.com",
      },
    },
  ];

  return (
    <section className="relative py-20 px-6 bg-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
            Nossa{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Equipe
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Profissionais apaixonados por esporte, dedicados a oferecer a melhor
            experiência para nossos clientes
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              {/* Card Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 group-hover:border-cyan-400/50 transition-all duration-500"></div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>

              <div className="relative p-8 text-center">
                {/* Photo */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-700 group-hover:border-cyan-400/50 transition-colors duration-300">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Online Indicator */}
                  <div className="absolute bottom-2 right-1/2 transform translate-x-16 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900"></div>
                </div>

                {/* Info */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-cyan-400 font-semibold mb-4">
                  {member.role}
                </p>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {member.description}
                </p>

                {/* Social Links */}
                <div className="flex justify-center gap-4">
                  <a
                    href={member.social.linkedin}
                    className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-300 group/social"
                  >
                    <Linkedin className="w-5 h-5 text-gray-400 group-hover/social:text-white transition-colors" />
                  </a>
                  <a
                    href={member.social.instagram}
                    className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors duration-300 group/social"
                  >
                    <Instagram className="w-5 h-5 text-gray-400 group-hover/social:text-white transition-colors" />
                  </a>
                  <a
                    href={`mailto:${member.social.email}`}
                    className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors duration-300 group/social"
                  >
                    <Mail className="w-5 h-5 text-gray-400 group-hover/social:text-white transition-colors" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
