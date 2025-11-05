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
- **[nextjsChatbot](./templates/nextjs-chatbot)** - Next.js with Echo and Vercel AI SDK
- **[assistantUi](./templates/assistant-ui)** - Next.js with Echo and Assistant UI

Or run `npx echo-start my-app` to choose interactively.

# Development

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **pnpm 10+** - Install with `npm install -g pnpm`
- **Docker & Docker Compose** - Download from [docker.com](https://www.docker.com/products/docker-desktop)

## Quick Start

### Automated Setup (Recommended)

```bash
# Run the setup script (handles dependencies, database, and configuration)
bash scripts/setup-local.sh
```

Then start development:

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) - you should see Echo running!

### Manual Setup

If you prefer manual setup or the script fails:

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up Echo Control (frontend/API)**:
   ```bash
   cd packages/app/control
   cp .env.example .env
   pnpm local-setup
   ```

3. **Start the development servers**:
   ```bash
   cd ../..  # Back to root
   pnpm dev
   ```

## Configuration

### Required Environment Variables

**Echo Control** (`packages/app/control/.env`):
- `AUTH_SECRET` - Generated automatically by the setup script
- `DATABASE_URL` - PostgreSQL connection string (set to `postgresql://echo_user:echo_password@localhost:5469/echo_control_v2?schema=public`)

**Echo Server** (`packages/app/server/.env`):
- `DATABASE_URL` - PostgreSQL connection string (set to `postgresql://echo_user:echo_password@localhost:5469/echo_control_v2?schema=public`)
- `ECHO_CONTROL_BASE_URL` - Set to `http://localhost:3000/`

For local development, most other variables (Stripe, OAuth providers, API keys) are optional and can use mock values.

## Database Management

PostgreSQL runs in Docker. Useful commands:

```bash
# View database in Prisma Studio
pnpm -C packages/app/control prisma studio

# View database logs
docker compose -f packages/app/control/docker-local-db.yml logs postgres

# Stop the database
docker compose -f packages/app/control/docker-local-db.yml down

# Reset database (WARNING: deletes all data)
pnpm -C packages/app/control prisma migrate reset
```

## Troubleshooting

### Docker Connection Error
Make sure Docker Desktop is running. On Mac/Windows, launch Docker Desktop. On Linux, ensure the Docker daemon is running.

### Port Already in Use
If port 3000 or 3070 is already in use:
- Find the process: `lsof -i :3000`
- Kill it: `kill -9 <PID>`
- Or change the port in the `.env` files

### Database Connection Failed
1. Check Docker is running: `docker ps`
2. Check PostgreSQL is running: `docker ps | grep postgres`
3. View logs: `docker logs echo-control-postgres-v2`
4. Reset: `docker compose -f packages/app/control/docker-local-db.yml down -v`

### pnpm command not found
Install pnpm globally: `npm install -g pnpm@10.11.0`
