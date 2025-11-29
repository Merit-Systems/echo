# Local Development Guide for Echo

This guide will help you get Echo running locally on your machine.

## Quick Start (Automated Setup)

```bash
# Clone the repository
git clone https://github.com/Merit-Systems/echo.git
cd echo

# Run the automated setup script
./scripts/setup-local.sh

# Start the development servers
pnpm dev
```

That's it! Visit http://localhost:3000 to access Echo.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Install Node.js](https://nodejs.org/)
- **pnpm** (v10.0.0 or higher) - Install with: `npm install -g pnpm@10.11.0`
- **Docker** and **Docker Compose** - [Install Docker](https://docs.docker.com/get-docker/)
- **Git** - [Install Git](https://git-scm.com/downloads)

## Manual Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Merit-Systems/echo.git
cd echo

# Install all dependencies
pnpm install
```

### 2. Set Up Environment Variables

#### For Echo Control (Dashboard)

```bash
# Navigate to the control package
cd packages/app/control

# Create .env file from the example
cp .env.example .env

# Generate AUTH_SECRET automatically
cd ../../../
pnpm local-setup
cd packages/app/control
```

#### For Echo Server (Proxy)

```bash
# Navigate to the server package
cd ../server

# Create .env file
cat > .env << 'EOF'
# Database (uses same PostgreSQL as control)
DATABASE_URL="postgresql://echo_user:echo_password@localhost:5469/echo_control_v2?schema=public"

# Server Configuration
PORT=3069
NODE_ENV=development

# API Keys (optional for local development)
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GEMINI_API_KEY=""
EOF

cd ../../..
```

### 3. Start the Database

Make sure Docker is running, then:

```bash
# From the echo-control directory
cd packages/app/control

# Start PostgreSQL container
docker compose -f docker-local-db.yml up -d

# Wait for database to be ready (about 5-10 seconds)
sleep 10

# Run database migrations
npx prisma generate
npx prisma db push

cd ../../..
```

### 4. Start Development Servers

From the root directory:

```bash
# This will start both Echo Control (port 3000) and Echo Server (port 3069)
pnpm dev
```

## Accessing the Applications

Once everything is running:

- **Echo Control Dashboard**: http://localhost:3000
- **Echo Server API**: http://localhost:3069

### Local Authentication

In development mode, you can use the "Local User" credential provider:
1. Go to http://localhost:3000/login
2. Click "Local User" 
3. You'll be logged in as a test user

## Common Issues and Solutions

### Issue: Docker daemon not running

**Error**: `Cannot connect to the Docker daemon at unix:///var/run/docker.sock`

**Solution**: 
- On macOS: Start Docker Desktop
- On Linux: `sudo systemctl start docker`
- On Windows: Start Docker Desktop

### Issue: Port already in use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using the port
lsof -i :3000
# Kill the process
kill -9 <PID>
```

### Issue: Database connection failed

**Error**: `Can't reach database server at localhost:5469`

**Solution**:
```bash
# Check if PostgreSQL container is running
docker ps | grep echo-control-postgres

# If not running, start it:
cd packages/app/control
docker compose -f docker-local-db.yml up -d
```

### Issue: Missing environment variables

**Error**: `Missing required environment variables`

**Solution**: Make sure you've completed step 2 and created both .env files with the required variables.

## Useful Commands

```bash
# View database contents
cd packages/app/control
npx prisma studio

# Reset database
npx prisma migrate reset

# View Docker logs
docker logs echo-control-postgres-v2

# Stop PostgreSQL container
docker compose -f docker-local-db.yml down

# Stop and remove all data
docker compose -f docker-local-db.yml down -v
```

## Next Steps

1. Create an Echo app in the dashboard
2. Generate an API key
3. Try one of our templates:
   ```bash
   pnpx echo-start@latest my-echo-app
   ```

## Need Help?

- Join our [Discord](https://discord.gg/merit)
- Check the [documentation](https://echo.merit.systems/docs)
- Open an [issue](https://github.com/Merit-Systems/echo/issues)
