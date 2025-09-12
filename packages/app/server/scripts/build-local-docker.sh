#!/bin/bash
# Build Docker image from packages/app/server directory
# This script should be run from the server directory
cd .. && docker build -f ./packages/app/server/docker/Dockerfile.local -t echo-server-local .