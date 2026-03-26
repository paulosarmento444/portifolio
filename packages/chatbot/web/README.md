# Chatbot Ecommerce - Regra Local + Firebase AI Logic

## Visao geral

O chatbot agora funciona com uma arquitetura simples:

- resposta por regra local para fluxos comuns
- fallback para **Firebase AI Logic** com **Gemini** apenas quando necessario
- sem fetch de catalogo
- sem rota de contexto
- sem dependencias do Chrome Prompt API

## Arquitetura

```text
packages/chatbot/web/src/
├── components/
│  └── chatbot-widget.component.tsx
├── data/
│  ├── chatbot.config.ts
│  ├── chatbot.service.ts
│  ├── chatbot.types.ts
│  ├── firebase-app.ts
│  └── hooks/
│     └── use-chatbot.hook.ts
└── index.ts
```

## Como funciona

1. `ChatbotWidget` controla a UI.
2. `useChatbot` controla estado, loading, erro e multi-turn.
3. `ChatbotService` tenta primeiro responder por regra:
   - produtos
   - categorias
   - contato
   - compra
4. Se nenhuma regra cobrir a pergunta, o service chama o Gemini via `firebase/ai`.
5. Se a IA falhar, o service devolve um fallback local com links da loja e do atendimento.

## Reuso em outros ecommerce

O chatbot fica reutilizavel porque a personalizacao da loja fica em `config.ts`:

- `storeName`
- `storeDescription`
- `assistantRole`
- `catalogPath`
- `cartPath`
- `supportPath`
- `supportEmail`
- `featuredCategories`

Para reaproveitar em outro projeto, basta trocar a configuracao da loja e manter o mesmo service.

## Observacoes

- `llms.txt` legado nao participa mais do prompt.
- `systemPrompt.txt` legado nao participa mais do prompt.
- o chatbot continua funcionando mesmo quando a IA nao responde.
