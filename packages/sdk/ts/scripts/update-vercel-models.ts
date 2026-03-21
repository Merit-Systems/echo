#!/usr/bin/env node

// -> Fetch all available models from the Vercel AI Gateway
// Uses the public models endpoint to get model IDs and pricing
// Writes to src/supported-models/chat/vercel.ts

import { generateModelFile, type SupportedModel } from './update-models';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface VercelGatewayModel {
  id: string;
  type: string;
  pricing?: {
    input: string;
    output: string;
  } | null;
}

interface VercelGatewayResponse {
  object: string;
  data: VercelGatewayModel[];
}

async function updateVercelModels(): Promise<void> {
  try {
    console.log('🔄 Starting Vercel AI Gateway model update process...\n');

    // Fetch available models from the public gateway endpoint
    console.log('📡 Fetching available models from Vercel AI Gateway...');
    const response = await fetch('https://ai-gateway.vercel.sh/v1/models');

    if (!response.ok) {
      throw new Error(
        `Failed to fetch models: ${response.status} ${response.statusText}`
      );
    }

    const data: VercelGatewayResponse = await response.json();
    console.log(`🔍 Found ${data.data.length} total models from gateway`);

    // Filter for language models with pricing
    const models: SupportedModel[] = data.data
      .filter(
        model =>
          model.type === 'language' &&
          model.pricing?.input != null &&
          model.pricing?.output != null
      )
      .map(model => ({
        model_id: model.id,
        input_cost_per_token: Number(model.pricing!.input),
        output_cost_per_token: Number(model.pricing!.output),
        provider: 'Vercel',
      }));

    console.log(`📝 Filtered to ${models.length} language models with pricing`);

    // Generate the file content
    const fileContent = generateModelFile(models, 'Vercel', 'Vercel');

    // Write the updated file
    const outputPath = join(
      process.cwd(),
      'src/supported-models/chat/vercel.ts'
    );
    writeFileSync(outputPath, fileContent, 'utf8');

    console.log(
      `\n✅ Successfully updated vercel.ts with ${models.length} models`
    );
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
