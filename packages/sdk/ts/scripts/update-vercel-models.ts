#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { join } from 'path';
import { SupportedModel } from './update-models';

interface VercelModel {
  id: string;
  type?: string;
  pricing?: {
    input?: string;
    output?: string;
  };
}

interface VercelModelsResponse {
  data: VercelModel[];
}

const ECHO_MODEL_PREFIX = 'vercel-ai-gateway/';

async function fetchVercelModels(): Promise<SupportedModel[]> {
  console.log('Fetching models from Vercel AI Gateway...');

  const response = await fetch('https://ai-gateway.vercel.sh/v1/models');

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Vercel AI Gateway models: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as VercelModelsResponse;
  const models: SupportedModel[] = [];

  for (const model of data.data) {
    if (model.type !== 'language') {
      continue;
    }

    const inputCost = Number(model.pricing?.input);
    const outputCost = Number(model.pricing?.output);

    if (
      Number.isNaN(inputCost) ||
      Number.isNaN(outputCost) ||
      inputCost === 0 ||
      outputCost === 0
    ) {
      console.warn(`Skipping ${model.id} - missing language token pricing`);
      continue;
    }

    models.push({
      model_id: `${ECHO_MODEL_PREFIX}${model.id}`,
      input_cost_per_token: inputCost,
      output_cost_per_token: outputCost,
      provider: 'Vercel',
    });
  }

  return models;
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
      return `  {
    model_id: '${model.model_id}',
    input_cost_per_token: ${model.input_cost_per_token},
    output_cost_per_token: ${model.output_cost_per_token},
    provider: '${model.provider}',
  }`;
    })
    .join(',\n');

  return `import { SupportedModel } from '../types';

// Union type of all valid Vercel AI Gateway language model IDs.
export type VercelModel =
${unionType};

export const VercelModels: SupportedModel[] = [
${modelObjects}
];

`;
}

async function updateVercelModels() {
  try {
    const models = await fetchVercelModels();

    if (models.length === 0) {
      throw new Error('No compatible Vercel AI Gateway language models found');
    }

    const fileContent = generateVercelModelFile(models);
    const fullPath = join(process.cwd(), 'src/supported-models/chat/vercel.ts');
    writeFileSync(fullPath, fileContent, 'utf8');

    console.log(`Updated vercel.ts with ${models.length} models`);
  } catch (error) {
    console.error('Error updating Vercel AI Gateway models:', error);
    process.exit(1);
  }
}

updateVercelModels().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
