#!/bin/bash

echo "Setting up Echo for local development..."

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
    if [ $? -ne 0 ]; then
        echo "Failed to install pnpm. Please install manually: npm install -g pnpm"
        exit 1
    fi
fi

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Please install Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "Docker not running. Please start Docker Desktop."
    exit 1
fi

echo "Installing dependencies..."
pnpm install
if [ $? -ne 0 ]; then
    echo "Failed to install dependencies."
    exit 1
fi

echo "Setting up environment files..."

# Control .env
if [ ! -f "packages/app/control/.env" ]; then
    echo "Creating control .env file..."
    touch packages/app/control/.env
    
    # Generate AUTH_SECRET and add required variables
    AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    cat > packages/app/control/.env << EOF
# ----------
# Application
# ----------

ECHO_CONTROL_APP_BASE_URL="http://localhost:3000"
API_KEY_PREFIX="echo_"

# ----------
# Database
# ----------

DATABASE_URL="postgresql://echo_user:echo_password@localhost:5469/echo_control_v2?schema=public"

# ----------
# AUTH
# ----------

AUTH_SECRET=$AUTH_SECRET
AUTH_GOOGLE_ID=placeholder_google_id
AUTH_GOOGLE_SECRET=placeholder_google_secret
AUTH_GITHUB_ID=placeholder_github_id
AUTH_GITHUB_SECRET=placeholder_github_secret
AUTH_RESEND_KEY=placeholder_resend_key
AUTH_RESEND_FROM_EMAIL=noreply@example.com

# ----------
# STRIPE
# ----------

STRIPE_SECRET_KEY=placeholder_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=placeholder_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=placeholder_stripe_webhook_secret
WEBHOOK_URL=http://localhost:3000/api/webhooks/stripe

# ----------
# OAuth Tokens
# ----------

OAUTH_JWT_SECRET=$AUTH_SECRET
OAUTH_REFRESH_TOKEN_EXPIRY_SECONDS=2592000
OAUTH_ACCESS_TOKEN_EXPIRY_SECONDS=15

# ----------
# Telemetry
# ----------

OTEL_EXPORTER_OTLP_ENDPOINT=
SIGNOZ_INGESTION_KEY=
SIGNOZ_SERVICE_NAME=

# ----------
# Blob Storage
# ----------

BLOB_READ_WRITE_TOKEN=
EOF
fi

# Server .env
if [ ! -f "packages/app/server/.env" ]; then
    echo "Creating server .env file..."
    touch packages/app/server/.env
    
    AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    cat > packages/app/server/.env << EOF
PORT=3070
DATABASE_URL="postgresql://echo_user:echo_password@localhost:5469/echo_control_v2?schema=public"
ECHO_CONTROL_BASE_URL=http://localhost:3000
ECHO_API_KEY=placeholder_api_key
OAUTH_JWT_SECRET=$AUTH_SECRET
EOF
fi

echo ""
echo "Setup complete. Run 'pnpm dev' to start development servers."
echo ""
echo "Services will be available at:"
echo "- Echo Control: http://localhost:3000"
echo "- Echo Server: http://localhost:3070"
echo "- PostgreSQL: localhost:5469"
