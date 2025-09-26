import { Request } from 'express';
import { BaseProvider } from '../providers/BaseProvider';
import { UnknownModelError } from 'errors/http';
import {
  getModelPrice,
  getVideoModelPrice,
  isValidImageModel,
  isValidVideoModel,
} from './AccountingService';
import { Decimal } from '@prisma/client/runtime/library';
import { extractMaxOutputTokens } from './RequestDataService';

export function getRequestMaxCost(
  req: Request,
  provider: BaseProvider
): Decimal {
  // Need to switch between language/image/video for different pricing models.
  if (isValidVideoModel(provider.getModel())) {
    const videoModelWithPricing = getVideoModelPrice(provider.getModel());
    if (!videoModelWithPricing) {
      throw new UnknownModelError(
        `No pricing found for video model: ${provider.getModel()}`
      );
    }
    const durationSeconds: number = Number(req.body.durationSeconds) || 8;
    const generateAudio: boolean = Boolean(req.body.generateAudio) || true;
    return new Decimal(
      generateAudio
        ? videoModelWithPricing.cost_per_second_with_audio
        : videoModelWithPricing.cost_per_second_without_audio
    ).mul(durationSeconds);
  } else if (isValidImageModel(provider.getModel())) {
    // TODO: Implement image pricing
    return new Decimal(0);
  } else {
    const headers = req.headers as Record<string, string>;
    const maxInputTokens = Number(headers['content-length']) / 3;
    const maxOutputTokens = extractMaxOutputTokens(req) || 0;
    const modelWithPricing = getModelPrice(provider.getModel());
    if (!modelWithPricing) {
      throw new UnknownModelError(`Invalid model: ${provider.getModel()}`);
    }
    const maxInputCost = new Decimal(maxInputTokens).mul(
      modelWithPricing.input_cost_per_token
    );
    const maxOutputCost = new Decimal(maxOutputTokens).mul(
      modelWithPricing.output_cost_per_token
    );
    return maxInputCost.add(maxOutputCost);
  }
}
