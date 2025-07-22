import { db } from '../db';
import { SupportedModel, SupportedModelsResult } from './types';

export * from './types';

export async function getSupportedModels(): Promise<SupportedModelsResult> {
  // Query UsageProduct table for LLM models
  const usageProducts = await db.usageProduct.findMany({
    where: {
      category: 'llm',
      isActive: true,
      isArchived: false,
    },
    select: {
      name: true,
      description: true,
      providerId: true,
      model: true,
      inputPricePerToken: true,
      outputPricePerToken: true,
    },
  });

  // Transform the database data to return important information for users
  const supportedModels: SupportedModel[] = usageProducts.map(product => ({
    name: product.model,
    display_name: product.name,
    description: product.description,
    provider: product.providerId,
    pricing: {
      input_cost_per_token: product.inputPricePerToken
        ? Number(product.inputPricePerToken)
        : null,
      output_cost_per_token: product.outputPricePerToken
        ? Number(product.outputPricePerToken)
        : null,
    },
  }));

  // Group by provider for easier consumption
  const groupedByProvider = supportedModels.reduce(
    (acc, model) => {
      const provider = model.provider || 'unknown';
      if (!acc[provider]) {
        acc[provider] = [];
      }
      acc[provider].push(model);
      return acc;
    },
    {} as Record<string, SupportedModel[]>
  );

  return {
    models: supportedModels,
    models_by_provider: groupedByProvider,
  };
}
