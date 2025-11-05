#!/bin/bash

set -e

echo "Welcome to Echo! Let's set up your local development environment."
echo ""

# Check prerequisites
echo "Checking prerequisites..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "ERROR: Node.js version 18+ is required. You have version $(node -v)"
    exit 1
fi
echo "OK: Node.js $(node -v) detected"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "ERROR: pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi
echo "OK: pnpm $(pnpm -v) detected"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker from https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo "OK: Docker detected"

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo "ERROR: Docker Compose is not installed. Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi
echo "OK: Docker Compose detected"

echo ""
echo "Installing dependencies..."
pnpm install

echo ""
echo "Setting up databases..."

# Setup control package database
echo "Setting up Echo Control database..."
cd packages/app/control

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file for echo-control..."
    cp .env.example .env

    # Generate AUTH_SECRET
    AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    grep -v "^AUTH_SECRET=" .env > .env.tmp
    echo "AUTH_SECRET=$AUTH_SECRET" >> .env.tmp
    mv .env.tmp .env

    # Update DATABASE_URL if needed
    echo "OK: Created .env file with AUTH_SECRET"
else
    echo "INFO: .env file already exists, skipping creation"
fi

# Start PostgreSQL container
echo "Starting PostgreSQL container..."
docker compose -f docker-local-db.yml up -d postgres

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker compose -f docker-local-db.yml exec -T postgres pg_isready -U echo_user -d echo_control_v2 &> /dev/null; then
        echo "OK: PostgreSQL is ready"
        break
    fi
    attempt=$((attempt + 1))
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo "ERROR: PostgreSQL failed to start. Please check Docker logs:"
    echo "   docker compose -f docker-local-db.yml logs postgres"
    exit 1
fi

# Run Prisma migrations
echo "Setting up database schema..."
pnpm prisma generate
pnpm prisma db push --skip-generate

cd ../..

echo ""
echo "Setup complete!"
echo ""
echo "You're ready to go! Start development with:"
echo ""
echo "   pnpm dev"
echo ""
echo "Then open http://localhost:3000 in your browser."
echo ""
echo "Useful commands:"
echo "   pnpm dev              - Start both control and server"
echo "   pnpm -C packages/app/control prisma studio  - View database GUI"
echo "   docker compose -f packages/app/control/docker-local-db.yml logs postgres  - View database logs"
echo ""
