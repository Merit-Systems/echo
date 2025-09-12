#!/bin/bash

# Seed Users Script
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
    echo "Seed Users Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --count <number>           Number of users to create (default: 10)"
    echo "  --echo-app-id <uuid>       Echo App ID to associate users with (optional)"
    echo "  --role <string>            Role for app membership if echo-app-id provided (default: 'user')"
    echo "  --quiet                    Suppress verbose output"
    echo "  --help, -h                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                              # Create 10 users"
    echo "  $0 --count 50                                   # Create 50 users"
    echo "  $0 --echo-app-id 12345-app-id                   # Create 10 users for specific app"
    echo "  $0 --count 25 --echo-app-id 12345-app-id --role owner  # Create 25 owner users"
    echo ""
    exit 0
fi

# Run the TypeScript script with all arguments passed through
echo "🚀 Running seed-users script..."
$RUNNER tsx scripts/seed-users.ts "$@"
