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
    echo "Usage: $0 [app_id] [options]"
    echo ""
    echo "Arguments:"
    echo "  app_id                    Specific app ID to seed (optional, seeds all apps if not provided)"
    echo ""
    echo "Options:"
    echo "  --days <number>           Number of days back to generate data (default: 30)"
    echo "  --transactions-per-day <number>  Average transactions per day (default: 50)"
    echo "  --quiet                   Suppress verbose output"
    echo "  --help, -h                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                              # Seed all apps"
    echo "  $0 12345-app-id                                # Seed specific app"
    echo "  $0 --days 7 --transactions-per-day 100        # Custom options"
    echo "  $0 12345-app-id --days 14                      # Specific app, 14 days"
    echo ""
    exit 0
fi

# Run the TypeScript script with all arguments passed through
echo "🚀 Running seed-app usage script..."
$RUNNER tsx scripts/seed-app-usage.ts "$@" 