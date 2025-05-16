"use client";

import { z } from "zod";
import { SectionTitle } from "../section-title";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../button/FormButton";
import { HiArrowNarrowRight } from "react-icons/hi";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import { fadeUpAnimation } from "@/app/lib/animations";
import { parsePhoneNumber } from "libphonenumber-js";
import ReactInputMask from "react-input-mask";
import { useEffect } from "react";

const contactFormSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  phone: z.string(),

  message: z.string().min(1).max(500),
});

function isValidPhoneNumber(value: string) {
  try {
    const phoneNumber = parsePhoneNumber(value, "BR"); // Substitua 'BR' pelo código do país desejado
    return phoneNumber?.isValid();
  } catch (error) {
    return false;
  }
}

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
      className="py-16 px-6 md:py-32 flex items-center justify-center bg-gray-950"
      id="contact"
    >
      <div className="w-full max-w-[420px] mx-auto">
        <SectionTitle
          subtitle="contato"
          title="Entre em contato"
          className="items-center text-center"
        />
        <motion.form
          className="mt-12 w-full flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
          {...fadeUpAnimation}
        >
          <input
            placeholder="Nome"
            className="w-full h-14 bg-gray-800 rounded-lg placeholder:text-gray-400 text-gray-50 p-4 focus:outline-none focus:ring-2 ring-emerald-600"
            {...register("name")}
          />
          <input
            placeholder="E-mail"
            type="email"
            className="w-full h-14 bg-gray-800 rounded-lg placeholder:text-gray-400 text-gray-50 p-4 focus:outline-none focus:ring-2 ring-emerald-600"
            {...register("email")}
          />
          <ReactInputMask
            // alwaysShowMask
            mask="+55 (99) 9999-99999"
            id="phone"
            // maskChar="_"
            placeholder="+55 (99) 9999-9999"
            type="tel"
            className="w-full h-14 bg-gray-800 rounded-lg placeholder:text-gray-400 text-gray-50 p-4 focus:outline-none focus:ring-2 ring-emerald-600"
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
            <p className="text-red-500">{errors.phone?.message}</p>
          )}
          <textarea
            placeholder="Mensagem"
            className="resize-none w-full h-[138px] bg-gray-800 rounded-lg placeholder:text-gray-400 text-gray-50 p-4 focus:outline-none focus:ring-2 ring-emerald-600"
            {...register("message")}
            maxLength={500}
          />

          <div className="relative w-max mx-auto mt-6">
            <Button className="z-[2] relative" disabled={isSubmitting}>
              Enviar mensagem
              <HiArrowNarrowRight size={18} />
            </Button>
            <div className="absolute inset-0 bg-emerald-600 blur-2xl opacity-20" />
          </div>
        </motion.form>
        {isInvalidPhone && toast.error("")}
      </div>
    </section>
  );
};
