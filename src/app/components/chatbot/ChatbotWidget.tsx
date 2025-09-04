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
      '<code class="bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>'
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-yellow-400 hover:text-yellow-300 underline" target="_blank" rel="noopener noreferrer">$1</a>'
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    sendMessage,
    stopGeneration,
    isGenerating,
    error,
  } = useChatbot(config);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setShowWelcomeBubble(false);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      handleSendMessage(input.value);
      input.value = "";
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
        className="fixed bottom-8 left-4 z-50 w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-2xl border-2 border-white/20 backdrop-blur-sm flex items-center justify-center group sm:left-8"
        style={{
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        }}
      >
        <img
          src={config.botAvatar}
          alt="Chatbot"
          className="w-12 h-12 rounded-full object-cover"
        />
        {showWelcomeBubble && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
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
            className="fixed bottom-24 left-4 z-40 max-w-xs bg-gradient-to-r from-yellow-400 to-amber-500 text-white p-4 rounded-2xl rounded-bl-md shadow-2xl cursor-pointer border border-white/20 backdrop-blur-sm sm:left-8"
            style={{
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
            }}
          >
            <p className="text-sm font-medium leading-relaxed">
              {config.welcomeBubble}
            </p>
            <div className="absolute bottom-0 left-0 w-0 h-0 border-r-8 border-r-transparent border-t-8 border-t-yellow-400"></div>
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
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />

            {/* Chat Container */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 left-0 right-0 z-50 w-full h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl flex flex-col overflow-hidden sm:left-8 sm:right-auto sm:w-96 sm:max-w-[calc(100vw-2rem)] sm:rounded-2xl"
              style={{
                background:
                  config.backgroundColor ||
                  "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-4 border-b border-white/10"
                style={{ backgroundColor: config.headerColor || "#1f2937" }}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={config.botAvatar}
                    alt="Bot"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <h3 className="text-white font-semibold text-lg">
                    {config.chatbotName}
                  </h3>
                </div>
                <button
                  onClick={handleCloseChat}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-br-md"
                          : "bg-white/10 text-white rounded-bl-md border border-white/20"
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
                            className="prose prose-invert prose-sm max-w-none"
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
                    <div className="bg-white/10 text-white rounded-2xl rounded-bl-md px-4 py-3 border border-white/20">
                      <div className="flex items-center space-x-2">
                        <img
                          src={config.botAvatar}
                          alt="Bot"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex justify-start">
                    <div className="bg-red-500/20 text-red-200 rounded-2xl rounded-bl-md px-4 py-3 border border-red-500/30">
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    disabled={isLoading}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector(
                        'input[type="text"]'
                      ) as HTMLInputElement;
                      if (input?.value) {
                        handleSendMessage(input.value);
                        input.value = "";
                      }
                    }}
                    disabled={isLoading}
                    className="p-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-xl hover:from-yellow-500 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                  {isGenerating && (
                    <button
                      onClick={stopGeneration}
                      className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
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
