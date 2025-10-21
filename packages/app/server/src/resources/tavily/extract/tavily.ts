import { Decimal } from '@prisma/client/runtime/library';
import { CREDIT_PRICE, TAVILY_EXTRACT_PRICING } from '../prices';
import {
  TavilyExtractInput,
  TavilyExtractOutput,
  TavilyExtractOutputSchema,
} from './types';
import { Transaction } from '../../../types';
import { HttpError } from 'errors/http';

export const calculateTavilyExtractMaxCost = (
  input: TavilyExtractInput | undefined
): Decimal => {
  if (!input) {
    return new Decimal(0);
  }

  const urlCount = Array.isArray(input.urls) ? input.urls.length : 1;
  const depth = input.extract_depth ?? 'basic';
  const { creditsPerUnit, urlsPerCredit } = TAVILY_EXTRACT_PRICING[depth];

  // Calculate max cost assuming all URLs succeed
  const credits = Math.ceil(urlCount / urlsPerCredit) * creditsPerUnit;
  return new Decimal(credits).mul(CREDIT_PRICE);
};

export const calculateTavilyExtractActualCost = (
  input: TavilyExtractInput,
  output: TavilyExtractOutput
): Decimal => {
  const successfulUrlCount = output.results.length;
  const depth = input.extract_depth ?? 'basic';
  const { creditsPerUnit, urlsPerCredit } = TAVILY_EXTRACT_PRICING[depth];

  // Calculate actual cost based on successful URLs
  const credits =
    Math.ceil(successfulUrlCount / urlsPerCredit) * creditsPerUnit;
  return new Decimal(credits).mul(CREDIT_PRICE);
};

export const createTavilyTransaction = (
  input: TavilyExtractInput,
  output: TavilyExtractOutput,
  cost: Decimal
): Transaction => {
  return {
    metadata: {
      providerId: output.request_id,
      provider: 'tavily',
      model: `extract-${input.extract_depth ?? 'basic'}`,
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

export async function tavilyExtract(
  input: TavilyExtractInput
): Promise<TavilyExtractOutput> {
  const response = await fetch('https://api.tavily.com/extract', {
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
  return TavilyExtractOutputSchema.parse(data);
}
