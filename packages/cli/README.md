# Echo CLI

Simple CLI chat tool for Echo - pay-per-use AI with OAuth authentication.

## Features

- OAuth login flow that directs you to echo.merit.systems
- Automatic token management and refresh
- Streaming chat responses
- Pay-per-use - users pay for AI, not developers

## Installation

```bash
cd packages/cli
pnpm install
```

## Setup

### 1. Get an Echo App ID

You need an Echo app ID to use this CLI:

1. Visit [echo.merit.systems](https://echo.merit.systems)
2. Create an account and login (use Google or GitHub)
3. Create a new Echo app
4. Copy your app ID (it's a UUID like `87654321-4321-4321-8321-fedcba987654`)

### 2. Configure the CLI

Create a `.env` file:

```bash
cp .env.example .env
```

Then edit `.env` and add your app ID:

```bash
ECHO_APP_ID=your-app-id-here
```

Or set it as an environment variable:

```bash
export ECHO_APP_ID=your-app-id-here
```

## Usage

```bash
pnpm start
```

On first run, the CLI will:
1. Start a local OAuth callback server on port 8402
2. Display a URL to visit for authentication
3. Direct you to echo.merit.systems to login
4. Automatically receive and store your access token

Once authenticated, simply type your messages and chat with AI!

## Commands

- Type your message to chat
- `exit` - Quit the CLI
- `logout` - Clear stored credentials
- `login` - Force re-authentication

## How it Works

This CLI mimics how OpenAI Codex, GitHub CLI, and Vercel CLI handle authentication:

1. **OAuth Flow**: Checks for saved token in `~/.echo-cli/token.json`
2. **Authentication**: If no token, starts local server and generates OAuth URL
3. **User Login**: Opens echo.merit.systems in browser for authentication
4. **Callback**: Receives authorization code via localhost callback
5. **Token Exchange**: Exchanges code for access token using PKCE
6. **Chat**: Uses access token for all API requests

## Troubleshooting

### Error: "ECHO_APP_ID is required"

You need to set your Echo app ID. See Setup section above.

### Error: "invalid_client" or "client_id must be a valid UUID"

Make sure your `ECHO_APP_ID` is a valid UUID from your Echo dashboard.
