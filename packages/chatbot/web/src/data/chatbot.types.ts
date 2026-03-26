export interface ChatbotConfig {
  storeName: string;
  storeDescription: string;
  assistantRole: string;
  locale: string;
  catalogPath: string;
  cartPath?: string;
  supportPath?: string;
  supportEmail?: string;
  whatsappUrl?: string;
  whatsappLabel?: string;
  featuredCategories?: Array<{
    label: string;
    href: string;
  }>;
  primaryColor: string;
  chatbotName: string;
  buttonColor: string;
  backgroundColor: string;
  headerColor: string;
  userBubble: string;
  botBubble: string;
  userText: string;
  botText: string;
  iconUrl: string;
  botAvatar: string;
  welcomeBubble: string;
  firstBotMessage: string;
  typingDelay: number;
}

export interface ChatMessage {
  role: "user" | "bot" | "system";
  content: string;
  timestamp?: Date;
}

export interface ChatbotState {
  messages: ChatMessage[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  isInitialized: boolean;
}
