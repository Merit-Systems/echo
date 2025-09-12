#!/bin/bash
# integration/scripts/teardown-integration-env.sh

set -e

echo "🧹 Tearing down Echo integration test environment..."

# Change to integration directory
cd "$(dirname "$0")/.."

# Detect environment
if [ "$CI" = "true" ]; then
    echo "📦 CI environment detected"
    IS_CI=true
else
    echo "🏠 Local environment detected"
    IS_CI=false
fi

if [ "$IS_CI" != "true" ]; then
    echo "🐳 Stopping Docker services..."
    
    # Stop and remove containers, networks, and volumes
    docker-compose -f docker/docker-compose.yml down -v
    
    echo "🗑️  Cleaning up Docker resources..."
    
    # Remove any dangling images from our compose
    docker image prune -f --filter "label=com.docker.compose.project=integration" || true
    
    # Remove unused volumes
    docker volume prune -f || true
    
    echo "✅ Local integration environment cleaned up"
    
else
    echo "📦 CI teardown - stopping background processes..."
    
    # Kill echo-control using stored PID if available
    if [ -f "/tmp/echo-control.pid" ]; then
        ECHO_CONTROL_PID=$(cat /tmp/echo-control.pid)
        if ps -p "$ECHO_CONTROL_PID" >/dev/null 2>&1; then
            echo "🛑 Stopping echo-control (PID: $ECHO_CONTROL_PID)..."
            kill "$ECHO_CONTROL_PID" || true
            sleep 2
            # Force kill if still running
            kill -9 "$ECHO_CONTROL_PID" 2>/dev/null || true
        fi
        rm -f /tmp/echo-control.pid
    fi
    
    # Kill echo-data-server using stored PID if available
    if [ -f "/tmp/echo-data-server.pid" ]; then
        ECHO_DATA_SERVER_PID=$(cat /tmp/echo-data-server.pid)
        if ps -p "$ECHO_DATA_SERVER_PID" >/dev/null 2>&1; then
            echo "🛑 Stopping echo-data-server (PID: $ECHO_DATA_SERVER_PID)..."
            kill "$ECHO_DATA_SERVER_PID" || true
            sleep 2
            # Force kill if still running
            kill -9 "$ECHO_DATA_SERVER_PID" 2>/dev/null || true
        fi
        rm -f /tmp/echo-data-server.pid
    fi
    
    # Fallback: Kill any remaining processes (less aggressive than before)
    pkill -f "PORT=3001.*next start" || true
    pkill -f "PORT=3069.*pnpm start" || true
    
    echo "🗃️ Cleaning up CI database..."
    cd ../../app/control
    
    # Reset database (optional in CI, but good for cleanup)
    if command -v pnpm >/dev/null 2>&1; then
        pnpm db:reset || echo "⚠️  Database reset failed (might not be running)"
    fi
    
    cd ../../tests/integration
    echo "✅ CI integration environment cleaned up"
fi

echo "🎉 Integration test environment teardown complete!"