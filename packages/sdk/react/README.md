# Echo React SDK

React SDK for Echo OAuth2 + PKCE authentication and token management.

## Install

```bash
pnpm install @merit-systems/echo-react-sdk
```

## Setup

```tsx
import { EchoProvider, EchoSignIn, useEcho } from '@merit-systems/echo-react-sdk';

// 1. Wrap your app
<EchoProvider config={{ appId: 'your-app-id' }}>
  <App />
</EchoProvider>

// 2. Add sign-in
<EchoSignIn onSuccess={(user) => console.log(user)} />

// 3. Use authentication state
const { user, balance, isAuthenticated, signOut } = useEcho();
```

## CSP Requirements

Add to your Content Security Policy:

```http
connect-src https://echo.merit.systems;
```

## Components

```tsx
// Custom sign-in button
<EchoSignIn>
  <button>Sign In with Echo</button>
</EchoSignIn>

// Token purchase
<EchoTokens
  amount={100}
  onPurchaseComplete={(balance) => console.log(balance)}
/>

// Authentication state
const {
  user,           // { id, email, name }
  balance,        // { credits, currency }
  isAuthenticated,
  signIn,
  signOut,
  refreshBalance
} = useEcho();
```

## Monetize Vercel AI SDK Models

Wrap Vercel AI SDK providers with `useMonetizedModel` to route usage through
Echo automatically (supports OpenAI, Anthropic, Google Generative AI, and
OpenRouter models).

```tsx
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { useMonetizedModel } from '@merit-systems/echo-react-sdk';

function Example() {
  const monetize = useMonetizedModel();

  const ask = async () => {
    const { text } = await generateText({
      model: monetize(openai('gpt-4o-mini')),
      prompt: 'What is love?',
    });

    console.log(text);
  };

  return <button onClick={ask}>Ask Echo</button>;
}
```

Pass `useMonetizedModel({ baseRouterUrl: 'https://my-proxy.example.com' })`
to point SDK traffic at a self-hosted Echo router.

## Config

```tsx
<EchoProvider config={{
  appId: 'your-app-id',                    // required
  apiUrl: 'https://echo.merit.systems',         // optional (default)
  redirectUri: 'http://localhost:3000',         // optional
  scope: 'llm:invoke offline_access'            // optional
}}>
```
