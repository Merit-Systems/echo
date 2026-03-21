#!/usr/bin/env node

// -> Fetch all available models from the Vercel AI Gateway
// Uses the @ai-sdk/gateway package to get model IDs and pricing
// Writes to src/supported-models/chat/vercel.ts

import { gateway } from '@ai-sdk/gateway';
import { generateModelFile, type SupportedModel } from './update-models';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function updateVercelModels(): Promise<void> {
  try {
    console.log('🔄 Starting Vercel AI Gateway model update process...\n');

    // Fetch available models directly from the gateway API
    console.log('📡 Fetching available models from Vercel AI Gateway...');
    const response = await gateway.getAvailableModels();

    // Filter for language models with pricing
    const models: SupportedModel[] = response.models
      .filter(model => model.modelType === 'language')
      .filter(model => model.pricing?.input != null && model.pricing?.output != null)
      .map(model => ({
        model_id: model.id,
        input_cost_per_token: Number(model.pricing!.input),
        output_cost_per_token: Number(model.pricing!.output),
        provider: 'Vercel',
      }));

    console.log(`\n📝 Found ${models.length} language models with pricing`);

    // Generate the file content
    const fileContent = generateModelFile(models, 'Vercel', 'Vercel');

    // Write the updated file
    const outputPath = join(process.cwd(), 'src/supported-models/chat/vercel.ts');
    writeFileSync(outputPath, fileContent, 'utf8');

    console.log(`\n✅ Successfully updated vercel.ts with ${models.length} models`);
    console.log('📊 Models included:');
    models.forEach(model => {
      console.log(`  - ${model.model_id}`);
    });
  } catch (error) {
    console.error('❌ Error updating Vercel AI Gateway models:', error);
    process.exit(1);
  }
}

// Run the script
updateVercelModels().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
