# Echo Templates

This directory contains ready-to-use templates for building AI applications with Echo. Each template is pre-configured with Echo integration and demonstrates different use cases and frameworks.

## Quick Start

The fastest way to get started is using the `echo-start` CLI tool:

```bash
npx echo-start@latest --template <template-name>
```

You'll be prompted for your Echo App ID during setup. If you don't have one yet, visit [echo.merit.systems/new](https://echo.merit.systems/new) to create a new app.

## Available Templates

### Core Templates

#### Next.js (`next`)

A minimal Next.js application with Echo integration, perfect for getting started quickly.

```bash
npx echo-start@latest --template next
```

**Features:**

- Next.js 15 with App Router
- Server-side Echo integration
- Basic authentication flow
- Echo provider configuration

---

#### React (`react` / `vite`)

A Vite-powered React application with Echo's client-side SDK.

```bash
npx echo-start@latest --template vite
```

**Features:**

- Vite for fast development
- Client-side OAuth2 + PKCE
- No backend required for AI calls
- React 18 with TypeScript

---

#### Assistant UI (`assistant-ui`)

Full-featured chat UI using `@assistant-ui/react` with AI SDK v5.

```bash
npx echo-start@latest --template assistant-ui
```

**Features:**

- Modern chat interface
- AI SDK v5 integration
- Streaming responses
- Built-in UI components

---

### CLI Templates

#### Echo CLI (`echo-cli`)

A command-line interface for AI chat powered by Echo with support for both API key and crypto wallet payments.

**Note:** This template is different from web-based templates. Install it directly from the repository:

```bash
git clone https://github.com/Merit-Systems/echo.git
cd echo/templates/echo-cli
pnpm install
pnpm build
```

**Features:**

- Dual authentication: Echo API keys or WalletConnect
- Multi-model support (GPT-4o, GPT-5, etc.)
- X402 protocol for crypto payments
- Conversation history and resume
- Secure OS keychain credential storage
- Export conversations as JSON
- Profile and usage management

**Usage:**

```bash
echodex login          # Authenticate
echodex                # Start chat
echodex model          # Select AI model
echodex resume         # Resume conversation
echodex history        # View history
echodex export         # Export as JSON
echodex profile        # View profile
echodex logout         # Sign out
```

---

### Feature-Specific Templates

#### Next.js Chat (`next-chat`)

A complete chat application with beautiful UI components.

```bash
npx echo-start@latest --template next-chat
```

**Features:**

- Full chat interface
- Real-time balance display
- Message history
- Streaming AI responses
- shadcn/ui components

---

#### Next.js Image Generation (`next-image`)

Image generation application with Echo billing.

```bash
npx echo-start@latest --template next-image
```

**Features:**

- AI image generation
- Gallery view
- Download capabilities
- Automatic cost tracking
- Multiple AI image providers

---

#### Next.js Video (`next-video-template`)

Video generation application integrated with Echo.

```bash
npx echo-start@latest --template next-video-template
```

**Features:**

- AI video generation
- Video preview and playback
- Echo billing integration
- Modern video player UI

---

#### Next.js API Key Template (`nextjs-api-key-template`)

Server-side API key management with database integration.

```bash
npx echo-start@latest --template nextjs-api-key-template
```

**Features:**

- API key generation and management
- PostgreSQL database with Prisma
- Server-side authentication
- Docker setup for local development
- Secure key storage

---

#### React Chat (`react-chat`)

Chat interface built for React applications.

```bash
npx echo-start@latest --template react-chat
```

**Features:**

- Client-side chat UI
- Vite + React
- Tailwind CSS styling
- Echo OAuth integration

---

#### React Image (`react-image`)

Image generation for client-side React applications.

```bash
npx echo-start@latest --template react-image
```

**Features:**

- Client-side image generation
- React-based UI
- Echo billing
- Image gallery

---

#### Auth.js (NextAuth) (`authjs`)

Next.js application demonstrating Echo as an Auth.js provider for authentication.

```bash
npx echo-start@latest --template authjs
```

**Features:**

- Auth.js (NextAuth v5) integration
- Echo as authentication provider
- Server-side session management

---

## Template Structure

Each template follows a consistent structure:

```
template-name/
├── src/                  # Source code
│   ├── app/             # Application pages (Next.js)
│   ├── components/      # React components
│   └── echo/            # Echo configuration
├── public/              # Static assets
├── package.json         # Dependencies
├── README.md           # Template-specific documentation
└── [config files]      # Framework-specific config
```

## Installation

```bash
# npm
npx echo-start@latest --template <template-name>

# yarn
yarn dlx echo-start@latest --template <template-name>

# pnpm
pnpx echo-start@latest --template <template-name>

# bun
bunx echo-start@latest --template <template-name>
```

## Configuration

All templates require an Echo App ID. Get yours at [echo.merit.systems/new](https://echo.merit.systems/new).

### Next.js Templates

Configure in `src/echo/index.ts`:

```typescript
export const { handlers, isSignedIn, openai, anthropic } = Echo({
  appId: 'your-echo-app-id',
});
```

### React Templates

Configure in `src/echo/index.ts`:

```typescript
export const echo = new Echo({
  appId: 'your-echo-app-id',
});
```

### Environment Variables

Some templates (like `nextjs-api-key-template`) may require additional environment variables. Check the template's README for details.

## Documentation

- **Echo Docs**: [echo.merit.systems/docs](https://echo.merit.systems/docs)
- **Next.js SDK**: [echo.merit.systems/docs/next-sdk](https://echo.merit.systems/docs/next-sdk)
- **React SDK**: [echo.merit.systems/docs/react-sdk](https://echo.merit.systems/docs/react-sdk)
- **TypeScript SDK**: [echo.merit.systems/docs/typescript-sdk](https://echo.merit.systems/docs/typescript-sdk)

## Support

- **Platform**: [echo.merit.systems](https://echo.merit.systems)
- **Documentation**: [echo.merit.systems/docs](https://echo.merit.systems/docs)
- **GitHub**: [github.com/Merit-Systems/echo](https://github.com/Merit-Systems/echo)

---

Built with ❤️ by [Merit Systems](https://merit.systems)
