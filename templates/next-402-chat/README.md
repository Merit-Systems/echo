# Echo Next.js Chat x402 Template

A minimal Next.js chat template with an auth switcher that lets users choose
how to pay:

- Echo credits (Echo auth)
- USDC via x402 (wallet auth)

## Quick Start

```bash
npx echo-start@latest --template next-402-chat
```

Then configure env vars:

```bash
ECHO_APP_ID=your_app_id
NEXT_PUBLIC_ECHO_APP_ID=your_app_id
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

## Features

- Simple chat UI from the standard `next-chat` template
- Payment/auth switcher on the sign-in screen
- Echo credits flow via `@merit-systems/echo-next-sdk`
- USDC x402 flow via `@merit-systems/ai-x402`
- Wallet connection via RainbowKit + wagmi

## How It Works

- `credits` mode:
  - User signs in with Echo
  - API uses `openai(model)` from Echo SDK
- `x402` mode:
  - User connects wallet
  - Client uses `useChatWithPayment`
  - API uses `createX402OpenAIWithoutPayment` and reads `x-payment` header

## Run Locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.
