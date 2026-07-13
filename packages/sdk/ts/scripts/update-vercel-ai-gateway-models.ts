// Script to update Vercel AI Gateway models
// Usage: pnpm run update-models:vercel-ai-gateway

import { writeFileSync } from 'fs';
import { SupportedModel } from '../src/supported-models/types';

// TODO: Fetch models from Vercel AI Gateway API when available
// For now, models are manually maintained based on:
// https://vercel.com/ai-gateway/models
// https://vercel.com/docs/ai-gateway/pricing

const models: SupportedModel[] = [
  // OpenAI models via Vercel AI Gateway
  {
    model_id: 'gpt-4o',
    input_cost_per_token: 0.0000025,
    output_cost_per_token: 0.00001,
    provider: 'Vercel AI Gateway',
  },
  // ... add more models as needed
];

console.log(`Found ${models.length} Vercel AI Gateway models`);
// writeFileSync(...) // Uncomment to auto-update the model file
