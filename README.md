![Echo Header](./imgs/header_gif.gif)

<div align="center">
  
# Echo

</div>

  <div align="center">
    
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
- **[next-chat](./templates/next-chat)** - Next.js chatbot with Echo and Vercel AI SDK
- **[assistant-ui](./templates/assistant-ui)** - Next.js with Echo and Assistant UI
- **[echo-cli](./templates/echo-cli)** - CLI tool for AI chat with Echo (API keys + crypto wallets)

Or run `npx echo-start my-app` to choose interactively.

**Note:** The CLI template (`echo-cli`) requires manual installation from the repository as it's a command-line tool rather than a web application. See the [templates README](./templates/README.md) for details.

---

# Local Development

## Prerequisites

| Dependency        | Version   | Install                                                       |
| ----------------- | --------- | ------------------------------------------------------------- |
| Node.js           | >= 18     | [nodejs.org](https://nodejs.org)                              |
| pnpm              | >= 10     | `npm install -g pnpm`                                         |
| Docker + Compose  | latest    | [docker.com/get-docker](https://docs.docker.com/get-docker/)  |

Docker is used to run a local PostgreSQL database. No other external services are required for basic local development.

## Getting Started

```bash
# 1. Clone and enter the repo
git clone https://github.com/Merit-Systems/echo.git
cd echo

# 2. Install dependencies
pnpm install

# 3. Run the automated setup (creates .env files, starts Postgres, runs migrations)
pnpm setup

# 4. Start developing
pnpm dev
```

After `pnpm dev`, open **http://localhost:3000** — you should see the Echo Control dashboard.

That's it. The `pnpm setup` script handles everything:
- Checks that `node`, `pnpm`, `docker`, and `docker compose` are available
- Generates `.env` files for both `packages/app/control` and `packages/app/server` with working local defaults
- Starts a PostgreSQL container (port **5469**) via Docker Compose
- Runs Prisma migrations to set up the database schema

## What Gets Started

| Service        | URL                     | Package                     |
| -------------- | ----------------------- | --------------------------- |
| Echo Control   | http://localhost:3000   | `packages/app/control`      |
| Echo Server    | http://localhost:3069   | `packages/app/server`       |
| PostgreSQL     | `localhost:5469`        | Docker (via `docker-local-db.yml`) |

## Using LLM Providers Locally

By default, no LLM provider keys are configured. To actually route requests through the Echo Server to an LLM, add your API keys to `packages/app/server/.env`:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
```

Restart the server after changing `.env` values.

## OAuth / Authentication

The local setup uses placeholder OAuth credentials. To test real Google or GitHub login:

1. **GitHub**: Create an OAuth App at https://github.com/settings/developers
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
2. **Google**: Create credentials at https://console.cloud.google.com/apis/credentials
   - Callback URL: `http://localhost:3000/api/auth/callback/google`

Then update the values in `packages/app/control/.env`.

## Useful Commands

```bash
# Start dev servers (control + server)
pnpm dev

# Database
pnpm --filter echo-control exec prisma studio    # Visual DB browser
pnpm --filter echo-control exec prisma db push    # Push schema changes
pnpm --filter echo-control exec prisma migrate dev # Create a new migration

# Testing
pnpm test:unit          # Unit tests
pnpm test:integration   # Integration tests
pnpm test:all           # Everything

# Code quality
pnpm lint               # Lint all packages
pnpm format             # Format all files
pnpm type-check         # TypeScript check (currently not in root)

# Seed data (run from packages/app/control)
./scripts/seed-users.sh              # Create test users
./scripts/seed-app-usage.sh          # Generate sample usage data
```

## Troubleshooting

**`pnpm dev` fails with env validation errors**

Make sure you ran `pnpm setup` first. If you already have a `.env` file, check that `AUTH_SECRET` is set. You can regenerate it:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Port 5469 already in use**

Another PostgreSQL container might be running. Stop it:

```bash
docker stop echo-control-postgres-v2
docker rm echo-control-postgres-v2
```

Then re-run `pnpm setup`.

**Prisma errors about missing migrations**

```bash
cd packages/app/control
pnpm exec prisma migrate deploy
# or force-reset for a fresh start:
pnpm exec prisma db push --force-reset
```

**Docker not running**

The setup script needs Docker for PostgreSQL. Make sure the Docker daemon is running before you run `pnpm setup`.

---

See [CONTRIBUTING.md](./CONTRIBUTING.md) for coding standards, commit conventions, and PR guidelines.
