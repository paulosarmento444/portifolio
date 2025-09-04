"use client";

import { createContext, useContext, ReactNode } from "react";
import { ChatbotConfig } from "./types";

interface ChatbotContextType {
  config: ChatbotConfig;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

interface ChatbotProviderProps {
  children: ReactNode;
  config: ChatbotConfig;
}

export function ChatbotProvider({ children, config }: ChatbotProviderProps) {
  return (
    <ChatbotContext.Provider value={{ config }}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbotConfig() {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error("useChatbotConfig must be used within a ChatbotProvider");
  }
  return context;
}
