#!/bin/bash

set -e

echo "Setting up Echo Control local development..."
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
fi

# Generate AUTH_SECRET if not present
if ! grep -q "^AUTH_SECRET=" .env || grep -q "^AUTH_SECRET=$" .env; then
    echo "Generating AUTH_SECRET..."
    AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    # Use grep and mv to safely update AUTH_SECRET, avoiding sed issues with special chars and improving portability.
    grep -v "^AUTH_SECRET=" .env > .env.tmp
    echo "AUTH_SECRET=$AUTH_SECRET" >> .env.tmp
    mv .env.tmp .env
    echo "OK: AUTH_SECRET generated"
fi

# Ensure DATABASE_URL is set for local dev
if ! grep -q "^DATABASE_URL=" .env || grep -q "^DATABASE_URL=$" .env; then
    echo "Setting DATABASE_URL..."
    DB_URL="postgresql://echo_user:echo_password@localhost:5469/echo_control_v2?schema=public"
    grep -v "^DATABASE_URL=" .env > .env.tmp
    echo "DATABASE_URL=\"$DB_URL\"" >> .env.tmp
    mv .env.tmp .env
    echo "OK: DATABASE_URL configured"
fi

# Ensure ECHO_CONTROL_APP_BASE_URL is set
if ! grep -q "^ECHO_CONTROL_APP_BASE_URL=" .env || grep -q "^ECHO_CONTROL_APP_BASE_URL=$" .env; then
    echo "Setting ECHO_CONTROL_APP_BASE_URL..."
    grep -v "^ECHO_CONTROL_APP_BASE_URL=" .env > .env.tmp
    echo "ECHO_CONTROL_APP_BASE_URL=http://localhost:3000" >> .env.tmp
    mv .env.tmp .env
fi

echo ""
echo "Starting PostgreSQL Docker container..."

# Start PostgreSQL container
docker compose -f docker-local-db.yml up -d postgres

# Wait for PostgreSQL to be ready with health check
echo "Waiting for PostgreSQL to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker compose -f docker-local-db.yml exec -T postgres pg_isready -U echo_user -d echo_control_v2 &> /dev/null; then
        echo "OK: PostgreSQL is ready"
        break
    fi
    attempt=$((attempt + 1))
    if [ $((attempt % 5)) -eq 0 ]; then
        echo "  Waiting... ($attempt/$max_attempts)"
    fi
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo "ERROR: PostgreSQL failed to start after 30 seconds"
    echo "   Check Docker logs: docker compose -f docker-local-db.yml logs postgres"
    exit 1
fi

echo ""
echo "Running Prisma migrations..."
pnpm prisma generate
pnpm prisma db push --skip-generate

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "   1. Return to the root directory: cd ../.."
echo "   2. Start development: pnpm dev"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
echo "Useful commands:"
echo "   pnpm prisma studio          # View the database GUI"
echo "   docker logs <container>      # View Docker logs"
