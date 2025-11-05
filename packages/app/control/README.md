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

## Setup Instructions

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (PostgreSQL runs in Docker)
- pnpm 10+

### Quick Start (From Root)

The easiest way is to use the root setup script:

```bash
bash scripts/setup-local.sh
```

Then:
```bash
pnpm dev
```

### Manual Setup (From echo-control directory)

1. **Navigate to this directory**:
   ```bash
   cd packages/app/control
   ```

2. **Create .env file**:
   ```bash
   cp .env.example .env
   pnpm local-setup
   ```

   This script will:
   - Generate an AUTH_SECRET if not present
   - Set database connection string
   - Start PostgreSQL in Docker
   - Run Prisma migrations

3. **Start the development server**:
   ```bash
   pnpm dev
   ```

4. **Open the application**:
   Visit [http://localhost:3000](http://localhost:3000)

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
