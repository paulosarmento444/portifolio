"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import type { ChatbotConfig } from "../chatbot.types";
import { useChatbot } from "./use-chatbot.hook";

type UseChatbotWidgetStateArgs = {
  config: ChatbotConfig;
};

type UseChatbotWidgetStateResult = ReturnType<typeof useChatbot> & {
  draft: string;
  isOpen: boolean;
  showWelcomeBubble: boolean;
  canSend: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  handleOpenChat: () => void;
  handleCloseChat: () => void;
  handleDraftChange: (value: string) => void;
  handleSendMessage: (message: string) => Promise<void>;
  handleSendDraft: () => Promise<void>;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export function useChatbotWidgetState({
  config,
}: UseChatbotWidgetStateArgs): UseChatbotWidgetStateResult {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatbotState = useChatbot(config);
  const {
    messages,
    isLoading,
    isGenerating,
    error,
    clearError,
    sendMessage,
  } = chatbotState;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating, error]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setShowWelcomeBubble(false);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  const handleSendMessage = async (message: string) => {
    const normalizedMessage = message.trim();

    if (!normalizedMessage || isLoading) {
      return;
    }

    await sendMessage(normalizedMessage);
    setDraft("");
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);

    if (error) {
      clearError();
    }
  };

  const handleSendDraft = async () => {
    await handleSendMessage(draft);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSendDraft();
    }
  };

  return {
    ...chatbotState,
    draft,
    isOpen,
    showWelcomeBubble,
    canSend: Boolean(draft.trim()) && !isLoading,
    messagesEndRef,
    handleOpenChat,
    handleCloseChat,
    handleDraftChange,
    handleSendMessage,
    handleSendDraft,
    handleKeyDown,
  };
}
