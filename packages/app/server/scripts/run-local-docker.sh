#!/bin/bash
# Run Docker container from echo-server directory
# This script should be run from the echo-server directory

# Check if .env file exists in parent directory, if not, run without env file

echo "Using .env file from parent directory"
docker run --env-file .env -p 3069:3069 echo-server-local
