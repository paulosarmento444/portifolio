# Chatbot EW Academy - Integração Next.js

## Visão Geral

Este chatbot foi refatorado do JavaScript vanilla para React/Next.js, mantendo todas as funcionalidades originais e seguindo as melhores práticas do framework.

## Estrutura de Arquivos

```
src/app/components/chatbot/
├── ChatbotWidget.tsx          # Componente principal do chatbot
├── ChatbotProvider.tsx        # Context provider para configuração
├── config.ts                  # Configuração padrão do chatbot
├── types.ts                   # Definições de tipos TypeScript
├── hooks/
│   └── useChatbot.ts          # Hook customizado para lógica do chatbot
└── README.md                  # Esta documentação

public/chatbot/
├── botData/
│   ├── avatar.svg             # Avatar do chatbot
│   ├── chatbot-config.json    # Configuração JSON original
│   └── systemPrompt.txt       # Prompt do sistema
└── llms.txt                   # Dados dos cursos da EW Academy
```

## Funcionalidades

### ✅ Implementadas

- **Interface responsiva** com design moderno usando Tailwind CSS
- **Animações suaves** com Framer Motion
- **Streaming de respostas** em tempo real
- **Indicador de digitação** animado
- **Botão de parar geração** durante streaming
- **Bubble de boas-vindas** que aparece ao carregar a página
- **Parsing de Markdown** básico para formatação de texto
- **Links clicáveis** nos cursos e trilhas
- **Validação de requisitos** (Chrome + LanguageModel API)
- **Tratamento de erros** com mensagens amigáveis
- **Integração com layout** do site Next.js

### 🔧 Configuração

O chatbot pode ser configurado através do objeto `ChatbotConfig`:

```typescript
interface ChatbotConfig {
  primaryColor: string; // Cor primária do tema
  chatbotName: string; // Nome do chatbot
  buttonColor: string; // Cor do botão flutuante
  backgroundColor: string; // Cor de fundo da janela
  headerColor: string; // Cor do cabeçalho
  userBubble: string; // Cor das mensagens do usuário
  botBubble: string; // Cor das mensagens do bot
  userText: string; // Cor do texto do usuário
  botText: string; // Cor do texto do bot
  iconUrl: string; // URL do ícone
  botAvatar: string; // URL do avatar do bot
  welcomeBubble: string; // Mensagem de boas-vindas
  firstBotMessage: string; // Primeira mensagem do bot
  typingDelay: number; // Delay da animação de digitação
}
```

### 🚀 Como Usar

1. **Importar o componente** no layout ou página:

```tsx
import { ChatbotWidget } from "./components/chatbot/ChatbotWidget";
import { defaultChatbotConfig } from "./components/chatbot/config";

// No JSX
<ChatbotWidget config={defaultChatbotConfig} />;
```

2. **Personalizar configuração** (opcional):

```tsx
const customConfig = {
  ...defaultChatbotConfig,
  chatbotName: "Meu Chatbot",
  primaryColor: "#ff6b6b",
};
```

### 📱 Responsividade

O chatbot é totalmente responsivo:

- **Desktop**: Janela flutuante no canto inferior direito
- **Mobile**: Janela ocupa toda a largura da tela
- **Bubble de boas-vindas**: Adapta-se ao tamanho da tela

### 🎨 Design System

O chatbot segue o design system do site:

- **Cores**: Gradientes amarelo/âmbar para botões e elementos interativos
- **Tipografia**: Consistente com o resto do site
- **Animações**: Transições suaves e micro-interações
- **Acessibilidade**: Suporte a navegação por teclado e screen readers

### 🔌 Integração com IA

O chatbot utiliza a **Chrome LanguageModel API** para:

- **Streaming de respostas** em tempo real
- **Contexto de conversa** mantido durante a sessão
- **Cancelamento de requisições** com AbortController
- **Fallback de sistema** caso a API não esteja disponível

### 🛠️ Requisitos Técnicos

- **Navegador**: Google Chrome ou Chrome Canary (versão recente)
- **Flags do Chrome**: `chrome://flags/#prompt-api-for-gemini-nano` deve estar ativada
- **Dados**: Arquivos de configuração e prompts em `/public/chatbot/`

### 🐛 Tratamento de Erros

O chatbot trata os seguintes cenários:

- **API não disponível**: Mostra instruções para ativar
- **Navegador incompatível**: Avisa sobre requisitos
- **Erro de rede**: Mensagem de erro amigável
- **Cancelamento**: Para geração quando solicitado

### 🔄 Migração do JavaScript Vanilla

**Principais mudanças realizadas:**

1. **Arquitetura**: De MVC para React Hooks
2. **Estado**: Gerenciado com useState/useEffect
3. **Estilização**: De CSS customizado para Tailwind CSS
4. **Animações**: De CSS puro para Framer Motion
5. **TypeScript**: Tipagem completa para melhor DX
6. **Componentização**: Separação clara de responsabilidades

**Funcionalidades mantidas:**

- ✅ Streaming de respostas
- ✅ Validação de requisitos
- ✅ Configuração via JSON
- ✅ Parsing de Markdown
- ✅ Interface responsiva
- ✅ Tratamento de erros

### 📈 Performance

- **Lazy loading**: Componente carregado apenas quando necessário
- **Memoização**: Hooks otimizados para evitar re-renders
- **Streaming**: Respostas exibidas em tempo real
- **Debounce**: Atualizações de UI limitadas a 200ms

### 🔮 Próximos Passos

Possíveis melhorias futuras:

- [ ] Suporte a múltiplos idiomas
- [ ] Temas personalizáveis
- [ ] Histórico de conversas
- [ ] Integração com analytics
- [ ] Suporte a outros navegadores
- [ ] Modo offline com cache
