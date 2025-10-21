# Update Models

Scripts to sync supported models with latest pricing from AI providers.

## Usage

```bash
# Update individual providers
pnpm run update-models:openai
pnpm run update-models:anthropic
pnpm run update-models:gemini
pnpm run update-models:openrouter
pnpm run update-models:groq

# Update all providers at once
pnpm run update-all-models
```

## Requirements

Set environment variables for provider API keys:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `OPENROUTER_API_KEY`
- `GROQ_API_KEY`

## What it does

1. Fetches latest models from each provider's API
2. Matches them with pricing data from AI Gateway
3. Updates TypeScript model definitions in `src/supported-models/chat/`
4. Generates type-safe model IDs and pricing info
