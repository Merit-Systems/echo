#!/usr/bin/env node

// -> Get all model slugs from Gemini's API directly
// Match them to the AI gateway model slugs for accurate pricing
// Write to a static file in the src/supported-models/gemini.ts file

import { updateProviderModels, type ProviderConfig } from './update-models';

interface GeminiApiModel {
  name: string;
  version: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
}

interface GeminiApiResponse {
  models: GeminiApiModel[];
}

async function fetchGeminiModels(): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Gemini models: ${response.status} ${response.statusText}`
      );
    }

    const data: GeminiApiResponse = await response.json();
    console.log(`🔍 Found ${data.models.length} models from Gemini API`);

    // Filter for language models and extract model IDs
    const modelIds = data.models
      .filter(model => {
        // Filter for generation models (language models)
        const hasGenerateContent =
          model.supportedGenerationMethods?.includes('generateContent');

        // Filter out embedding models
        const isNotEmbedding =
          !model.name.includes('embedding') &&
          !model.displayName.toLowerCase().includes('embedding');

        // Filter out vision-only models (keep multimodal ones that can do text)
        const isNotVisionOnly = !model.displayName
          .toLowerCase()
          .includes('vision');

        return hasGenerateContent && isNotEmbedding && isNotVisionOnly;
      })
      .map(model => {
        // Extract model ID from the full name (e.g., "models/gemini-pro" -> "gemini-pro")
        const modelId = model.name.replace('models/', '');
        return modelId;
      });

    console.log(`📝 Filtered to ${modelIds.length} language models:`);
    modelIds.forEach(id => console.log(`  - ${id}`));

    return modelIds;
  } catch (error) {
    console.error('❌ Error fetching models from Gemini API:', error);
    throw error;
  }
}

function getGeminiVersionSuffixPatterns(): RegExp[] {
  return [
    /-\d{3}$/, // Remove version suffixes like -001
    /-latest$/,
    /-preview$/,
    /-vision$/,
    /-experimental.*$/,
  ];
}

// Create provider configuration
const geminiConfig: ProviderConfig = {
  name: 'Gemini',
  gatewayPrefix: 'google/',
  outputPath: 'src/supported-models/chat/gemini.ts',
  apiKeyEnvVar: 'GEMINI_API_KEY',
  fetchModels: fetchGeminiModels,
  getVersionSuffixPatterns: getGeminiVersionSuffixPatterns,
};

// Run the script
updateProviderModels(geminiConfig).catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
