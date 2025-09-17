# Echo TypeScript SDK

The official TypeScript SDK for the Echo platform, providing easy access to Echo APIs and a command-line interface for managing your Echo applications.

## Installation

```bash
pnpm install @merit-systems/echo-typescript-sdk
```

## Programmatic Usage

```typescript
import { EchoClient } from '@merit-systems/echo-typescript-sdk';

// Initialize with API key
const client = new EchoClient({
  apiKey: 'echo_your_api_key_here',
});

// Or use stored credentials from CLI
const client = new EchoClient();

// Get account balance
const balance = await client.getBalance();
console.log(`Balance: $${balance.balance}`);

// Create a payment link
const paymentResponse = await client.createPaymentLink({
  amount: 10.0, // $10.00
  description: 'Credits for my account',
});
console.log('Payment URL:', paymentResponse.paymentLink.url);
```

## Monetize Vercel AI SDK Calls

Use the `monetized` helper to wrap any Vercel AI SDK model so requests flow
through the Echo router and accrue usage to your Echo app. The wrapper currently
supports OpenAI, Anthropic, Google Generative AI, and OpenRouter providers.

```ts
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { monetized } from '@merit-systems/echo-typescript-sdk';

const fetchEchoAccessToken = async () => {
  // Replace with your token retrieval logic (e.g. useEcho().getToken()).
  return await echoAuthClient.getToken();
};

const model = monetized(openai('gpt-4o-mini'), {
  appId: 'your-echo-app-id',
  getAccessToken: fetchEchoAccessToken,
  // baseRouterUrl and onInsufficientFunds are optional overrides
});

const { text } = await generateText({
  model,
  prompt: 'What is love?',
});
```

Supply a `getAccessToken` resolver that returns the short-lived Echo access
token for the current user. When using the React SDK, `useMonetizedModel`
exposes this wiring for you.
