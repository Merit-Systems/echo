#!/bin/bash

# Make User Admin Script
# Wrapper for make-user-admin.ts that promotes a user to admin status

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo "🔐 Make User Admin"
echo ""

npx tsx scripts/make-user-admin.ts "$@"

