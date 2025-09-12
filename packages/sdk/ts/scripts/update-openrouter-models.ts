#!/usr/bin/env node

// -> Get all model slugs and pricing from OpenRouter's API directly
// Write to a static file in the src/supported-models/chat/openrouter.ts file

import { writeFileSync } from 'fs';
import { join } from 'path';

interface SupportedModel {
  model_id: string;
  input_cost_per_token: number;
  output_cost_per_token: number;
  provider: string;
}

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  top_provider: {
    max_completion_tokens?: number;
    is_moderated: boolean;
  };
  per_request_limits?: {
    prompt_tokens: string;
    completion_tokens: string;
  };
}

interface OpenRouterResponse {
  data: OpenRouterModel[];
}

async function fetchOpenRouterModels(): Promise<SupportedModel[]> {
  try {
    console.log('📡 Fetching models from OpenRouter API...');

    const response = await fetch('https://openrouter.ai/api/v1/models');

    if (!response.ok) {
      throw new Error(
        `Failed to fetch OpenRouter models: ${response.status} ${response.statusText}`
      );
    }

    const data: OpenRouterResponse = await response.json();
    console.log(`🔍 Found ${data.data.length} models from OpenRouter API`);

    // Filter for text models only and convert to our format
    const supportedModels: SupportedModel[] = [];

    for (const model of data.data) {
      // Only include text-based models
      if (
        model.architecture.modality === 'text->text' ||
        model.architecture.modality === 'text+image->text'
      ) {
        const inputCost = parseFloat(model.pricing.prompt);
        const outputCost = parseFloat(model.pricing.completion);

        // Skip models with invalid pricing
        if (isNaN(inputCost) || isNaN(outputCost)) {
          console.warn(`⚠️  Skipping ${model.id} - invalid pricing data`);
          continue;
        }

        supportedModels.push({
          model_id: model.id,
          input_cost_per_token: inputCost,
          output_cost_per_token: outputCost,
          provider: 'OpenRouter',
        });

        console.log(
          `  ✅ ${model.id} - Input: $${inputCost}/token, Output: $${outputCost}/token`
        );
      } else {
        console.log(
          `  ⏭️  Skipping ${model.id} - not a text model (${model.architecture.modality})`
        );
      }
    }

    console.log(
      `\n📊 Processed ${supportedModels.length} compatible text models`
    );
    return supportedModels;
  } catch (error) {
    console.error('❌ Error fetching models from OpenRouter API:', error);
    throw error;
  }
}

function generateOpenRouterModelFile(models: SupportedModel[]): string {
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
    provider: "OpenRouter"
  }`;
    })
    .join(',\n');

  return `import { SupportedModel } from "../types";

// Union type of all valid OpenRouter model IDs
export type OpenRouterModel = 
${unionType};

export const OpenRouterModels: SupportedModel[] = [
${modelObjects}
];

`;
}

async function updateOpenRouterModels() {
  try {
    console.log('🔄 Starting OpenRouter model update process...\n');

    // Fetch models and pricing from OpenRouter API
    const models = await fetchOpenRouterModels();

    if (models.length === 0) {
      console.log('❌ No compatible models found');
      return;
    }

    // Generate the new file content
    const fileContent = generateOpenRouterModelFile(models);

    // Write the updated file
    const fullPath = join(
      process.cwd(),
      'src/supported-models/chat/openrouter.ts'
    );
    writeFileSync(fullPath, fileContent, 'utf8');

    console.log(
      `\n✅ Successfully updated openrouter.ts with ${models.length} models`
    );
    console.log(`📊 Models included:`);

    // Show a sample of models for verification
    const sampleModels = models.slice(0, 10);
    sampleModels.forEach(model => {
      console.log(`  - ${model.model_id}`);
    });

    if (models.length > 10) {
      console.log(`  ... and ${models.length - 10} more models`);
    }
  } catch (error) {
    console.error('❌ Error updating OpenRouter models:', error);
    process.exit(1);
  }
}

// Run the script
updateOpenRouterModels().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
