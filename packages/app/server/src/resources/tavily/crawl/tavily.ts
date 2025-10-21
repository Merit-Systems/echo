import { Decimal } from '@prisma/client/runtime/library';
import {
  CREDIT_PRICE,
  TAVILY_MAP_PRICING,
  TAVILY_EXTRACT_PRICING,
} from '../prices';
import {
  TavilyCrawlInput,
  TavilyCrawlOutput,
  TavilyCrawlOutputSchema,
} from './types';
import { Transaction } from '../../../types';
import { HttpError } from 'errors/http';

export const calculateTavilyCrawlMaxCost = (
  input: TavilyCrawlInput | undefined
): Decimal => {
  if (!input) {
    return new Decimal(0);
  }

  // Max cost is based on the limit parameter (default 50)
  const maxPages = input.limit ?? 50;
  const hasInstructions = !!input.instructions;
  const extractDepth = input.extract_depth ?? 'basic';

  // Mapping cost
  const mapPricing = hasInstructions
    ? TAVILY_MAP_PRICING.withInstructions
    : TAVILY_MAP_PRICING.regular;
  const mapCredits =
    Math.ceil(maxPages / mapPricing.pagesPerCredit) * mapPricing.creditsPerUnit;

  // Extraction cost
  const { creditsPerUnit, urlsPerCredit } =
    TAVILY_EXTRACT_PRICING[extractDepth];
  const extractCredits = Math.ceil(maxPages / urlsPerCredit) * creditsPerUnit;

  const totalCredits = mapCredits + extractCredits;
  return new Decimal(totalCredits).mul(CREDIT_PRICE);
};

export const calculateTavilyCrawlActualCost = (
  input: TavilyCrawlInput,
  output: TavilyCrawlOutput
): Decimal => {
  const successfulPages = output.results.length;
  const hasInstructions = !!input.instructions;
  const extractDepth = input.extract_depth ?? 'basic';

  // Mapping cost
  const mapPricing = hasInstructions
    ? TAVILY_MAP_PRICING.withInstructions
    : TAVILY_MAP_PRICING.regular;
  const mapCredits =
    Math.ceil(successfulPages / mapPricing.pagesPerCredit) *
    mapPricing.creditsPerUnit;

  // Extraction cost
  const { creditsPerUnit, urlsPerCredit } =
    TAVILY_EXTRACT_PRICING[extractDepth];
  const extractCredits =
    Math.ceil(successfulPages / urlsPerCredit) * creditsPerUnit;

  const totalCredits = mapCredits + extractCredits;
  return new Decimal(totalCredits).mul(CREDIT_PRICE);
};

export const createTavilyTransaction = (
  input: TavilyCrawlInput,
  output: TavilyCrawlOutput,
  cost: Decimal
): Transaction => {
  return {
    metadata: {
      providerId: output.request_id,
      provider: 'tavily',
      model: `crawl-${input.extract_depth ?? 'basic'}`,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      toolCost: cost,
    },
    rawTransactionCost: cost,
    status: 'completed',
  };
};

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

export async function tavilyCrawl(
  input: TavilyCrawlInput
): Promise<TavilyCrawlOutput> {
  const response = await fetch('https://api.tavily.com/crawl', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TAVILY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new HttpError(
      response.status,
      `Tavily API request failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = await response.json();
  return TavilyCrawlOutputSchema.parse(data);
}
