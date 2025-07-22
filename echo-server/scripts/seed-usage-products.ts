#!/usr/bin/env tsx

/// <reference types="node" />

import { PrismaClient } from '../src/generated/prisma/index.js';
import modelPrices from '../model_prices.json';
import * as crypto from 'crypto';

// Database client
const prisma = new PrismaClient();

// Provider mapping from litellm_provider to consistent provider IDs
const PROVIDER_MAPPING: Record<string, string> = {
  openai: 'openai',
  anthropic: 'anthropic',
  'vertex_ai-language-models': 'google',
  google: 'google',
  gemini: 'google',
};

/**
 * Map a model name to a human-readable display name
 */
function getModelDisplayName(modelKey: string): string {
  // Convert model key to a more readable format
  return modelKey
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Gpt/g, 'GPT')
    .replace(/Claude/g, 'Claude')
    .replace(/Gemini/g, 'Gemini')
    .replace(/O1/g, 'O1')
    .replace(/O3/g, 'O3')
    .replace(/O4/g, 'O4');
}

/**
 * Get the provider ID from the model configuration
 */
function getProviderId(modelData: any): string {
  const litellmProvider = modelData.litellm_provider;

  if (!litellmProvider) {
    // Fallback: try to infer from model name
    const modelKey = modelData.model || '';
    if (
      modelKey.startsWith('gpt-') ||
      modelKey.startsWith('o1-') ||
      modelKey.startsWith('o3-') ||
      modelKey.startsWith('o4-') ||
      modelKey.startsWith('chatgpt-')
    ) {
      return 'openai';
    } else if (modelKey.includes('claude')) {
      return 'anthropic';
    } else if (modelKey.includes('gemini')) {
      return 'google';
    }
    return 'unknown';
  }

  return PROVIDER_MAPPING[litellmProvider] || litellmProvider;
}

/**
 * Create a description for the usage product
 */
function createDescription(modelKey: string, modelData: any): string {
  const provider = getProviderId(modelData);
  const maxTokens = modelData.max_tokens || modelData.max_output_tokens;
  const inputTokens = modelData.max_input_tokens;

  let description = `${getModelDisplayName(modelKey)} model from ${provider}`;

  if (inputTokens) {
    description += ` (Max input: ${inputTokens.toLocaleString()} tokens`;
    if (maxTokens) {
      description += `, Max output: ${maxTokens.toLocaleString()} tokens`;
    }
    description += ')';
  }

  return description;
}

/**
 * Seed usage products for a specific app
 */
async function seedUsageProductsForApp(
  appId: string,
  options: {
    verbose?: boolean;
    overwrite?: boolean;
  } = {}
): Promise<number> {
  const { verbose = false, overwrite = false } = options;

  if (verbose) {
    console.log(`🌱 Seeding usage products for app: ${appId}`);
  }

  // Verify app exists
  const app = await prisma.echoApp.findUnique({
    where: { id: appId },
  });

  if (!app) {
    throw new Error(`App with ID ${appId} not found`);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const [modelKey, modelData] of Object.entries(modelPrices)) {
    try {
      const providerId = getProviderId(modelData);
      const name = getModelDisplayName(modelKey);
      const description = createDescription(modelKey, modelData);

      // Extract pricing information
      const inputPricePerToken = modelData.input_cost_per_token || null;
      const outputPricePerToken = modelData.output_cost_per_token || null;

      // Check if usage product already exists for this model and app
      const existingProduct = await prisma.usageProduct.findFirst({
        where: {
          model: modelKey,
          echoAppId: appId,
          isArchived: false,
        },
      });

      if (existingProduct && !overwrite) {
        if (verbose) {
          console.log(`  ⏭️  Skipping existing product: ${name} (${modelKey})`);
        }
        skipped++;
        continue;
      }

      const productData = {
        name,
        description,
        providerId,
        model: modelKey,
        inputPricePerToken,
        outputPricePerToken,
        category: 'llm',
        isArchived: false,
        echoAppId: appId,
      };

      if (existingProduct && overwrite) {
        // Update existing product
        await prisma.usageProduct.update({
          where: { id: existingProduct.id },
          data: {
            ...productData,
            updatedAt: new Date(),
          },
        });

        if (verbose) {
          console.log(`  🔄 Updated product: ${name} (${modelKey})`);
        }
        updated++;
      } else {
        // Create new product
        await prisma.usageProduct.create({
          data: {
            id: crypto.randomUUID(),
            ...productData,
          },
        });

        if (verbose) {
          console.log(`  ✅ Created product: ${name} (${modelKey})`);
        }
        created++;
      }
    } catch (error) {
      console.error(`❌ Failed to process model ${modelKey}:`, error);
    }
  }

  if (verbose) {
    console.log(`\n📊 Summary for app ${appId}:`);
    console.log(`  Created: ${created}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped: ${skipped}`);
  }

  return created + updated;
}

/**
 * Seed usage products for all apps
 */
async function seedAllApps(
  options: {
    verbose?: boolean;
    overwrite?: boolean;
  } = {}
): Promise<void> {
  const { verbose = false } = options;

  if (verbose) {
    console.log('🔍 Finding all active apps...');
  }

  const apps = await prisma.echoApp.findMany({
    where: {
      isArchived: false,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (apps.length === 0) {
    console.log('⚠️  No active apps found');
    return;
  }

  if (verbose) {
    console.log(`📱 Found ${apps.length} active apps`);
  }

  let totalProcessed = 0;
  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    if (verbose) {
      console.log(`\n[${i + 1}/${apps.length}] Processing app: ${app.name}`);
    }

    const count = await seedUsageProductsForApp(app.id, options);
    totalProcessed += count;
  }

  console.log(
    `\n🎉 Completed! Total usage products processed: ${totalProcessed}`
  );
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse command line arguments
  let appId: string | null = null;
  let verbose = false;
  let overwrite = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    } else if (arg === '--overwrite' || arg === '-o') {
      overwrite = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: tsx seed-usage-products.ts [appId] [options]

Arguments:
  appId                 Optional app ID to seed. If not provided, seeds all apps.

Options:
  --verbose, -v         Verbose output
  --overwrite, -o       Overwrite existing usage products
  --help, -h            Show this help message

Examples:
  tsx seed-usage-products.ts                           # Seed all apps
  tsx seed-usage-products.ts --verbose                 # Seed all apps with verbose output
  tsx seed-usage-products.ts abc-123 --verbose         # Seed specific app with verbose output
  tsx seed-usage-products.ts abc-123 --overwrite       # Seed specific app and overwrite existing products
      `);
      process.exit(0);
    } else if (!arg.startsWith('--')) {
      // Assume it's an app ID
      appId = arg;
    }
  }

  try {
    console.log('🚀 Starting usage product seeding...');
    console.log(
      `📊 Found ${Object.keys(modelPrices).length} models in model_prices.json`
    );

    if (appId) {
      await seedUsageProductsForApp(appId, { verbose, overwrite });
    } else {
      await seedAllApps({ verbose, overwrite });
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { seedUsageProductsForApp, seedAllApps };
