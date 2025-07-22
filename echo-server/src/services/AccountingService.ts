import modelPrices from '../../model_prices.json';
import { PrismaClient } from '../generated/prisma';

export const isValidModel = (model: string) => {
  return model in modelPrices;
};

/**
 * Calculate cost using seeded UsageProduct pricing from database
 * Returns both the cost and the usageProduct for downstream use
 */
export const getCostPerToken = async (
  db: PrismaClient,
  model: string,
  echoAppId: string,
  inputTokens: number,
  outputTokens: number
): Promise<{ cost: number; usageProduct: any }> => {
  const usageProduct = await db.usageProduct.findFirst({
    where: {
      model: model,
      echoAppId: echoAppId,
      isActive: true,
      isArchived: false,
    },
  });

  if (!usageProduct) {
    throw new Error(
      `UsageProduct not found for model '${model}' in app '${echoAppId}'`
    );
  }

  if (!usageProduct.inputPricePerToken || !usageProduct.outputPricePerToken) {
    throw new Error(
      `UsageProduct for model '${model}' is missing pricing information`
    );
  }

  const cost =
    Number(usageProduct.inputPricePerToken) * inputTokens +
    Number(usageProduct.outputPricePerToken) * outputTokens;

  return { cost, usageProduct };
};
