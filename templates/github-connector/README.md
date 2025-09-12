# GitHub x Echo Connector

Powered by Echo for LLM generations.

## Getting Started

First, run the development server:

```bash
pnpm dev
```

## GitHub App Integration

Set the following environment variables for the GitHub App flow:
Create a [GitHub App](https://github.com/settings/apps/new).

```bash
GITHUB_APP_ID=123456
GITHUB_APP_SLUG=your-app-slug
# Private key in PKCS8 format. If multi-line, use \n escaped newlines.
GITHUB_APP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```