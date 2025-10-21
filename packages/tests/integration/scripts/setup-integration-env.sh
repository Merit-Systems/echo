#!/bin/bash
# integration/scripts/setup-integration-env.sh

set -e

echo "🚀 Setting up Echo integration test environment..."

# Change to integration directory
cd "$(dirname "$0")/.."

# Detect environment
if [ "$CI" = "true" ]; then
    echo "📦 Running in CI environment"
    ENV_FILE=".env.test"
    IS_CI=true
elif [ -f ".env.test.local" ]; then
    echo "🏠 Using local integration environment"
    ENV_FILE=".env.test.local"
    IS_CI=false
else
    echo "🔧 Using default integration environment"
    ENV_FILE=".env.test"
    IS_CI=false
fi

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    # Export variables from env file (skip comments and empty lines)
    set -a
    # Use a more reliable method to load environment variables
    while IFS= read -r line || [[ -n "$line" ]]; do
        # Skip comments and empty lines
        if [[ ! "$line" =~ ^[[:space:]]*# ]] && [[ -n "${line// }" ]]; then
            export "$line"
        fi
    done < "$ENV_FILE"
    set +a
    echo "✅ Loaded environment from $ENV_FILE"
else
    echo "❌ Environment file $ENV_FILE not found"
    exit 1
fi

# Validate required environment variables
required_vars=(
    "DATABASE_URL"
    "ECHO_CONTROL_URL"
    "ECHO_DATA_SERVER_URL"
    "JWT_SECRET"
    "INTEGRATION_TEST_JWT"
    "OAUTH_REFRESH_TOKEN_EXPIRY_SECONDS"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables: ${missing_vars[*]}"
    echo "Please set these variables in $ENV_FILE"
    exit 1
fi

echo "✅ All required environment variables are set"

# Start services based on environment
if [ "$IS_CI" != "true" ]; then
    echo "🐳 Starting Docker services for integration tests..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    
    # Clean up existing containers and volumes
    echo "🧹 Cleaning up existing containers and volumes..."
    docker-compose -f docker/docker-compose.yml down -v
    
    # Start services with rebuild
    echo "🏗️  Rebuilding and starting services..."
    docker-compose -f docker/docker-compose.yml build --no-cache
    docker-compose -f docker/docker-compose.yml up -d
    
    # Wait for services to be healthy
    echo "⏳ Waiting for services to be ready..."
    
    # macOS-compatible timeout implementation
    start_time=$(date +%s)
    timeout_duration=120
    
    while true; do
        current_time=$(date +%s)
        elapsed=$((current_time - start_time))
        
        if [ $elapsed -ge $timeout_duration ]; then
            echo "❌ Services failed to start within $timeout_duration seconds"
            break
        fi
        
        # Check if all services are healthy
        echo_control_healthy=$(curl -f "$ECHO_CONTROL_URL/api/health" >/dev/null 2>&1 && echo "true" || echo "false")
        echo_data_server_healthy=$(curl -f "$ECHO_DATA_SERVER_URL/health" >/dev/null 2>&1 && echo "true" || echo "false")
        
        if [ "$echo_control_healthy" = "true" ] && [ "$echo_data_server_healthy" = "true" ]; then
            echo "✅ All services are healthy"
            echo "  📊 Echo Control: $ECHO_CONTROL_URL ✅"
            echo "  🗃️  Echo Data Server: $ECHO_DATA_SERVER_URL ✅"
            
            # Seed the database
            echo "🌱 Seeding integration test database..."
            pnpm db:seed
            
            exit 0
        fi
        
        echo "⏳ Still waiting for services... (${elapsed}s elapsed)"
        echo "  📊 Echo Control status: $echo_control_healthy"
        echo "  🗃️  Echo Data Server status: $echo_data_server_healthy"
        sleep 5
    done
    
    {
        echo "❌ Services failed to start within 2 minutes"
        echo "📊 Service status:"
        docker-compose -f docker/docker-compose.yml ps
        echo "📋 Logs from echo-control-test:"
        docker-compose -f docker/docker-compose.yml logs echo-control-test
        echo "📋 Logs from echo-data-server-test:"
        docker-compose -f docker/docker-compose.yml logs echo-data-server-test
        exit 1
    }
    
else
    echo "📦 CI environment detected - services managed by GitHub Actions"
    
    # In CI, manually start echo-control since it's not in Docker
    echo "🗃️ Setting up database for CI..."
    cd ../../app/control
    
    # Wait for database to be available
    start_time=$(date +%s)
    while ! pg_isready -h localhost -p 5433 -U test -d echo_integration_test; do
        current_time=$(date +%s)
        elapsed=$((current_time - start_time))
        if [ $elapsed -ge 30 ]; then
            echo "❌ Database failed to start within 30 seconds"
            exit 1
        fi
        echo "⏳ Waiting for database... (${elapsed}s elapsed)"
        sleep 2
    done
    
    # Run Prisma migrations
    pnpm prisma:migrate-deploy
    
    # Seed integration test data
    echo "🌱 Seeding integration test database..."
    INTEGRATION_TEST_MODE=true cd ../../tests/integration && pnpm db:seed
    
    echo "🚀 Starting echo-control test server..."
    cd ../../app/control && INTEGRATION_TEST_MODE=true pnpm build
    
    # Start echo-control in background with explicit port and all required environment variables
    cd ../../app/control && \
    PORT=3001 \
    NODE_ENV=test \
    CI="$CI" \
    DATABASE_URL="$DATABASE_URL" \
    JWT_SECRET="$JWT_SECRET" \
    JWT_ISSUER="$JWT_ISSUER" \
    JWT_AUDIENCE="$JWT_AUDIENCE" \
    INTEGRATION_TEST_MODE="$INTEGRATION_TEST_MODE" \
    OAUTH_REFRESH_TOKEN_EXPIRY_SECONDS="$OAUTH_REFRESH_TOKEN_EXPIRY_SECONDS" \
    OAUTH_ACCESS_TOKEN_EXPIRY_SECONDS="$OAUTH_ACCESS_TOKEN_EXPIRY_SECONDS" \
    STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-}" \
    STRIPE_PUBLISHABLE_KEY="${STRIPE_PUBLISHABLE_KEY:-}" \
    STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-}" \
    pnpm start &
    ECHO_CONTROL_PID=$!
    echo "$ECHO_CONTROL_PID" > /tmp/echo-control.pid
    
    # Wait for health check with improved debugging
    start_time=$(date +%s)
    echo "🔍 Checking if echo-control process started (PID: $ECHO_CONTROL_PID)..."
    
    
    while ! curl -f http://localhost:3001/api/health >/dev/null 2>&1; do
        current_time=$(date +%s)
        elapsed=$((current_time - start_time))
        if [ $elapsed -ge 60 ]; then
            echo "❌ echo-control failed to start within 60 seconds"
            echo "🔍 Process status: $(ps -p $ECHO_CONTROL_PID >/dev/null 2>&1 && echo 'running' || echo 'not running')"
            echo "🔍 Port status: $(netstat -tulpn 2>/dev/null | grep :3001 || echo 'no process listening on port 3001')"
            echo "🔍 Port 3000 status: $(netstat -tulpn 2>/dev/null | grep :3000 || echo 'no process listening on port 3000')"
            echo "🔍 Health endpoint response: $(curl -s http://localhost:3001/api/health 2>&1 || echo 'no response')"
            kill $ECHO_CONTROL_PID 2>/dev/null || true
            exit 1
        fi
        
        # Check if process is still running
        if ! ps -p $ECHO_CONTROL_PID >/dev/null 2>&1; then
            echo "❌ echo-control process died unexpectedly"
            echo "🔍 Checking for any Next.js processes..."
            ps aux | grep -i next || echo "No Next.js processes found"
            exit 1
        fi
        
        echo "⏳ Waiting for echo-control health check... (${elapsed}s elapsed)"
        sleep 2
    done
    
    echo "✅ echo-control is healthy at http://localhost:3001"
    
    # Start echo-data-server in CI
    echo "🚀 Starting echo-data-server test server..."
    cd ../../app/server
    
    # Build echo-data-server
    pnpm build
    
    # Start echo-data-server in background
    ECHO_CONTROL_URL="http://localhost:3001" \
    NODE_ENV=test \
    PORT=3069 \
    OPENAI_API_KEY="${OPENAI_API_KEY:-}" \
    ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}" \
    CDP_API_KEY_ID="${CDP_API_KEY_ID:-}" \
    CDP_API_KEY_SECRET="${CDP_API_KEY_SECRET:-}" \
    CDP_WALLET_SECRET="${CDP_WALLET_SECRET:-}" \
    pnpm start &
    ECHO_DATA_SERVER_PID=$!
    echo "$ECHO_DATA_SERVER_PID" > /tmp/echo-data-server.pid
    
    # Wait for echo-data-server health check
    start_time=$(date +%s)
    while ! curl -f "$ECHO_DATA_SERVER_URL/health" >/dev/null 2>&1; do
        current_time=$(date +%s)
        elapsed=$((current_time - start_time))
        if [ $elapsed -ge 60 ]; then
            echo "❌ echo-data-server failed to start within 60 seconds"
            kill $ECHO_CONTROL_PID 2>/dev/null || true
            kill $ECHO_DATA_SERVER_PID 2>/dev/null || true
            exit 1
        fi
        echo "⏳ Waiting for echo-data-server health check... (${elapsed}s elapsed)"
        sleep 2
    done || {
        echo "❌ echo-data-server failed to start within 60 seconds"
        kill $ECHO_CONTROL_PID 2>/dev/null || true
        kill $ECHO_DATA_SERVER_PID 2>/dev/null || true
        exit 1
    }
    
    echo "✅ echo-data-server is healthy at $ECHO_DATA_SERVER_URL"
    cd ../../tests/integration
fi

echo ""
echo "🎉 Integration environment ready!"
echo ""
echo "🌐 Services:"
echo "  📊 Echo Control: $ECHO_CONTROL_URL"
echo "  🗃️  Echo Data Server: $ECHO_DATA_SERVER_URL"
echo "  🗄️  Database: ${DATABASE_URL#*@}"
echo ""
echo "🧪 Available test commands:"
echo "  pnpm test:oauth-protocol  - OAuth2 compliance tests"
echo "  pnpm test:react-sdk       - React SDK integration tests"
echo "  pnpm test:typescript-sdk  - TypeScript SDK integration tests"
echo "  pnpm test:cross-sdk       - Cross-SDK interoperability tests"
echo "  pnpm test:e2e             - End-to-end browser tests"
echo "  pnpm test:all             - Run all integration tests"
echo ""
echo "⚙️  Test configuration:"
echo "  OAUTH_REFRESH_TOKEN_EXPIRY_SECONDS - Override refresh token expiry (for testing)"
echo "  OAUTH_REFRESH_TOKEN_EXPIRY_DAYS    - Set refresh token expiry in days (default: 30)"
echo ""
echo "🗄️  Database management:"
echo "  pnpm db:seed              - Seed test data"
echo "  pnpm db:reset             - Clean all test data"
echo "  pnpm db:reset-and-seed    - Reset and seed test data"
echo ""
echo "🐳 Docker management:"
echo "  pnpm docker:up            - Start all services"
echo "  pnpm docker:down          - Stop all services"
echo "  pnpm docker:logs          - View service logs"