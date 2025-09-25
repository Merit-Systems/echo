#!/bin/bash

echo "🚀 Setting up NextJS API Template PostgreSQL Database..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Database - Docker PostgreSQL
DATABASE_URL="postgresql://api_user:api_password@localhost:5433/nextjs_api_template?schema=public"

# Echo API Configuration
ECHO_API_KEY="your-echo-api-key-here"
ECHO_SERVER_URL="https://api.echo.dev"

# Application
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
API_KEY_PREFIX="nxt_"
EOF
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

# Start PostgreSQL container
echo "🐳 Starting PostgreSQL container..."
docker-compose -f docker-local-db.yml up -d postgres

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
npx prisma generate
npx prisma db push

echo "🎉 Database setup complete!"
echo ""
echo "📊 You can now run:"
echo "  npm run dev          # Start the application"
echo "  npx prisma studio    # View the database"
echo "  docker logs nextjs-api-template-postgres  # View database logs"
echo "  docker stop nextjs-api-template-postgres  # Stop the database"
