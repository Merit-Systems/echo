#!/bin/bash

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file for echo-server..."
    cp .env.example .env

    echo "OK: Created .env file"
    echo ""
    echo "NOTE: The following environment variables need to be configured:"
    echo "   - ECHO_API_KEY: API key from echo-control (get from dashboard after setup)"
    echo "   - Provider keys (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)"
    echo ""
    echo "See the .env file for more information."
else
    echo "INFO: .env file already exists, skipping creation"
fi