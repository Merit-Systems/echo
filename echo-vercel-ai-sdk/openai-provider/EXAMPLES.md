# Echo TypeScript SDK - Examples

Simple examples showing how to use the `@zdql/echo-typescript-sdk` in your projects.

## Installation

```bash
npm install @zdql/echo-typescript-sdk
```

## Setup

```typescript
import { EchoClient } from '@zdql/echo-typescript-sdk';

const echo = new EchoClient({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://echo.merit.systems',
});
```

## Basic Examples

### Get Your Balance

```typescript
const balance = await echo.getBalance();
console.log(`You have $${balance.balance} remaining`);
```

### List Your Apps

```typescript
const apps = await echo.listEchoApps();
console.log(`You have ${apps.length} apps`);

apps.forEach(app => {
  console.log(`- ${app.name} (${app.isActive ? 'Active' : 'Inactive'})`);
});
```

### Get App Details

```typescript
const app = await echo.getEchoApp('your-app-id');
console.log(`App: ${app.name}`);
console.log(`URL: ${echo.getAppUrl(app.id)}`);
```

### Purchase Credits

```typescript
const payment = await echo.createPaymentLink({
  amount: 10,
  description: 'Buy $10 credits',
});

console.log(`Pay here: ${payment.paymentLink.url}`);
```

### Get User Info

```typescript
const user = await echo.getUserInfo();
console.log(`Hello ${user.name}!`);
console.log(`Email: ${user.email}`);
```

### Check Available Models

```typescript
const models = await echo.listSupportedModels();
console.log(`${models.length} models available`);

// Find OpenAI models
const openAIModels = models.filter(m => m.provider === 'openai');
console.log(
  'OpenAI models:',
  openAIModels.map(m => m.name)
);
```

## Quick Recipes

### Dashboard Data

```typescript
async function getDashboard() {
  const [balance, apps, user] = await Promise.all([
    echo.getBalance(),
    echo.listEchoApps(),
    echo.getUserInfo(),
  ]);

  return { balance, apps, user };
}

const dashboard = await getDashboard();
console.log(dashboard);
```

### Find Cheapest Model

```typescript
const models = await echo.listSupportedModels();
const cheapest = models.sort(
  (a, b) => a.pricing.input_cost_per_token - b.pricing.input_cost_per_token
)[0];

console.log(`Cheapest model: ${cheapest.name}`);
console.log(`Cost: $${cheapest.pricing.input_cost_per_token} per input token`);
```

### Check App Activity

```typescript
const app = await echo.getEchoApp('your-app-id');
console.log(`${app.name} has used ${app.totalTokens || 0} tokens`);
console.log(`Total cost: $${app.totalCost || 0}`);
```

## Environment Setup

Create a `.env` file:

```bash
ECHO_API_KEY=your_api_key_here
ECHO_BASE_URL=https://echo.merit.systems
```

Then use without configuration:

```typescript
const echo = new EchoClient(); // Uses environment variables
```

## TypeScript Types

Import types for better development experience:

```typescript
import { EchoClient, EchoApp, Balance, User } from '@zdql/echo-typescript-sdk';

const echo = new EchoClient({ apiKey: 'your-key' });

const balance: Balance = await echo.getBalance();
const apps: EchoApp[] = await echo.listEchoApps();
const user: User = await echo.getUserInfo();
```

That's it! These examples cover the most common use cases.
