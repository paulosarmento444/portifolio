"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ChatbotConfig, ChatbotState } from "../chatbot.types";
import { ChatbotService, normalizeChatbotError } from "../chatbot.service";

export function useChatbot(config: ChatbotConfig) {
  const [state, setState] = useState<ChatbotState>({
    messages: [],
    isLoading: false,
    isGenerating: false,
    error: null,
    isInitialized: false,
  });

  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const serviceRef = useRef<ChatbotService | null>(null);

  if (serviceRef.current === null) {
    serviceRef.current = new ChatbotService();
  }

  // Initialize chatbot with first message
  useEffect(() => {
    if (!state.isInitialized) {
      setState((prev) => ({
        ...prev,
        messages: [
          {
            role: "bot",
            content: config.firstBotMessage,
            timestamp: new Date(),
          },
        ],
        isInitialized: true,
      }));
    }
  }, [config.firstBotMessage, state.isInitialized]);

  useEffect(() => {
    return () => {
      abortController?.abort();
      serviceRef.current?.reset();
    };
  }, [abortController]);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      const normalizedMessage = userMessage.trim();

      if (!normalizedMessage || state.isLoading) {
        return;
      }

      const history = state.messages;
      const controller = new AbortController();
      setAbortController(controller);

      setState((prev) => ({
        ...prev,
        isLoading: true,
        isGenerating: true,
        error: null,
        messages: [
          ...prev.messages,
          {
            role: "user",
            content: normalizedMessage,
            timestamp: new Date(),
          },
        ],
      }));

      try {
        const response = await serviceRef.current!.sendMessage({
          config: {
            assistantRole: config.assistantRole,
            catalogPath: config.catalogPath,
            cartPath: config.cartPath,
            chatbotName: config.chatbotName,
            storeDescription: config.storeDescription,
            storeName: config.storeName,
            locale: config.locale,
            supportPath: config.supportPath,
            supportEmail: config.supportEmail,
            whatsappLabel: config.whatsappLabel,
            whatsappUrl: config.whatsappUrl,
            featuredCategories: config.featuredCategories,
            welcomeBubble: config.welcomeBubble,
            firstBotMessage: config.firstBotMessage,
          },
          history,
          message: normalizedMessage,
          signal: controller.signal,
        });

        setState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: "bot",
              content: response,
              timestamp: new Date(),
            },
          ],
          isLoading: false,
          isGenerating: false,
        }));
      } catch (error: any) {
        const normalizedError = normalizeChatbotError(error);

        if (normalizedError === "abort") {
          setState((prev) => ({
            ...prev,
            isGenerating: false,
            isLoading: false,
          }));
          return;
        }

        console.error("Chatbot error:", error);
        setState((prev) => ({
          ...prev,
          error: normalizedError,
          isLoading: false,
          isGenerating: false,
        }));
      } finally {
        setAbortController((current) =>
          current === controller ? null : current,
        );
      }
    },
    [
      config.chatbotName,
      config.firstBotMessage,
      config.locale,
      config.assistantRole,
      config.catalogPath,
      config.cartPath,
      config.storeDescription,
      config.storeName,
      config.supportEmail,
      config.whatsappLabel,
      config.whatsappUrl,
      config.featuredCategories,
      config.welcomeBubble,
      config.supportPath,
      state.messages,
      state.isLoading,
    ]
  );

  const stopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setState((prev) => ({
      ...prev,
      isGenerating: false,
      isLoading: false,
    }));
  }, [abortController]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    isGenerating: state.isGenerating,
    error: state.error,
    sendMessage,
    stopGeneration,
    clearError,
  };
}
