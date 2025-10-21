#!/usr/bin/env node

// -> Get all model slugs from Groq's API directly
// Note: Groq pricing is not available in AI Gateway, so pricing must be manually updated
// from https://console.groq.com/docs/models

import Groq from 'groq-sdk';

async function fetchGroqModels(): Promise<void> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is required');
  }

  try {
    console.log('🔄 Fetching models from Groq API...\n');

    const groq = new Groq({ apiKey });
    const response = await groq.models.list();

    console.log(`🔍 Found ${response.data.length} total models from Groq API`);

    // Filter for language models (exclude embeddings, audio, etc.)
    const languageModels = response.data.filter(model => {
      const isNotEmbedding = !model.id.includes('embedding');
      const isNotAudio =
        !model.id.includes('whisper') &&
        !model.id.includes('tts') &&
        !model.id.includes('audio') &&
        !model.id.includes('playai');
      const isNotModeration = !model.id.includes('moderation');
      const isNotSystem = !model.id.includes('compound');

      return isNotEmbedding && isNotAudio && isNotModeration && isNotSystem;
    });

    console.log(`📝 Filtered to ${languageModels.length} language models:\n`);

    // Group by production vs preview (simplified heuristic)
    const productionModels = languageModels.filter(
      m => !m.id.includes('llama-4') && !m.id.includes('prompt-guard')
    );
    const previewModels = languageModels.filter(
      m => m.id.includes('llama-4') || m.id.includes('prompt-guard')
    );

    console.log('📦 Production Models:');
    productionModels.forEach(model => {
      console.log(`  - ${model.id}`);
    });

    console.log('\n🔬 Preview Models:');
    previewModels.forEach(model => {
      console.log(`  - ${model.id}`);
    });

    console.log('\n✅ Model list fetched successfully!');
    console.log('\n⚠️  Note: Pricing must be manually updated from:');
    console.log('   https://console.groq.com/docs/models');
    console.log('\n📝 Update the file: src/supported-models/chat/groq.ts');
  } catch (error) {
    console.error('❌ Error fetching models from Groq API:', error);
    throw error;
  }
}

// Run the script
fetchGroqModels().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
