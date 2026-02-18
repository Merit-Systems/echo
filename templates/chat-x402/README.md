# Chat x402 Template

A simple AI chat template with an auth switcher that lets users choose between paying with **Echo credits** or **USDC via x402** protocol.

Based on the [next-chat](../next-chat) template with the wallet/x402 payment flow from the [sora-template](https://github.com/Merit-Systems/sora-template).

## Features

- Simple chat interface using Vercel AI SDK
- Auth switcher modal: Echo credits **or** wallet-based USDC (x402)
- RainbowKit wallet connection (Base, Mainnet)
- Echo SDK for authentication and billing
- Model selection (GPT-4o, GPT-5)

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

2. Install dependencies:

```bash
npm install
```

3. Run dev server:

```bash
npm run dev
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `ECHO_APP_ID` | Your Echo app ID (server-side) |
| `NEXT_PUBLIC_ECHO_APP_ID` | Your Echo app ID (client-side) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID for wallet connections |

## How It Works

Users are presented with a login modal offering two payment methods:

1. **Echo Credits** — Sign in via Echo OAuth, pay per-message with Echo credits
2. **USDC via x402** — Connect a wallet (e.g. MetaMask), pay with USDC using the [x402](https://www.x402.org/) payment protocol

Once authenticated through either method, users get access to the same chat interface.
