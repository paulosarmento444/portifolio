export {};

declare global {
  interface Window {
    LanguageModel?: {
      create: (options?: any) => Promise<any>;
    };
    ai?: {
      languageModel?: {
        create: (options?: any) => Promise<any>;
      };
    };
    chatbotSession?: any;
  }
}
