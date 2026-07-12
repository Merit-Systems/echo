#!/bin/bash

set -euo pipefail

if ! command -v docker &> /dev/null; then
    echo "Error: Docker is required to run Echo locally."
    echo "Install Docker Desktop (or Docker Engine + Compose plugin), then retry."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose plugin is required."
    echo "Make sure 'docker compose' is available, then retry."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "Error: Docker daemon is not running."
    echo "Start Docker and run 'pnpm dev' again."
    exit 1
fi

docker compose -f docker-local-db.yml up -d
sleep 3
pnpm exec prisma generate
pnpm exec prisma migrate deploy
