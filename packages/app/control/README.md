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

1. **Authentication**
2. **API Key Management** - Create and manage API keys for users
3. **Stripe Integration** - Payment links and webhook handling (mocked)
4. **Balance Operations** - Increment/decrement user balances
5. **Usage Analytics** - Track LLM transactions and costs

### Database Schema (PostgreSQL + Prisma)

- **Users** - User accounts with Auth.js integration support
- **Echo Apps** - Individual Echo applications
- **API Keys** - API keys associated with users and apps
- **Payments** - Payment records with Stripe integration
- **LLM Transactions** - Detailed transaction logs with token usage and costs

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Auth.js
- **Payments**: Stripe (mocked)
- **TypeScript**: Full type safety

## Quick Setup

From the root directory:

```bash
./setup.sh
pnpm dev
```

## Manual Setup

1. Install dependencies: `pnpm install`
2. Start Docker Desktop
3. Create `.env` file with required variables (see `src/env.ts`)
4. Run `pnpm dev`

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5469/echo_control"

# Stripe (Mocked)
STRIPE_SECRET_KEY="mock_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="mock_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="mock_webhook_secret"

# Application
NEXTAUTH_URL="http://localhost:3000"
API_KEY_PREFIX="echo_"
```

## Development

### Running Tests

```bash
pnpm test
```

### Scripts

To run scripts, you should do:

```bash
SKIP_ENV_VALIDATION=1 ./scripts/<name-of-script.sh>
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

Visit [http://localhost:3000](http://localhost:3000)
