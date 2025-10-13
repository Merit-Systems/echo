# @merit-systems/ai-x402

AI x402 payment integration SDK for Echo platform.

## Installation

```bash
pnpm add @merit-systems/ai-x402
```

## Client Usage

React hook for automatic x402 payment handling:

```typescript
import { useChatWithPayment } from '@merit-systems/ai-x402/client';

const { messages, input, handleInputChange, handleSubmit } = useChatWithPayment({
  api: '/api/chat',
  walletClient: yourWalletClient,
});
```

## Server Usage

### With Automatic Payment Handling

```typescript
import { createX402OpenAI } from '@merit-systems/ai-x402/server';
import { streamText } from 'ai';

const openai = createX402OpenAI(walletClient);

const result = streamText({
  model: openai('gpt-4'),
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### With Pre-signed Payment Header

```typescript
import { createX402OpenAIWithoutPayment } from '@merit-systems/ai-x402/server';
import { streamText } from 'ai';

const paymentHeader = req.headers.get('x-payment');
const openai = createX402OpenAIWithoutPayment(paymentHeader);

const result = streamText({
  model: openai('gpt-4'),
  messages: [{ role: 'user', content: 'Hello!' }],
});
```
