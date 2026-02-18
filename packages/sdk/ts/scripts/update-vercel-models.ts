#!/usr/bin/env node

// -> Fetch all available models from the Vercel AI Gateway pricing API
// Uses the @ai-sdk/gateway package to get model pricing
// Write to a static file in the src/supported-models/chat/vercel.ts file

import { gateway } from '@ai-sdk/gateway';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import type { SupportedModel } from './update-models';

config();

async function fetchVercelGatewayModels(): Promise<SupportedModel[]> {
  try {
    console.log('Fetching models from Vercel AI Gateway...');

    const availableModels = await gateway.getAvailableModels();

    console.log(
      `Found ${availableModels.models.length} total models from Vercel AI Gateway`
    );

    const supportedModels: SupportedModel[] = [];

    for (const model of availableModels.models) {
      // Only include language models
      if (model.modelType !== 'language') {
        continue;
      }

      // Ensure pricing data exists
      if (
        !model.pricing ||
        model.pricing.input === undefined ||
        model.pricing.input === null ||
        model.pricing.output === undefined ||
        model.pricing.output === null
      ) {
        console.warn(`Skipping ${model.id} - missing pricing data`);
        continue;
      }

      const inputCost = Number(model.pricing.input);
      const outputCost = Number(model.pricing.output);

      // Skip models with zero or invalid pricing
      if (
        isNaN(inputCost) ||
        isNaN(outputCost) ||
        inputCost === 0 ||
        outputCost === 0
      ) {
        console.warn(`Skipping ${model.id} - invalid pricing data`);
        continue;
      }

      // Use the gateway model ID with @ prefix for the provider portion
      // e.g., "openai/gpt-4o" becomes "@openai/gpt-4o"
      const modelId = `@${model.id}`;

      supportedModels.push({
        model_id: modelId,
        input_cost_per_token: inputCost,
        output_cost_per_token: outputCost,
        provider: 'Vercel',
      });

      console.log(
        `  ${modelId} - Input: $${inputCost}/token, Output: $${outputCost}/token`
      );
    }

    console.log(
      `\nProcessed ${supportedModels.length} compatible language models`
    );
    return supportedModels;
  } catch (error) {
    console.error(
      'Error fetching models from Vercel AI Gateway:',
      error
    );
    throw error;
  }
}

function generateVercelModelFile(models: SupportedModel[]): string {
  const sortedModels = models.sort((a, b) =>
    a.model_id.localeCompare(b.model_id)
  );

  // Generate union type
  const unionType = sortedModels
    .map(model => `  | "${model.model_id}"`)
    .join('\n');

  // Generate model objects
  const modelObjects = sortedModels
    .map(model => {
      return `  {
    model_id: "${model.model_id}",
    input_cost_per_token: ${model.input_cost_per_token},
    output_cost_per_token: ${model.output_cost_per_token},
    provider: "${model.provider}",
  }`;
    })
    .join(',\n');

  return `import { SupportedModel } from "../types";

// Union type of all valid Vercel AI Gateway model IDs
// Models are prefixed with their upstream provider as used by the Vercel AI Gateway
// Pricing sourced from: https://vercel.com/ai-gateway via @ai-sdk/gateway API
export type VercelModel = 
${unionType};

export const VercelModels: SupportedModel[] = [
${modelObjects}
];

`;
}

async function updateVercelModels() {
  try {
    console.log('Starting Vercel AI Gateway model update process...\n');

    // Fetch models and pricing from Vercel AI Gateway API
    const models = await fetchVercelGatewayModels();

    if (models.length === 0) {
      console.log('No compatible models found');
      return;
    }

    // Generate the new file content
    const fileContent = generateVercelModelFile(models);

    // Write the updated file
    const fullPath = join(
      process.cwd(),
      'src/supported-models/chat/vercel.ts'
    );
    writeFileSync(fullPath, fileContent, 'utf8');

    console.log(
      `\nSuccessfully updated vercel.ts with ${models.length} models`
    );
    console.log(`Models included:`);

    // Show a sample of models for verification
    const sampleModels = models.slice(0, 10);
    sampleModels.forEach(model => {
      console.log(`  - ${model.model_id}`);
    });

    if (models.length > 10) {
      console.log(`  ... and ${models.length - 10} more models`);
    }
  } catch (error) {
    console.error('Error updating Vercel models:', error);
    process.exit(1);
  }
}

// Run the script
updateVercelModels().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
