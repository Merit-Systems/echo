import { Request, Response } from 'express';
import { TavilyExtractInputSchema } from './types';
import {
  calculateTavilyExtractMaxCost,
  calculateTavilyExtractActualCost,
  tavilyExtract,
  createTavilyTransaction,
} from './tavily';
import { handleResourceRequestWithErrorHandling } from '../../handler';

export async function tavilyExtractRoute(req: Request, res: Response) {
  return handleResourceRequestWithErrorHandling(req, res, {
    inputSchema: TavilyExtractInputSchema,
    calculateMaxCost: input => calculateTavilyExtractMaxCost(input),
    executeResource: tavilyExtract,
    calculateActualCost: calculateTavilyExtractActualCost,
    createTransaction: createTavilyTransaction,
    errorMessage: 'Error extracting tavily',
  });
}
