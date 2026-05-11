#!/bin/bash

set -euo pipefail

ENV_FILE=".env"
DATABASE_URL_VALUE='"postgresql://echo_user:echo_password@localhost:5469/echo_control_v2?schema=public"'

ensure_env_file() {
    if [ -f "$ENV_FILE" ]; then
        return
    fi

    if [ -f ".env.example" ]; then
        cp ".env.example" "$ENV_FILE"
        echo "Created $ENV_FILE from .env.example."
    else
        touch "$ENV_FILE"
        echo "Created empty $ENV_FILE."
    fi
}

env_value() {
    local key="$1"
    grep -E "^${key}=" "$ENV_FILE" | tail -n 1 | cut -d= -f2- | tr -d "\"'"
}

set_env_value() {
    local key="$1"
    local value="$2"
    local current

    current="$(env_value "$key" || true)"
    if [ -n "$current" ]; then
        echo "$key already exists in $ENV_FILE. Skipping."
        return
    fi

    if grep -qE "^${key}=" "$ENV_FILE"; then
        local temp_file
        temp_file="$(mktemp)"
        awk -v key="$key" -v replacement="${key}=${value}" '
            BEGIN { replaced = 0 }
            $0 ~ "^" key "=" && replaced == 0 {
                print replacement
                replaced = 1
                next
            }
            { print }
        ' "$ENV_FILE" > "$temp_file"
        mv "$temp_file" "$ENV_FILE"
    else
        printf "%s=%s\n" "$key" "$value" >> "$ENV_FILE"
    fi

    echo "Set $key in $ENV_FILE."
}

ensure_env_file

AUTH_SECRET_VALUE="\"$(node -e "process.stdout.write(require('crypto').randomBytes(32).toString('base64'))")\""

set_env_value "AUTH_SECRET" "$AUTH_SECRET_VALUE"
set_env_value "DATABASE_URL" "$DATABASE_URL_VALUE"

echo "Setup complete. You can now run 'pnpm dev' to start the development server."
