# Projeto: Loja + Blog + Chatbot (Next.js)

## Visão Geral

Plataforma de e-commerce e conteúdo (loja + blog) construída em Next.js (App Router), integrada a WordPress (via Apollo/GraphQL) e com um módulo de Chatbot (AI on-device via LanguageModel API do Chrome). Inclui checkout com PIX (Mercado Pago), área do cliente (pedidos, endereços), blog com filtros e paginação, e páginas institucionais.

## Stack Técnica

- Framework: Next.js 14 (App Router) com React 18 e TypeScript
- UI/Estilo: Tailwind CSS, Framer Motion, Lucide Icons
- Dados CMS: WordPress via Apollo Client/GraphQL (Faust)
- E-commerce: Serviços utilitários (WooCommerce/REST ou fonte mock), cookies para carrinho
- Notificações: react-hot-toast
- Chatbot: LanguageModel API (Chrome) com UI própria em React
- Testes/Qualidade: Jest (config presente), ESLint (Next)

## Estrutura do Projeto (pasta `src/`)

- `app/`
  - `layout.tsx`: layout raiz, inclui Script(s), Back-to-Top e Chatbot
  - `page.tsx`: home (Header, vitrine, contato, etc.)
  - `about/`: páginas e componentes institucionais (hero, missão/valores, equipe)
  - `blog/`: listagem, post, filtros, paginação e componentes
  - `contact/`: página e formulário com API `/api/contact`
  - `my-account/`: área do cliente (pedidos, endereços, posts, etc.)
  - `my-cart/`: carrinho, checkout, PIX, QRCode modal, seleção de pagamento
  - `order-confirmation/[id]/`: confirmação de pedido
  - `components/`: Header, Logo, NavLinks, Toaster, Back to Top e seção de produtos
  - `components/chatbot/`: módulo do chatbot (Widget, Provider, hook e tipos)
  - `server-actions/`: ações de servidor (auth, cart, checkout, order, cupom)
  - `service/`: serviços de dados (Products, Orders, Cart, Coupon, etc.)
  - `types/`: tipagens de domínio (product, category, checkout)
  - `api/`: rotas API (contact webhook, faust proxy, pix generate/status)
- `models.ts`: tipagens auxiliares compartilhadas

## Configuração & Execução

1. Requisitos

- Node.js 18+
- PNPM/Yarn/NPM (qualquer gerenciador)
- WordPress GraphQL configurado (se aplicável ao ambiente)

2. Instalação

- Com npm: `npm install`
- Com yarn: `yarn`
- Com pnpm: `pnpm install`

3. Variáveis de Ambiente (crie `.env.local` na raiz)

- `WEBHOOK_URL` (Webhook para receber mensagens do formulário de contato)
- `MERCADO_PAGO_API_KEY` (Chave de API do Mercado Pago para status do PIX)

4. Rodar em DEV

- `npm run dev` (ou `yarn dev` / `pnpm dev`)
- A aplicação abre em `http://localhost:3000`

5. Build/Prod

- `npm run build` seguido de `npm start`

6. Lint/Testes

- Lint: `npm run lint`
- Testes: `npm test`

## Módulos Principais

### 1) UI/Design System

- Tailwind com utilitários de gradiente, glassmorphism, e animações
- Componentes reutilizáveis em `app/components/*`
- Toaster configurado em `components/toaster`
- Header responsivo com menu mobile animado

### 2) Blog (WordPress via Apollo)

- Listagem: `blog/page.tsx`
- Post: `blog/[uri]/page.tsx`
- Componentes: `blog/components/*` (hero, filtros, grid, paginação, conteúdo, relacionados)
- GraphQL queries em cada página/componente via `apolloClient`
- Tratamento de estados (loading/erro), filtros e paginação

### 3) Loja / Vitrine

- Seções de categoria e produtos em `components/categories-showcase.tsx` e `product-section.tsx`
- Página da loja em `store/page.tsx` com filtros, grid e paginação
- Página de produto: `store/[id]/page.tsx` com galeria, info, specs e quantidade

### 4) Carrinho, Checkout e PIX

- Carrinho: `my-cart/*` (container, sidebar, itens, resumo)
- Checkout com seleção de método de pagamento
- PIX: geração (`/api/pix/generate`) e status (`/api/pix/status`) usando Mercado Pago
- `QRCodeModal` e `PixQRCode` para exibir QR Code e monitorar pagamento

### 5) Área do Cliente

- `my-account/*`: navegação de seções (bem-vindo, pedidos, endereços, posts), logout
- Server actions e services para buscar/alterar dados

### 6) Formulário de Contato

- UI em `contact/components`
- API `POST /api/contact` envia payload (embed) para `WEBHOOK_URL`
- `zod` + `react-hook-form` para validação

### 7) Chatbot (Chrome On-Device AI)

- UI: `components/chatbot/ChatbotWidget.tsx`
- Config: `components/chatbot/config.ts` e `public/chatbot/botData/*`
- Lógica: `components/chatbot/hooks/useChatbot.ts`
- Requisitos: Chrome recente + flag `chrome://flags/#prompt-api-for-gemini-nano`
- Fluxo:
  - Primeira mensagem do bot (config)
  - Usuário envia prompt -> hook valida requisitos -> cria/usa sessão (`window.LanguageModel`)
  - `promptStreaming` exibe resposta de forma incremental
  - AbortController para parar geração

## Arquitetura & Fluxos

### Frontend (App Router)

- Layout raiz injeta componentes comuns (Header, BackToTop, Chatbot)
- Páginas roteadas por pastas: `app/<rota>/page.tsx`
- Componentes desacoplados por domínio/página

### Dados & Serviços

- Apollo Client para WordPress GraphQL
- `service/*` centraliza acesso a dados de produtos, pedidos, cupons e carrinho
- `server-actions/*` para mutações no lado do servidor (Next App Router)

### Estado & UX

- Hooks locais por página/componente
- Animações suaves via Framer Motion
- Toaster para feedback de usuário

### Erros & Logging

- Padrões de try/catch em operações assíncronas
- Mensagens ao usuário em estados de erro e falhas de rede
- Logs no servidor para rotas API e erros de integração

## Padrões de Código (Clean Code + promptDev)

- Nomes descritivos (funções/variáveis), evitar abreviações obscuras
- Tipos explícitos nos exports públicos e props de componentes
- Fluxos com early-return e sem nesting profundo
- Comentários curtos e focados no “porquê” quando necessário
- Evitar TODOs permanentes; implementar de fato

## Workflows (conforme promptDev)

1. Compreensão: leia `docs/`, `README.md` e `src/app/*`
2. Investigação: identifique componentes e serviços afetados
3. Planejamento: defina tarefas pequenas e verificáveis
4. Implementação: edite incrementalmente, mantendo build verde
5. Debug: reproduza, isole causa, conserte raíz
6. Testes: manuais e unit (quando prontos) a cada alteração
7. Iteração: mantenha UX, acessibilidade e performance

## Variáveis/Segredos

- `.env.local` não commitado
- `WEBHOOK_URL`, `MERCADO_PAGO_API_KEY` obrigatórios para contato/PIX

## APIs Internas

- `POST /api/contact`: recebe `{ name, email, phone, message }` e envia para `WEBHOOK_URL`
- `POST /api/pix/generate`: body `{ orderId, value, expirationDate?, description? }` -> cria pedido PIX (Mercado Pago)
- `POST /api/pix/status`: body `{ orderId }` -> consulta status do pedido
- `GET|POST /api/faust/[route]`: handler do Faust para GraphQL do WP

## Execução do Chatbot

- Requer Google Chrome
- Ative a flag: `chrome://flags/#prompt-api-for-gemini-nano`
- O widget é carregado no layout (botão flutuante). Clique para abrir, envie mensagens. Use o botão parar.

## Troubleshooting

- Erro `LanguageModel` ausente: verifique Chrome/flags
- `WEBHOOK_URL` 4xx/5xx: cheque endpoint destino
- `MERCADO_PAGO_API_KEY` inválida: revise .env e permissões
- Apollo/GraphQL: endpoints e schema do WordPress devem estar acessíveis
- Build falha em CSS utilitário inexistente: valide classes Tailwind e camadas `@layer`

## Contribuição

1. Crie branch feature/xxx
2. Faça commits pequenos e claros
3. Rode lint e testes locais
4. Abra PR com descrição prática (o quê/por quê/como)

## Roadmap (Sugerido)

- Internacionalização (i18n)
- Testes unitários e e2e (Jest + Playwright)
- A/B tests de UI e performance (Core Web Vitals)
- Tema dinâmico (dark/light) e design tokens
- Histórico do Chatbot e analytics (opt-in)
