#!/usr/bin/env node

// -> Get all model slugs from Anthropic's API directly
// Match them to the AI gateway model slugs for accurate pricing
// Write to a static file in the src/supported-models/anthropic.ts file

import { updateProviderModels, type ProviderConfig } from './update-models';

interface AnthropicApiModel {
  type: string;
  id: string;
  display_name: string;
  created_at: string;
}

interface AnthropicApiResponse {
  data: AnthropicApiModel[];
  has_more: boolean;
  first_id: string;
  last_id: string;
}

async function fetchAnthropicModels(): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Anthropic models: ${response.status} ${response.statusText}`
      );
    }

    const data: AnthropicApiResponse = await response.json();
    console.log(`🔍 Found ${data.data.length} models from Anthropic API`);

    // Extract model IDs and log them
    const modelIds = data.data.map(model => model.id);
    modelIds.forEach(id => console.log(`  - ${id}`));

    return modelIds;
  } catch (error) {
    console.error('❌ Error fetching models from Anthropic API:', error);
    throw error;
  }
}

function getAnthropicVersionSuffixPatterns(): RegExp[] {
  return [
    /-latest$/,
    /-\d{8}$/, // Remove date suffixes like -20250514
    /-\d{4}-\d{2}-\d{2}$/, // Remove date suffixes like -2024-10-22
  ];
}

// Create provider configuration
const anthropicConfig: ProviderConfig = {
  name: 'Anthropic',
  gatewayPrefix: 'anthropic/',
  outputPath: 'src/supported-models/chat/anthropic.ts',
  apiKeyEnvVar: 'ANTHROPIC_API_KEY',
  fetchModels: fetchAnthropicModels,
  getVersionSuffixPatterns: getAnthropicVersionSuffixPatterns,
};

// Run the script
updateProviderModels(anthropicConfig).catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
