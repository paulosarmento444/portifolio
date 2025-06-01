"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import { parsePhoneNumber } from "libphonenumber-js";
import ReactInputMask from "react-input-mask";
import { useEffect } from "react";
import {
  Send,
  User,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "../../components/button/FormButton";

const contactFormSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  phone: z.string(),
  message: z.string().min(1).max(500),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export const ContactForm = () => {
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { isSubmitting, errors, dirtyFields },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  useEffect(() => {
    register("phone");
  }, [register]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      await axios.post("/api/contact", data);
      toast.success("Mensagem enviada com sucesso!");
      setValue("phone", "");
      reset();
    } catch (error) {
      toast.error("Ocorreu um erro ao enviar a mensagem. Tente novamente.");
    }
  };

  const isInvalidPhone = errors.phone && dirtyFields.phone;

  return (
    <section
      className="relative py-20 px-6 md:py-32 bg-black overflow-hidden"
      id="contact"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-20 animate-bounce">
          <div className="bg-cyan-400/20 backdrop-blur-sm rounded-full p-3 border border-cyan-400/30">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
        <div className="absolute top-40 right-32 animate-bounce delay-500">
          <div className="bg-purple-400/20 backdrop-blur-sm rounded-full p-3 border border-purple-400/30">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-cyan-400/30 mb-6">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-medium">Contato</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Fale Conosco
            </span>
          </h2>

          <p className="text-xl text-gray-300 max-w-lg mx-auto">
            Pronto para elevar seu desempenho? Entre em contato e descubra os
            melhores equipamentos esportivos!
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {/* Form Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-gray-700/50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>

          <form
            className="relative p-8 md:p-12 space-y-8"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Name Field */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <User className="w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                placeholder="Seu nome completo"
                className="w-full h-16 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl placeholder:text-gray-400 text-white pl-14 pr-6 text-lg focus:outline-none focus:border-cyan-400/50 focus:bg-gray-800/70 transition-all duration-300"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-2 ml-4">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                placeholder="seu@email.com"
                type="email"
                className="w-full h-16 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl placeholder:text-gray-400 text-white pl-14 pr-6 text-lg focus:outline-none focus:border-cyan-400/50 focus:bg-gray-800/70 transition-all duration-300"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-2 ml-4">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <ReactInputMask
                mask="+55 (99) 9999-99999"
                placeholder="+55 (99) 9999-9999"
                type="tel"
                className="w-full h-16 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl placeholder:text-gray-400 text-white pl-14 pr-6 text-lg focus:outline-none focus:border-cyan-400/50 focus:bg-gray-800/70 transition-all duration-300"
                {...register("phone", {
                  validate: (value) =>
                    (dirtyFields.phone ? value.length === 17 : true) ||
                    "Telefone inválido",
                })}
                onChange={(event) => {
                  setValue("phone", event.target.value);
                }}
              />
              {isInvalidPhone && (
                <p className="text-red-400 text-sm mt-2 ml-4">
                  {errors.phone?.message}
                </p>
              )}
            </div>

            {/* Message Field */}
            <div className="relative group">
              <div className="absolute left-4 top-6 z-10">
                <MessageSquare className="w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <textarea
                placeholder="Conte-nos como podemos ajudar você a alcançar seus objetivos esportivos..."
                className="resize-none w-full h-40 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl placeholder:text-gray-400 text-white pl-14 pr-6 pt-6 pb-6 text-lg focus:outline-none focus:border-cyan-400/50 focus:bg-gray-800/70 transition-all duration-300"
                {...register("message")}
                maxLength={500}
              />
              {errors.message && (
                <p className="text-red-400 text-sm mt-2 ml-4">
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="relative bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold px-12 py-6 text-lg rounded-2xl border-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
                >
                  {/* Button Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

                  <span className="relative flex items-center gap-3">
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar Mensagem
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
              </motion.div>
            </div>
          </form>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          className="mt-16 grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="text-center p-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Telefone</h3>
            <p className="text-gray-400">+55 (11) 9999-9999</p>
          </div>

          <div className="text-center p-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">E-mail</h3>
            <p className="text-gray-400">contato@loja.com</p>
          </div>

          <div className="text-center p-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Atendimento</h3>
            <p className="text-gray-400">Seg - Sex: 8h às 18h</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
