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

## Config

```tsx
<EchoProvider config={{
  appId: 'your-app-id',                    // required
  apiUrl: 'https://echo.merit.systems',         // optional (default)
  redirectUri: 'http://localhost:3000',         // optional
  scope: 'llm:invoke offline_access'            // optional
}}>
```
