import { BaseProvider } from '../providers/BaseProvider';
import { UnknownModelError } from 'errors/http';
import {
  getModelPrice,
  getVideoModelPrice,
  isValidImageModel,
  isValidVideoModel,
  calculateToolCost,
  getImageModelPrice,
} from './AccountingService';
import { Decimal } from '@prisma/client/runtime/library';
import { extractMaxOutputTokens } from './RequestDataService';
import { EscrowRequest } from '../middleware/transaction-escrow-middleware';
import { ProviderType } from 'providers/ProviderType';
import { Tool } from 'openai/resources/responses/responses';
import { SupportedVideoModel } from '@merit-systems/echo-typescript-sdk';

export function getRequestMaxCost(
  req: EscrowRequest,
  provider: BaseProvider,
  isPassthroughProxyRoute: boolean
): Decimal {
  // Need to switch between language/image/video for different pricing models.
  if (isValidVideoModel(provider.getModel())) {
    const videoModelWithPricing = getVideoModelPrice(provider.getModel());
    if (!videoModelWithPricing) {
      throw new UnknownModelError(
        `No pricing found for video model: ${provider.getModel()}`
      );
    }
    return predictMaxVideoCost(req, provider, videoModelWithPricing);
  } else if (isValidImageModel(provider.getModel())) {
    if (req.path.includes('images/generations')) {
      // Text to image generation pricing
      const imageModelPrice = getImageModelPrice(provider.getModel());
      if (!imageModelPrice) {
        throw new UnknownModelError(
          `No pricing found for image model: ${provider.getModel()}`
        );
      }
      const maxResolutionPricing = new Decimal(0.25);
      const numberOfImages = req.body.n || 1;
      const outputImageCost = new Decimal(numberOfImages).mul(
        maxResolutionPricing
      );
      const inputTokens = Number(req.originalContentLength) / 3;
      const textCost = new Decimal(
        imageModelPrice.text_input_cost_per_token
      ).mul(new Decimal(inputTokens));
      return textCost.add(outputImageCost);
    }
    // Default to cover costs
    return new Decimal(2.5);
  } else {
    const contentLength = req.originalContentLength;
    const maxInputTokens = contentLength ? Number(contentLength) / 3 : 1000;
    const maxOutputTokens = extractMaxOutputTokens(req);
    const modelWithPricing = getModelPrice(provider.getModel());
    if (!modelWithPricing) {
      if (isPassthroughProxyRoute) {
        return new Decimal(0);
      }
      throw new UnknownModelError(`Invalid model: ${provider.getModel()}`);
    }
    const maxInputCost = new Decimal(maxInputTokens).mul(
      modelWithPricing.input_cost_per_token
    );
    const maxOutputCost = new Decimal(maxOutputTokens).mul(
      modelWithPricing.output_cost_per_token
    );
    // Tool cost for OpenAI Responses API
    const toolCost = predictMaxToolCost(req, provider);
    return maxInputCost.add(maxOutputCost).add(toolCost);
  }
}

function predictMaxToolCost(
  req: EscrowRequest,
  provider: BaseProvider
): Decimal {
  switch (provider.getType()) {
    case ProviderType.OPENAI_RESPONSES:
      const tools = req.body.tools as Tool[] | undefined;
      if (!tools || !Array.isArray(tools) || tools.length === 0) {
        return new Decimal(0);
      }

      let totalToolCost = new Decimal(0);

      for (const tool of tools) {
        // Calculate the cost of each tool as specified
        totalToolCost = totalToolCost.add(calculateToolCost(tool));
      }

      return totalToolCost;

    default:
      return new Decimal(0);
  }
}

function predictMaxVideoCost(
  req: EscrowRequest,
  provider: BaseProvider,
  videoModelWithPricing: SupportedVideoModel
): Decimal {
  switch (provider.getType()) {
    case ProviderType.OPENAI_VIDEOS:
      const seconds: number = Number(req.body.seconds) || 4;
      return new Decimal(videoModelWithPricing.cost_per_second_with_audio).mul(
        seconds
      );
    case ProviderType.VERTEX_AI:
      const durationSeconds: number = Number(req.body.durationSeconds) || 8;
      const generateAudio: boolean = Boolean(req.body.generateAudio) || true;
      return new Decimal(
        generateAudio
          ? videoModelWithPricing.cost_per_second_with_audio
          : videoModelWithPricing.cost_per_second_without_audio
      ).mul(durationSeconds);
    default:
      return new Decimal(0);
  }
}
