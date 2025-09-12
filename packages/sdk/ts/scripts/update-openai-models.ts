#!/usr/bin/env node

// -> Get all model slugs from OpenAI's API directly
// Match them to the AI gateway model slugs for accurate pricing
// Write to a static file in the src/supported-models/openai.ts file

import { updateProviderModels, type ProviderConfig } from './update-models';

interface OpenAIApiModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

interface OpenAIApiResponse {
  object: string;
  data: OpenAIApiModel[];
}

async function fetchOpenAIModels(): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch OpenAI models: ${response.status} ${response.statusText}`
      );
    }

    const data: OpenAIApiResponse = await response.json();
    console.log(`🔍 Found ${data.data.length} models from OpenAI API`);

    // Filter for language models and extract model IDs
    const modelIds = data.data
      .filter(model => {
        // Filter out non-language models (embeddings, audio, etc.)
        const isLanguageModel =
          model.id.includes('gpt') ||
          model.id.includes('o1') ||
          model.id.includes('o3') ||
          model.id.includes('davinci') ||
          model.id.includes('curie') ||
          model.id.includes('babbage') ||
          model.id.includes('ada');

        // Exclude specific non-language model types
        const isNotEmbedding = !model.id.includes('embedding');
        const isNotAudio =
          !model.id.includes('whisper') &&
          !model.id.includes('tts') &&
          !model.id.includes('audio') &&
          !model.id.includes('transcribe') &&
          !model.id.includes('realtime');
        const isNotVision = !model.id.includes('dall-e');

        return isLanguageModel && isNotEmbedding && isNotAudio && isNotVision;
      })
      .map(model => model.id);

    console.log(`📝 Filtered to ${modelIds.length} language models:`);
    modelIds.forEach(id => console.log(`  - ${id}`));

    return modelIds;
  } catch (error) {
    console.error('❌ Error fetching models from OpenAI API:', error);
    throw error;
  }
}

function getOpenAIVersionSuffixPatterns(): RegExp[] {
  return [
    /-\d{4}-\d{2}-\d{2}$/, // Remove date suffixes like -2024-04-09
    /-\d{4}$/, // Remove year suffixes like -2024
    /-16k.*$/, // Remove 16k variants
    /-32k.*$/, // Remove 32k variants
    /-\d{4}.*$/, // Remove timestamped versions
    /-preview.*$/, // Remove preview suffixes
    /-latest$/, // Remove latest suffixes
  ];
}

// Create provider configuration
const openaiConfig: ProviderConfig = {
  name: 'OpenAI',
  gatewayPrefix: 'openai/',
  outputPath: 'src/supported-models/chat/openai.ts',
  apiKeyEnvVar: 'OPENAI_API_KEY',
  fetchModels: fetchOpenAIModels,
  getVersionSuffixPatterns: getOpenAIVersionSuffixPatterns,
};

// Run the script
updateProviderModels(openaiConfig).catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
