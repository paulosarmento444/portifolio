import {
  AIError,
  AIErrorCode,
  GoogleAIBackend,
  getAI,
  getGenerativeModel,
  type Content,
} from "firebase/ai";
import { firebaseApp } from "@/app/lib/firebase";
import type { ChatMessage, ChatbotConfig } from "@/app/components/chatbot/types";

const GEMINI_MODEL = "gemini-2.5-flash";

const PRODUCT_KEYWORDS = [
  "produto",
  "produtos",
  "catalogo",
  "catalogos",
  "catalog",
  "ver produtos",
  "mostrar produtos",
];

const CATEGORY_KEYWORDS = [
  "categoria",
  "categorias",
  "departamento",
  "departamentos",
  "colecao",
  "colecoes",
];

const CONTACT_KEYWORDS = [
  "contato",
  "atendimento",
  "suporte",
  "ajuda",
  "email",
  "telefone",
  "falar com",
  "whatsapp",
];

const PURCHASE_KEYWORDS = [
  "comprar",
  "compra",
  "carrinho",
  "checkout",
  "pagar",
  "pagamento",
  "finalizar pedido",
];

const FALLBACK_SYSTEM_INSTRUCTION = [
  "Voce e um assistente simples de ecommerce.",
  "Responda em Portugues do Brasil.",
  "Ajude o cliente com produtos, categorias, compra e navegacao da loja.",
  "Se nao souber algum detalhe, seja transparente e direcione para a loja ou para o atendimento.",
  "Mantenha respostas curtas, objetivas e com links quando isso ajudar.",
].join(" ");

export type ChatbotServiceConfig = Pick<
  ChatbotConfig,
  | "assistantRole"
  | "catalogPath"
  | "cartPath"
  | "chatbotName"
  | "storeName"
  | "storeDescription"
  | "locale"
  | "supportPath"
  | "supportEmail"
  | "whatsappLabel"
  | "whatsappUrl"
  | "featuredCategories"
  | "welcomeBubble"
  | "firstBotMessage"
>;

export interface ChatbotSendMessageInput {
  config: ChatbotServiceConfig;
  history: ChatMessage[];
  message: string;
  signal?: AbortSignal;
}

interface ChatbotServiceDependencies {
  getAIImpl?: typeof getAI;
  getGenerativeModelImpl?: typeof getGenerativeModel;
}

type ChatbotIntent = "products" | "categories" | "contact" | "purchase";

const createAbortError = () =>
  new DOMException("The operation was aborted.", "AbortError");

const withAbortSignal = async <T>(
  promise: Promise<T>,
  signal?: AbortSignal,
): Promise<T> => {
  if (!signal) {
    return promise;
  }

  if (signal.aborted) {
    throw createAbortError();
  }

  return await new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(createAbortError());

    signal.addEventListener("abort", onAbort, { once: true });

    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
};

const normalizeInput = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const hasKeyword = (value: string, keywords: string[]) =>
  keywords.some((keyword) => value.includes(keyword));

const buildCategoryLinks = (config: ChatbotServiceConfig) => {
  const categories = config.featuredCategories ?? [];

  if (categories.length === 0) {
    return [];
  }

  return categories.map((category) => `- [${category.label}](${category.href})`);
};

const buildContactLinks = (config: ChatbotServiceConfig) => {
  const lines: string[] = [];

  if (config.whatsappUrl) {
    lines.push(
      `👉 [${config.whatsappLabel ?? "WhatsApp"}](${config.whatsappUrl})`,
    );
  }

  if (config.supportPath) {
    lines.push(`👉 [Pagina de contato](${config.supportPath})`);
  }

  if (config.supportEmail) {
    lines.push(`👉 [${config.supportEmail}](mailto:${config.supportEmail})`);
  }

  return lines;
};

export const detectRuleIntent = (
  message: string,
): ChatbotIntent | null => {
  const normalized = normalizeInput(message);

  if (!normalized) {
    return null;
  }

  if (hasKeyword(normalized, CONTACT_KEYWORDS)) {
    return "contact";
  }

  if (hasKeyword(normalized, PURCHASE_KEYWORDS)) {
    return "purchase";
  }

  if (hasKeyword(normalized, CATEGORY_KEYWORDS)) {
    return "categories";
  }

  if (hasKeyword(normalized, PRODUCT_KEYWORDS)) {
    return "products";
  }

  return null;
};

const buildProductsReply = (config: ChatbotServiceConfig) => {
  const categoryLinks = buildCategoryLinks(config);

  return [
    "Claro! Voce pode ver nossos produtos aqui:",
    "",
    `👉 [Ver produtos](${config.catalogPath})`,
    categoryLinks.length > 0 ? "" : null,
    categoryLinks.length > 0 ? "Categorias principais:" : null,
    ...categoryLinks,
    "",
    "Quer que eu te ajude a encontrar algo especifico?",
  ]
    .filter(Boolean)
    .join("\n");
};

const buildCategoriesReply = (config: ChatbotServiceConfig) => {
  const categoryLinks = buildCategoryLinks(config);

  return [
    "Estas sao algumas categorias principais da loja:",
    "",
    ...(categoryLinks.length > 0
      ? categoryLinks
      : [`👉 [Abrir loja](${config.catalogPath})`]),
    "",
    `👉 [Abrir loja completa](${config.catalogPath})`,
    "Se quiser, eu posso te sugerir por tipo de produto.",
  ].join("\n");
};

const buildContactReply = (config: ChatbotServiceConfig) => {
  const contactLinks = buildContactLinks(config);

  return [
    "Voce pode falar com o atendimento por estes canais:",
    "",
    ...(contactLinks.length > 0
      ? contactLinks
      : [`👉 [Pagina de contato](${config.supportPath ?? config.catalogPath})`]),
    "",
    "Se preferir, eu tambem posso te direcionar para a loja ou para o carrinho.",
  ].join("\n");
};

const buildPurchaseReply = (config: ChatbotServiceConfig) => {
  const lines = [
    "Perfeito. Para continuar sua compra agora:",
    "",
    `👉 [Ir para a loja](${config.catalogPath})`,
  ];

  if (config.cartPath) {
    lines.push(`👉 [Abrir carrinho](${config.cartPath})`);
  }

  lines.push("", "Se quiser, eu tambem posso te indicar uma categoria.");

  return lines.join("\n");
};

export const buildRuleBasedReply = (
  config: ChatbotServiceConfig,
  message: string,
): string | null => {
  const intent = detectRuleIntent(message);

  if (!intent) {
    return null;
  }

  switch (intent) {
    case "products":
      return buildProductsReply(config);
    case "categories":
      return buildCategoriesReply(config);
    case "contact":
      return buildContactReply(config);
    case "purchase":
      return buildPurchaseReply(config);
    default:
      return null;
  }
};

export const buildAiFallbackReply = (
  config: ChatbotServiceConfig,
): string => {
  const supportTarget =
    config.supportPath ??
    (config.supportEmail ? `mailto:${config.supportEmail}` : config.catalogPath);

  return [
    "Posso te ajudar a navegar pela loja:",
    "",
    `👉 [Ver produtos](${config.catalogPath})`,
    `👉 [Falar com atendimento](${supportTarget})`,
    "",
    "Se quiser, me diga o que voce procura ou qual categoria deseja ver.",
  ].join("\n");
};

export class ChatbotService {
  private readonly getAIImpl: typeof getAI;
  private readonly getGenerativeModelImpl: typeof getGenerativeModel;

  constructor(deps: ChatbotServiceDependencies = {}) {
    this.getAIImpl = deps.getAIImpl ?? getAI;
    this.getGenerativeModelImpl =
      deps.getGenerativeModelImpl ?? getGenerativeModel;
  }

  async sendMessage({
    config,
    history,
    message,
    signal,
  }: ChatbotSendMessageInput): Promise<string> {
    const normalizedMessage = message.trim();

    if (!normalizedMessage) {
      return "";
    }

    const ruleReply = buildRuleBasedReply(config, normalizedMessage);

    if (ruleReply) {
      return ruleReply;
    }

    try {
      const ai = this.getAIImpl(firebaseApp, { backend: new GoogleAIBackend() });
      const model = this.getGenerativeModelImpl(ai, {
        model: GEMINI_MODEL,
        systemInstruction: buildSystemInstruction(config),
      });

      const chat = model.startChat({
        history: buildChatHistory(history),
      });

      const result = await withAbortSignal(
        chat.sendMessage(normalizedMessage),
        signal,
      );
      const responseText = result.response.text().trim();

      if (!responseText) {
        return buildAiFallbackReply(config);
      }

      return responseText;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      return buildAiFallbackReply(config);
    }
  }

  reset(): void {}
}

export const buildChatHistory = (messages: ChatMessage[]): Content[] => {
  const history = messages.reduce<Content[]>((acc, message) => {
    if (message.role !== "user" && message.role !== "bot") {
      return acc;
    }

    const text = message.content.trim();

    if (!text) {
      return acc;
    }

    const role = message.role === "bot" ? "model" : "user";
    const previous = acc.at(-1);

    if (!previous) {
      if (role !== "user") {
        return acc;
      }

      acc.push({ role, parts: [{ text }] });
      return acc;
    }

    if (previous.role === role) {
      acc[acc.length - 1] = { role, parts: [{ text }] };
      return acc;
    }

    acc.push({ role, parts: [{ text }] });
    return acc;
  }, []);

  if (history.at(-1)?.role === "user") {
    history.pop();
  }

  return history;
};

export const buildSystemInstruction = (
  config: ChatbotServiceConfig,
): string =>
  [
    FALLBACK_SYSTEM_INSTRUCTION,
    `Voce se chama ${config.chatbotName}.`,
    `Seu papel: ${config.assistantRole}.`,
    `Loja atual: ${config.storeName}.`,
    `Descricao da loja: ${config.storeDescription}.`,
    `Locale principal: ${config.locale}.`,
    `Link da loja: ${config.catalogPath}.`,
    config.cartPath ? `Link do carrinho: ${config.cartPath}.` : null,
    config.supportPath ? `Link de atendimento: ${config.supportPath}.` : null,
    "Nunca invente preco, estoque ou politica comercial.",
    "Se faltar contexto, sugira abrir a loja ou falar com o atendimento.",
  ]
    .filter(Boolean)
    .join("\n\n");

export const normalizeChatbotError = (error: unknown): string => {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "abort";
  }

  if (error instanceof AIError) {
    if (
      error.code === AIErrorCode.NO_API_KEY ||
      error.code === AIErrorCode.NO_APP_ID ||
      error.code === AIErrorCode.NO_PROJECT_ID ||
      error.code === AIErrorCode.API_NOT_ENABLED
    ) {
      return "O chatbot nao conseguiu carregar o atendimento inteligente agora.";
    }

    if (
      error.code === AIErrorCode.FETCH_ERROR ||
      error.code === AIErrorCode.REQUEST_ERROR
    ) {
      return "O chatbot nao conseguiu responder agora.";
    }
  }

  if (error instanceof Error) {
    if (/network|fetch|failed to fetch/i.test(error.message)) {
      return "O chatbot nao conseguiu responder agora.";
    }
  }

  return "O chatbot nao conseguiu responder agora.";
};
