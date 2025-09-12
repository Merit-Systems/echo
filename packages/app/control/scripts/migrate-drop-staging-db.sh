#!/bin/bash

# Script to drop the staging database and apply the current Prisma schema
# This script is for staging environment only - DO NOT use on production

set -e  # Exit on any error

# Navigate to the echo-control directory to ensure we're in the right context
cd "$(dirname "$0")/.."

# Load environment variables from .env.staging
if [ -f ".env.staging" ]; then
    echo "📁 Loading environment variables from .env.staging..."
    export $(cat .env.staging | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "❌ ERROR: .env.staging file not found in echo-control directory"
    echo "Please create a .env.staging file with your staging database configuration"
    exit 1
fi

echo ""
echo "🚨 WARNING: This script will DROP the staging database and recreate it from the current schema!"
echo "This will DELETE ALL DATA in the staging database."
echo ""

# Check if we're not accidentally running on production
if [[ "$DATABASE_URL" == *"prod"* ]] || [[ "$DATABASE_URL" == *"production"* ]]; then
    echo "❌ ERROR: This script cannot be run on production database!"
    echo "DATABASE_URL appears to contain 'prod' or 'production'"
    exit 1
fi

# Ensure we have a DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set in .env.staging"
    echo "Please set DATABASE_URL in your .env.staging file"
    exit 1
fi

echo "📍 Using database: $DATABASE_URL"
echo ""

# Ask for confirmation
read -p "Are you sure you want to proceed? This will DELETE ALL DATA. Type 'yes' to continue: " -r
if [[ ! $REPLY =~ ^yes$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo ""
echo "🔥 Dropping staging database and applying current schema..."
echo ""

# Reset the database (drops all data and schema)
echo "📥 Resetting database..."
pnpx prisma db push --force-reset --accept-data-loss

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpx prisma generate

echo ""
echo "✅ Database migration completed successfully!"
echo "📊 The staging database has been reset and the current schema has been applied."
echo ""
echo "You can now:"
echo "  - Run your application against the fresh staging database"
echo "  - Use 'pnpx prisma studio' to view the database"
echo "  - Seed the database with test data if needed"
