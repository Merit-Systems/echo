#!/bin/bash

echo "Generating AUTH_SECRET..."
AUTH_SECRET=$(node -e "console.log('AUTH_SECRET=' + require('crypto').randomBytes(32).toString('base64'))")
echo $AUTH_SECRET

echo $AUTH_SECRET >> .env
echo "DATABASE_URL='postgresql://echo_user:echo_password@localhost:5469/echo_control?schema=public'" >> .env

echo "SKIP_ENV_VALIDATION=1" >> .env

echo "Setup complete! You can now run 'pnpm dev' to start the development server."

