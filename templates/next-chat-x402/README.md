# Echo Chat x402 Template

A Next.js chat template with a dual-auth switcher — users can choose to pay with **Echo credits** or **USDC via x402**.

## Quick Start

Use the Echo CLI to create a new project with this template:

```bash
npx echo-start@latest --template next-chat-x402
```

You'll be prompted for your Echo App ID. Don't have one? Get it at [echo.merit.systems/new](https://echo.merit.systems/new).

## Features

- **Auth Switcher** — Sign in with Echo (credits) or connect a wallet (USDC via x402)
- **AI Chat Interface** — Interactive chat with GPT-4o and GPT-5 models
- **x402 Payments** — Pay per message with USDC through the [x402 protocol](https://www.x402.org/)
- **Echo Credits** — Alternative billing through Echo's credit system
- **Wallet Integration** — RainbowKit + wagmi for seamless wallet connection
- **Streaming Responses** — Real-time AI response streaming with reasoning display

## Setup

### Prerequisites

- Node.js 18+
- An Echo account ([echo.merit.systems](https://echo.merit.systems))
- A WalletConnect project ID ([cloud.walletconnect.com](https://cloud.walletconnect.com))

### Environment Variables

Copy `.env.local` and fill in your values:

```env
ECHO_APP_ID="your-echo-app-id"
NEXT_PUBLIC_ECHO_APP_ID="your-echo-app-id"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-walletconnect-project-id"
ECHO_ROUTER_URL="http://localhost:3070"
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

### Authentication Flow

Users are presented with two authentication options on the login screen:

1. **Sign in with Echo** — Uses Echo credentials; chat is billed via Echo credits
2. **Connect Wallet** — Connects an EVM wallet (via RainbowKit); chat is billed with USDC via x402

### Payment Routing

The chat API route (`/api/chat`) automatically detects the payment method:

- **Echo credits**: Standard Echo billing flow (no `x-payment` header)
- **x402 USDC**: When the client includes an `x-payment` header with x402 payment authorization, the API routes through the x402 protocol

### Architecture

```
src/
├── app/
│   ├── _components/
│   │   ├── chat.tsx              # Chat UI with dual payment mode
│   │   ├── header.tsx            # Header with wallet/echo account switcher
│   │   └── echo/
│   │       └── sign-in-button.tsx
│   ├── api/
│   │   ├── chat/route.ts         # Chat endpoint (x402 + Echo)
│   │   └── echo/[...echo]/route.ts
│   ├── layout.tsx
│   └── page.tsx                  # Auth guard with dual auth
├── components/
│   ├── wallet/                   # Wallet components (RainbowKit + wagmi)
│   │   ├── auth-guard.tsx        # Dual auth guard (Echo OR wallet)
│   │   ├── config.ts             # Wagmi chain config
│   │   ├── connect-button.tsx    # RainbowKit connect button
│   │   ├── header-account.tsx    # Shows wallet or Echo account
│   │   ├── wallet-provider.tsx   # WagmiProvider + RainbowKit
│   │   └── wallet-status.tsx     # Wallet connection status
│   ├── ai-elements/              # Reusable AI chat UI components
│   ├── echo-account-next.tsx
│   └── ui/                       # shadcn/ui components
├── echo/index.ts                 # Echo SDK setup
├── lib/
│   ├── x402.ts                   # x402 payment types & helpers
│   ├── currency-utils.ts
│   └── utils.ts
└── providers.tsx                  # EchoProvider + WalletProvider
```

## Learn More

- [Echo Platform](https://echo.merit.systems)
- [x402 Protocol](https://www.x402.org/)
- [RainbowKit](https://www.rainbowkit.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
