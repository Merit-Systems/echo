# Echo Next.js SDK

The official Next.js SDK for the Echo platform, providing seamless authentication, AI provider integration, and easy access to Echo APIs in Next.js applications.

## Installation

```bash
pnpm install @merit-systems/echo-next-sdk
```

## Features

- **OAuth Authentication** - Complete authentication flow with automatic token management
- **AI Provider Integration** - Pre-configured OpenAI, Anthropic, and Google AI providers
- **Server & Client Components** - Support for both server-side and client-side usage
- **Automatic Token Refresh** - Handles token refresh automatically
- **TypeScript Support** - Full TypeScript support with type definitions
- **Cookie-based Sessions** - Secure HTTP-only cookie authentication

## Quick Start

### 1. Server Setup

Create an Echo instance in your server code:

```typescript
// src/echo/index.ts
import Echo from '@merit-systems/echo-next-sdk';

export const {
  // Echo Auth Routes
  handlers,

  // Server-side utilities
  getUser,
  isSignedIn,
  getEchoToken,

  // AI Providers
  openai,
  anthropic,
  google,
} = Echo({
  appId: process.env.NEXT_PUBLIC_ECHO_APP_ID!,
});
```

### 2. API Route Setup

Export the handlers in your API route:

```typescript
// app/api/echo/[...echo]/route.ts
import { handlers } from '@/echo';

export const { GET, POST } = handlers;
```

This automatically sets up these authentication endpoints:

- `/api/echo/signin` - Initiates OAuth flow
- `/api/echo/callback` - OAuth callback handler
- `/api/echo/refresh` - Token refresh endpoint
- `/api/echo/session` - Session status endpoint
- `/api/echo/signout` - Sign out endpoint

### 3. Client Provider Setup

Wrap your app with the Echo provider:

```typescript
// providers.tsx
'use client';

import { EchoProvider } from '@merit-systems/echo-next-sdk/client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EchoProvider config={{ appId: process.env.NEXT_PUBLIC_ECHO_APP_ID! }}>
      {children}
    </EchoProvider>
  );
}
```

```typescript
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Usage

### Server-Side Authentication

```typescript
import { getUser, isSignedIn } from '@/echo';

export default async function Page() {
  const signedIn = await isSignedIn();

  if (!signedIn) {
    return <SignInButton />;
  }

  const user = await getUser();
  return <Dashboard user={user} />;
}
```

### Client-Side Hook

```typescript
'use client';

import { useEcho } from '@merit-systems/echo-next-sdk/client';

export default function MyComponent() {
  const {
    user,
    balance,
    freeTierBalance,
    signIn,
    signOut,
    echoClient,
    isLoading
  } = useEcho();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <button onClick={signIn}>Sign In with Echo</button>;
  }

  return (
    <div>
      <p>Welcome {user.name}!</p>
      <p>Balance: ${balance?.balance || 0}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### AI Provider Integration

Use Echo-wrapped AI providers with automatic billing:

```typescript
// app/api/chat/route.ts
import { openai } from '@/echo';
import { streamText, convertToModelMessages } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

### Direct API Access

Access the full Echo API through the client:

```typescript
'use client';

import { useEcho } from '@merit-systems/echo-next-sdk/client';

export default function PaymentComponent() {
  const { echoClient } = useEcho();

  const createPaymentLink = async () => {
    if (!echoClient) return;

    const paymentLink = await echoClient.payments.createPaymentLink({
      amount: 10,
      description: 'Credits for my account',
    });

    window.open(paymentLink.url, '_blank');
  };

  return <button onClick={createPaymentLink}>Add Credits</button>;
}
```

## Configuration

The Echo constructor accepts the following configuration:

| Option     | Type     | Required | Default     | Description              |
| ---------- | -------- | -------- | ----------- | ------------------------ |
| `appId`    | `string` | ✅       | -           | Your Echo App ID         |
| `basePath` | `string` | ❌       | `/api/echo` | Base path for API routes |

## Environment Variables

Set these environment variables in your `.env.local`:

```bash
NEXT_PUBLIC_ECHO_APP_ID=your_echo_app_id_here
```

## Components

The SDK re-exports helpful components from the React SDK:

```typescript
import {
  EchoSignIn,
  EchoSignOut,
  EchoTokens,
  InsufficientFundsModal,
} from '@merit-systems/echo-next-sdk/client';
```

## TypeScript Support

The SDK is built with TypeScript and provides full type definitions for all methods and responses. Import types as needed:

```typescript
import type { EchoConfig, EchoResult } from '@merit-systems/echo-next-sdk';
```

## Documentation

For complete documentation and examples, visit:

- [Echo Next.js Documentation](https://echo.merit.systems/docs/next-sdk)
- [Getting Started Guide](https://echo.merit.systems/docs/getting-started/next-js)

## Requirements

- Next.js 15.0.0 or higher
- React 18.0.0 or 19.0.0
- Node.js 18 or higher
