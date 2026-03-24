"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Square } from "lucide-react";
// Simple markdown parser for basic formatting
const parseMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`(.*?)`/g,
      '<code class="rounded-md border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] px-1.5 py-0.5 text-sm text-[color:var(--site-color-foreground-strong)]">$1</code>'
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-[color:var(--site-color-primary)] underline underline-offset-2 hover:text-[color:var(--site-color-primary-strong)]" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    .replace(/\n/g, "<br>");
};
import { ChatbotConfig } from "./types";
import { useChatbot } from "./hooks/useChatbot";

interface ChatbotWidgetProps {
  config: ChatbotConfig;
}

export function ChatbotWidget({ config }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    stopGeneration,
    isGenerating,
    error,
    clearError,
  } = useChatbot(config);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage(draft);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpenChat}
        data-testid="chatbot-open"
        className="fixed bottom-8 left-4 z-50 flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--site-color-border-strong)] bg-[color:var(--site-color-surface-strong)] shadow-[var(--site-shadow-lg)] backdrop-blur-sm sm:left-8"
      >
        <img
          src={config.botAvatar}
          alt="Chatbot"
          className="w-12 h-12 rounded-full object-cover"
        />
        {showWelcomeBubble && (
          <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--site-color-danger)] text-xs font-bold text-white animate-pulse">
            1
          </div>
        )}
      </motion.button>

      {/* Welcome Bubble */}
      <AnimatePresence>
        {showWelcomeBubble && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.8 }}
            onClick={handleOpenChat}
            className="fixed bottom-24 left-4 z-40 max-w-xs cursor-pointer rounded-2xl rounded-bl-md border border-[color:var(--site-color-border-strong)] bg-[color:var(--site-color-surface-strong)] p-4 text-[color:var(--site-color-foreground)] shadow-[var(--site-shadow-lg)] backdrop-blur-sm sm:left-8"
          >
            <p className="text-sm font-medium leading-relaxed">
              {config.welcomeBubble}
            </p>
            <div className="absolute bottom-0 left-0 h-0 w-0 border-r-8 border-r-transparent border-t-8 border-t-[color:var(--site-color-surface-strong)]"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseChat}
              className="fixed inset-0 z-40 bg-[color:var(--site-color-overlay-scrim)] backdrop-blur-sm"
            />

            {/* Chat Container */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 left-0 right-0 z-50 flex h-[600px] max-h-[calc(100vh-8rem)] w-full max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[color:var(--site-color-border-strong)] bg-[color:var(--site-color-surface-strong)] shadow-[var(--site-shadow-lg)] backdrop-blur-xl sm:left-8 sm:right-auto sm:w-96 sm:max-w-[calc(100vw-2rem)] sm:rounded-2xl"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between border-b border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] p-4"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={config.botAvatar}
                    alt="Bot"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <h3 className="text-lg font-semibold text-[color:var(--site-color-foreground-strong)]">
                    {config.chatbotName}
                  </h3>
                </div>
                <button
                  onClick={handleCloseChat}
                  className="rounded-full p-2 text-[color:var(--site-color-foreground-muted)] transition-colors hover:bg-[color:var(--site-color-interactive-muted-hover)] hover:text-[color:var(--site-color-foreground-strong)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                data-testid="chatbot-messages"
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    data-testid={`chatbot-message-${message.role}`}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "rounded-br-md bg-[color:var(--site-color-primary)] text-[color:var(--site-color-primary-contrast)]"
                          : "rounded-bl-md border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] text-[color:var(--site-color-foreground)]"
                      }`}
                    >
                      {message.role === "bot" && (
                        <div className="flex items-start space-x-2">
                          <img
                            src={config.botAvatar}
                            alt="Bot"
                            className="w-6 h-6 rounded-full object-cover mt-1 flex-shrink-0"
                          />
                          <div
                            className="prose prose-sm max-w-none text-[color:var(--site-color-foreground)]"
                            dangerouslySetInnerHTML={{
                              __html: parseMarkdown(message.content),
                            }}
                          />
                        </div>
                      )}
                      {message.role === "user" && (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div
                      className="rounded-2xl rounded-bl-md border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] px-4 py-3 text-[color:var(--site-color-foreground)]"
                      role="status"
                      aria-live="polite"
                      data-testid="chatbot-typing"
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={config.botAvatar}
                          alt="Bot"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 rounded-full bg-[color:var(--site-color-foreground-soft)] animate-bounce"></div>
                          <div
                            className="h-2 w-2 rounded-full bg-[color:var(--site-color-foreground-soft)] animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="h-2 w-2 rounded-full bg-[color:var(--site-color-foreground-soft)] animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-sm text-[color:var(--site-color-foreground-muted)]">
                          Digitando...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex justify-start">
                    <div
                      className="rounded-2xl rounded-bl-md border border-[color:var(--site-color-danger-soft)] bg-[color:var(--site-color-danger-soft)] px-4 py-3 text-[color:var(--site-color-danger-text)]"
                      data-testid="chatbot-error"
                    >
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-[color:var(--site-color-border)] p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    disabled={isLoading}
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      if (error) {
                        clearError();
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    aria-label="Mensagem para o assistente"
                    data-testid="chatbot-input"
                    className="flex-1 rounded-xl border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] px-4 py-3 text-[color:var(--site-color-foreground)] placeholder-[color:var(--site-color-foreground-soft)] focus:outline-none focus:ring-2 focus:ring-[color:var(--site-color-primary-soft)] focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    onClick={() => void handleSendMessage(draft)}
                    disabled={isLoading || !draft.trim()}
                    aria-label="Enviar mensagem"
                    data-testid="chatbot-send"
                    className="rounded-xl bg-[color:var(--site-color-primary)] p-3 text-[color:var(--site-color-primary-contrast)] transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                  {isGenerating && (
                    <button
                      onClick={stopGeneration}
                      aria-label="Parar resposta"
                      className="rounded-xl bg-[color:var(--site-color-danger)] p-3 text-white transition-colors hover:brightness-95"
                    >
                      <Square className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
