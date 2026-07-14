#!/bin/bash

set -e

echo "Setting up Echo for local development..."

echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi
echo "Node.js $(node -v)"

if ! command -v pnpm &> /dev/null; then
    echo "pnpm is not installed. Installing pnpm..."
    npm install -g pnpm@10.11.0
fi
echo "pnpm $(pnpm -v)"

if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "Docker daemon is not running. Please start Docker."
    exit 1
fi
echo "Docker is running"

echo ""
echo "Installing dependencies..."
pnpm install

echo ""
echo "Setting up Echo Control..."
cd packages/app/control

if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file from example"
fi

if ! grep -q "^AUTH_SECRET=." .env; then
    cd ../../..
    pnpm local-setup
    cd packages/app/control
fi

echo ""
echo "Starting PostgreSQL database..."
docker compose -f docker-local-db.yml up -d

echo "Waiting for database to be ready..."
RETRIES=30
until docker compose -f docker-local-db.yml exec -T postgres pg_isready -U echo_user -d echo_control_v2 &> /dev/null || [ $RETRIES -eq 0 ]; do
    echo -n "."
    sleep 1
    RETRIES=$((RETRIES-1))
done
echo ""

if [ $RETRIES -eq 0 ]; then
    echo "Database failed to start. Check Docker logs:"
    echo "   docker compose -f docker-local-db.yml logs"
    exit 1
fi

echo "PostgreSQL is ready"

echo ""
echo "Setting up database schema..."
npx prisma generate
npx prisma db push

echo ""
echo "Setting up Echo Server..."
cd ../server

if [ ! -f .env ]; then
    cat > .env << 'EOF'
DATABASE_URL="postgresql://echo_user:echo_password@localhost:5469/echo_control_v2?schema=public"

PORT=3069
NODE_ENV=development

OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GEMINI_API_KEY=""
EOF
    echo "Created Echo Server .env file"
fi

echo ""
echo "Setup complete!"
echo ""
echo "To start Echo:"
echo "  cd ../../.."
echo "  pnpm dev"
echo ""
echo "Then visit:"
echo "  - Echo Dashboard: http://localhost:3000"
echo "  - Echo Server: http://localhost:3069"
echo ""
echo "For local development, use the 'Local User' auth provider on the login page."
