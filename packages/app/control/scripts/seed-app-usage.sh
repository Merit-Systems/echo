#!/bin/bash

# Seed App Usage Script
# A wrapper around the TypeScript seeding script for easier CLI usage

# Change to the echo-control directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Check if tsx is available
if ! command -v pnpx &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ Error: pnpx or npx is required to run this script"
    exit 1
fi

# Prefer pnpx if available, fallback to npx
if command -v pnpx &> /dev/null; then
    RUNNER="pnpx"
else
    RUNNER="npx"
fi

# Show help if requested
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Seed App Usage Script"
    echo ""
    echo "Usage: $0 <app_id> [options]"
    echo ""
    echo "Arguments:"
    echo "  app_id                    Specific app ID to seed usage for (required)"
    echo ""
    echo "Options:"
    echo "  --days <number>           Number of days back to generate data (default: 30)"
    echo "  --transactions-per-day <number>  Average transactions per day (default: 50)"
    echo "  --users <number>          Number of users to generate transactions for (default: 5)"
    echo "  --quiet                   Suppress verbose output"
    echo "  --help, -h                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 12345-app-id                                # Seed specific app"
    echo "  $0 12345-app-id --days 7 --transactions-per-day 100  # Custom options"
    echo "  $0 12345-app-id --days 14 --users 10          # 14 days, 10 users"
    echo ""
    exit 0
fi

# Check if app_id is provided
if [[ -z "$1" ]]; then
    echo "❌ Error: App ID is required"
    echo "Usage: $0 <app_id> [options]"
    echo "Run '$0 --help' for more information"
    exit 1
fi

# Run the TypeScript script with all arguments passed through
echo "🚀 Running seed-app-usage script..."
$RUNNER tsx scripts/seed-app-usage.ts "$@"
