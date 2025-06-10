# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

Echo is a TypeScript monorepo providing an LLM application platform with 5 main packages:

- **echo-control** - Control plane (Next.js) for user management, billing, API keys
- **echo-server** - Backend API server handling LLM requests and provider proxying
- **echo-typescript-sdk** - Client SDK and CLI for developers
- **echo-react-sdk** - React SDK for OAuth2 + PKCE authentication and token management
- **create-echo-app** - CLI tool for scaffolding chatbot applications

### Key Architectural Relationships

- **echo-server** depends on **echo-control** for Prisma client (copied at build time)
- **echo-server** uses **echo-typescript-sdk** as dependency for client functionality
- API keys are app-scoped (major architectural constraint - all keys tied to specific Echo apps)
- Dual authentication: Clerk sessions (web UI) + API keys (programmatic access)

## Development Commands

### Monorepo Commands (run from root)

```bash
pnpm run build          # Build all packages
pnpm run test          # Test all packages
pnpm run lint          # Lint all packages
pnpm run type-check    # TypeScript checking across monorepo
pnpm run format        # Prettier formatting
```

### Package-specific Development

**Echo Control (web dashboard):**

```bash
cd echo-control
pnpm run dev                    # Next.js dev server
pnpm run prisma:generate       # Generate Prisma client
pnpm run prisma:push          # Push schema changes to DB
pnpm dlx prisma studio             # Database browser
```

**Echo Server (API backend):**

```bash
cd echo-server
pnpm run dev                   # Development server
pnpm run copy-prisma          # Copy Prisma client from echo-control (required dependency)
pnpm test                     # Run tests
```

**TypeScript SDK:**

```bash
cd echo-typescript-sdk
pnpm run build                # Build SDK
pnpm dlx echo-cli login          # CLI authentication
pnpm test                    # Run SDK tests
```

**React SDK:**

```bash
cd echo-react-sdk
pnpm install                 # Install dependencies
pnpm run build              # Build SDK
pnpm run test               # Run unit tests
pnpm run test:integration   # Run integration tests
pnpm run test:security      # Run security tests
pnpm run storybook          # Component development
```

## Database & Authentication

- **PostgreSQL** with Prisma ORM
- **Prisma client** is generated in echo-control and copied to echo-server
- **API key validation** happens through echo-control endpoints
- **Stripe webhooks** for payment processing (use ngrok for local testing)

## Critical Dependencies

- **Prisma client copying**: echo-server requires `pnpm run copy-prisma` after echo-control Prisma changes
- **App-scoped API keys**: All API keys must be associated with specific Echo apps (breaking change from earlier versions)
- **Strict TypeScript**: Shared config in `tsconfig.base.json` with comprehensive type safety rules

## LLM Provider System

- **Factory pattern** for provider selection in echo-server
- **Supported providers**: Anthropic (Claude), OpenAI (GPT)
- **Cost tracking** and token usage analytics
- **Provider classes** in `src/providers/` directory

## Testing & Code Quality

- **Pre-commit hooks** with Husky and lint-staged
- **Consistent linting** across packages with shared ESLint config
- **Automatic Prettier formatting** on commit
- **Type checking** enforced across monorepo
- **Comprehensive testing**: Unit, integration, and security tests in echo-react-sdk using Vitest
- **Component testing**: Storybook for React component development and documentation

Run `pnpm run lint` and `pnpm run type-check` before committing changes.
