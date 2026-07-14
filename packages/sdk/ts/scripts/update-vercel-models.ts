#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { join } from 'path';
import type { SupportedModel, TokenPricingTier } from './update-models';

const VERCEL_MODELS_URL = 'https://ai-gateway.vercel.sh/v1/models';
const ECHO_MODEL_PREFIX = 'vercel/';

interface VercelModel {
  id: string;
  type?: string;
  modelType?: string;
  pricing?: {
    input?: string;
    output?: string;
    input_tiers?: VercelPricingTier[];
    output_tiers?: VercelPricingTier[];
    inputTiers?: VercelPricingTier[];
    outputTiers?: VercelPricingTier[];
  };
}

interface VercelPricingTier {
  cost: string;
  min: number;
  max?: number;
}

interface VercelModelsResponse {
  data?: VercelModel[];
  models?: VercelModel[];
}

function parseTier(tier: VercelPricingTier): TokenPricingTier {
  return {
    cost: Number(tier.cost),
    min: tier.min,
    ...(tier.max !== undefined ? { max: tier.max } : {}),
  };
}

function parsePricingTiers(
  tiers: VercelPricingTier[] | undefined
): TokenPricingTier[] | undefined {
  if (!tiers || tiers.length === 0) {
    return undefined;
  }

  const parsed = tiers.map(parseTier).filter(tier => !Number.isNaN(tier.cost));
  return parsed.length > 0 ? parsed : undefined;
}

function generateVercelModelFile(models: SupportedModel[]): string {
  const sortedModels = models.sort((a, b) =>
    a.model_id.localeCompare(b.model_id)
  );

  const unionType = sortedModels
    .map(model => `  | '${model.model_id}'`)
    .join('\n');

  const modelObjects = sortedModels
    .map(model => {
      const fields = [
        `    model_id: '${model.model_id}',`,
        `    input_cost_per_token: ${model.input_cost_per_token},`,
        `    output_cost_per_token: ${model.output_cost_per_token},`,
      ];

      if (model.input_cost_per_token_tiers) {
        fields.push(
          `    input_cost_per_token_tiers: ${JSON.stringify(
            model.input_cost_per_token_tiers
          )},`
        );
      }

      if (model.output_cost_per_token_tiers) {
        fields.push(
          `    output_cost_per_token_tiers: ${JSON.stringify(
            model.output_cost_per_token_tiers
          )},`
        );
      }

      fields.push(`    provider: 'Vercel AI Gateway',`);

      return `  {\n${fields.join('\n')}\n  }`;
    })
    .join(',\n');

  return `import { SupportedModel } from '../types';

// Union type of all Echo model IDs routed through Vercel AI Gateway.
// Strip the leading "${ECHO_MODEL_PREFIX}" before forwarding to Vercel.
export type VercelAIGatewayModel =
${unionType};

export const VercelAIGatewayModels: SupportedModel[] = [
${modelObjects}
];
`;
}

async function fetchVercelModels(): Promise<SupportedModel[]> {
  const response = await fetch(VERCEL_MODELS_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Vercel AI Gateway models: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as VercelModelsResponse;
  const models = data.data ?? data.models ?? [];

  return models
    .filter(model => (model.type ?? model.modelType) === 'language')
    .map(model => {
      const inputCost = Number(model.pricing?.input);
      const outputCost = Number(model.pricing?.output);
      if (
        !model.id ||
        Number.isNaN(inputCost) ||
        Number.isNaN(outputCost) ||
        inputCost <= 0 ||
        outputCost <= 0
      ) {
        return null;
      }

      const supportedModel: SupportedModel = {
        model_id: `${ECHO_MODEL_PREFIX}${model.id}`,
        input_cost_per_token: inputCost,
        output_cost_per_token: outputCost,
        provider: 'Vercel AI Gateway',
      };

      const inputTiers = parsePricingTiers(
        model.pricing?.input_tiers ?? model.pricing?.inputTiers
      );
      if (inputTiers) {
        supportedModel.input_cost_per_token_tiers = inputTiers;
      }

      const outputTiers = parsePricingTiers(
        model.pricing?.output_tiers ?? model.pricing?.outputTiers
      );
      if (outputTiers) {
        supportedModel.output_cost_per_token_tiers = outputTiers;
      }

      return supportedModel;
    })
    .filter((model): model is SupportedModel => model !== null);
}

async function updateVercelModels(): Promise<void> {
  try {
    console.log('Starting Vercel AI Gateway model update process...');
    const models = await fetchVercelModels();

    if (models.length === 0) {
      throw new Error('No compatible Vercel AI Gateway language models found');
    }

    const fullPath = join(process.cwd(), 'src/supported-models/chat/vercel.ts');
    writeFileSync(fullPath, generateVercelModelFile(models), 'utf8');

    console.log(`Updated vercel.ts with ${models.length} models`);
  } catch (error) {
    console.error('Error updating Vercel AI Gateway models:', error);
    process.exit(1);
  }
}

updateVercelModels();
