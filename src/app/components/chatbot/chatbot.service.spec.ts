import { describe, expect, it, jest } from "@jest/globals";
import { AIError, AIErrorCode } from "firebase/ai";
import {
  ChatbotService,
  buildAiFallbackReply,
  buildChatHistory,
  buildRuleBasedReply,
  buildSystemInstruction,
  detectRuleIntent,
  normalizeChatbotError,
} from "./chatbot.service";

const config = {
  assistantRole: "assistente de vendas para ecommerce",
  chatbotName: "Assistente da Loja Teste",
  storeName: "Loja Teste",
  storeDescription: "Loja virtual com itens para casa e cozinha.",
  locale: "pt-BR",
  catalogPath: "/store",
  cartPath: "/my-cart",
  supportPath: "/contact",
  supportEmail: "contato@lojateste.com",
  featuredCategories: [
    { label: "Roupas", href: "/store" },
    { label: "Calcados", href: "/store" },
    { label: "Acessorios", href: "/store" },
  ],
  welcomeBubble: "Ola! Posso ajudar com produtos, categorias e compra.",
  firstBotMessage: "Posso te ajudar a navegar pela loja.",
};

describe("chatbot.service", () => {
  it("responde por regra para compra sem chamar IA", async () => {
    const getAIImpl: any = jest.fn();
    const getGenerativeModelImpl: any = jest.fn();
    const service = new ChatbotService({ getAIImpl, getGenerativeModelImpl });

    const response = await service.sendMessage({
      config,
      history: [],
      message: "quero comprar",
    });

    expect(response).toContain("[Ir para a loja](/store)");
    expect(response).toContain("[Abrir carrinho](/my-cart)");
    expect(getAIImpl).not.toHaveBeenCalled();
  });

  it("responde por regra para contato com links locais", async () => {
    const getAIImpl: any = jest.fn();
    const getGenerativeModelImpl: any = jest.fn();
    const service = new ChatbotService({ getAIImpl, getGenerativeModelImpl });

    const response = await service.sendMessage({
      config,
      history: [],
      message: "contato",
    });

    expect(response).toContain("[Pagina de contato](/contact)");
    expect(response).toContain("[contato@lojateste.com](mailto:contato@lojateste.com)");
    expect(getAIImpl).not.toHaveBeenCalled();
  });

  it("usa a IA para perguntas fora das regras simples", async () => {
    const sendMessage = jest.fn(async () => ({
      response: {
        text: () => "Posso te ajudar melhor se voce me disser o tipo de item que procura.",
      },
    }));
    const startChat: any = jest.fn(() => ({ sendMessage }));
    const getAIImpl: any = jest.fn(() => ({ id: "ai-instance" }));
    const getGenerativeModelImpl: any = jest.fn(() => ({ startChat }));
    const service = new ChatbotService({ getAIImpl, getGenerativeModelImpl });

    const response = await service.sendMessage({
      config,
      history: [
        { role: "bot", content: "Mensagem inicial" },
        { role: "user", content: "Quero uma dica" },
      ],
      message: "Qual material combina mais com uso diario?",
    });

    expect(response).toContain("tipo de item");
    expect(getAIImpl).toHaveBeenCalled();
    expect(startChat).toHaveBeenCalledWith({ history: [] });
    expect(sendMessage).toHaveBeenCalledWith(
      "Qual material combina mais com uso diario?",
    );
  });

  it("volta para resposta local se a IA falhar", async () => {
    const sendMessage = jest.fn(async () => {
      throw new AIError(AIErrorCode.FETCH_ERROR, "Failed to fetch");
    });
    const startChat: any = jest.fn(() => ({ sendMessage }));
    const getAIImpl: any = jest.fn(() => ({ id: "ai-instance" }));
    const getGenerativeModelImpl: any = jest.fn(() => ({ startChat }));
    const service = new ChatbotService({ getAIImpl, getGenerativeModelImpl });

    const response = await service.sendMessage({
      config,
      history: [],
      message: "Me explica melhor essa loja",
    });

    expect(response).toBe(buildAiFallbackReply(config));
  });

  it("detecta as intencoes simples corretamente", () => {
    expect(detectRuleIntent("quero ver produtos")).toBe("products");
    expect(detectRuleIntent("me mostra as categorias")).toBe("categories");
    expect(detectRuleIntent("contato")).toBe("contact");
    expect(detectRuleIntent("quero comprar agora")).toBe("purchase");
    expect(detectRuleIntent("qual a diferenca entre dois tecidos?")).toBeNull();
  });

  it("monta respostas locais com links reutilizaveis", () => {
    expect(buildRuleBasedReply(config, "quero ver produtos")).toContain(
      "[Ver produtos](/store)",
    );
    expect(buildRuleBasedReply(config, "categorias")).toContain("- [Roupas](/store)");
  });

  it("monta a instrucao de sistema simples e generica", () => {
    const instruction = buildSystemInstruction(config);

    expect(instruction).toContain("assistente simples de ecommerce");
    expect(instruction).toContain("Loja Teste");
    expect(instruction).toContain("/store");
    expect(instruction).not.toContain("catalogo estruturado");
  });

  it("normaliza erros de configuracao e rede sem mensagem tecnica", () => {
    expect(
      normalizeChatbotError(
        new AIError(AIErrorCode.API_NOT_ENABLED, "api not enabled"),
      ),
    ).toContain("nao conseguiu carregar");

    expect(
      normalizeChatbotError(
        new AIError(AIErrorCode.FETCH_ERROR, "Failed to fetch"),
      ),
    ).toContain("nao conseguiu responder");
  });

  it("filtra apenas mensagens relevantes no historico do chat", () => {
    expect(
      buildChatHistory([
        { role: "system", content: "interno" },
        { role: "bot", content: " Mensagem inicial " },
        { role: "user", content: " Quero tenis " },
      ]),
    ).toEqual([]);
  });

  it("mantem apenas turnos completos e alternados para o Firebase chat", () => {
    expect(
      buildChatHistory([
        { role: "bot", content: "Mensagem inicial" },
        { role: "user", content: "Quero tenis" },
        { role: "bot", content: "Temos dois modelos" },
        { role: "user", content: "Algo mais tecnico?" },
      ]),
    ).toEqual([
      { role: "user", parts: [{ text: "Quero tenis" }] },
      { role: "model", parts: [{ text: "Temos dois modelos" }] },
    ]);
  });
});
