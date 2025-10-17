import { Request, Response } from 'express';
import { TavilySearchInputSchema } from './types';
import {
  calculateTavilySearchCost,
  tavilySearch,
  createTavilyTransaction,
} from './tavily';
import { handleResourceRequestWithErrorHandling } from '../../handler';

export async function tavilySearchRoute(req: Request, res: Response) {
  return handleResourceRequestWithErrorHandling(req, res, {
    inputSchema: TavilySearchInputSchema,
    calculateMaxCost: input => calculateTavilySearchCost(input),
    executeResource: tavilySearch,
    calculateActualCost: input => calculateTavilySearchCost(input),
    createTransaction: createTavilyTransaction,
    errorMessage: 'Error searching tavily',
  });
}
