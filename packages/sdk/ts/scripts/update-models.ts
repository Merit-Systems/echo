import { config } from 'dotenv';
import { gateway } from '@ai-sdk/gateway';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

export interface SupportedModel {
  model_id: string;
  input_cost_per_token: number;
  output_cost_per_token: number;
  provider: string;
}

export interface ProviderConfig {
  name: string;
  gatewayPrefix: string;
  outputPath: string;
  apiKeyEnvVar: string;
  fetchModels: () => Promise<string[]>;
  normalizeModelId?: (modelId: string) => string;
  getVersionSuffixPatterns?: () => RegExp[];
}

export function cleanModelId(modelId: string): string {
  const parts = modelId.split('/');
  if (parts.length < 2) {
    throw new Error(`Invalid model ID format: ${modelId}`);
  }
  return parts[1]!;
}

export function matchModelsWithPricing(
  providerModelIds: string[],
  gatewayModels: SupportedModel[],
  providerName: string,
  versionSuffixPatterns: RegExp[] = []
): SupportedModel[] {
  const result: SupportedModel[] = [];

  // Create a map of base model names to their pricing info from gateway
  const pricingMap = new Map<string, { input: number; output: number }>();
  gatewayModels.forEach(model => {
    pricingMap.set(model.model_id, {
      input: model.input_cost_per_token,
      output: model.output_cost_per_token,
    });
  });

  console.log(
    `\n🔄 Matching ${providerModelIds.length} ${providerName} models with gateway pricing...`
  );

  // For each provider model ID, try to find matching pricing
  for (const modelId of providerModelIds) {
    let pricing = pricingMap.get(modelId);

    // Check if we found an exact match first
    if (pricing) {
      console.log(`✅ Exact match found for ${modelId}`);
    } else {
      // Extract base model name for matching
      let baseModelName = modelId;

      // Apply provider-specific version suffix patterns
      for (const pattern of versionSuffixPatterns) {
        baseModelName = baseModelName.replace(pattern, '');
      }

      // Look for gateway models that match this base name
      const potentialMatches: {
        gatewayModelId: string;
        pricing: { input: number; output: number };
      }[] = [];

      for (const [gatewayModelId, gatewayPricing] of pricingMap.entries()) {
        // Normalize both model names for comparison
        const normalizedGatewayId = gatewayModelId.replace(/\./g, '-');
        const normalizedBaseModel = baseModelName.replace(/\./g, '-');

        if (
          normalizedGatewayId.startsWith(normalizedBaseModel) ||
          normalizedBaseModel.startsWith(normalizedGatewayId) ||
          gatewayModelId.startsWith(baseModelName) ||
          baseModelName.startsWith(gatewayModelId)
        ) {
          potentialMatches.push({ gatewayModelId, pricing: gatewayPricing });
        }
      }

      // If we found matches, select the most specific one
      if (potentialMatches.length > 0) {
        // Sort by specificity: exact match > longest match > first match
        potentialMatches.sort((a, b) => {
          const aNormalized = a.gatewayModelId.replace(/\./g, '-');
          const bNormalized = b.gatewayModelId.replace(/\./g, '-');
          const baseNormalized = baseModelName.replace(/\./g, '-');

          // Check for exact matches first
          if (aNormalized === baseNormalized && bNormalized !== baseNormalized)
            return -1;
          if (bNormalized === baseNormalized && aNormalized !== baseNormalized)
            return 1;

          // Otherwise, prefer longer (more specific) matches
          return b.gatewayModelId.length - a.gatewayModelId.length;
        });

        const bestMatch = potentialMatches[0];
        if (bestMatch === undefined) {
          continue;
        }
        pricing = bestMatch.pricing;
        console.log(
          `✅ Matched ${modelId} with ${bestMatch.gatewayModelId} pricing`
        );
      }
    }

    // If we found pricing info, add the model
    if (pricing) {
      result.push({
        model_id: modelId,
        input_cost_per_token: pricing.input,
        output_cost_per_token: pricing.output,
        provider: providerName,
      });
    } else {
      // Extract base model name for logging
      let debugBaseModelName = modelId;
      for (const pattern of versionSuffixPatterns) {
        debugBaseModelName = debugBaseModelName.replace(pattern, '');
      }
      console.warn(
        `⚠️  No pricing found for ${providerName} model: ${modelId} (base: ${debugBaseModelName}) - dropping from list`
      );
    }
  }

  return result;
}

export function generateModelFile(
  models: SupportedModel[],
  providerName: string,
  modelTypeName: string
): string {
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
    provider: "${providerName}"
  }`;
    })
    .join(',\n');

  return `import { SupportedModel } from "../types";

// Union type of all valid ${providerName} model IDs
export type ${modelTypeName}Model = 
${unionType};

export const ${modelTypeName}Models: SupportedModel[] = [
${modelObjects}
];

`;
}

export async function fetchGatewayModels(
  gatewayPrefix: string,
  providerName: string
): Promise<SupportedModel[]> {
  console.log(`\n💰 Fetching pricing data from AI SDK Gateway...`);
  const availableModels = await gateway.getAvailableModels();

  // Filter for provider models from the gateway
  const providerGatewayModels = availableModels.models
    .filter(model => model.id.startsWith(gatewayPrefix))
    .filter(model => model.modelType === 'language')
    .map(model => {
      const cleanId = cleanModelId(model.id);

      console.log(`Found gateway model: ${model.id} -> ${cleanId}`);

      // Validate that required fields exist in gateway response
      if (!model.pricing) {
        throw new Error(`Model ${model.id} is missing pricing information`);
      }

      if (model.pricing.input === undefined || model.pricing.input === null) {
        throw new Error(`Model ${model.id} is missing input pricing`);
      }

      if (model.pricing.output === undefined || model.pricing.output === null) {
        throw new Error(`Model ${model.id} is missing output pricing`);
      }

      const inputCost = Number(model.pricing.input);
      const outputCost = Number(model.pricing.output);

      return {
        model_id: cleanId,
        input_cost_per_token: inputCost,
        output_cost_per_token: outputCost,
        provider: providerName,
      };
    });

  if (providerGatewayModels.length === 0) {
    console.log(`No ${providerName} models found in gateway response`);
    return [];
  }

  console.log(
    `Found ${providerGatewayModels.length} ${providerName} models in gateway`
  );

  return providerGatewayModels;
}

export async function updateProviderModels(
  config: ProviderConfig
): Promise<void> {
  try {
    console.log(`🔄 Starting ${config.name} model update process...\n`);

    // Check for API key
    const apiKey = process.env[config.apiKeyEnvVar];
    if (!apiKey) {
      throw new Error(
        `${config.apiKeyEnvVar} environment variable is required`
      );
    }

    // Step 1: Fetch available models from provider API
    console.log(`📡 Fetching available models from ${config.name} API...`);
    const providerModelIds = await config.fetchModels();

    // Step 2: Fetch pricing data from AI Gateway
    const gatewayModels = await fetchGatewayModels(
      config.gatewayPrefix,
      config.name
    );

    if (gatewayModels.length === 0) {
      return;
    }

    // Step 3: Match provider API models with gateway pricing
    const versionSuffixPatterns = config.getVersionSuffixPatterns?.() || [];
    const finalModels = matchModelsWithPricing(
      providerModelIds,
      gatewayModels,
      config.name,
      versionSuffixPatterns
    );

    // Generate the new file content
    const modelTypeName = config.name;
    const fileContent = generateModelFile(
      finalModels,
      config.name,
      modelTypeName
    );

    // Write the updated file
    const fullPath = join(process.cwd(), config.outputPath);
    writeFileSync(fullPath, fileContent, 'utf8');

    console.log(
      `\n✅ Successfully updated ${config.name.toLowerCase()}.ts with ${finalModels.length} models`
    );
    console.log(`📊 Models included:`);
    finalModels.forEach(model => {
      console.log(`  - ${model.model_id}`);
    });

    const droppedCount = providerModelIds.length - finalModels.length;
    if (droppedCount > 0) {
      console.log(
        `\n⚠️  ${droppedCount} models were dropped due to missing pricing data`
      );
    }
  } catch (error) {
    console.error(`❌ Error updating ${config.name} models:`, error);
    process.exit(1);
  }
}
