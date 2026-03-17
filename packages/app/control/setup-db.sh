#!/bin/bash

echo "🚀 Setting up Echo Control PostgreSQL Database..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Database - Docker PostgreSQL
DATABASE_URL="postgresql://echo_user:echo_password@localhost:5469/echo_control_v2?schema=public"

# Stripe (Mocked for now)
STRIPE_SECRET_KEY="mock_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="mock_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="mock_webhook_secret"

# Application
ECHO_CONTROL_APP_BASE_URL="http://localhost:3000"
API_KEY_PREFIX="echo_"
EOF
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

# Start PostgreSQL container
echo "🐳 Starting PostgreSQL container..."
docker compose -f docker-local-db.yml up -d postgres

# Wait for PostgreSQL to be ready
# No need for manual health check since docker-local-db.yml already has healthcheck configured

echo "✅ PostgreSQL is ready!"

# Check if .env file exists and show DATABASE_URL
if [ -f .env ]; then
    echo "🔍 Checking DATABASE_URL..."
    grep "DATABASE_URL" .env
fi

# Run Prisma migrations
echo "🔄 Running Prisma migrations..."
pnpm exec prisma generate
pnpm exec prisma db push

echo "🎉 Database setup complete!"
echo ""
echo "📊 You can now run:"
echo "  pnpm dev                    # Start the application"
echo "  pnpm exec prisma studio    # View the database"
echo "  docker logs echo-control-postgres-v2  # View database logs"
echo "  docker stop echo-control-postgres-v2  # Stop the database"
