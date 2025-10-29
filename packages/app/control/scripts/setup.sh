#!/bin/bash

# Check if .env file exists and if AUTH_SECRET is already set
if [ -f .env ] && grep -q "^AUTH_SECRET=" .env; then
    echo "AUTH_SECRET already exists in .env file. Skipping generation."
else
    echo "Generating AUTH_SECRET..."
    AUTH_SECRET=$(node -e "console.log('AUTH_SECRET=' + require('crypto').randomBytes(32).toString('base64'))")
    echo $AUTH_SECRET
    echo $AUTH_SECRET >> .env
fi

# Check if DATABASE_URL is already set
if [ -f .env ] && grep -q "^DATABASE_URL=" .env; then
    echo "DATABASE_URL already exists in .env file. Skipping."
else
    echo "DATABASE_URL='postgresql://echo_user:echo_password@localhost:5469/echo_control_v2?schema=public'" >> .env
fi

echo "Setup complete! You can now run 'pnpm dev' to start the development server."
