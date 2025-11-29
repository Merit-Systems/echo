import { config } from 'dotenv';
import { gateway } from '@ai-sdk/gateway';
import {
  generateModelFile,
  SupportedModel,
  updateProviderModels,
  ProviderConfig,
} from './update-models';

config();

async function fetchVercelAIGatewayModels(): Promise<string[]> {
  console.log('📡 Fetching models from Vercel AI Gateway...');

  const availableModels = await gateway.getAvailableModels();

  const modelIds = availableModels.models
    .filter(model => model.modelType === 'language')
    .map(model => model.id);

  console.log(`Found ${modelIds.length} language models in gateway`);

  return modelIds;
}

function normalizeVercelAIGatewayModelId(modelId: string): string {
  return modelId; // Keep full format: provider/model
}

async function fetchGatewayModelsWithPricing(): Promise<SupportedModel[]> {
  console.log('💰 Fetching models and pricing from Vercel AI Gateway...');

  const availableModels = await gateway.getAvailableModels();

  // Process all language models
  const models = availableModels.models
    .filter(model => model.modelType === 'language')
    .map(model => {
      console.log(`Processing: ${model.id}`);

      // Validate pricing information
      if (!model.pricing) {
        console.warn(`⚠️  Model ${model.id} missing pricing - skipping`);
        return null;
      }

      if (
        model.pricing.input === undefined ||
        model.pricing.input === null ||
        model.pricing.output === undefined ||
        model.pricing.output === null
      ) {
        console.warn(`⚠️  Model ${model.id} has incomplete pricing - skipping`);
        return null;
      }

      const inputCost = Number(model.pricing.input);
      const outputCost = Number(model.pricing.output);

      // Validate costs are valid numbers
      if (isNaN(inputCost) || isNaN(outputCost)) {
        console.warn(`⚠️  Model ${model.id} has invalid pricing - skipping`);
        return null;
      }

      return {
        model_id: model.id, // Keep full format: provider/model
        input_cost_per_token: inputCost,
        output_cost_per_token: outputCost,
        provider: 'VercelAIGateway',
      };
    })
    .filter((model): model is SupportedModel => model !== null);

  console.log(`✅ Successfully fetched ${models.length} models with pricing`);

  return models;
}

async function updateVercelAIGatewayModels(): Promise<void> {
  try {
    console.log('🔄 Starting Vercel AI Gateway model update process...\n');

    // Check for API key
    const apiKey = process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      throw new Error('AI_GATEWAY_API_KEY environment variable is required');
    }

    // Fetch models with pricing directly from gateway
    const models = await fetchGatewayModelsWithPricing();

    if (models.length === 0) {
      console.warn('⚠️  No models found in gateway');
      return;
    }

    // Generate the file content
    const fileContent = generateModelFile(
      models,
      'VercelAIGateway',
      'VercelAIGateway'
    );

    // Write the file
    const { writeFileSync } = await import('fs');
    const { join } = await import('path');
    const outputPath = 'src/supported-models/chat/vercel-ai-gateway.ts';
    const fullPath = join(process.cwd(), outputPath);
    writeFileSync(fullPath, fileContent, 'utf8');

    console.log(
      `\n✅ Successfully updated vercel-ai-gateway.ts with ${models.length} models`
    );
    console.log(`📊 Models included:`);
    models.forEach(model => {
      console.log(`  - ${model.model_id}`);
    });
  } catch (error) {
    console.error('❌ Error updating Vercel AI Gateway models:', error);
    process.exit(1);
  }
}

export { updateVercelAIGatewayModels, fetchVercelAIGatewayModels };

if (import.meta.url === `file://${process.argv[1]}`) {
  updateVercelAIGatewayModels();
}

