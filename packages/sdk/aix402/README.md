# @merit-systems/echo-aix402-sdk

AI x402 payment integration SDK for Echo platform.

## Installation

```bash
pnpm add @merit-systems/echo-aix402-sdk
```

## Usage

```typescript
import { useChatWithPayment } from '@merit-systems/echo-aix402-sdk';

// In your React component
const chat = useChatWithPayment({
  walletClient: yourWalletClient,
  regenerateOptions: {},
  // ... other useChat options
});
```

## Features

- React hook for chat with x402 payment handling
- Automatic payment error handling and regeneration
- Seamless integration with @ai-sdk/react

## License

MIT

