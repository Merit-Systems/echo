# Echo Platform - Deep Dive Guide

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Core Components](#core-components)
- [X402 Payment Protocol](#x402-payment-protocol)
- [Request Flow](#request-flow)
- [AI Agents & LLM Usage](#ai-agents--llm-usage)
- [Extending to Stellar Network](#extending-to-stellar-network)
- [Development Guide](#development-guide)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

**Echo is a user-pays AI infrastructure platform** that eliminates the need for developers to front API costs or build billing infrastructure.

### The Problem It Solves

Traditional AI app development forces you to choose:

| Approach | Developer Cost | User Experience | Revenue Model |
|----------|---------------|-----------------|---------------|
| **BYOK** | None (but no revenue) | Complex key management | None |
| **Dev API Key** | Unpredictable burn rate | Simple | Need metering + billing |
| **Bill End Users** | Weeks building infra | Simple | Auth + Stripe + metering |

**Echo eliminates all three problems.**

### How It Works

```typescript
// Before Echo - You front costs
import { openai } from '@ai-sdk/openai';
const response = await generateText({
  model: openai('gpt-4o'),
  apiKey: 'YOUR-API-KEY', // Your money burning
  prompt: '...'
});

// After Echo - Users pay, you earn markup
import { openai } from '@/echo';
const response = await generateText({
  model: openai('gpt-4o'), // User's balance charged
  prompt: '...'
});
```

### Value Proposition

**For Users:**
- Pay only for what you use (no subscriptions)
- Universal balance across all Echo apps
- Transparent pricing per request
- Choice of payment: OAuth + Stripe OR Web3 wallet

**For Developers:**
- Zero upfront API costs
- Instant revenue (set markup percentage)
- No billing infrastructure needed
- Production-ready in 2 minutes

**Example Economics:**
```
OpenAI charges:  $0.50 for request
Your markup:     20%
User pays:       $0.60
Your profit:     $0.10
Your risk:       $0.00 (user pre-pays)
```

---

## Architecture

### Monorepo Structure

```
/echo
├── packages/
│   ├── app/
│   │   ├── control/          # echo.merit.systems (Next.js dashboard)
│   │   └── server/           # router.echo.merit.systems (Express proxy)
│   ├── sdk/
│   │   ├── ts/               # Core TypeScript SDK
│   │   ├── react/            # React SDK (OAuth + hooks)
│   │   ├── next/             # Next.js SDK (full-stack)
│   │   ├── auth-js-provider/ # Auth.js integration
│   │   ├── aix402/           # X402 payment protocol SDK
│   │   └── echo-start/       # CLI scaffolding tool
│   └── tests/
│       ├── integration/
│       └── provider-smoke/
├── templates/                # Ready-to-deploy starters
│   ├── next/
│   ├── react/
│   ├── next-chat/
│   ├── next-image/
│   └── next-video-template/
└── docs/                     # Documentation
```

### Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- Tailwind CSS + Radix UI
- Lucide React icons

**Backend:**
- Express.js (Echo Server)
- Next.js API Routes (Control Plane)
- tRPC (type-safe APIs)
- Prisma ORM
- PostgreSQL

**Blockchain:**
- Base chain (EVM)
- Coinbase CDP SDK
- USDC (ERC20 + ERC3009)

**Infrastructure:**
- pnpm + Turbo (monorepo)
- Vercel (hosting)
- Stripe (fiat payments)
- OpenTelemetry (observability)

---

## Core Components

### 1. Echo Control Plane (`packages/app/control`)

**Purpose:** Management dashboard at `echo.merit.systems`

**Responsibilities:**
- User authentication (OAuth2 + PKCE via Auth.js)
- App registration and management
- API key generation (HMAC-SHA256 hashed)
- Balance management (credit system)
- Payment processing (Stripe integration)
- Analytics dashboard
- Referral rewards system
- Admin features (payouts, user management)

**Key Features:**
- Real-time balance tracking
- Usage metrics by model
- Transaction history
- Cost breakdown analytics
- Stripe checkout integration
- API key management

**Database Models:**
```
Users           → Authentication, payment info, referrals
EchoApps        → Applications using Echo
ApiKeys         → Per-app authentication (hashed)
AppMemberships  → User-to-app relationships
Transactions    → Detailed usage logs (model, tokens, cost, profit)
SpendPools      → Free tier allocations
Payments        → Stripe payment history
Payouts         → Developer earnings withdrawals
ReferralCodes   → Referral reward tracking
```

**Tech Details:**
- Next.js 15 App Router
- Prisma ORM with PostgreSQL
- tRPC for type-safe backend
- OpenTelemetry for tracing
- Tailwind + Radix UI components

---

### 2. Echo Server (`packages/app/server`)

**Purpose:** Intelligent proxy at `router.echo.merit.systems`

**Responsibilities:**
- Request authentication (API keys + OAuth tokens + X402)
- Cost estimation (pre-request)
- Provider routing (OpenAI, Anthropic, Gemini, etc.)
- Request proxying with provider API keys
- Token counting (post-response)
- Cost calculation with markup
- Transaction recording
- X402 blockchain payment settlement
- Free tier management
- Refund processing

**Request Flow:**
```
Client Request
    ↓
Authentication Layer (API key OR OAuth OR X402)
    ↓
Provider Initialization (determine provider + estimate cost)
    ↓
Balance Check / Payment Validation
    ↓
Transaction Escrow (reserve balance)
    ↓
Forward to AI Provider (with provider's API key)
    ↓
Token Counting (actual usage)
    ↓
Cost Calculation (apply markup + referrals)
    ↓
Transaction Recording (DB write)
    ↓
Response to Client
```

**Supported Providers:**

**Chat Models:**
- OpenAI: gpt-4o, gpt-4-turbo, gpt-3.5-turbo, o1, o1-mini
- Anthropic: claude-3-5-sonnet, claude-3-opus, claude-3-haiku
- Google: gemini-2.0-flash, gemini-1.5-pro
- OpenRouter: Any model available
- Groq: Llama, Mixtral models
- Vertex AI: Proprietary models

**Image Generation:**
- OpenAI: dall-e-3, dall-e-2

**Video Generation:**
- OpenAI: sora
- Gemini: gemini-2.0-flash-preview
- Vertex AI: Video models

**Special Services:**
- E2B: Code execution environment
- Tavily: Web search, content extraction, crawling

**Architecture Patterns:**
- Provider factory pattern (extensible)
- Middleware: authentication, escrow, tracing
- Streaming + non-streaming response handlers
- Cost estimation + actual cost reconciliation

---

### 3. SDK Layer

#### TypeScript SDK (`@merit-systems/echo-typescript-sdk`)

**Core SDK** for programmatic access

**Components:**

**EchoClient:**
```typescript
const client = new EchoClient({ apiKey: 'echo_...' });

// Resources
await client.balance.getBalance();
await client.payments.createPaymentLink({ amount: 10 });
await client.apps.listApps();
await client.users.getCurrentUser();
await client.models.listModels();
```

**HttpClient:**
- Native fetch-based
- Automatic token refresh on 401
- Concurrent request protection

**TokenProvider:**
- ApiKeyTokenProvider (server-side)
- OAuth token management

**Pre-configured AI Providers:**
```typescript
import { openai, anthropic, google } from '@merit-systems/echo-typescript-sdk';

const provider = openai('gpt-4o');
```

---

#### React SDK (`@merit-systems/echo-react-sdk`)

**Client-side SDK** for browser/React apps

**Setup:**
```typescript
import { EchoProvider } from '@merit-systems/echo-react-sdk';

<EchoProvider appId="your-app-id">
  <App />
</EchoProvider>
```

**Key Hooks:**
```typescript
// Main hook
const { user, balance, signIn, signOut, isLoading } = useEcho();

// Balance updates
const { balance } = useEchoBalance();

// Direct API access
const client = useEchoClient();

// AI provider access
const { openai, anthropic, google } = useEchoModelProviders();

// Chat integration
const { messages, input, handleSubmit } = useChat({
  api: '/api/chat',
  // Auto-uses Echo authentication
});
```

**Authentication Flow:**
1. User clicks "Sign In with Echo"
2. OAuth popup to `echo.merit.systems`
3. User authenticates and authorizes app
4. Browser receives access/refresh tokens
5. Tokens stored in memory or secure storage
6. Automatic refresh on expiration

**UI Components:**
- Sign-in button
- Token purchase modal
- Insufficient funds modal
- Balance display

---

#### Next.js SDK (`@merit-systems/echo-next-sdk`)

**Full-stack SDK** for Next.js 15+ App Router

**Setup:**
```typescript
// src/echo/index.ts
import Echo from '@merit-systems/echo-next-sdk';

export const {
  handlers,      // API route handlers
  openai,        // Pre-configured OpenAI
  anthropic,     // Pre-configured Anthropic
  google,        // Pre-configured Google
  getUser,       // Server-side user info
  isSignedIn     // Server-side auth check
} = Echo({
  appId: process.env.NEXT_PUBLIC_ECHO_APP_ID
});
```

**API Routes (Auto-generated):**
```typescript
// app/api/echo/[...echo]/route.ts
import { handlers } from '@/echo';
export const { GET, POST } = handlers;
```

**Routes Created:**
- `/api/echo/signin` - Initiates OAuth
- `/api/echo/callback` - OAuth callback
- `/api/echo/refresh` - Token refresh
- `/api/echo/session` - Session status
- `/api/echo/signout` - Sign out

**Server-Side Usage:**
```typescript
// app/api/chat/route.ts
import { openai } from '@/echo';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });

  return result.toUIMessageStreamResponse();
}
```

**Client-Side Usage:**
```typescript
'use client';
import { useEcho } from '@merit-systems/echo-next-sdk/client';

export function ChatComponent() {
  const { user, balance, signIn, signOut } = useEcho();

  return (
    <div>
      {user ? (
        <>
          <p>Balance: ${balance}</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <button onClick={signIn}>Sign In with Echo</button>
      )}
    </div>
  );
}
```

---

## X402 Payment Protocol

### Overview

**X402 = HTTP 402 Payment Required**

A blockchain-native payment protocol enabling **wallet-based payments** without API keys.

### Key Characteristics

- **Protocol Version:** 1
- **Scheme:** "exact" (pre-signed authorization)
- **Payment Token:** USDC (6 decimals)
- **Signature Type:** ERC3009 TransferWithAuthorization (EVM) or Signed Transactions (SVM)
- **Status:** Standalone, reusable library (`@merit-systems/ai-x402`)

### Supported Networks

**EVM Chains:**
- `base` (mainnet) ← **Echo uses this**
- `base-sepolia` (testnet)
- `polygon` (Polygon PoS)
- `polygon-amoy` (testnet)
- `avalanche` (C-Chain)
- `avalanche-fuji` (testnet)
- `iotex`
- `peaq`

**Non-EVM Chains:**
- `solana` (mainnet)
- `solana-devnet` (testnet)
- `sei`
- `sei-testnet`

**Current Echo Deployment:** Base only (configurable via `NETWORK` env var)

### How X402 Works

#### 1. Challenge Response (HTTP 402)

When you make a request **without payment**, Echo returns:

```http
HTTP/1.1 402 Payment Required
WWW-Authenticate: X-402 realm="echo", link="/chat/completions", network="base"
Content-Type: application/json

{
  "x402Version": 1,
  "error": "Payment Required",
  "accepts": [{
    "scheme": "exact",
    "network": "base",
    "maxAmountRequired": "1000000",  // 1 USDC ($1.00 in atomic units)
    "payTo": "0xEchoSmartAccount...",
    "resource": "https://router.echo.merit.systems/chat/completions",
    "asset": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Base
    "nonce": "0xrandom32bytes...",
    "validAfter": 0,
    "validBefore": 1699999999,
    "maxTimeoutSeconds": 1000,
    "description": "Echo x402",
    "mimeType": "application/json"
  }]
}
```

**Key Fields:**
- `maxAmountRequired` - Maximum charge (USDC: 1,000,000 = $1.00)
- `payTo` - Echo's smart account address
- `asset` - USDC contract address on Base
- `nonce` - Prevents replay attacks
- `validBefore/validAfter` - Time constraints

#### 2. Payment Request

Client signs authorization and retries with `X-Payment` header:

```http
POST /chat/completions
X-Payment: <base64-encoded-payload>
Content-Type: application/json

# Base64 decodes to:
{
  "x402Version": 1,
  "scheme": "exact",
  "network": "base",
  "payload": {
    "signature": "0x...",  # Signed by user's wallet
    "authorization": {
      "from": "0xYourWallet...",
      "to": "0xEchoSmartAccount...",
      "value": "1000000",
      "validAfter": 0,
      "validBefore": 1699999999,
      "nonce": "0x..."
    }
  }
}
```

#### 3. Server Processing Flow

```
Request Arrives
    ↓
Check for 'x-payment' header
    ├─ NO → Return 402 challenge
    └─ YES → Continue
    ↓
Validate X-Payment Header (decode base64)
    ↓
Call Facilitator Service
    ├─ POST /verify - Check signature validity
    └─ POST /settle - Execute on-chain transfer
    ↓
Facilitator calls USDC contract:
  transferWithAuthorization(
    from: 0xYourWallet,
    to: 0xEchoSmartAccount,
    value: 1000000,
    validAfter: 0,
    validBefore: 1699999999,
    nonce: 0x...,
    signature: 0x...
  )
    ↓
Transaction confirmed on blockchain
    ↓
Execute model request (OpenAI, Anthropic, etc.)
    ↓
Calculate actual cost: $0.45
    ↓
Refund overpayment: $0.55
  └─ USDC.transfer(yourWallet, 550000)
    ↓
Return response to client
```

### Smart Contracts Involved

#### 1. USDC Contract (ERC20 + ERC3009)

**Address:** `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` (Base)

**ERC3009 Extension:**
```solidity
function transferWithAuthorization(
    address from,        // Payer's wallet
    address to,          // Echo's smart account
    uint256 value,       // Amount in atomic units
    uint256 validAfter,  // Unix timestamp
    uint256 validBefore, // Unix timestamp
    bytes32 nonce,       // Random 32 bytes
    bytes memory signature // EIP-712 signature
) external;
```

**Why ERC3009?**
- **Meta-transaction standard** - User signs, relayer executes
- **Gas-free for users** - Echo pays gas
- **Secure** - Signature acts as authorization
- **Standard** - Supported by USDC on multiple chains

#### 2. Echo Smart Account (Coinbase CDP)

- Created via `@coinbase/cdp-sdk`
- Has USDC balance for operations
- Executes `transferWithAuthorization` calls
- Sends refunds via standard `transfer()`

**Environment Variables:**
```bash
CDP_API_KEY_ID=...
CDP_API_KEY_SECRET=...
CDP_WALLET_SECRET=...
WALLET_OWNER=echo-fund-owner
```

#### 3. Merit Repository Contract

Optional: Funds open-source repositories

```typescript
// fundRepoService.ts
smartAccount.sendUserOperation({
  calls: [
    // Approve USDC
    {
      to: USDC_ADDRESS,
      data: encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [MERIT_CONTRACT_ADDRESS, amount]
      })
    },
    // Call fundRepo
    {
      to: MERIT_CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: MERIT_ABI,
        functionName: 'fundRepo',
        args: [repoId, instanceId, tokenAddress, amount, '0x']
      })
    }
  ]
});
```

### Facilitator Service

**Purpose:** External service that settles blockchain payments

**Endpoints:**
- `POST /api/v1/x402/verify` - Validates payment without settling
- `POST /api/v1/x402/settle` - Settles payment on-chain

**Authentication:** Coinbase CDP JWT

```typescript
const jwt = await generateCdpJwt({
  requestMethod: 'POST',
  requestPath: '/settle',
  requestHost: 'api.cdp.coinbase.com',
  expiresIn: 1200000000
});

headers: { 'Authorization': `Bearer ${jwt}` }
```

**Request/Response:**
```typescript
// Request
{
  x402Version: 1,
  paymentPayload: { /* signed authorization */ },
  paymentRequirements: { /* from 402 challenge */ }
}

// Response (settle)
{
  success: true,
  transaction: "0xTransactionHash...",
  network: "base",
  payer: "0xYourWallet..."
}
```

### Client-Side SDK Usage

#### React Hook (Automatic Payment Handling)

```typescript
import { useChatWithPayment } from '@merit-systems/ai-x402/client';
import { createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';

// Create wallet client (MetaMask, WalletConnect, etc.)
const walletClient = createWalletClient({
  chain: base,
  transport: custom(window.ethereum)
});

// Use the hook
const {
  messages,
  input,
  handleInputChange,
  handleSubmit
} = useChatWithPayment({
  api: '/api/chat',
  walletClient: walletClient,  // Signs payments automatically
});

// UI automatically handles 402 responses:
// 1. Gets 402 → Extracts payment requirements
// 2. Prompts wallet signature
// 3. Signs authorization → Retries with x-payment header
// 4. Request succeeds
```

#### Server-Side Provider Creation

```typescript
import { createX402OpenAI } from '@merit-systems/ai-x402/server';

const openai = createX402OpenAI(walletClient);

const result = streamText({
  model: openai('gpt-4'),
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

### X402 Advantages

**For Users:**
- ✅ No API keys required - Just wallet signature
- ✅ Self-custody - You control the payment
- ✅ Transparent - See exact amount before signing
- ✅ Automatic refunds - Overpayments returned
- ✅ Gas-free - Echo pays gas for transfers

**For Developers:**
- ✅ No payment infrastructure - X402 + facilitator handles it
- ✅ Blockchain-native - Perfect for Web3 apps
- ✅ Chain-agnostic design - Can expand to other chains
- ✅ Standard protocol - Uses external `x402` library

**For Web3 Ecosystem:**
- ✅ USDC payments - Stablecoin (no volatility)
- ✅ Open protocol - Anyone can implement
- ✅ Merit funding - Collected payments can fund OSS

### Current Limitations

❌ **Single asset:** USDC only (hardcoded address)
❌ **Single chain:** Base only in production (but configurable)
❌ **Centralized facilitator:** Trust required for settlement service
❌ **Gas costs:** Echo fronts gas for on-chain operations
❌ **Latency:** Extra round-trip for signature + on-chain confirmation

---

## Request Flow

### Complete End-to-End Flow

#### Scenario: User uses Echo-integrated chat app

**Setup Phase (Developer):**
1. Create app on `echo.merit.systems`
2. Get appId: `74d9c979-e036-4e43-904f-32d214b361fc`
3. Create API key (optional, for backend)
4. Set markup percentage (e.g., 20%)
5. Install SDK: `pnpm add @merit-systems/echo-next-sdk`

**User Authentication Phase:**
1. User visits developer's app
2. Clicks "Sign In with Echo"
3. Browser redirects to OAuth
4. User authenticates
5. Returns authorization code
6. Developer's app exchanges code for tokens
7. Tokens stored in secure HTTP-only cookies
8. User sees balance: $10.00

**Request/Payment Phase:**
```
User clicks "Send message"
    ↓
Frontend calls /api/chat (developer's server)
    ↓
Developer's server:
  import { openai } from '@/echo';
  openai('gpt-4o').generateText({ prompt: '...' });
    ↓
SDK extracts user token from request cookie
    ↓
Calls Echo Server: router.echo.merit.systems
  Header: Authorization: Bearer <token>
  Body: { model: 'gpt-4o', messages: [...] }
    ↓
Echo Server:
  - Authenticates token
  - Retrieves user ID and appId
  - Initializes GPT provider
  - Estimates cost: ~$0.084 (input + output + 20% markup)
  - Checks balance: ✓ sufficient
  - Reserves $0.084 in escrow
  - Forwards to OpenAI with Authorization: Bearer sk-...
    ↓
OpenAI API:
  - Generates response
  - Returns with usage: {prompt_tokens: 50, completion_tokens: 100}
    ↓
Echo Server:
  - Counts tokens: 50 input, 100 output
  - Calculates actual cost: $0.225
  - Applies 20% markup: $0.27
  - Deducts from user balance
  - Records transaction (totalCost, rawCost, markUpProfit)
  - Returns response
    ↓
Client UI:
  - Displays response
  - Updates balance to $9.73
  - Shows cost breakdown
```

### Authentication Methods

#### 1. API Key (Server-to-Server)

**Storage:** HMAC-SHA256 hash in database

```typescript
// Generate API key
const apiKey = 'echo_' + randomBytes(32).toString('hex');
const keyHash = createHmac('sha256', SECRET)
  .update(apiKey)
  .digest('hex');

// Store keyHash, return apiKey to user (one time)

// Authenticate request
const incomingHash = createHmac('sha256', SECRET)
  .update(req.headers.authorization)
  .digest('hex');

const record = await db.apiKey.findUnique({
  where: { keyHash: incomingHash }
});
```

**Pros:** Simple, no OAuth flow needed
**Cons:** Key must be kept secret

#### 2. OAuth2 + PKCE (Client-facing)

**Flow:**
```
1. Client generates code_verifier (random string)
2. Computes code_challenge = SHA256(code_verifier)
3. Redirects to /signin?code_challenge=...&redirect_uri=...
4. User authenticates on echo.merit.systems
5. Redirects back with authorization_code
6. Client exchanges: code + code_verifier for tokens
7. Receives: access_token + refresh_token
8. Stores in HTTP-only cookies
9. Auto-refreshes when access_token expires
```

**Pros:** Secure for browsers, no key management
**Cons:** More complex flow

#### 3. X402 (Blockchain)

**Flow:**
```
1. Client makes request without payment
2. Server returns 402 with payment requirements
3. Client signs authorization with wallet
4. Client retries with X-Payment header
5. Server validates and settles on-chain
6. Request executes
```

**Pros:** No API keys, self-custody, transparent
**Cons:** Requires wallet, blockchain latency

---

## AI Agents & LLM Usage

### Does Echo Implement AI Agents?

**NO** - Echo does **not** implement AI agents or agentic workflows.

**What Echo Does:**
- ✅ Proxies LLM API requests (chat completions)
- ✅ Handles image generation requests
- ✅ Handles video generation requests
- ✅ Supports streaming responses
- ✅ Supports tool/function calling (passthrough to provider)
- ✅ Meters token usage and calculates costs

**What Echo Does NOT Do:**
- ❌ No autonomous agents
- ❌ No multi-agent orchestration
- ❌ No workflow engines
- ❌ No LangChain, CrewAI, AutoGen, or similar frameworks
- ❌ No agent memory management
- ❌ No agentic reasoning loops

### LLM Usage in Echo

Echo is **infrastructure** for AI applications. It acts as a:
- **Payment gateway** (users pay for AI usage)
- **Proxy server** (routes requests to OpenAI, Anthropic, etc.)
- **Metering service** (tracks usage and calculates costs)
- **Authentication layer** (validates users and apps)

**Example Use Cases:**
- Developer builds chatbot with Vercel AI SDK
- Developer uses Echo to monetize without fronting costs
- User pays per request
- Developer earns markup

**Echo is not the AI** - it's the **billing layer** between your app and AI providers.

### Building Agents with Echo

You **can** build AI agents that use Echo for payments:

```typescript
// Your agent code (using LangChain, etc.)
import { ChatOpenAI } from '@langchain/openai';
import { openai } from '@/echo'; // Echo-wrapped provider

const llm = new ChatOpenAI({
  model: openai('gpt-4o'), // User pays via Echo
  temperature: 0.7,
});

// Your agentic workflow
const agent = createReactAgent({
  llm,
  tools: [searchTool, calculatorTool],
});

await agent.invoke({ input: "Plan a trip to Paris" });
// Each LLM call is metered and charged via Echo
```

**Key Point:** Echo handles the **payment layer**, you handle the **agent logic**.

---

## Extending to Stellar Network

### Overview

Currently, Echo supports EVM chains (Base) and has external `x402` library support for Solana. To add Stellar, you need to:

1. Extend the X402 protocol for Stellar (SVM-style)
2. Add Stellar USDC contract integration
3. Update facilitator service for Stellar transactions
4. Add Stellar network configuration
5. Update SDK to support Stellar wallets

### Prerequisites

- Stellar SDK knowledge
- Understanding of Stellar accounts and transactions
- Stellar USDC asset (issued by Circle)
- Stellar testnet and mainnet RPC endpoints

### Step-by-Step Guide

#### Step 1: Add Stellar Network Support

**File:** `packages/app/server/src/types.ts`

```typescript
export enum Network {
  BASE = 'base',
  BASE_SEPOLIA = 'base-sepolia',
  STELLAR = 'stellar',           // Add
  STELLAR_TESTNET = 'stellar-testnet', // Add
}

export const NETWORK_CONFIG = {
  base: {
    rpcUrl: 'https://mainnet.base.org',
    usdcAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chainId: 8453,
    type: 'evm',
  },
  'base-sepolia': {
    rpcUrl: 'https://sepolia.base.org',
    usdcAddress: '0x...',
    chainId: 84532,
    type: 'evm',
  },
  stellar: {
    horizonUrl: 'https://horizon.stellar.org',
    usdcAssetCode: 'USDC',
    usdcIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', // Circle
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    type: 'stellar',
  },
  'stellar-testnet': {
    horizonUrl: 'https://horizon-testnet.stellar.org',
    usdcAssetCode: 'USDC',
    usdcIssuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', // Testnet
    networkPassphrase: 'Test SDF Network ; September 2015',
    type: 'stellar',
  },
};
```

#### Step 2: Update X402 Types

**File:** `packages/sdk/aix402/src/x402-types.ts`

```typescript
// Update NetworkSchema
export const NetworkSchema = z.enum([
  'base',
  'base-sepolia',
  'polygon',
  'polygon-amoy',
  'avalanche',
  'avalanche-fuji',
  'solana',
  'solana-devnet',
  'stellar',           // Add
  'stellar-testnet',   // Add
  'iotex',
  'peaq',
  'sei',
  'sei-testnet',
]);

// Add Stellar-specific payload type
export const StellarPaymentPayloadSchema = z.object({
  type: z.literal('stellar'),
  transaction: z.string(), // XDR-encoded transaction
  signature: z.string(),   // Transaction signature
  publicKey: z.string(),   // Sender's public key
});

// Update PaymentPayloadSchema union
export const PaymentPayloadSchema = z.discriminatedUnion('type', [
  EVMPaymentPayloadSchema,
  SVMPaymentPayloadSchema,
  StellarPaymentPayloadSchema, // Add
]);
```

#### Step 3: Create Stellar Payment Service

**File:** `packages/app/server/src/services/stellar/stellarPaymentService.ts`

```typescript
import * as StellarSdk from '@stellar/stellar-sdk';
import { Network } from '../../types';

export class StellarPaymentService {
  private server: StellarSdk.Horizon.Server;
  private networkPassphrase: string;
  private usdcAsset: StellarSdk.Asset;
  private echoAccount: StellarSdk.Keypair;

  constructor(network: Network) {
    const config = NETWORK_CONFIG[network];

    this.server = new StellarSdk.Horizon.Server(config.horizonUrl);
    this.networkPassphrase = config.networkPassphrase;

    this.usdcAsset = new StellarSdk.Asset(
      config.usdcAssetCode,
      config.usdcIssuer
    );

    // Load Echo's Stellar account from env
    this.echoAccount = StellarSdk.Keypair.fromSecret(
      process.env.STELLAR_SECRET_KEY!
    );
  }

  async validatePayment(
    xdrTransaction: string,
    signature: string,
    senderPublicKey: string,
    expectedAmount: string
  ): Promise<{ isValid: boolean; payer: string; invalidReason?: string }> {
    try {
      // Decode XDR transaction
      const transaction = StellarSdk.TransactionBuilder.fromXDR(
        xdrTransaction,
        this.networkPassphrase
      ) as StellarSdk.Transaction;

      // Verify signature
      const keypair = StellarSdk.Keypair.fromPublicKey(senderPublicKey);
      const txHash = transaction.hash();
      const isValidSig = keypair.verify(txHash, Buffer.from(signature, 'hex'));

      if (!isValidSig) {
        return {
          isValid: false,
          payer: senderPublicKey,
          invalidReason: 'Invalid signature',
        };
      }

      // Verify transaction structure
      const operations = transaction.operations;

      // Check for payment operation to Echo account
      const paymentOp = operations.find(
        op =>
          op.type === 'payment' &&
          op.destination === this.echoAccount.publicKey() &&
          op.asset.equals(this.usdcAsset)
      ) as StellarSdk.Operation.Payment | undefined;

      if (!paymentOp) {
        return {
          isValid: false,
          payer: senderPublicKey,
          invalidReason: 'No valid payment operation found',
        };
      }

      // Verify amount (Stellar uses 7 decimal places)
      const expectedAmountDecimal = new Decimal(expectedAmount)
        .div(new Decimal(10).pow(6)); // Convert from USDC 6 decimals

      const actualAmount = new Decimal(paymentOp.amount);

      if (actualAmount.lt(expectedAmountDecimal)) {
        return {
          isValid: false,
          payer: senderPublicKey,
          invalidReason: `Insufficient amount: ${actualAmount} < ${expectedAmountDecimal}`,
        };
      }

      return {
        isValid: true,
        payer: senderPublicKey,
      };
    } catch (error) {
      return {
        isValid: false,
        payer: senderPublicKey,
        invalidReason: `Validation error: ${error.message}`,
      };
    }
  }

  async settlePayment(
    xdrTransaction: string,
    signature: string
  ): Promise<{
    success: boolean;
    transaction?: string;
    errorReason?: string;
  }> {
    try {
      // Reconstruct transaction
      const transaction = StellarSdk.TransactionBuilder.fromXDR(
        xdrTransaction,
        this.networkPassphrase
      ) as StellarSdk.Transaction;

      // Submit to network
      const result = await this.server.submitTransaction(transaction);

      return {
        success: true,
        transaction: result.hash,
      };
    } catch (error) {
      return {
        success: false,
        errorReason: `Settlement failed: ${error.message}`,
      };
    }
  }

  async refundPayment(
    recipientPublicKey: string,
    amount: string
  ): Promise<{ success: boolean; transaction?: string; errorReason?: string }> {
    try {
      // Load Echo account
      const echoAccountData = await this.server.loadAccount(
        this.echoAccount.publicKey()
      );

      // Build refund transaction
      const transaction = new StellarSdk.TransactionBuilder(
        echoAccountData,
        {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase: this.networkPassphrase,
        }
      )
        .addOperation(
          StellarSdk.Operation.payment({
            destination: recipientPublicKey,
            asset: this.usdcAsset,
            amount: new Decimal(amount)
              .div(new Decimal(10).pow(6))
              .toString(), // Convert to Stellar format
          })
        )
        .setTimeout(30)
        .build();

      // Sign with Echo's key
      transaction.sign(this.echoAccount);

      // Submit
      const result = await this.server.submitTransaction(transaction);

      return {
        success: true,
        transaction: result.hash,
      };
    } catch (error) {
      return {
        success: false,
        errorReason: `Refund failed: ${error.message}`,
      };
    }
  }

  // Convert USDC 6-decimal to Stellar 7-decimal format
  private usdcToStellarAmount(usdcAmount: string): string {
    return new Decimal(usdcAmount)
      .div(new Decimal(10).pow(6))
      .toString();
  }

  // Convert Stellar amount to USDC 6-decimal format
  private stellarToUsdcAmount(stellarAmount: string): string {
    return new Decimal(stellarAmount)
      .mul(new Decimal(10).pow(6))
      .toFixed(0);
  }
}
```

#### Step 4: Update Facilitator Service

**File:** `packages/app/server/src/services/facilitator/facilitatorService.ts`

```typescript
import { StellarPaymentService } from '../stellar/stellarPaymentService';

export async function verify(
  paymentPayload: PaymentPayload,
  paymentRequirements: PaymentRequirements
): Promise<VerifyResponse> {
  const { network } = paymentRequirements;

  // Check if Stellar network
  if (network === 'stellar' || network === 'stellar-testnet') {
    const stellarService = new StellarPaymentService(network);

    const result = await stellarService.validatePayment(
      paymentPayload.payload.transaction,
      paymentPayload.payload.signature,
      paymentPayload.payload.publicKey,
      paymentRequirements.maxAmountRequired
    );

    return {
      isValid: result.isValid,
      payer: result.payer,
      invalidReason: result.invalidReason,
    };
  }

  // Existing EVM/SVM logic...
}

export async function settle(
  settleRequest: SettleRequest
): Promise<SettleResponse> {
  const { paymentPayload, paymentRequirements } = settleRequest;
  const { network } = paymentRequirements;

  // Check if Stellar network
  if (network === 'stellar' || network === 'stellar-testnet') {
    const stellarService = new StellarPaymentService(network);

    const result = await stellarService.settlePayment(
      paymentPayload.payload.transaction,
      paymentPayload.payload.signature
    );

    return {
      success: result.success,
      transaction: result.transaction,
      network,
      payer: paymentPayload.payload.publicKey,
      errorReason: result.errorReason,
    };
  }

  // Existing EVM/SVM logic...
}
```

#### Step 5: Update X402 Challenge Generation

**File:** `packages/app/server/src/utils.ts`

```typescript
export function buildX402Response(
  req: Request,
  res: Response,
  maxCost: Decimal
): void {
  const network = (process.env.NETWORK as Network) || Network.BASE;
  const config = NETWORK_CONFIG[network];

  let asset: string;
  let payTo: string;

  if (config.type === 'stellar') {
    // Stellar uses Asset Code:Issuer format
    asset = `${config.usdcAssetCode}:${config.usdcIssuer}`;
    payTo = process.env.STELLAR_ECHO_PUBLIC_KEY!;
  } else if (config.type === 'evm') {
    asset = config.usdcAddress;
    payTo = process.env.ECHO_SMART_ACCOUNT_ADDRESS!;
  } else {
    // SVM (Solana)
    asset = config.usdcMintAddress;
    payTo = process.env.SOLANA_ECHO_PUBLIC_KEY!;
  }

  const maxAmountRequired = decimalToUsdcBigInt(maxCost).toString();

  const x402Response = {
    x402Version: 1,
    error: 'Payment Required',
    accepts: [
      {
        scheme: 'exact',
        network,
        maxAmountRequired,
        payTo,
        resource: `https://router.echo.merit.systems${req.path}`,
        description: 'Echo x402',
        mimeType: 'application/json',
        maxTimeoutSeconds: 1000,
        asset,
        nonce: `0x${randomBytes(32).toString('hex')}`,
        validAfter: 0,
        validBefore: Math.floor(Date.now() / 1000) + 3600,
      },
    ],
  };

  res.setHeader(
    'WWW-Authenticate',
    `X-402 realm="echo", link="${req.path}", network="${network}"`
  );
  res.status(402).json(x402Response);
}
```

#### Step 6: Add Stellar Client SDK Support

**File:** `packages/sdk/aix402/src/client/stellar.ts`

```typescript
import * as StellarSdk from '@stellar/stellar-sdk';

export interface StellarWalletClient {
  publicKey: string;
  signTransaction: (xdr: string) => Promise<string>;
}

export async function createStellarPaymentHeader(
  paymentRequirements: X402PaymentRequirements,
  walletClient: StellarWalletClient
): Promise<string> {
  const { network, maxAmountRequired, payTo, asset, nonce, validBefore } =
    paymentRequirements.accepts[0];

  // Parse Stellar asset
  const [assetCode, issuer] = asset.split(':');
  const stellarAsset = new StellarSdk.Asset(assetCode, issuer);

  // Get network passphrase
  const networkPassphrase =
    network === 'stellar'
      ? StellarSdk.Networks.PUBLIC
      : StellarSdk.Networks.TESTNET;

  // Build server
  const server = new StellarSdk.Horizon.Server(
    network === 'stellar'
      ? 'https://horizon.stellar.org'
      : 'https://horizon-testnet.stellar.org'
  );

  // Load sender account
  const senderAccount = await server.loadAccount(walletClient.publicKey);

  // Convert amount (USDC 6 decimals → Stellar 7 decimals)
  const amount = new Decimal(maxAmountRequired)
    .div(new Decimal(10).pow(6))
    .toString();

  // Build transaction
  const transaction = new StellarSdk.TransactionBuilder(senderAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: payTo,
        asset: stellarAsset,
        amount,
      })
    )
    .addMemo(StellarSdk.Memo.text(nonce.slice(0, 28))) // Max 28 chars
    .setTimeout(validBefore - Math.floor(Date.now() / 1000))
    .build();

  // Get XDR
  const xdr = transaction.toXDR();

  // Sign via wallet
  const signature = await walletClient.signTransaction(xdr);

  // Create payment payload
  const paymentPayload = {
    x402Version: 1,
    scheme: 'exact',
    network,
    payload: {
      type: 'stellar',
      transaction: xdr,
      signature,
      publicKey: walletClient.publicKey,
    },
  };

  // Encode to base64
  return Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
}

// React hook for Stellar payments
export function useChatWithStellarPayment(options: {
  api: string;
  walletClient: StellarWalletClient;
}) {
  // Similar to useChatWithPayment but uses createStellarPaymentHeader
  // ...implementation
}
```

#### Step 7: Environment Variables

**File:** `packages/app/server/.env`

```bash
# Existing vars...
NETWORK=stellar  # or stellar-testnet

# Stellar Configuration
STELLAR_ECHO_PUBLIC_KEY=GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STELLAR_SECRET_KEY=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Stellar Testnet (for testing)
# NETWORK=stellar-testnet
# STELLAR_ECHO_PUBLIC_KEY=GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
# STELLAR_SECRET_KEY=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### Step 8: Install Dependencies

```bash
cd packages/app/server
pnpm add @stellar/stellar-sdk

cd packages/sdk/aix402
pnpm add @stellar/stellar-sdk
```

#### Step 9: Update Database Schema (Optional)

If tracking Stellar-specific transaction data:

**File:** `packages/app/control/prisma/schema.prisma`

```prisma
model Transaction {
  id                    String   @id @default(cuid())
  // ... existing fields

  // Add network field
  network               String?  @default("base") // 'base', 'stellar', etc.
  blockchainTxHash      String?  // On-chain transaction hash

  // ... rest of schema
}
```

Run migration:
```bash
cd packages/app/control
pnpm prisma migrate dev --name add_stellar_support
```

#### Step 10: Testing

**Create test script:** `packages/tests/integration/tests/stellar-402.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import * as StellarSdk from '@stellar/stellar-sdk';

describe('Stellar X402 Flow', () => {
  it('should return 402 with Stellar payment requirements', async () => {
    const response = await fetch('http://localhost:3069/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    expect(response.status).toBe(402);

    const data = await response.json();
    expect(data.accepts[0].network).toBe('stellar');
    expect(data.accepts[0].asset).toContain('USDC:');
  });

  it('should accept Stellar payment and execute request', async () => {
    // 1. Get 402 challenge
    const challengeResponse = await fetch(/* ... */);
    const challenge = await challengeResponse.json();

    // 2. Create Stellar keypair (test)
    const keypair = StellarSdk.Keypair.random();

    // 3. Build payment transaction
    const server = new StellarSdk.Horizon.Server(
      'https://horizon-testnet.stellar.org'
    );
    const account = await server.loadAccount(keypair.publicKey());

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(/* payment op */)
      .build();

    transaction.sign(keypair);

    // 4. Create X-Payment header
    const paymentHeader = Buffer.from(
      JSON.stringify({
        x402Version: 1,
        scheme: 'exact',
        network: 'stellar-testnet',
        payload: {
          type: 'stellar',
          transaction: transaction.toXDR(),
          signature: transaction.signatures[0].signature().toString('hex'),
          publicKey: keypair.publicKey(),
        },
      })
    ).toString('base64');

    // 5. Retry with payment
    const response = await fetch('http://localhost:3069/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Payment': paymentHeader,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    expect(response.status).toBe(200);
  });
});
```

Run tests:
```bash
cd packages/tests/integration
pnpm test stellar-402
```

---

### Summary: Stellar Integration Checklist

- [ ] Add Stellar network enum and config
- [ ] Update X402 types for Stellar payload
- [ ] Create StellarPaymentService class
- [ ] Integrate into facilitator service
- [ ] Update X402 challenge generation
- [ ] Add Stellar client SDK support
- [ ] Set environment variables
- [ ] Install @stellar/stellar-sdk
- [ ] Update database schema (optional)
- [ ] Write integration tests
- [ ] Test on Stellar testnet
- [ ] Deploy to production with mainnet config

### Key Differences: Stellar vs EVM

| Aspect | EVM (Base) | Stellar |
|--------|-----------|---------|
| **Transaction Format** | ERC3009 authorization | XDR-encoded transaction |
| **Signature** | EIP-712 signature | Ed25519 signature |
| **Decimals** | USDC 6 decimals | Native 7 decimals |
| **Asset Format** | Contract address | AssetCode:Issuer |
| **Gas** | Wei (gwei) | Stroops (0.00001 XLM) |
| **Account Format** | 0x... (hex) | G... (base32) |
| **Memo Support** | No native memo | Yes (up to 28 chars) |
| **Confirmation Time** | ~2 seconds | ~5 seconds |

---

## Development Guide

### Local Setup

#### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 10.0.0
- PostgreSQL
- Stripe account (for payments)
- Coinbase Developer Platform account (for X402)

#### Steps

1. **Clone and install:**
```bash
git clone https://github.com/Merit-Systems/echo.git
cd echo
pnpm install
```

2. **Set up databases:**
```bash
# Create PostgreSQL databases
createdb echo_control
createdb echo_server
```

3. **Configure Control Plane:**

Create `packages/app/control/.env`:
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/echo_control
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

4. **Configure Echo Server:**

Create `packages/app/server/.env`:
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/echo_server
PORT=3069
NETWORK=base-sepolia

# AI Provider API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# Coinbase CDP (for X402)
CDP_API_KEY_ID=...
CDP_API_KEY_SECRET=...
USDC_ADDRESS=0x...
ECHO_SMART_ACCOUNT_ADDRESS=0x...

# Control Plane Connection
ECHO_CONTROL_BASE_URL=http://localhost:3000
ECHO_CONTROL_API_KEY=echo_...
```

5. **Run migrations:**
```bash
cd packages/app/control
pnpm prisma migrate dev

cd ../server
pnpm prisma migrate dev
```

6. **Build SDKs:**
```bash
pnpm prepare
```

7. **Start dev servers:**
```bash
pnpm dev
# Runs: Echo Control (3000) + Echo Server (3069)
```

### Project Scripts

```bash
# Development
pnpm dev                    # Start control + server
pnpm build                  # Build all packages
pnpm test:unit              # Run unit tests
pnpm test:integration       # Run integration tests
pnpm test:all               # Run all tests

# Linting
pnpm lint                   # Lint all packages
pnpm lint:fix               # Fix lint issues
pnpm type-check             # TypeScript type checking

# Formatting
pnpm format                 # Format with Prettier
pnpm format:check           # Check formatting

# Publishing
pnpm publish:sdks           # Publish SDKs to npm
pnpm publish:test           # Dry-run publish
```

### Adding a New AI Provider

1. **Create provider class:**

`packages/app/server/src/providers/NewProvider.ts`
```typescript
import { BaseProvider } from './BaseProvider';

export class NewProvider extends BaseProvider {
  async initialize(req: Request): Promise<void> {
    // Parse request, set up config
    this.model = req.body.model;
    this.apiKey = process.env.NEW_PROVIDER_API_KEY;
  }

  async estimateCost(): Promise<Decimal> {
    // Estimate max cost based on request
    const inputTokens = this.estimateInputTokens();
    const outputTokens = this.estimateOutputTokens();

    const pricing = await this.accountingService.getModelPricing(this.model);

    return new Decimal(inputTokens)
      .mul(pricing.inputPrice)
      .add(new Decimal(outputTokens).mul(pricing.outputPrice));
  }

  async execute(): Promise<Response> {
    // Call provider API
    const response = await fetch('https://api.newprovider.com/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.requestBody),
    });

    return response;
  }

  async calculateActualCost(response: Response): Promise<Decimal> {
    // Parse response for token usage
    const data = await response.json();
    const { input_tokens, output_tokens } = data.usage;

    const pricing = await this.accountingService.getModelPricing(this.model);

    return new Decimal(input_tokens)
      .mul(pricing.inputPrice)
      .add(new Decimal(output_tokens).mul(pricing.outputPrice));
  }
}
```

2. **Register in provider factory:**

`packages/app/server/src/providers/index.ts`
```typescript
import { NewProvider } from './NewProvider';

export function getProviderClass(providerName: string): typeof BaseProvider {
  switch (providerName) {
    case 'openai':
      return GPTProvider;
    case 'anthropic':
      return AnthropicGPTProvider;
    case 'newprovider':  // Add
      return NewProvider;
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}
```

3. **Add model pricing:**

`packages/app/control/prisma/seed.ts` or via admin dashboard
```typescript
await prisma.modelPricing.create({
  data: {
    model: 'newprovider-model-1',
    provider: 'newprovider',
    inputPrice: '0.000001',   // Per token
    outputPrice: '0.000002',  // Per token
    type: 'chat',
  },
});
```

4. **Update SDK:**

`packages/sdk/ts/src/providers/newprovider.ts`
```typescript
export function createNewProvider(baseURL?: string) {
  return createProvider({
    baseURL: baseURL || 'https://router.echo.merit.systems',
    name: 'newprovider',
    modelId: (modelId: string) => `newprovider/${modelId}`,
  });
}
```

5. **Export from SDK:**

`packages/sdk/ts/src/index.ts`
```typescript
export { createNewProvider as newprovider } from './providers/newprovider';
```

---

## Troubleshooting

### Common Issues

#### 1. "Payment Required" Error Loop

**Symptoms:** Client keeps getting 402 responses even with valid payment

**Causes:**
- Invalid signature
- Expired `validBefore` timestamp
- Insufficient payment amount
- Nonce reuse

**Solutions:**
```typescript
// Check payment payload
const decoded = JSON.parse(
  Buffer.from(xPaymentHeader, 'base64').toString()
);
console.log('Payment payload:', decoded);

// Verify timestamp
const now = Math.floor(Date.now() / 1000);
console.log('Current time:', now);
console.log('Valid before:', decoded.payload.authorization.validBefore);

// Check amount
console.log('Required:', paymentRequirements.maxAmountRequired);
console.log('Provided:', decoded.payload.authorization.value);
```

#### 2. Token Refresh Failures

**Symptoms:** User gets logged out unexpectedly

**Causes:**
- Expired refresh token
- Concurrent refresh requests
- Missing refresh token in storage

**Solutions:**
```typescript
// Enable debug logging
const client = new EchoClient({
  apiKey: '...',
  debug: true, // Logs all requests
});

// Check token expiration
const token = await getAccessToken();
const decoded = jwt.decode(token);
console.log('Token expires at:', new Date(decoded.exp * 1000));

// Ensure refresh token is stored
const refreshToken = await getRefreshToken();
if (!refreshToken) {
  console.error('Refresh token missing - user must re-authenticate');
}
```

#### 3. Balance Not Updating

**Symptoms:** User balance doesn't reflect recent usage

**Causes:**
- Transaction not recorded in DB
- Frontend cache not invalidated
- WebSocket connection dropped

**Solutions:**
```typescript
// Check transaction records
const transactions = await prisma.transaction.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' },
  take: 10,
});
console.log('Recent transactions:', transactions);

// Force balance refresh
const { balance } = useEchoBalance({ refetchInterval: 5000 });

// Check DB directly
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { balance: true },
});
console.log('DB balance:', user.balance);
```

#### 4. Cost Estimation Errors

**Symptoms:** Estimated cost wildly different from actual cost

**Causes:**
- Incorrect token counting
- Model pricing not updated
- Request body size miscalculation

**Solutions:**
```typescript
// Debug cost calculation
const inputTokens = estimateInputTokens(requestBody);
console.log('Estimated input tokens:', inputTokens);

const pricing = await getModelPricing(model);
console.log('Model pricing:', pricing);

const maxCost = new Decimal(inputTokens)
  .mul(pricing.inputPrice)
  .add(new Decimal(maxOutputTokens).mul(pricing.outputPrice));
console.log('Max cost:', maxCost.toString());

// Compare with actual
const actualCost = calculateActualCost(response);
console.log('Actual cost:', actualCost.toString());
console.log('Difference:', maxCost.sub(actualCost).toString());
```

#### 5. X402 Facilitator Errors

**Symptoms:** "Settlement failed" errors

**Causes:**
- Facilitator service down
- Invalid CDP credentials
- Insufficient smart account balance
- Blockchain network congestion

**Solutions:**
```bash
# Check facilitator health
curl https://facilitator.service.merit.systems/health

# Verify CDP credentials
echo $CDP_API_KEY_ID
echo $CDP_API_KEY_SECRET

# Check smart account balance
curl -X POST https://api.cdp.coinbase.com/v1/accounts/$ACCOUNT_ID/balance \
  -H "Authorization: Bearer $CDP_JWT"

# Monitor blockchain
# Base: https://basescan.org/address/$ECHO_SMART_ACCOUNT_ADDRESS
```

#### 6. Streaming Response Issues

**Symptoms:** Streaming responses cut off or hang

**Causes:**
- Proxy timeout
- SSE connection dropped
- Token counting errors in stream

**Solutions:**
```typescript
// Increase timeout
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000);
  next();
});

// Add stream error handling
const stream = await handleStreamService.execute();

stream.on('error', (error) => {
  console.error('Stream error:', error);
  res.end();
});

stream.on('end', () => {
  console.log('Stream completed successfully');
});
```

### Debugging Tips

**Enable verbose logging:**
```bash
# Echo Server
DEBUG=echo:* pnpm dev

# Prisma queries
DEBUG=prisma:* pnpm dev
```

**Check OpenTelemetry traces:**
```typescript
// Add custom spans
import { trace } from '@opentelemetry/api';

const span = trace.getTracer('echo').startSpan('custom-operation');
try {
  // Your code
} finally {
  span.end();
}
```

**Inspect database:**
```bash
cd packages/app/control
pnpm prisma studio
# Opens GUI at http://localhost:5555
```

---

## Resources

### Documentation
- [Echo Docs](https://echo.merit.systems/docs)
- [Live Demo](https://echo-next-image.vercel.app/)
- [Announcement Blog](https://www.merit.systems/blog/echo)

### Community
- [Discord](https://discord.gg/merit)
- [GitHub Issues](https://github.com/Merit-Systems/echo/issues)
- [Twitter](https://twitter.com/merit_systems)

### External Dependencies
- [x402 Protocol](https://www.npmjs.com/package/x402)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Coinbase CDP](https://docs.cdp.coinbase.com/)
- [Stellar SDK](https://stellar.github.io/js-stellar-sdk/)

---

## License

Apache 2.0 - See [LICENSE](LICENSE)

---

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

**Key areas for contribution:**
- Additional blockchain network support (Solana, Stellar, etc.)
- New AI provider integrations
- SDK improvements (Vue, Svelte, Angular)
- Documentation improvements
- Bug fixes and testing

---

*Last updated: 2025-10-24*
