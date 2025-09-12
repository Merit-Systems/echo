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
