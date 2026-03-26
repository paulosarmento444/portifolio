import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChatbotWidget } from "./chatbot-widget.component";

jest.mock("framer-motion", () => {
  const React = require("react");

  const createPrimitive = (tag: "button" | "div") => {
    const Primitive = React.forwardRef(
      ({ children, ...props }: any, ref: React.ForwardedRef<any>) =>
        React.createElement(tag, { ref, ...props }, children),
    );

    Primitive.displayName = `MockMotion(${tag})`;

    return Primitive;
  };

  return {
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: {
      button: createPrimitive("button"),
      div: createPrimitive("div"),
    },
  };
});

jest.mock("../data/hooks/use-chatbot.hook", () => ({
  useChatbot: jest.fn(() => ({
    messages: [],
    isLoading: false,
    sendMessage: jest.fn(),
    stopGeneration: jest.fn(),
    isGenerating: false,
    error: null,
    clearError: jest.fn(),
  })),
}));

describe("ChatbotWidget", () => {
  const config = {
    storeName: "Loja Teste",
    storeDescription: "Produtos para validar o widget.",
    assistantRole: "Assistente virtual",
    locale: "pt-BR",
    catalogPath: "/store",
    cartPath: "/my-cart",
    supportPath: "/contact",
    supportEmail: "contato@teste.com",
    featuredCategories: [
      {
        label: "Roupas",
        href: "/store",
      },
    ],
    primaryColor: "#3053ff",
    chatbotName: "Assistente",
    buttonColor: "#3053ff",
    backgroundColor: "#ffffff",
    headerColor: "#0a1320",
    userBubble: "#3053ff",
    botBubble: "#f3f4f6",
    userText: "#ffffff",
    botText: "#0a1320",
    welcomeBubble: "Posso ajudar?",
    botAvatar: "/avatar.webp",
    firstBotMessage: "Ola",
    iconUrl: "/avatar.svg",
    typingDelay: 0,
  };

  it("keeps the floating trigger above the header layer", () => {
    render(<ChatbotWidget config={config} />);

    expect(screen.getByTestId("chatbot-open").className).toContain("z-[70]");
  });

  it("opens the chatbot panel above the header and backdrop layers", () => {
    render(<ChatbotWidget config={config} />);

    fireEvent.click(screen.getByTestId("chatbot-open"));

    expect(screen.getByTestId("chatbot-backdrop").className).toContain("z-[70]");
    expect(screen.getByTestId("chatbot-panel").className).toContain("z-[80]");
  });
});
