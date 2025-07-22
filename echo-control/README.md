# Echo Control Plane

A comprehensive Next.js application for managing Echo applications, API keys, and LLM usage analytics with integrated Stripe payment processing.

## Features

### Frontend (Next.js)

1. **Echo Apps Dashboard** - View all your Echo applications with usage statistics
2. **App Details Page** - Detailed view of individual Echo apps with:
   - Usage analytics by model
   - API key management
   - Recent transaction history
   - Direct Stripe payment integration
3. **Balance Management** - Real-time balance tracking with credit/debit functionality
4. **Payment Integration** - Mock Stripe payment links for adding credits

### Backend API (Next.js API Routes)

1. **Authentication** - Ready for Clerk integration (currently mocked)
2. **API Key Management** - Create and manage API keys for users
3. **Stripe Integration** - Payment links and webhook handling (mocked)
4. **Balance Operations** - Increment/decrement user balances
5. **Usage Analytics** - Track LLM transactions and costs

### Database Schema (PostgreSQL + Prisma)

- **Users** - User accounts with Clerk integration support
- **Echo Apps** - Individual Echo applications
- **API Keys** - API keys associated with users and apps
- **Payments** - Payment records with Stripe integration
- **LLM Transactions** - Detailed transaction logs with token usage and costs

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Clerk (mocked)
- **Payments**: Stripe (mocked)
- **TypeScript**: Full type safety

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm

### Installation

1. **Clone and navigate to the project**:

   ```bash
   cd echo-control
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Set up the database**:

   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Update DATABASE_URL in .env with your PostgreSQL connection string
   # Example: DATABASE_URL="postgresql://username:password@localhost:5469/echo_control"
   ```

4. **Run database migrations**:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**:

   ```bash
   pnpm run dev
   ```

6. **Open the application**:
   Visit [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5469/echo_control"

# Authentication (Mocked)
CLERK_SECRET_KEY="mock_clerk_secret_key"
CLERK_PUBLISHABLE_KEY="mock_clerk_publishable_key"

# Stripe (Mocked)
STRIPE_SECRET_KEY="mock_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="mock_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="mock_webhook_secret"

# Application
NEXTAUTH_URL="http://localhost:3000"
API_KEY_PREFIX="echo_"
```

## API Endpoints

### Echo Apps

- `GET /api/echo-apps?userId={id}` - List user's Echo apps
- `POST /api/echo-apps` - Create new Echo app
- `GET /api/echo-apps/{id}` - Get app details
- `PUT /api/echo-apps/{id}` - Update app

### API Keys

- `GET /api/api-keys?userId={id}` - List user's API keys
- `POST /api/api-keys` - Store API key from Clerk

### Balance Management

- `GET /api/balance?userId={id}` - Get user balance
- `POST /api/balance` - Increment/decrement balance

### Stripe Integration

- `POST /api/stripe/payment-link` - Generate payment link
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## Database Schema

### Key Models

**User**

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  clerkId   String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**EchoApp**

```prisma
model EchoApp {
  id          String   @id @default(cuid())
  name        String
  description String?
  userId      String
}
```

**Payment**

```prisma
model Payment {
  id              String   @id @default(cuid())
  stripePaymentId String?  @unique
  amount          Int      // Amount in cents
  currency        String   @default("usd")
  status          String   // pending, completed, failed, refunded
  userId          String
}
```

**LlmTransaction**

```prisma
model LlmTransaction {
  id           String   @id @default(cuid())
  model        String   // e.g., "gpt-4", "claude-3-sonnet"
  inputTokens  Int
  outputTokens Int
  totalTokens  Int
  cost         Decimal  @db.Decimal(10, 6)
  status       String   // success, error, timeout
  userId       String
  echoAppId    String?
}
```

## Features Overview

### Dashboard

- View all Echo applications
- Quick balance overview
- Create new applications
- Generate payment links

### App Details

- Comprehensive usage analytics
- API key management
- Transaction history
- Model-specific usage breakdown
- Direct Stripe integration

### Balance Management

- Real-time balance calculation
- Payment history
- Admin controls for balance adjustments
- Stripe payment integration

### Mock Integrations

- **Clerk Authentication**: Ready for real Clerk integration
- **Stripe Payments**: Mock payment links and webhooks
- **API Key Generation**: Prepared for Clerk-managed API keys

## Development

### Running Tests

```bash
pnpm test
```

### Database Operations

```bash
# Reset database
npx prisma db push --force-reset

# View database
npx prisma studio

# Generate client after schema changes
npx prisma generate
```

### Building for Production

```bash
pnpm run build
pnpm start
```

## Next Steps

1. **Integrate Clerk Authentication**: Replace mock authentication with real Clerk integration
2. **Connect Stripe**: Implement real Stripe payment processing
3. **Add API Key Generation**: Connect with Clerk for API key management
4. **Implement Rate Limiting**: Add rate limiting for API endpoints
5. **Add Monitoring**: Implement logging and error tracking
6. **Deploy**: Set up production deployment with proper environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
