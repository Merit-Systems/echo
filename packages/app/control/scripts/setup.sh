#!/bin/bash

set -euo pipefail

ENV_FILE=".env"
DEFAULT_DATABASE_URL="postgresql://echo_user:echo_password@localhost:5469/echo_control_v2?schema=public"

if [ ! -f "$ENV_FILE" ]; then
    if [ -f .env.example ]; then
        cp .env.example "$ENV_FILE"
        echo "Created .env from .env.example."
    else
        touch "$ENV_FILE"
        echo "Created empty .env."
    fi
fi

get_env_value() {
    local key="$1"
    local raw_value

    raw_value="$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 | cut -d '=' -f2- || true)"
    raw_value="${raw_value%\"}"
    raw_value="${raw_value#\"}"
    raw_value="${raw_value%\'}"
    raw_value="${raw_value#\'}"

    echo "$raw_value"
}

set_env_value() {
    local key="$1"
    local value="$2"

    if grep -qE "^${key}=" "$ENV_FILE"; then
        sed -i "s|^${key}=.*|${key}=\"${value}\"|" "$ENV_FILE"
    else
        printf '\n%s="%s"\n' "$key" "$value" >> "$ENV_FILE"
    fi
}

auth_secret_value="$(get_env_value "AUTH_SECRET")"
if [ -z "$auth_secret_value" ]; then
    generated_auth_secret="$(node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))")"
    set_env_value "AUTH_SECRET" "$generated_auth_secret"
    echo "Generated AUTH_SECRET."
else
    echo "AUTH_SECRET already set."
fi

database_url_value="$(get_env_value "DATABASE_URL")"
if [ -z "$database_url_value" ]; then
    set_env_value "DATABASE_URL" "$DEFAULT_DATABASE_URL"
    echo "Set DATABASE_URL to local default."
else
    echo "DATABASE_URL already set."
fi

echo "Local setup complete."
