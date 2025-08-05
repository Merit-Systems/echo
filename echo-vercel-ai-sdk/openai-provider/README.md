# Echo TypeScript SDK

The official TypeScript SDK for the Echo platform, providing easy access to Echo APIs and a command-line interface for managing your Echo applications.

## Installation

```bash
pnpm install @echo/typescript-sdk
```

## CLI Usage

The SDK includes a CLI tool for managing your Echo account from the command line.

### Authentication

First, authenticate with your Echo account:

```bash
npx echo-cli login
```

This will:

1. Open your browser to the Echo authentication page
2. Guide you through creating an API key
3. Securely store the API key locally

### Available Commands

```bash
# Show authentication status
npx echo-cli whoami

# Get account balance
npx echo-cli balance

# List your Echo apps
npx echo-cli apps

# Logout (remove stored credentials)
npx echo-cli logout
```

## Programmatic Usage

```typescript
import { EchoClient } from '@echo/typescript-sdk';

// Initialize with API key
const client = new EchoClient({
  apiKey: 'echo_your_api_key_here',
});

// Or use stored credentials from CLI
const client = new EchoClient();

// Get account balance
const balance = await client.getBalance();
console.log(`Balance: $${balance.balance}`);

// List your Echo apps
const apps = await client.listEchoApps();
console.log('Your apps:', apps);

// Get a specific app
const app = await client.getEchoApp('app-id');

// Create a payment link
const paymentResponse = await client.createPaymentLink({
  amount: 10.0, // $10.00
  description: 'Credits for my account',
});
console.log('Payment URL:', paymentResponse.paymentLink.url);

// Get app URL
const appUrl = client.getAppUrl('app-id');
console.log('App URL:', appUrl);
```

## Configuration

The SDK can be configured via environment variables or constructor options:

```typescript
const client = new EchoClient({
  baseUrl: 'https://your-echo-instance.com', // Default: http://localhost:3000
  apiKey: 'your-api-key', // Optional if using stored credentials
});
```

### Environment Variables

- `ECHO_BASE_URL`: Base URL for the Echo API (default: `http://localhost:3000`)

## API Reference

### EchoClient

#### Constructor

```typescript
new EchoClient(config?: Partial<EchoConfig>)
```

#### Methods

##### `getBalance(echoAppId?: string): Promise<Balance>`

Get account balance, optionally for a specific app.

##### `listEchoApps(): Promise<EchoApp[]>`

List all Echo apps for the authenticated user.

##### `getEchoApp(appId: string): Promise<EchoApp>`

Get details for a specific Echo app.

##### `createPaymentLink(request: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse>`

Create a Stripe payment link for purchasing credits.

##### `getPaymentUrl(amount: number, echoAppId: string, description?: string): Promise<string>`

Convenience method to get a payment URL for purchasing credits.

##### `getAppUrl(appId: string): string`

Get the web URL for accessing an Echo app.

### Types

#### Balance

```typescript
interface Balance {
  balance: string;
  totalPaid: string;
  totalSpent: string;
  currency: string;
  echoAppId?: string | null;
}
```

#### EchoApp

```typescript
interface EchoApp {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  totalTokens?: number;
  totalCost?: number;
  // ... other fields
}
```

#### CreatePaymentLinkRequest

```typescript
interface CreatePaymentLinkRequest {
  amount: number; // Amount in USD
  description?: string;
  echoAppId: string;
}
```

## Security

API keys are stored securely using the system keychain:

- **macOS**: Keychain Access
- **Windows**: Credential Vault
- **Linux**: libsecret

Never commit API keys to version control. Use environment variables or the CLI's secure storage.

## Error Handling

The SDK throws descriptive errors for common issues:

```typescript
try {
  const balance = await client.getBalance();
} catch (error) {
  if (error.message.includes('Authentication required')) {
    console.log('Please run "npx echo-cli login" to authenticate');
  } else {
    console.error('API Error:', error.message);
  }
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build the SDK
pnpm run build

# Run tests
pnpm test

# Watch mode for development
pnpm run dev
```

## License

MIT
