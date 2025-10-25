<p align="center">
  <img src="./imgs/header_gif.gif" alt="Echo Header" width="100%">
</p>

<h1 align="center">Echo</h1>
    
  [![Discord](https://img.shields.io/discord/1382120201713352836?style=flat&logo=discord&logoColor=white&label=Discord)](https://discord.gg/merit) 
  ![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/merit_systems) 
  [![GitHub Repo stars](https://img.shields.io/github/stars/Merit-Systems/echo?style=social)](https://github.com/Merit-Systems/echo) 
  [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

  </div>

**User-pays AI infrastructure. Drop in Echo, users pay for their own usage—you never front costs.**

Skip the hard choice between fronting API costs, high-friction BYOK flows, or building billing from scratch.

[Read the docs](https://echo.merit.systems/docs) | [Live demo](https://echo-next-image.vercel.app/) | [Read our announcement](https://www.merit.systems/blog/echo)

## The Problem

Building AI apps forces you to pick your poison:

| Approach           | Developer Cost          | User Experience        | Revenue Model            |
| ------------------ | ----------------------- | ---------------------- | ------------------------ |
| **BYOK**           | None (but no revenue)   | Complex key management | None                     |
| **Dev API Key**    | Unpredictable burn rate | Simple                 | Need metering + billing  |
| **Bill End Users** | Weeks building infra    | Simple                 | Auth + Stripe + metering |

Echo eliminates all three problems.

## How Echo Works

Replace your AI SDK imports with Echo. Users authenticate once, get a balance, and pay for their own usage. You set a markup and earn revenue automatically.

**Before:**

```typescript
// Option 1: Front costs yourself
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
const response = await generateText({
  model: openai('gpt-5'),
  'YOUR-API-KEY',
  prompt: '...'
});

```

**After:**

```typescript
// Users pay, you earn markup, zero infrastructure
import { useEchoModelProviders } from '@merit-systems/echo-react-sdk';
import { generateText } from 'ai';

const { openai } = useEchoModelProviders();
const response = await generateText({
  model: openai('gpt-5'),
  prompt: '...',
});
```

## Quick Start

```bash
pnpx echo-start@latest
```

Creates a new app with Echo pre-configured. Live in 2 minutes.

## Why Echo?

**No hosting costs** - Users pay providers directly through Echo. You never proxy requests or front bills.

**Better UX** - One OAuth login replaces complex BYOK flows. Users get a universal balance across all Echo apps.

**Instant revenue** - Set a markup percentage. Every token generates profit automatically.

**Zero infrastructure** - No payment processing, no usage tracking, no key validation. Echo handles it all.

## Core

- [Echo Control](./packages/app/control): Next.js app for [echo.merit.systems](https://echo.merit.systems). Hosted site and api routes.
- [Echo Server](./packages/app/server): Express server for router.echo.merit.systems. Proxy for routing and metering LLM requests from clients.

## SDKs

- [Echo TS SDK](./packages/sdk/ts) Typescript SDK that all the framework specific SDKs are built on top of.
- [Echo Next.js SDK](./packages/sdk/next) SDK for simple Next.js 15+ App Router integration.
- [Echo React SDK](./packages/sdk/react) SDK for simple React client side SPA integration.

## Examples

- [Echo Next.js Example](./packages/sdk/examples/next)
- [Echo React SDK](./packages/sdk/examples/vite)

## Templates

Get started quickly with `echo-start`:

```bash
pnpx echo-start gen-ai-app
```

Available templates:

- **[next](./templates/next)** - Next.js application with Echo
- **[react](./templates/react)** - Vite React application with Echo
- **[nextjsChatbot](./templates/nextjs-chatbot)** - Next.js with Echo and Vercel AI SDK
- **[assistantUi](./templates/assistant-ui)** - Next.js with Echo and Assistant UI

Or run `npx echo-start my-app` to choose interactively.

# Development

Fill out `packages/app/control/.env` and `packages/app/server/.env`. Then...

- `pnpm i`
- `pnpm dev`
