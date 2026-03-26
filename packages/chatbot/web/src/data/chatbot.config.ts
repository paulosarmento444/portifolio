import type { ChatbotConfig } from "./chatbot.types";
import { footerMeta } from "@site/shared";

export const defaultChatbotConfig: ChatbotConfig = {
  storeName: "Solar Esportes",
  storeDescription:
    "Loja virtual com catalogo de roupas, calcados, acessorios e artigos esportivos.",
  assistantRole: "assistente de vendas para ecommerce",
  locale: "pt-BR",
  catalogPath: "/store",
  cartPath: "/my-cart",
  supportPath: "/contact",
  supportEmail: footerMeta.supportEmail,
  featuredCategories: [
    { label: "Roupas", href: "/store" },
    { label: "Calcados", href: "/store" },
    { label: "Acessorios", href: "/store" },
  ],
  primaryColor: "#23A267",
  chatbotName: "Assistente da Solar Esportes",
  buttonColor: "#1D7A4B",
  backgroundColor: "#111e16",
  headerColor: "#172a21",
  userBubble: "#2c4636",
  botBubble: "#183224",
  userText: "#fff",
  botText: "#fff",
  iconUrl: "/chatbot/botData/avatar.svg",
  botAvatar: "/chatbot/botData/avatar.webp",
  welcomeBubble: "Ola! Posso te ajudar com produtos, categorias, compra e atendimento.",
  firstBotMessage:
    "Posso te ajudar a navegar pela loja, ver categorias, comprar e falar com o atendimento.",
  typingDelay: 0.5,
};
