#!/bin/bash

# Script to safely apply Prisma migrations to production database
# This script NEVER drops or resets the database - it only applies new migrations

set -e  # Exit on any error

# Navigate to the echo-control directory to ensure we're in the right context
cd "$(dirname "$0")/.."

# Load environment variables from .env.production
if [ -f ".env.production" ]; then
    echo "📁 Loading environment variables from .env.production..."
    export $(cat .env.production | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "❌ ERROR: .env.production file not found in echo-control directory"
    echo "Please create a .env.production file with your production database configuration"
    exit 1
fi

echo ""
echo "🏭 PRODUCTION DATABASE MIGRATION"
echo "This script will safely apply pending migrations to the production database."
echo "NO data will be dropped or lost - only new migrations will be applied."
echo ""

# Ensure we have a DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set in .env.production"
    echo "Please set DATABASE_URL in your .env.production file"
    exit 1
fi

echo "📍 Using production database: $(echo $DATABASE_URL | sed 's/:[^:]*@/:***@/')"
echo ""

# Safety check - confirm this looks like a production database
echo "🔍 Safety checks..."
if [[ "$DATABASE_URL" == *"localhost"* ]] || [[ "$DATABASE_URL" == *"127.0.0.1"* ]]; then
    echo "⚠️  WARNING: DATABASE_URL appears to be pointing to localhost"
    echo "Are you sure this is your production database?"
fi

# Ask for confirmation
echo ""
read -p "Are you sure you want to apply migrations to PRODUCTION? Type 'APPLY-PRODUCTION-MIGRATIONS' to continue: " -r
if [[ ! $REPLY =~ ^APPLY-PRODUCTION-MIGRATIONS$ ]]; then
    echo "❌ Operation cancelled - confirmation phrase not matched"
    exit 1
fi

echo ""
echo "🚀 Applying migrations to production database..."
echo ""

# Check migration status first
echo "📋 Checking current migration status..."
pnpm exec prisma migrate status

echo ""
echo "🔄 Applying pending migrations..."

# Apply migrations (this is safe - it only applies new migrations)
pnpm exec prisma migrate deploy

# Generate Prisma client to ensure it's up to date
echo ""
echo "🔧 Generating Prisma client..."
pnpm exec prisma generate

echo ""
echo "✅ Production database migration completed successfully!"
echo "📊 All pending migrations have been applied to the production database."
echo ""

# Show final migration status
echo "📋 Final migration status:"
pnpm exec prisma migrate status

echo ""
echo "🎉 Production database is now up to date!"
echo "You can verify the changes by:"
echo "  - Checking your application logs"
echo "  - Running health checks on your production application"
echo "  - Using 'pnpm exec prisma studio' (with production credentials) to inspect the database"
