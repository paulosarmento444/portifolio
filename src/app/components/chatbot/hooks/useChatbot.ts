"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatbotConfig, ChatbotState } from "../types";

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

  const checkRequirements = useCallback(() => {
    const errors: string[] = [];

    // Check if Chrome
    // @ts-ignore
    if (!window.chrome) {
      errors.push(
        "⚠️ Este recurso só funciona no Google Chrome ou Chrome Canary (versão recente)."
      );
    }

    // Check if LanguageModel API is available
    if (!("LanguageModel" in window)) {
      errors.push("⚠️ As APIs nativas de IA não estão ativas.");
      errors.push("Ative a seguinte flag em chrome://flags/:");
      errors.push(
        "- Prompt API for Gemini Nano (chrome://flags/#prompt-api-for-gemini-nano)"
      );
      errors.push("Depois reinicie o Chrome e tente novamente.");
    }

    return errors;
  }, []);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || state.isLoading) return;

      // Check requirements first
      const errors = checkRequirements();
      if (errors.length > 0) {
        setState((prev) => ({
          ...prev,
          error: errors.join("\n\n"),
          isLoading: false,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        isGenerating: true,
        error: null,
        messages: [
          ...prev.messages,
          {
            role: "user",
            content: userMessage,
            timestamp: new Date(),
          },
        ],
      }));

      try {
        // Create new abort controller
        const controller = new AbortController();
        setAbortController(controller);

        // Check if LanguageModel is available
        if (!window.LanguageModel) {
          throw new Error("LanguageModel API não está disponível");
        }

        // Create session if not exists
        let session = (window as any).chatbotSession;
        if (!session) {
          session = await window.LanguageModel.create({
            initialPrompts: [
              {
                role: "system",
                content: await getSystemPrompt(),
              },
            ],
            expectedInputLanguages: ["pt"],
          });
          (window as any).chatbotSession = session;
        }

        // Add user message to conversation
        const conversationHistory = [
          ...state.messages
            .filter((msg) => msg.role === "user")
            .map((msg) => ({
              role: "user" as const,
              content: msg.content,
            })),
        ];

        // Get streaming response
        const response = session.promptStreaming(conversationHistory, {
          signal: controller.signal,
        });

        let fullResponse = "";
        let lastUpdate = 0;

        // Create initial bot message
        setState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: "bot",
              content: "",
              timestamp: new Date(),
            },
          ],
          isLoading: false,
        }));

        // Stream the response
        for await (const chunk of response) {
          if (!chunk) continue;

          fullResponse += chunk;

          // Update UI every 200ms to avoid too many re-renders
          const now = Date.now();
          if (now - lastUpdate > 200) {
            setState((prev) => ({
              ...prev,
              messages: prev.messages.map((msg, index) =>
                index === prev.messages.length - 1 && msg.role === "bot"
                  ? { ...msg, content: fullResponse }
                  : msg
              ),
            }));
            lastUpdate = now;
          }
        }

        // Final update
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg, index) =>
            index === prev.messages.length - 1 && msg.role === "bot"
              ? { ...msg, content: fullResponse }
              : msg
          ),
          isGenerating: false,
        }));
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Request aborted by user");
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
          error: "Erro ao obter resposta da IA. Tente novamente.",
          isLoading: false,
          isGenerating: false,
        }));
      }
    },
    [state.messages, state.isLoading, checkRequirements]
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

// Helper function to get system prompt
async function getSystemPrompt(): Promise<string> {
  try {
    // Try to fetch from the original chatbot data
    const response = await fetch("/chatbot/botData/systemPrompt.txt");
    if (response.ok) {
      const systemPrompt = await response.text();
      const llmsResponse = await fetch("/chatbot/llms.txt");
      if (llmsResponse.ok) {
        const llmsData = await llmsResponse.text();
        return systemPrompt + "\n" + llmsData;
      }
      return systemPrompt;
    }
  } catch (error) {
    console.warn("Could not fetch system prompt:", error);
  }

  // Fallback system prompt
  return `Você é um assistente virtual da EW Academy, plataforma de cursos online em tecnologia.
Responda apenas com base nos dados do contexto fornecido (não utilize informações externas).
Formate todas as respostas em **markdown**.

**Instruções:**
- Seja objetivo e resumido (no máximo mil caracteres), com tom amigável e profissional.
- Palavras como "me conte sobre" geralmente remetem aos cursos, então tente verificar primeiro se ele está falando de um curso especifico ou pergunte para obter mais contexto
- Sempre inclua links para fácil acesso.
- Não repita cursos que aparecem em mais de uma trilha.
- O idioma padrão é Português do brasil, os que tem idioma, possuem uma anotaçao como (in English)
- Apresente primeiro a lista de cursos relevantes, depois suas trilhas relacionadas.
- Ao final de cada resposta, pergunte o que o usuário deseja fazer em seguida (ex: "Deseja o link do curso, da trilha ou acessar outra informação?").
- Pergunte explicitamente se o usuário quer o link do curso/trilha mencionados ou de alguma página relacionada.
- Se a pergunta é relevante ao contexto fornecido, diga que não pode ajudar com isso e dê sugestões`;
}
